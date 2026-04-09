import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ApplicationStatus } from "@prisma/client";
import { NotificationService } from "../notification/notification.service";

const FINDER_FEE_RATE = 0.5;
const MINIMUM_FINDER_FEE = 300;

function calcFinderFee(proposedRate: number | null): number {
  if (!proposedRate || proposedRate <= 0) return MINIMUM_FINDER_FEE;
  const fee = Math.round(proposedRate * FINDER_FEE_RATE);
  return Math.max(fee, MINIMUM_FINDER_FEE);
}

@Injectable()
export class ApplicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(requestId: string, tutorId: string, coverLetter: string, proposedRate?: number) {
    const request = await this.prisma.tuitionRequest.findUnique({
      where: { id: requestId },
      include: { student: { select: { id: true, name: true, email: true } } },
    });
    if (!request) throw new NotFoundException("Tuition request not found");
    if (request.status !== "OPEN") {
      throw new ConflictException("This request is no longer accepting applications");
    }

    const existing = await this.prisma.application.findUnique({
      where: { requestId_tutorId: { requestId, tutorId } },
    });
    if (existing) throw new ConflictException("You have already applied");

    const tutor = await this.prisma.user.findUnique({
      where: { id: tutorId },
      select: { name: true, email: true },
    });

    const application = await this.prisma.application.create({
      data: {
        requestId,
        tutorId,
        coverLetter,
        proposed_rate: proposedRate ?? null,
      },
      include: {
        request: { select: { title: true, subjects: true } },
        tutor: { select: { email: true } },
      },
    });

    await this.notificationService.create({
      userId: request.studentId,
      type: "NEW_APPLICATION",
      title: "New application received",
      message: `${tutor?.name ?? tutor?.email ?? "A tutor"} applied to your request "${request.title}"`,
      data: { applicationId: application.id, requestId },
    });

    return application;
  }

  async findByRequest(requestId: string, studentUserId: string) {
    const request = await this.prisma.tuitionRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundException("Tuition request not found");
    if (request.studentId !== studentUserId) throw new ForbiddenException("Not authorized");
    return this.prisma.application.findMany({
      where: { requestId },
      include: {
        tutor: { select: { email: true, name: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByTutor(tutorId: string) {
    return this.prisma.application.findMany({
      where: { tutorId },
      include: {
        request: {
          include: { student: { select: { email: true, name: true, phone: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Student accepts an application → trial period starts immediately.
   * No payment required at this stage.
   * Chat is unlocked so student & tutor can coordinate trial classes.
   */
  async accept(applicationId: string, studentUserId: string) {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { request: true },
    });
    if (!app) throw new NotFoundException("Application not found");
    if (app.request.studentId !== studentUserId) {
      throw new ForbiddenException("Not authorized to accept this application");
    }
    if (app.status !== "PENDING") {
      throw new ConflictException("Application already processed");
    }

    const finderFee = calcFinderFee(Number(app.proposed_rate ?? 0));

    await this.prisma.$transaction([
      this.prisma.application.update({
        where: { id: applicationId },
        data: {
          status: "ACCEPTED" as ApplicationStatus,
          responded_at: new Date(),
          trial_started_at: new Date(),
          finder_fee: finderFee,
        },
      }),
      this.prisma.application.updateMany({
        where: { requestId: app.requestId, id: { not: applicationId }, status: "PENDING" },
        data: { status: "REJECTED" as ApplicationStatus },
      }),
      this.prisma.tuitionRequest.update({
        where: { id: app.requestId },
        data: { status: "IN_PROGRESS" },
      }),
    ]);

    const student = await this.prisma.user.findUnique({
      where: { id: studentUserId },
      select: { name: true, email: true },
    });

    await this.notificationService.create({
      userId: app.tutorId,
      type: "TRIAL_STARTED",
      title: "Trial period started!",
      message: `${student?.name ?? student?.email ?? "A student"} has accepted your application. The trial period has begun. Chat with them to arrange trial classes.`,
      data: { applicationId, requestId: app.requestId },
    });

    return {
      success: true,
      trialStarted: true,
      message: "Trial period started. Chat with your tutor to arrange trial classes.",
      applicationId,
    };
  }

  /**
   * Student marks trial as approved ("Guardian Approved").
   * This triggers the tutor's finder fee payment requirement.
   */
  async approveTrialStudent(applicationId: string, studentUserId: string) {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { request: true },
    });
    if (!app) throw new NotFoundException("Application not found");
    if (app.request.studentId !== studentUserId) {
      throw new ForbiddenException("Not authorized");
    }
    if (app.status !== "ACCEPTED") {
      throw new BadRequestException("Application must be in trial period to approve");
    }

    const finderFee = Number(app.finder_fee ?? calcFinderFee(Number(app.proposed_rate ?? 0)));

    await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        status: "TRIAL_APPROVED" as ApplicationStatus,
        trial_approved_at: new Date(),
      },
    });

    await this.notificationService.create({
      userId: app.tutorId,
      type: "TRIAL_APPROVED",
      title: "Guardian approved! Please pay finder's fee.",
      message: `The student/guardian approved the trial classes. Please pay the ৳${finderFee} finder's fee to get the student's contact info.`,
      data: { applicationId, requestId: app.requestId },
    });

    return {
      success: true,
      trialApproved: true,
      finderFee,
      message: "Trial approved. Tutor has been notified to pay the finder's fee.",
    };
  }

  /**
   * Tutor pays finder's fee after trial is approved.
   * Returns the fee amount calculated as 50% of proposed monthly rate.
   */
  async getTutorFinderFeeRequirement(applicationId: string, tutorId: string) {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { request: true },
    });
    if (!app) throw new NotFoundException("Application not found");
    if (app.tutorId !== tutorId) throw new ForbiddenException("Not authorized");

    const allowed = ["TRIAL_APPROVED", "BOTH_PAID", "CONNECTED"] as ApplicationStatus[];
    if (!allowed.includes(app.status)) {
      throw new BadRequestException("Trial must be approved by the student before payment");
    }

    const tutorPayment = await this.prisma.payment.findFirst({
      where: { applicationId, userId: tutorId, status: "VERIFIED" },
    });
    if (tutorPayment) {
      return { alreadyPaid: true, message: "Contact information already unlocked" };
    }

    const finderFee = Number(app.finder_fee ?? calcFinderFee(Number(app.proposed_rate ?? 0)));
    return {
      requiresPayment: true,
      amount: finderFee,
      currency: "BDT",
      applicationId,
      message: `Please pay ৳${finderFee} finder's fee (50% of one month's rate) to unlock the student's contact info.`,
    };
  }

  async getPaymentStatus(applicationId: string, userId: string) {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { request: true },
    });
    if (!app) throw new NotFoundException("Application not found");

    const isStudent = app.request.studentId === userId;
    const isTutor = app.tutorId === userId;
    if (!isStudent && !isTutor) throw new ForbiddenException("Not authorized");

    const payments = await this.prisma.payment.findMany({
      where: { applicationId, status: "VERIFIED" },
    });

    const userPayment = await this.prisma.payment.findFirst({
      where: { applicationId, userId },
      orderBy: { createdAt: "desc" },
    });

    const finderFee = Number(app.finder_fee ?? calcFinderFee(Number(app.proposed_rate ?? 0)));

    return {
      tutorPaid: payments.length >= 1,
      bothPaid: app.status === "BOTH_PAID" || app.status === "CONNECTED",
      contactUnlocked: app.request.contact_unlocked,
      finderFee,
      trialStarted: !!app.trial_started_at,
      trialApproved: !!app.trial_approved_at,
      applicationStatus: app.status,
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

  async reject(applicationId: string, studentUserId: string) {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { request: true },
    });
    if (!app) throw new NotFoundException("Application not found");
    if (app.request.studentId !== studentUserId) throw new ForbiddenException("Not authorized");

    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: { status: "REJECTED" as ApplicationStatus },
    });

    await this.notificationService.create({
      userId: app.tutorId,
      type: "APPLICATION_REJECTED",
      title: "Application not selected",
      message: "Your application was not selected for this request.",
      data: { applicationId, requestId: app.requestId },
    });

    return updated;
  }
}
