import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PaymentStatus, PaymentMethod, ApplicationStatus } from "@prisma/client";
import { randomInt } from "crypto";

const PLATFORM_FEE = 500; // 500 BDT
const OTP_EXPIRY_MINUTES = 5;

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  // Generate 6-digit OTP
  private generateOTP(): string {
    return randomInt(100000, 999999).toString();
  }

  // Initiate payment for student accepting an application
  async initiateStudentPayment(
    applicationId: string,
    userId: string,
    phoneNumber: string,
    method: PaymentMethod,
  ) {
    // Get application and verify it exists
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { request: true },
    });

    if (!application) {
      throw new NotFoundException("Application not found");
    }

    // For student payment, allow from PENDING status
    if (application.status !== "PENDING") {
      throw new BadRequestException("Application is not available for payment");
    }

    // Check if payment already exists
    const existingPayment = await this.prisma.payment.findFirst({
      where: {
        applicationId,
        userId,
        status: { in: [PaymentStatus.PENDING, PaymentStatus.OTP_SENT, PaymentStatus.VERIFIED] },
      },
    });

    if (existingPayment) {
      throw new BadRequestException("Payment already initiated for this application");
    }

    // Create payment and generate OTP
    const otp = this.generateOTP();
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    const payment = await this.prisma.payment.create({
      data: {
        applicationId,
        requestId: application.requestId,
        userId,
        amount: PLATFORM_FEE,
        method,
        phoneNumber,
        otpCode: otp,
        otpExpiresAt,
        status: PaymentStatus.OTP_SENT,
      },
    });

    // Send OTP via SMS API
    console.log(`OTP sent to ${phoneNumber}: ${otp}`);

    return {
      id: payment.id,
      amount: PLATFORM_FEE,
      method,
      phoneNumber,
      otpSent: true,
      message: `OTP sent to ${phoneNumber}. Enter the OTP to verify payment.`,
    };
  }

  // Initiate payment for tutor (when student has paid and tutor accepts)
  async initiateTutorPayment(
    applicationId: string,
    userId: string,
    phoneNumber: string,
    method: PaymentMethod,
  ) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { request: true },
    });

    if (!application) {
      throw new NotFoundException("Application not found");
    }

    // Verify student has already paid
    const studentPayment = await this.prisma.payment.findFirst({
      where: {
        applicationId,
        status: PaymentStatus.VERIFIED,
      },
    });

    if (!studentPayment) {
      throw new BadRequestException("Student must complete payment first");
    }

    // Check if tutor already paid
    const existingPayment = await this.prisma.payment.findFirst({
      where: {
        applicationId,
        userId,
        status: { in: [PaymentStatus.PENDING, PaymentStatus.OTP_SENT, PaymentStatus.VERIFIED] },
      },
    });

    if (existingPayment) {
      throw new BadRequestException("Payment already initiated");
    }

    const otp = this.generateOTP();
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    const payment = await this.prisma.payment.create({
      data: {
        applicationId,
        requestId: application.requestId,
        userId,
        amount: PLATFORM_FEE,
        method,
        phoneNumber,
        otpCode: otp,
        otpExpiresAt,
        status: PaymentStatus.OTP_SENT,
      },
    });

    console.log(`OTP sent to ${phoneNumber}: ${otp}`);

    return {
      id: payment.id,
      amount: PLATFORM_FEE,
      method,
      phoneNumber,
      otpSent: true,
      message: `OTP sent to ${phoneNumber}. Enter the OTP to verify payment.`,
    };
  }

  // Verify OTP and complete payment
  async verifyPayment(paymentId: string, userId: string, otp: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { application: { include: { request: true } } },
    });

    if (!payment) {
      throw new NotFoundException("Payment not found");
    }

    if (payment.userId !== userId) {
      throw new BadRequestException("Unauthorized");
    }

    if (payment.status !== PaymentStatus.OTP_SENT) {
      throw new BadRequestException("Invalid payment status");
    }

    if (payment.otpExpiresAt && payment.otpExpiresAt < new Date()) {
      await this.prisma.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.EXPIRED },
      });
      throw new BadRequestException("OTP has expired. Please request a new one.");
    }

    if (payment.otpCode !== otp) {
      throw new BadRequestException("Invalid OTP");
    }

    // Mark payment as verified
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.VERIFIED,
        verifiedAt: new Date(),
        otpCode: null, // Clear OTP for security
      },
    });

    // Check if both student and tutor have paid
    const allPayments = await this.prisma.payment.findMany({
      where: {
        applicationId: payment.applicationId,
        status: PaymentStatus.VERIFIED,
      },
    });

    // If both paid (2 payments), unlock contact information and set status to BOTH_PAID
    if (allPayments.length >= 2) {
      await this.prisma.$transaction([
        this.prisma.tuitionRequest.update({
          where: { id: payment.requestId },
          data: { contact_unlocked: true },
        }),
        this.prisma.application.update({
          where: { id: payment.applicationId },
          data: { status: "BOTH_PAID" as ApplicationStatus },
        })
      ]);
    }

    return {
      success: true,
      message: "Payment verified successfully!",
    };
  }

  // Resend OTP
  async resendOtp(paymentId: string, userId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException("Payment not found");
    }

    if (payment.userId !== userId) {
      throw new BadRequestException("Unauthorized");
    }

    if (payment.status !== PaymentStatus.OTP_SENT) {
      throw new BadRequestException("Cannot resend OTP in current state");
    }

    const otp = this.generateOTP();
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        otpCode: otp,
        otpExpiresAt,
      },
    });

    console.log(`OTP resent to ${payment.phoneNumber}: ${otp}`);

    return {
      success: true,
      message: `OTP resent to ${payment.phoneNumber}`,
    };
  }

  // Get payment status
  async getPaymentStatus(applicationId: string, userId: string) {
    const payments = await this.prisma.payment.findMany({
      where: {
        applicationId,
        status: PaymentStatus.VERIFIED,
      },
    });

    const userPayment = await this.prisma.payment.findFirst({
      where: {
        applicationId,
        userId,
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      studentPaid: payments.length >= 1,
      tutorPaid: payments.length >= 2,
      bothPaid: payments.length >= 2,
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

  // Get payment by ID
  async getPayment(paymentId: string, userId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        application: {
          include: {
            request: {
              select: {
                title: true,
                subjects: true,
                division: true,
                area: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException("Payment not found");
    }

    if (payment.userId !== userId) {
      throw new BadRequestException("Unauthorized");
    }

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
