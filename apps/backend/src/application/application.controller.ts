import { Body, Controller, Get, Param, Post, Req, UseGuards, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { CreateApplicationSchema } from "shared-schema";
import { ApplicationService } from "./application.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import type { UserRole } from "@prisma/client";

interface JwtUser { id: string; email: string; role: UserRole }

@Controller("applications")
export class ApplicationController {
  constructor(
    private readonly service: ApplicationService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("TUTOR")
  @UsePipes(new ZodValidationPipe(CreateApplicationSchema))
  create(
    @Body() body: { requestId: string; coverLetter: string },
    @Req() req: { user: JwtUser },
  ) {
    return this.service.create(body.requestId, req.user.id, body.coverLetter);
  }

  @Get("request/:requestId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("STUDENT")
  findByRequest(
    @Param("requestId") requestId: string,
    @Req() req: { user: JwtUser },
  ) {
    return this.service.findByRequest(requestId, req.user.id);
  }

  @Get("my")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("TUTOR")
  findMy(@Req() req: { user: JwtUser }) {
    return this.service.findByTutor(req.user.id);
  }

  // Student accepts an application - requires payment
  @Post(":id/accept")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("STUDENT")
  async accept(
    @Param("id") id: string,
    @Req() req: { user: JwtUser },
  ) {
    // This now returns payment requirement info
    return this.service.acceptWithPaymentRequirement(id, req.user.id);
  }

  // Confirm acceptance after payment
  @Post(":id/confirm-acceptance")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("STUDENT")
  async confirmAcceptance(
    @Param("id") id: string,
    @Req() req: { user: JwtUser },
  ) {
    return this.service.confirmAcceptance(id, req.user.id);
  }

  // Tutor confirms after student paid - requires tutor payment
  @Post(":id/tutor-confirm")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("TUTOR")
  async tutorConfirm(
    @Param("id") id: string,
    @Req() req: { user: JwtUser },
  ) {
    return this.service.tutorConfirmWithPaymentRequirement(id, req.user.id);
  }

  @Post(":id/reject")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("STUDENT")
  reject(
    @Param("id") id: string,
    @Req() req: { user: JwtUser },
  ) {
    return this.service.reject(id, req.user.id);
  }

  // Check payment status for an application
  @Get(":id/payment-status")
  @UseGuards(JwtAuthGuard)
  async getPaymentStatus(
    @Param("id") id: string,
    @Req() req: { user: JwtUser },
  ) {
    return this.service.getPaymentStatus(id, req.user.id);
  }
}
