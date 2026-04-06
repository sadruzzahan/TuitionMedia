import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { CreateTuitionRequestSchema } from "shared-schema";
import { TuitionRequestService } from "./tuition-request.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import type { RequestStatus, UserRole } from "@prisma/client";

interface JwtUser { id: string; email: string; role: UserRole }

@Controller("tuition-requests")
export class TuitionRequestController {
  constructor(
    private readonly service: TuitionRequestService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query("status") status?: RequestStatus, @Query("subject") subject?: string) {
    return this.service.findAll({ status, subject });
  }

  @Get("open")
  @UseGuards(JwtAuthGuard)
  findOpen() {
    return this.service.findOpenForTutors();
  }

  @Get("my")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("STUDENT")
  findMy(@Req() req: { user: JwtUser }) {
    return this.service.findByStudentId(req.user.id);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  findById(@Param("id") id: string) {
    return this.service.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("STUDENT")
  @UsePipes(new ZodValidationPipe(CreateTuitionRequestSchema))
  create(
    @Req() req: { user: JwtUser },
    @Body() body: { title: string; description: string; subjects: string[]; level?: string; mode?: string; budget?: number; division?: string; area?: string },
  ) {
    return this.service.create(req.user.id, body);
  }

  @Delete(":id/close")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("STUDENT")
  close(@Param("id") id: string, @Req() req: { user: JwtUser }) {
    return this.service.close(id, req.user.id);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  update(
    @Param("id") id: string,
    @Req() req: { user: JwtUser },
    @Body() body: { title?: string; description?: string; subjects?: string[]; level?: string; mode?: string; budget?: number; status?: RequestStatus; division?: string; area?: string },
  ) {
    return this.service.update(id, req.user.id, req.user.role, body);
  }
}
