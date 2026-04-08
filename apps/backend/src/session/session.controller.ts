import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { SessionService } from "./session.service";

@Controller("sessions")
@UseGuards(JwtAuthGuard)
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Put("availability")
  async setAvailability(
    @Body() body: { slots: { dayOfWeek: number; startHour: number; endHour: number }[] },
    @Request() req: { user: { id: string } },
  ) {
    return this.sessionService.setAvailability(req.user.id, body.slots ?? []);
  }

  @Get("availability/my")
  async getMyAvailability(@Request() req: { user: { id: string } }) {
    return this.sessionService.getAvailability(req.user.id);
  }

  @Get("availability/:tutorId")
  async getTutorAvailability(@Param("tutorId") tutorId: string) {
    return this.sessionService.getAvailability(tutorId);
  }

  @Get("availability/:tutorId/slots")
  async getAvailableSlots(
    @Param("tutorId") tutorId: string,
    @Query("days") days: string | undefined,
  ) {
    return this.sessionService.getAvailableSlots(tutorId, days ? Number(days) : 30);
  }

  @Get("upcoming")
  async getUpcoming(@Request() req: { user: { id: string } }) {
    return this.sessionService.getUpcoming(req.user.id);
  }

  @Get("history")
  async getHistory(@Request() req: { user: { id: string } }) {
    return this.sessionService.getHistory(req.user.id);
  }

  @Get("application/:applicationId")
  async getByApplication(
    @Param("applicationId") applicationId: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.sessionService.getSessionsByApplication(applicationId, req.user.id);
  }

  @Post("book/:applicationId")
  async book(
    @Param("applicationId") applicationId: string,
    @Body() body: { scheduledAt: string; durationMinutes: number; subject: string; notes?: string },
    @Request() req: { user: { id: string } },
  ) {
    return this.sessionService.bookSession(applicationId, req.user.id, body);
  }

  @Post(":sessionId/confirm")
  async confirm(
    @Param("sessionId") sessionId: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.sessionService.confirmSession(sessionId, req.user.id);
  }

  @Post(":sessionId/cancel")
  async cancel(
    @Param("sessionId") sessionId: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.sessionService.cancelSession(sessionId, req.user.id);
  }

  @Post(":sessionId/complete")
  async complete(
    @Param("sessionId") sessionId: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.sessionService.completeSession(sessionId, req.user.id);
  }

  @Post(":sessionId/reschedule")
  async reschedule(
    @Param("sessionId") sessionId: string,
    @Body() body: { scheduledAt: string; durationMinutes?: number },
    @Request() req: { user: { id: string } },
  ) {
    return this.sessionService.rescheduleSession(sessionId, req.user.id, body);
  }
}
