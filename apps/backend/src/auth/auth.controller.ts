import { Body, Controller, Get, Post, Put, Req, UseGuards, UsePipes } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { RegisterUserSchema, LoginUserSchema } from "shared-schema";
import { JwtAuthGuard } from "./jwt-auth.guard";
import type { UserRole } from "@prisma/client";

interface JwtUser { id: string; email: string; role: UserRole }

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @UsePipes(new ZodValidationPipe(RegisterUserSchema))
  async register(
    @Body()
    dto: {
      email: string;
      password: string;
      role: "STUDENT" | "TUTOR";
      name?: string;
      tutorProfile?: { bio?: string; subjects?: string[]; hourlyRate?: number; education?: string };
      studentProfile?: { gradeLevel?: string; preferredLocation?: string };
    },
  ) {
    const profile = dto.role === "TUTOR" ? dto.tutorProfile : dto.studentProfile;
    return this.authService.register(dto.email, dto.password, dto.role, dto.name, profile);
  }

  @Post("login")
  @UsePipes(new ZodValidationPipe(LoginUserSchema))
  async login(@Body() dto: { email: string; password: string }) {
    return this.authService.login(dto.email, dto.password);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: { user: JwtUser }) {
    return this.authService.getMe(req.user.id);
  }

  @Put("profile")
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @Req() req: { user: JwtUser },
    @Body() body: { name?: string; phone?: string },
  ) {
    return this.authService.updateProfile(req.user.id, body);
  }

  @Get("tutor-profile")
  @UseGuards(JwtAuthGuard)
  getTutorProfile(@Req() req: { user: JwtUser }) {
    return this.authService.getTutorProfile(req.user.id);
  }

  @Put("tutor-profile")
  @UseGuards(JwtAuthGuard)
  upsertTutorProfile(
    @Req() req: { user: JwtUser },
    @Body() body: { bio?: string; subjects?: string[]; hourly_rate?: number; education?: string; location?: string; experience?: number },
  ) {
    return this.authService.upsertTutorProfile(req.user.id, body);
  }

  @Get("student-profile")
  @UseGuards(JwtAuthGuard)
  getStudentProfile(@Req() req: { user: JwtUser }) {
    return this.authService.getStudentProfile(req.user.id);
  }

  @Put("student-profile")
  @UseGuards(JwtAuthGuard)
  upsertStudentProfile(
    @Req() req: { user: JwtUser },
    @Body() body: { grade?: string; school?: string; subjects?: string[]; goals?: string; location?: string },
  ) {
    return this.authService.upsertStudentProfile(req.user.id, body);
  }
}
