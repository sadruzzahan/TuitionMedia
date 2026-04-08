import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async canAccessChat(applicationId: string, userId: string): Promise<boolean> {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { request: { select: { studentId: true, contact_unlocked: true } } },
    });
    if (!app) return false;
    const isStudent = app.request.studentId === userId;
    const isTutor = app.tutorId === userId;
    if (!isStudent && !isTutor) return false;
    return app.status === "BOTH_PAID" || app.request.contact_unlocked;
  }

  async createMessage(
    applicationId: string,
    senderId: string,
    content: string,
  ): Promise<{ message: { id: string; applicationId: string; senderId: string; content: string; createdAt: Date; readAt: Date | null; sender: { name: string | null; email: string } }; recipientId: string }> {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { request: { select: { studentId: true, contact_unlocked: true } } },
    });
    if (!app) throw new NotFoundException("Application not found");

    const isStudent = app.request.studentId === senderId;
    const isTutor = app.tutorId === senderId;
    if (!isStudent && !isTutor) throw new ForbiddenException("Not authorized");
    if (app.status !== "BOTH_PAID" && !app.request.contact_unlocked) {
      throw new ForbiddenException("Chat not available yet");
    }

    const message = await this.prisma.message.create({
      data: { applicationId, senderId, content },
      include: { sender: { select: { name: true, email: true } } },
    });

    const recipientId = isStudent ? app.tutorId : app.request.studentId;

    return { message: { ...message, applicationId: message.applicationId }, recipientId };
  }

  async getMessages(applicationId: string, userId: string, cursor?: string) {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { request: { select: { studentId: true, contact_unlocked: true } } },
    });
    if (!app) throw new NotFoundException("Application not found");

    const isStudent = app.request.studentId === userId;
    const isTutor = app.tutorId === userId;
    if (!isStudent && !isTutor) throw new ForbiddenException("Not authorized");
    if (app.status !== "BOTH_PAID" && !app.request.contact_unlocked) {
      throw new ForbiddenException("Chat not available yet");
    }

    const messages = await this.prisma.message.findMany({
      where: { applicationId, ...(cursor ? { id: { lt: cursor } } : {}) },
      include: { sender: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return messages.reverse();
  }

  async markRead(applicationId: string, userId: string) {
    await this.prisma.message.updateMany({
      where: {
        applicationId,
        readAt: null,
        senderId: { not: userId },
      },
      data: { readAt: new Date() },
    });
  }
}
