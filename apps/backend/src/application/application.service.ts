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

const PLATFORM_FEE = 500;

@Injectable()
export class ApplicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(requestId: string, tutorId: string, coverLetter: string) {
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

    const tutor = await this.prisma.user.findUnique({ where: { id: tutorId }, select: { name: true, email: true } });

    const application = await this.prisma.application.create({
      data: { requestId, tutorId, coverLetter },
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
    const request = await this.prisma.tuitionRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new NotFoundException("Tuition request not found");
    if (request.studentId !== studentUserId) {
      throw new ForbiddenException("Not authorized");
    }
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

  async acceptWithPaymentRequirement(applicationId: string, studentUserId: string) {
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

    return {
      requiresPayment: true,
      amount: PLATFORM_FEE,
      currency: "BDT",
      applicationId,
      message: "Please pay ৳500 platform fee to accept this application",
    };
  }

  async confirmAcceptance(applicationId: string, studentUserId: string) {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { request: true },
    });
    if (!app) throw new NotFoundException("Application not found");
    if (app.request.studentId !== studentUserId) {
      throw new ForbiddenException("Not authorized");
    }
    if (app.status !== "PENDING") {
      throw new ConflictException("Application already processed");
    }

    const studentPayment = await this.prisma.payment.findFirst({
      where: { applicationId, userId: studentUserId, status: "VERIFIED" },
    });

    if (!studentPayment) {
      throw new BadRequestException("Payment not verified. Please complete payment first.");
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.application.update({
        where: { id: applicationId },
        data: { status: "STUDENT_PAID" as ApplicationStatus },
      }),
      this.prisma.application.updateMany({
        where: { requestId: app.requestId, id: { not: applicationId }, status: "PENDING" },
        data: { status: "REJECTED" as ApplicationStatus },
      }),
      this.prisma.tuitionRequest.update({
        where: { id: app.requestId },
        data: { status: "CLOSED" },
      }),
    ]);

    const student = await this.prisma.user.findUnique({
      where: { id: studentUserId },
      select: { name: true, email: true },
    });

    await this.notificationService.create({
      userId: app.tutorId,
      type: "APPLICATION_ACCEPTED",
      title: "Your application was accepted!",
      message: `${student?.name ?? student?.email ?? "A student"} accepted your application. Please pay ৳500 to connect.`,
      data: { applicationId, requestId: app.requestId },
    });

    return updated;
  }

  async tutorConfirmWithPaymentRequirement(applicationId: string, tutorUserId: string) {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { request: true },
    });
    if (!app) throw new NotFoundException("Application not found");
    if (app.tutorId !== tutorUserId) {
      throw new ForbiddenException("Not authorized");
    }
    if (app.status !== ApplicationStatus.STUDENT_PAID) {
      throw new ConflictException("Application must be accepted by student first");
    }

    const studentPayment = await this.prisma.payment.findFirst({
      where: { applicationId, status: "VERIFIED" },
    });

    if (!studentPayment) {
      throw new BadRequestException("Student has not completed payment yet");
    }

    const tutorPayment = await this.prisma.payment.findFirst({
      where: { applicationId, userId: tutorUserId, status: "VERIFIED" },
    });

    if (tutorPayment) {
      await this.prisma.tuitionRequest.update({
        where: { id: app.requestId },
        data: { status: "IN_PROGRESS", contact_unlocked: true },
      });
      return { alreadyPaid: true, message: "Contact information unlocked" };
    }

    return {
      requiresPayment: true,
      amount: PLATFORM_FEE,
      currency: "BDT",
      applicationId,
      message: "Please pay ৳500 platform fee to confirm and unlock contact details",
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
    if (!isStudent && !isTutor) {
      throw new ForbiddenException("Not authorized");
    }

    const payments = await this.prisma.payment.findMany({
      where: { applicationId, status: "VERIFIED" },
    });

    const userPayment = await this.prisma.payment.findFirst({
      where: { applicationId, userId },
      orderBy: { createdAt: "desc" },
    });

    return {
      studentPaid: payments.length >= 1,
      tutorPaid: payments.length >= 2,
      bothPaid: payments.length >= 2,
      contactUnlocked: app.request.contact_unlocked,
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
    if (app.request.studentId !== studentUserId) {
      throw new ForbiddenException("Not authorized");
    }

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
