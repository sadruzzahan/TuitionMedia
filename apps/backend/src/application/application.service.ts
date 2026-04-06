import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ApplicationStatus } from "@prisma/client";

const PLATFORM_FEE = 500; // 500 BDT

@Injectable()
export class ApplicationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(requestId: string, tutorId: string, coverLetter: string) {
    const request = await this.prisma.tuitionRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new NotFoundException("Tuition request not found");
    if (request.status !== "OPEN") {
      throw new ConflictException("This request is no longer accepting applications");
    }

    const existing = await this.prisma.application.findUnique({
      where: { requestId_tutorId: { requestId, tutorId } },
    });
    if (existing) throw new ConflictException("You have already applied");

    return this.prisma.application.create({
      data: { requestId, tutorId, coverLetter },
      include: {
        request: { select: { title: true, subjects: true } },
        tutor: { select: { email: true } },
      },
    });
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

  // Student accepts - returns payment requirement
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

    // Return payment requirement info
    return {
      requiresPayment: true,
      amount: PLATFORM_FEE,
      currency: "BDT",
      applicationId,
      message: "Please pay ৳500 platform fee to accept this application",
    };
  }

  // Confirm acceptance after student payment
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

    // Verify student has paid
    const studentPayment = await this.prisma.payment.findFirst({
      where: {
        applicationId,
        userId: studentUserId,
        status: "VERIFIED",
      },
    });

    if (!studentPayment) {
      throw new BadRequestException("Payment not verified. Please complete payment first.");
    }

    // Accept the application (STUDENT_PAID)
    const [updated] = await this.prisma.$transaction([
      this.prisma.application.update({
        where: { id: applicationId },
        data: { status: "STUDENT_PAID" as ApplicationStatus },
      }),
      this.prisma.application.updateMany({
        where: {
          requestId: app.requestId,
          id: { not: applicationId },
          status: "PENDING",
        },
        data: { status: "REJECTED" as ApplicationStatus },
      }),
      this.prisma.tuitionRequest.update({
        where: { id: app.requestId },
        data: { status: "CLOSED" },
      }),
    ]);
    return updated;
  }

  // Tutor confirms after student paid - returns payment requirement
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

    // Check if student has paid
    const studentPayment = await this.prisma.payment.findFirst({
      where: {
        applicationId,
        status: "VERIFIED",
      },
    });

    if (!studentPayment) {
      throw new BadRequestException("Student has not completed payment yet");
    }

    // Check if tutor already paid
    const tutorPayment = await this.prisma.payment.findFirst({
      where: {
        applicationId,
        userId: tutorUserId,
        status: "VERIFIED",
      },
    });

    if (tutorPayment) {
      // Already paid, confirm the request
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

  // Get payment status for an application
  async getPaymentStatus(applicationId: string, userId: string) {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { request: true },
    });
    if (!app) throw new NotFoundException("Application not found");

    // Check authorization
    const isStudent = app.request.studentId === userId;
    const isTutor = app.tutorId === userId;
    if (!isStudent && !isTutor) {
      throw new ForbiddenException("Not authorized");
    }

    const payments = await this.prisma.payment.findMany({
      where: {
        applicationId,
        status: "VERIFIED",
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
    return this.prisma.application.update({
      where: { id: applicationId },
      data: { status: "REJECTED" as ApplicationStatus },
    });
  }
}
