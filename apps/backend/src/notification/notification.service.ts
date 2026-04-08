import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationType, Prisma } from "@prisma/client";
import { randomUUID } from "crypto";

export interface IGatewayEmitter {
  emitToUser(userId: string, event: string, payload: unknown): void;
}

@Injectable()
export class NotificationService {
  private gateway: IGatewayEmitter | null = null;

  constructor(private readonly prisma: PrismaService) {}

  setGateway(gateway: IGatewayEmitter) {
    this.gateway = gateway;
  }

  async create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, unknown>;
  }) {
    const jsonData: Prisma.InputJsonValue = (data.data ?? {}) as Prisma.InputJsonValue;
    const notification = await this.prisma.notification.create({
      data: {
        id: randomUUID(),
        user_id: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        data: jsonData,
      },
    });

    this.gateway?.emitToUser(data.userId, "notification", notification);

    return notification;
  }

  async findByUser(userId: string, limit = 20) {
    return this.prisma.notification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
      take: limit,
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { user_id: userId, is_read: false },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true },
    });
  }

  async markRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, user_id: userId },
      data: { is_read: true },
    });
  }
}
