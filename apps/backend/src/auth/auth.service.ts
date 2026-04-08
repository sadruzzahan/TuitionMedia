import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Prisma, type UserRole } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  user: { id: string; email: string; name: string | null; role: UserRole };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    email: string,
    password: string,
    role: UserRole,
    name?: string,
    profileData?: { bio?: string; subjects?: string[]; hourlyRate?: number; education?: string } | { gradeLevel?: string; preferredDivision?: string; preferredAreas?: string[] },
  ): Promise<AuthTokens> {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException("Email already registered");
    }

    if (!password || password.length < 8) {
      throw new BadRequestException("Password must be at least 8 characters");
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        email,
        name: name ?? null,
        password_hash: passwordHash,
        role,
        updated_at: new Date(),
      },
    });

    if (role === "TUTOR") {
      const tutorProfile = profileData && "bio" in profileData ? profileData : undefined;
      await this.prisma.tutorProfile.create({
        data: {
          id: crypto.randomUUID(),
          user_id: user.id,
          bio: tutorProfile?.bio,
          subjects: tutorProfile?.subjects ?? [],
          hourly_rate: tutorProfile?.hourlyRate ?? 0,
          education: tutorProfile?.education,
          qualifications: [],
          updated_at: new Date(),
        },
      });
    }

    if (role === "STUDENT") {
      const studentProfile = profileData && "gradeLevel" in profileData ? profileData : undefined;
      await this.prisma.studentProfile.create({
        data: {
          id: crypto.randomUUID(),
          user_id: user.id,
          grade: studentProfile?.gradeLevel,
          division: studentProfile?.preferredDivision,
          areas: studentProfile?.preferredAreas ?? [],
          subjects: [],
          updated_at: new Date(),
        },
      });
    }

    return this.signUser(user);
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({ where: { email }, select: { id: true, email: true, name: true, role: true, password_hash: true } });
    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new UnauthorizedException("Invalid email or password");
    }
    return this.signUser(user);
  }

  async validateUser(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true },
    });
    return user ?? null;
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, phone: true, is_verified: true, created_at: true },
    });
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async updateProfile(userId: string, data: { name?: string; phone?: string }) {
    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.phone !== undefined && { phone: data.phone }),
          updated_at: new Date(),
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          is_verified: true,
          created_at: true,
        },
      });
    } catch (error) {
      this.rethrowPrismaError(error);
    }
  }

  async getTutorProfile(userId: string) {
    return this.prisma.tutorProfile.findUnique({ where: { user_id: userId } });
  }

  async upsertTutorProfile(userId: string, data: { bio?: string; subjects?: string[]; hourly_rate?: number; education?: string; division?: string; areas?: string[]; experience?: number; is_profile_public?: boolean }) {
    const existing = await this.prisma.tutorProfile.findUnique({ where: { user_id: userId } });
    try {
      if (existing) {
        return await this.prisma.tutorProfile.update({
          where: { user_id: userId },
          data: { ...data, updated_at: new Date() },
        });
      }
      return await this.prisma.tutorProfile.create({
        data: {
          id: crypto.randomUUID(),
          user_id: userId,
          bio: data.bio,
          subjects: data.subjects ?? [],
          hourly_rate: data.hourly_rate ?? 0,
          education: data.education,
          division: data.division,
          areas: data.areas ?? [],
          experience: data.experience ?? 0,
          qualifications: [],
          updated_at: new Date(),
        },
      });
    } catch (error) {
      this.rethrowPrismaError(error);
    }
  }

  async getStudentProfile(userId: string) {
    return this.prisma.studentProfile.findUnique({ where: { user_id: userId } });
  }

  async upsertStudentProfile(userId: string, data: { grade?: string; school?: string; subjects?: string[]; goals?: string; division?: string; areas?: string[] }) {
    const existing = await this.prisma.studentProfile.findUnique({ where: { user_id: userId } });
    try {
      if (existing) {
        return await this.prisma.studentProfile.update({
          where: { user_id: userId },
          data: { ...data, updated_at: new Date() },
        });
      }
      return await this.prisma.studentProfile.create({
        data: {
          id: crypto.randomUUID(),
          user_id: userId,
          grade: data.grade,
          school: data.school,
          subjects: data.subjects ?? [],
          goals: data.goals,
          division: data.division,
          areas: data.areas ?? [],
          updated_at: new Date(),
        },
      });
    } catch (error) {
      this.rethrowPrismaError(error);
    }
  }

  private rethrowPrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const target = Array.isArray(error.meta?.target) ? error.meta.target.join(", ") : String(error.meta?.target ?? "");
      if (target.includes("phone")) {
        throw new ConflictException("Phone number is already in use");
      }
      throw new ConflictException("A record with this value already exists");
    }
    throw error;
  }

  private signUser(user: { id: string; email: string; name?: string | null; role: UserRole }): AuthTokens {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    return {
      accessToken,
      user: { id: user.id, email: user.email, name: user.name ?? null, role: user.role },
    };
  }
}
