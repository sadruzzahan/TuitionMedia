import { Controller, Get, Post, Param, UseGuards, Request } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { NotificationService } from "./notification.service";

@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications(@Request() req: { user: { id: string } }) {
    return this.notificationService.findByUser(req.user.id);
  }

  @Get("unread-count")
  async getUnreadCount(@Request() req: { user: { id: string } }) {
    const count = await this.notificationService.getUnreadCount(req.user.id);
    return { count };
  }

  @Post("mark-all-read")
  async markAllRead(@Request() req: { user: { id: string } }) {
    await this.notificationService.markAllRead(req.user.id);
    return { success: true };
  }

  @Post(":id/read")
  async markRead(
    @Param("id") id: string,
    @Request() req: { user: { id: string } },
  ) {
    await this.notificationService.markRead(id, req.user.id);
    return { success: true };
  }
}
