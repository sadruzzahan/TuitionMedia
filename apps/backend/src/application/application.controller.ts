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
  constructor(private readonly service: ApplicationService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("TUTOR")
  @UsePipes(new ZodValidationPipe(CreateApplicationSchema))
  create(
    @Body() body: { requestId: string; coverLetter: string; proposedRate?: number },
    @Req() req: { user: JwtUser },
  ) {
    return this.service.create(body.requestId, req.user.id, body.coverLetter, body.proposedRate);
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

  /** Student accepts application — trial starts immediately, no payment */
  @Post(":id/accept")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("STUDENT")
  accept(
    @Param("id") id: string,
    @Req() req: { user: JwtUser },
  ) {
    return this.service.accept(id, req.user.id);
  }

  /** Student marks trial as "Guardian Approved" — triggers tutor finder fee */
  @Post(":id/approve-trial")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("STUDENT")
  approveTrial(
    @Param("id") id: string,
    @Req() req: { user: JwtUser },
  ) {
    return this.service.approveTrialStudent(id, req.user.id);
  }

  /** Tutor: get finder fee requirement after trial approved */
  @Post(":id/tutor-confirm")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("TUTOR")
  tutorConfirm(
    @Param("id") id: string,
    @Req() req: { user: JwtUser },
  ) {
    return this.service.getTutorFinderFeeRequirement(id, req.user.id);
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

  @Get(":id/payment-status")
  @UseGuards(JwtAuthGuard)
  getPaymentStatus(
    @Param("id") id: string,
    @Req() req: { user: JwtUser },
  ) {
    return this.service.getPaymentStatus(id, req.user.id);
  }
}
