import { Injectable, ForbiddenException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { RequestStatus, UserRole } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export interface CreateTuitionRequestDto {
  title: string;
  description: string;
  subjects: string[];
  level?: string;
  mode?: string;
  budget?: number;
  division?: string;
  area?: string;
}

export interface UpdateTuitionRequestDto {
  title?: string;
  description?: string;
  subjects?: string[];
  level?: string;
  mode?: string;
  budget?: number;
  status?: RequestStatus;
  division?: string;
  area?: string;
}

@Injectable()
export class TuitionRequestService {
  constructor(private readonly prisma: PrismaService) {}

  async create(studentId: string, dto: CreateTuitionRequestDto) {
    return this.prisma.tuitionRequest.create({
      data: {
        studentId,
        title: dto.title,
        description: dto.description,
        subjects: dto.subjects,
        level: dto.level,
        mode: dto.mode,
        budget: dto.budget != null ? new Decimal(dto.budget) : null,
        division: dto.division,
        area: dto.area,
      },
      include: {
        student: { select: { email: true, name: true } },
      },
    });
  }

  async findAll(filters?: { status?: RequestStatus; subject?: string; division?: string }) {
    return this.prisma.tuitionRequest.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.subject && { subjects: { has: filters.subject } }),
        ...(filters?.division && { division: filters.division }),
      },
      include: {
        student: { select: { email: true, name: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOpenForTutors() {
    return this.prisma.tuitionRequest.findMany({
      where: { status: "OPEN" },
      include: {
        student: { select: { email: true, name: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    const req = await this.prisma.tuitionRequest.findUnique({
      where: { id },
      include: {
        student: { select: { email: true, name: true, phone: true } },
        applications: {
          include: {
            tutor: { select: { email: true, name: true, phone: true } },
          },
        },
      },
    });
    if (!req) throw new NotFoundException("Tuition request not found");
    return req;
  }

  async findByStudentId(studentId: string) {
    return this.prisma.tuitionRequest.findMany({
      where: { studentId },
      include: {
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async close(id: string, userId: string) {
    const req = await this.findById(id);
    if (req.studentId !== userId) {
      throw new ForbiddenException("Not authorized to close this request");
    }
    return this.prisma.tuitionRequest.update({
      where: { id },
      data: { status: "CLOSED", closed_at: new Date() },
    });
  }

  async update(id: string, userId: string, role: UserRole, dto: UpdateTuitionRequestDto) {
    const req = await this.findById(id);
    if (req.studentId !== userId && role !== "ADMIN") {
      throw new ForbiddenException("Not authorized to update this request");
    }
    return this.prisma.tuitionRequest.update({
      where: { id },
      data: {
        ...(dto.title != null && { title: dto.title }),
        ...(dto.description != null && { description: dto.description }),
        ...(dto.subjects != null && { subjects: dto.subjects }),
        ...(dto.level != null && { level: dto.level }),
        ...(dto.mode != null && { mode: dto.mode }),
        ...(dto.budget != null && { budget: new Decimal(dto.budget) }),
        ...(dto.status != null && { status: dto.status }),
        ...(dto.division != null && { division: dto.division }),
        ...(dto.area != null && { area: dto.area }),
      },
    });
  }
}
