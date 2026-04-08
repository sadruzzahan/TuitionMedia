import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationService } from "../notification/notification.service";

@Injectable()
export class SessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  private async getConnectedApplication(applicationId: string, userId: string): Promise<{
    id: string;
    studentId: string;
    tutorId: string;
    request: { subjects: string[]; title: string };
  }> {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { request: { select: { studentId: true, subjects: true, title: true } } },
    });
    if (!app) throw new NotFoundException("Application not found");

    const isStudent = app.request.studentId === userId;
    const isTutor = app.tutorId === userId;
    if (!isStudent && !isTutor) throw new ForbiddenException("Not authorized");

    const isConnected = app.status === "BOTH_PAID" || app.status === "CONNECTED";
    if (!isConnected) throw new BadRequestException("Not connected yet");

    return {
      id: app.id,
      studentId: app.request.studentId,
      tutorId: app.tutorId,
      request: { subjects: app.request.subjects, title: app.request.title },
    };
  }

  async setAvailability(tutorId: string, slots: { dayOfWeek: number; startHour: number; endHour: number }[]) {
    for (const s of slots) {
      if (s.dayOfWeek < 0 || s.dayOfWeek > 6) throw new BadRequestException("dayOfWeek must be 0-6");
      if (s.startHour < 0 || s.startHour > 23) throw new BadRequestException("startHour invalid");
      if (s.endHour < 1 || s.endHour > 24) throw new BadRequestException("endHour invalid");
      if (s.endHour <= s.startHour) throw new BadRequestException("endHour must be after startHour");
    }

    await this.prisma.$transaction([
      this.prisma.availability.deleteMany({ where: { tutorId } }),
      this.prisma.availability.createMany({
        data: slots.map((s) => ({
          tutorId,
          dayOfWeek: s.dayOfWeek,
          startHour: s.startHour,
          endHour: s.endHour,
        })),
      }),
    ]);

    return this.prisma.availability.findMany({
      where: { tutorId },
      orderBy: [{ dayOfWeek: "asc" }, { startHour: "asc" }],
    });
  }

  async getAvailability(tutorId: string) {
    return this.prisma.availability.findMany({
      where: { tutorId },
      orderBy: [{ dayOfWeek: "asc" }, { startHour: "asc" }],
    });
  }

  async getAvailableSlots(tutorId: string, daysAhead = 30) {
    const availability = await this.prisma.availability.findMany({
      where: { tutorId },
      orderBy: [{ dayOfWeek: "asc" }, { startHour: "asc" }],
    });

    const now = new Date();
    const end = new Date(now);
    end.setDate(end.getDate() + daysAhead);

    const bookedSessions = await this.prisma.session.findMany({
      where: {
        tutorId,
        scheduledAt: { gte: now, lte: end },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      select: { scheduledAt: true, durationMinutes: true },
    });

    const slots: { date: string; startHour: number; availableForMinutes: number }[] = [];
    const current = new Date(now);
    current.setHours(0, 0, 0, 0);

    while (current <= end) {
      const dayOfWeek = current.getDay();
      const dayAvail = availability.filter((a) => a.dayOfWeek === dayOfWeek);

      for (const avail of dayAvail) {
        for (let hour = avail.startHour; hour < avail.endHour; hour++) {
          const slotStart = new Date(current);
          slotStart.setHours(hour, 0, 0, 0);

          if (slotStart <= now) continue;

          const isBooked = bookedSessions.some((s) => {
            const sessionStart = new Date(s.scheduledAt);
            const sessionEnd = new Date(sessionStart);
            sessionEnd.setMinutes(sessionEnd.getMinutes() + s.durationMinutes);
            return slotStart >= sessionStart && slotStart < sessionEnd;
          });

          if (!isBooked) {
            const remainingInBlock = (avail.endHour - hour) * 60;
            slots.push({
              date: current.toISOString().split("T")[0] as string,
              startHour: hour,
              availableForMinutes: remainingInBlock,
            });
          }
        }
      }
      current.setDate(current.getDate() + 1);
    }

    return slots;
  }

  async bookSession(
    applicationId: string,
    studentId: string,
    data: { scheduledAt: string; durationMinutes: number; subject: string; notes?: string },
  ) {
    const app = await this.getConnectedApplication(applicationId, studentId);
    if (app.studentId !== studentId) throw new ForbiddenException("Only students can book sessions");

    const scheduledAt = new Date(data.scheduledAt);
    if (scheduledAt <= new Date()) throw new BadRequestException("Session must be in the future");

    const ALLOWED_DURATIONS = [30, 60, 90, 120];
    if (!ALLOWED_DURATIONS.includes(data.durationMinutes)) {
      throw new BadRequestException("Duration must be 30, 60, 90, or 120 minutes");
    }

    const slotHour = scheduledAt.getHours();
    const slotDayOfWeek = scheduledAt.getDay();

    const availability = await this.prisma.availability.findFirst({
      where: {
        tutorId: app.tutorId,
        dayOfWeek: slotDayOfWeek,
        startHour: { lte: slotHour },
        endHour: { gt: slotHour },
      },
    });
    if (!availability) {
      throw new BadRequestException("Selected time is outside tutor's availability");
    }

    const sessionEnd = new Date(scheduledAt);
    sessionEnd.setMinutes(sessionEnd.getMinutes() + data.durationMinutes);

    const sessionEndHour = sessionEnd.getHours() + sessionEnd.getMinutes() / 60;
    if (sessionEndHour > availability.endHour) {
      throw new BadRequestException(
        `Session of ${data.durationMinutes} minutes starting at ${slotHour}:00 would run past tutor availability end at ${availability.endHour}:00`,
      );
    }

    const overlap = await this.prisma.session.findFirst({
      where: {
        tutorId: app.tutorId,
        status: { in: ["PENDING", "CONFIRMED"] },
        AND: [
          { scheduledAt: { lt: sessionEnd } },
          {
            scheduledAt: {
              gte: new Date(scheduledAt.getTime() - 120 * 60 * 1000),
            },
          },
        ],
      },
      select: { id: true, scheduledAt: true, durationMinutes: true },
    });

    if (overlap) {
      const overlapEnd = new Date(overlap.scheduledAt);
      overlapEnd.setMinutes(overlapEnd.getMinutes() + overlap.durationMinutes);
      const newStart = scheduledAt;
      if (newStart < overlapEnd && sessionEnd > overlap.scheduledAt) {
        throw new BadRequestException("This time slot conflicts with an existing session");
      }
    }

    const session = await this.prisma.session.create({
      data: {
        applicationId,
        studentId: app.studentId,
        tutorId: app.tutorId,
        scheduledAt,
        durationMinutes: data.durationMinutes,
        subject: data.subject,
        notes: data.notes,
      },
      include: {
        student: { select: { name: true, email: true } },
        tutor: { select: { name: true, email: true } },
      },
    });

    await this.notificationService.create({
      userId: app.tutorId,
      type: "SESSION_BOOKED",
      title: "New session booked",
      message: `${session.student.name ?? session.student.email} booked a session for ${scheduledAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} at ${scheduledAt.getHours()}:00`,
      data: { sessionId: session.id, applicationId },
    });

    return session;
  }

  async confirmSession(sessionId: string, tutorId: string) {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException("Session not found");
    if (session.tutorId !== tutorId) throw new ForbiddenException("Only the tutor can confirm");
    if (session.status !== "PENDING") throw new BadRequestException("Session is not pending");

    const updated = await this.prisma.session.update({
      where: { id: sessionId },
      data: { status: "CONFIRMED" },
      include: {
        student: { select: { name: true, email: true } },
        tutor: { select: { name: true, email: true } },
      },
    });

    await this.notificationService.create({
      userId: session.studentId,
      type: "SESSION_CONFIRMED",
      title: "Session confirmed",
      message: `${updated.tutor.name ?? updated.tutor.email} confirmed your session on ${updated.scheduledAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} at ${updated.scheduledAt.getHours()}:00`,
      data: { sessionId, applicationId: session.applicationId },
    });

    return updated;
  }

  async cancelSession(sessionId: string, userId: string) {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException("Session not found");

    const isStudent = session.studentId === userId;
    const isTutor = session.tutorId === userId;
    if (!isStudent && !isTutor) throw new ForbiddenException("Not authorized");

    if (session.status === "COMPLETED" || session.status === "CANCELLED") {
      throw new BadRequestException("Cannot cancel a completed or already cancelled session");
    }

    const updated = await this.prisma.session.update({
      where: { id: sessionId },
      data: { status: "CANCELLED" },
      include: {
        student: { select: { name: true, email: true } },
        tutor: { select: { name: true, email: true } },
      },
    });

    const recipientId = isStudent ? session.tutorId : session.studentId;
    const actorName = isStudent
      ? (updated.student.name ?? updated.student.email)
      : (updated.tutor.name ?? updated.tutor.email);

    await this.notificationService.create({
      userId: recipientId,
      type: "SESSION_CANCELLED",
      title: "Session cancelled",
      message: `${actorName} cancelled the session on ${updated.scheduledAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} at ${updated.scheduledAt.getHours()}:00`,
      data: { sessionId, applicationId: session.applicationId },
    });

    return updated;
  }

  async completeSession(sessionId: string, userId: string) {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException("Session not found");

    const isStudent = session.studentId === userId;
    const isTutor = session.tutorId === userId;
    if (!isStudent && !isTutor) throw new ForbiddenException("Not authorized");

    if (session.status === "CANCELLED") throw new BadRequestException("Cannot complete a cancelled session");
    if (session.status === "COMPLETED") throw new BadRequestException("Session already completed");
    if (new Date(session.scheduledAt) > new Date()) {
      throw new BadRequestException("Session cannot be completed before the scheduled time");
    }

    const updated = await this.prisma.session.update({
      where: { id: sessionId },
      data: { status: "COMPLETED" },
      include: {
        student: { select: { name: true, email: true } },
        tutor: { select: { name: true, email: true } },
      },
    });

    const recipientId = isStudent ? session.tutorId : session.studentId;

    await this.notificationService.create({
      userId: recipientId,
      type: "SESSION_COMPLETED",
      title: "Session completed",
      message: `Session on ${updated.scheduledAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} marked as completed. Consider leaving a review!`,
      data: { sessionId, applicationId: session.applicationId },
    });

    return updated;
  }

  async rescheduleSession(
    sessionId: string,
    userId: string,
    data: { scheduledAt: string; durationMinutes?: number },
  ) {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException("Session not found");

    const isStudent = session.studentId === userId;
    const isTutor = session.tutorId === userId;
    if (!isStudent && !isTutor) throw new ForbiddenException("Not authorized");

    if (session.status === "COMPLETED" || session.status === "CANCELLED") {
      throw new BadRequestException("Cannot reschedule a completed or cancelled session");
    }

    const newScheduledAt = new Date(data.scheduledAt);
    if (newScheduledAt <= new Date()) throw new BadRequestException("Rescheduled time must be in the future");

    const duration = data.durationMinutes ?? session.durationMinutes;
    const ALLOWED_DURATIONS = [30, 60, 90, 120];
    if (!ALLOWED_DURATIONS.includes(duration)) {
      throw new BadRequestException("Duration must be 30, 60, 90, or 120 minutes");
    }

    const slotHour = newScheduledAt.getHours();
    const slotDayOfWeek = newScheduledAt.getDay();

    const availability = await this.prisma.availability.findFirst({
      where: {
        tutorId: session.tutorId,
        dayOfWeek: slotDayOfWeek,
        startHour: { lte: slotHour },
        endHour: { gt: slotHour },
      },
    });
    if (!availability) {
      throw new BadRequestException("Rescheduled time is outside tutor's availability");
    }

    const sessionEnd = new Date(newScheduledAt);
    sessionEnd.setMinutes(sessionEnd.getMinutes() + duration);
    const sessionEndHour = sessionEnd.getHours() + sessionEnd.getMinutes() / 60;
    if (sessionEndHour > availability.endHour) {
      throw new BadRequestException(
        `Session of ${duration} minutes starting at ${slotHour}:00 would run past tutor availability`,
      );
    }

    const overlap = await this.prisma.session.findFirst({
      where: {
        tutorId: session.tutorId,
        id: { not: sessionId },
        status: { in: ["PENDING", "CONFIRMED"] },
        AND: [
          { scheduledAt: { lt: sessionEnd } },
          { scheduledAt: { gte: new Date(newScheduledAt.getTime() - 120 * 60 * 1000) } },
        ],
      },
      select: { id: true, scheduledAt: true, durationMinutes: true },
    });

    if (overlap) {
      const overlapEnd = new Date(overlap.scheduledAt);
      overlapEnd.setMinutes(overlapEnd.getMinutes() + overlap.durationMinutes);
      if (newScheduledAt < overlapEnd && sessionEnd > overlap.scheduledAt) {
        throw new BadRequestException("Rescheduled time conflicts with an existing session");
      }
    }

    const updated = await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        scheduledAt: newScheduledAt,
        durationMinutes: duration,
        status: "PENDING",
      },
      include: {
        student: { select: { name: true, email: true } },
        tutor: { select: { name: true, email: true } },
      },
    });

    const recipientId = isStudent ? session.tutorId : session.studentId;
    const actorName = isStudent
      ? (updated.student.name ?? updated.student.email)
      : (updated.tutor.name ?? updated.tutor.email);

    await this.notificationService.create({
      userId: recipientId,
      type: "SESSION_BOOKED",
      title: "Session rescheduled",
      message: `${actorName} rescheduled a session to ${newScheduledAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} at ${slotHour}:00`,
      data: { sessionId, applicationId: session.applicationId },
    });

    return updated;
  }

  private sessionInclude() {
    return {
      student: { select: { id: true, name: true, email: true } },
      tutor: { select: { id: true, name: true, email: true } },
      application: { select: { id: true, request: { select: { id: true, title: true, subjects: true } } } },
    };
  }

  async getUpcoming(userId: string) {
    return this.prisma.session.findMany({
      where: {
        OR: [{ studentId: userId }, { tutorId: userId }],
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      include: this.sessionInclude(),
      orderBy: { scheduledAt: "asc" },
    });
  }

  async getHistory(userId: string) {
    return this.prisma.session.findMany({
      where: {
        OR: [{ studentId: userId }, { tutorId: userId }],
        status: { in: ["COMPLETED", "CANCELLED"] },
      },
      include: this.sessionInclude(),
      orderBy: { scheduledAt: "desc" },
      take: 50,
    });
  }

  async getSessionsByApplication(applicationId: string, userId: string) {
    const app = await this.getConnectedApplication(applicationId, userId);
    return this.prisma.session.findMany({
      where: { applicationId: app.id },
      include: this.sessionInclude(),
      orderBy: { scheduledAt: "asc" },
    });
  }
}
