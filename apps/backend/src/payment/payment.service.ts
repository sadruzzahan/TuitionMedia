import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PaymentStatus, PaymentMethod, ApplicationStatus } from "@prisma/client";
import { randomInt } from "crypto";
import { NotificationService } from "../notification/notification.service";

const MINIMUM_FEE = 300;
const FINDER_FEE_RATE = 0.5;
const OTP_EXPIRY_MINUTES = 5;

function calcFinderFee(proposedRate: number | null): number {
  if (!proposedRate || proposedRate <= 0) return MINIMUM_FEE;
  return Math.max(Math.round(proposedRate * FINDER_FEE_RATE), MINIMUM_FEE);
}

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  private generateOTP(): string {
    return randomInt(100000, 999999).toString();
  }

  /**
   * Tutor initiates payment of finder's fee after trial is approved.
   * Amount = 50% of their proposed monthly rate (min ৳300).
   */
  async initiateTutorFinderFeePayment(
    applicationId: string,
    tutorId: string,
    phoneNumber: string,
    method: PaymentMethod,
  ) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { request: true },
    });

    if (!application) throw new NotFoundException("Application not found");
    if (application.tutorId !== tutorId) throw new BadRequestException("Not authorized");

    const allowed: ApplicationStatus[] = ["TRIAL_APPROVED", "BOTH_PAID", "CONNECTED"];
    if (!allowed.includes(application.status)) {
      throw new BadRequestException("The student must approve the trial before you can pay");
    }

    const existingPayment = await this.prisma.payment.findFirst({
      where: {
        applicationId,
        userId: tutorId,
        status: { in: [PaymentStatus.PENDING, PaymentStatus.OTP_SENT, PaymentStatus.VERIFIED] },
      },
    });
    if (existingPayment) {
      if (existingPayment.status === PaymentStatus.VERIFIED) {
        throw new BadRequestException("You have already paid the finder's fee");
      }
      throw new BadRequestException("Payment already initiated. Please verify the OTP.");
    }

    const finderFee = Number(application.finder_fee ?? calcFinderFee(Number(application.proposed_rate ?? 0)));
    const otp = this.generateOTP();
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    const payment = await this.prisma.payment.create({
      data: {
        applicationId,
        requestId: application.requestId,
        userId: tutorId,
        amount: finderFee,
        method,
        phoneNumber,
        otpCode: otp,
        otpExpiresAt,
        status: PaymentStatus.OTP_SENT,
      },
    });

    console.log(`[DEMO OTP] ${phoneNumber}: ${otp}`);

    return {
      id: payment.id,
      amount: finderFee,
      method,
      phoneNumber,
      otpSent: true,
      demoOtp: otp,
      message: `OTP sent to ${phoneNumber}. Enter the OTP to confirm your ৳${finderFee} finder's fee.`,
    };
  }

  async verifyPayment(paymentId: string, userId: string, otp: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { application: { include: { request: { select: { studentId: true, title: true } } } } },
    });

    if (!payment) throw new NotFoundException("Payment not found");
    if (payment.userId !== userId) throw new BadRequestException("Unauthorized");
    if (payment.status !== PaymentStatus.OTP_SENT) throw new BadRequestException("Invalid payment status");

    if (payment.otpExpiresAt && payment.otpExpiresAt < new Date()) {
      await this.prisma.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.EXPIRED },
      });
      throw new BadRequestException("OTP has expired. Please request a new one.");
    }

    if (payment.otpCode !== otp) throw new BadRequestException("Invalid OTP");

    await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.VERIFIED, verifiedAt: new Date(), otpCode: null },
    });

    await this.prisma.$transaction([
      this.prisma.tuitionRequest.update({
        where: { id: payment.requestId },
        data: { contact_unlocked: true },
      }),
      this.prisma.application.update({
        where: { id: payment.applicationId },
        data: { status: "BOTH_PAID" as ApplicationStatus },
      }),
    ]);

    const app = payment.application;
    const studentId = app.request.studentId;

    await this.notificationService.create({
      userId: studentId,
      type: "PAYMENT_VERIFIED",
      title: "Tutor paid — you're fully connected!",
      message: "The tutor has paid their finder's fee. Contact information is now unlocked for both of you.",
      data: { applicationId: payment.applicationId, requestId: payment.requestId },
    });

    await this.notificationService.create({
      userId: payment.userId,
      type: "PAYMENT_VERIFIED",
      title: "Payment confirmed — contact unlocked!",
      message: "Your finder's fee was confirmed. The student's contact info is now visible.",
      data: { applicationId: payment.applicationId, requestId: payment.requestId },
    });

    return { success: true, message: "Finder's fee verified. Contact information is now unlocked!" };
  }

  async resendOtp(paymentId: string, userId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException("Payment not found");
    if (payment.userId !== userId) throw new BadRequestException("Unauthorized");
    if (payment.status !== PaymentStatus.OTP_SENT) throw new BadRequestException("Cannot resend OTP in current state");

    const otp = this.generateOTP();
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await this.prisma.payment.update({
      where: { id: paymentId },
      data: { otpCode: otp, otpExpiresAt },
    });

    console.log(`[DEMO OTP RESEND] ${payment.phoneNumber}: ${otp}`);

    return { success: true, demoOtp: otp, message: `OTP resent to ${payment.phoneNumber}` };
  }

  async getPaymentStatus(applicationId: string, userId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { applicationId, status: PaymentStatus.VERIFIED },
    });

    const userPayment = await this.prisma.payment.findFirst({
      where: { applicationId, userId },
      orderBy: { createdAt: "desc" },
    });

    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
      select: { status: true, finder_fee: true, proposed_rate: true },
    });

    return {
      tutorPaid: payments.length >= 1,
      bothPaid: payments.length >= 1,
      applicationStatus: app?.status,
      userPayment: userPayment
        ? {
            id: userPayment.id,
            status: userPayment.status,
            method: userPayment.method,
            amount: Number(userPayment.amount),
          }
        : null,
    };
  }

  async getPayment(paymentId: string, userId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        application: {
          include: {
            request: { select: { title: true, subjects: true, division: true, area: true } },
          },
        },
      },
    });

    if (!payment) throw new NotFoundException("Payment not found");
    if (payment.userId !== userId) throw new BadRequestException("Unauthorized");

    return {
      id: payment.id,
      amount: Number(payment.amount),
      method: payment.method,
      status: payment.status,
      phoneNumber: payment.phoneNumber,
      createdAt: payment.createdAt,
      verifiedAt: payment.verifiedAt,
      application: payment.application,
    };
  }
}
