import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  private isChatEnabled(status: string): boolean {
    return status === "BOTH_PAID" || status === "CONNECTED";
  }

  async canAccessChat(applicationId: string, userId: string): Promise<boolean> {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { request: { select: { studentId: true } } },
    });
    if (!app) return false;
    const isStudent = app.request.studentId === userId;
    const isTutor = app.tutorId === userId;
    if (!isStudent && !isTutor) return false;
    return this.isChatEnabled(app.status);
  }

  async createMessage(
    applicationId: string,
    senderId: string,
    content: string,
  ): Promise<{ message: { id: string; applicationId: string; senderId: string; content: string; createdAt: Date; readAt: Date | null; sender: { name: string | null; email: string } }; recipientId: string; requestId: string }> {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { request: { select: { id: true, studentId: true } } },
    });
    if (!app) throw new NotFoundException("Application not found");

    const isStudent = app.request.studentId === senderId;
    const isTutor = app.tutorId === senderId;
    if (!isStudent && !isTutor) throw new ForbiddenException("Not authorized");
    if (!this.isChatEnabled(app.status)) {
      throw new ForbiddenException("Chat not available yet");
    }

    const message = await this.prisma.message.create({
      data: { applicationId, senderId, content },
      include: { sender: { select: { name: true, email: true } } },
    });

    const recipientId = isStudent ? app.tutorId : app.request.studentId;

    return { message: { ...message, applicationId: message.applicationId }, recipientId, requestId: app.request.id };
  }

  async getMessages(applicationId: string, userId: string, cursor?: string) {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { request: { select: { studentId: true } } },
    });
    if (!app) throw new NotFoundException("Application not found");

    const isStudent = app.request.studentId === userId;
    const isTutor = app.tutorId === userId;
    if (!isStudent && !isTutor) throw new ForbiddenException("Not authorized");
    if (!this.isChatEnabled(app.status)) {
      throw new ForbiddenException("Chat not available yet");
    }

    const PAGE_SIZE = 50;

    const messages = await this.prisma.message.findMany({
      where: {
        applicationId,
        ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
      },
      include: { sender: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE + 1,
    });

    const hasMore = messages.length > PAGE_SIZE;
    if (hasMore) messages.pop();

    const items = messages.reverse();
    const firstItem = items[0];
    const nextCursor = hasMore && firstItem ? firstItem.createdAt.toISOString() : null;

    return { items, hasMore, nextCursor };
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
