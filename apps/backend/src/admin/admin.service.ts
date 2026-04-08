import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { randomUUID } from "crypto";

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalUsers,
      studentCount,
      tutorCount,
      adminCount,
      connections,
      openRequests,
      totalRevenue,
      monthlyRevenue,
      lastMonthRevenue,
      newUsersThisMonth,
      fulfillmentsThisMonth,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: "STUDENT" } }),
      this.prisma.user.count({ where: { role: "TUTOR" } }),
      this.prisma.user.count({ where: { role: "ADMIN" } }),
      this.prisma.application.count({ where: { status: "CONNECTED" } }),
      this.prisma.tuitionRequest.count({ where: { status: "OPEN" } }),
      this.prisma.payment.aggregate({
        where: { status: "VERIFIED" },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { status: "VERIFIED", createdAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          status: "VERIFIED",
          createdAt: { gte: startOfLastMonth, lt: startOfMonth },
        },
        _sum: { amount: true },
      }),
      this.prisma.user.count({ where: { created_at: { gte: startOfMonth } } }),
      this.prisma.tuitionRequest.count({
        where: { status: { in: ["ASSIGNED", "CLOSED"] }, updatedAt: { gte: startOfMonth } },
      }),
    ]);

    const monthlyRevenueByMonth = await this.getMonthlyRevenue();
    const recentActivity = await this.getRecentActivity();

    return {
      totalUsers,
      studentCount,
      tutorCount,
      adminCount,
      connections,
      openRequests,
      totalRevenue: Number(totalRevenue._sum.amount ?? 0),
      monthlyRevenue: Number(monthlyRevenue._sum.amount ?? 0),
      lastMonthRevenue: Number(lastMonthRevenue._sum.amount ?? 0),
      newUsersThisMonth,
      fulfillmentsThisMonth,
      monthlyRevenueByMonth,
      recentActivity,
    };
  }

  private async getRecentActivity(): Promise<{ type: string; label: string; detail: string; time: Date }[]> {
    const [recentUsers, recentConnections, recentPayments] = await Promise.all([
      this.prisma.user.findMany({
        orderBy: { created_at: "desc" },
        take: 4,
        select: { name: true, email: true, role: true, created_at: true },
      }),
      this.prisma.application.findMany({
        where: { status: "CONNECTED" },
        orderBy: { updatedAt: "desc" },
        take: 3,
        include: {
          tutor: { select: { name: true } },
          request: { select: { title: true } },
        },
      }),
      this.prisma.payment.findMany({
        where: { status: "VERIFIED" },
        orderBy: { verifiedAt: "desc" },
        take: 3,
        include: { user: { select: { name: true } }, request: { select: { title: true } } },
      }),
    ]);

    const events: { type: string; label: string; detail: string; time: Date }[] = [];

    for (const u of recentUsers) {
      events.push({
        type: "registration",
        label: `New ${u.role.toLowerCase()} registered`,
        detail: u.name ?? u.email,
        time: u.created_at,
      });
    }
    for (const c of recentConnections) {
      events.push({
        type: "connection",
        label: "New tutor-student connection",
        detail: `${c.tutor.name ?? "Tutor"} for "${c.request.title}"`,
        time: c.updatedAt,
      });
    }
    for (const p of recentPayments) {
      events.push({
        type: "payment",
        label: `Payment verified — ৳${Number(p.amount).toLocaleString()}`,
        detail: `${p.user.name ?? "User"} · ${p.request.title}`,
        time: p.verifiedAt ?? p.createdAt,
      });
    }

    events.sort((a, b) => b.time.getTime() - a.time.getTime());
    return events.slice(0, 10);
  }

  private async getMonthlyRevenue() {
    const months: { month: string; revenue: number }[] = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const result = await this.prisma.payment.aggregate({
        where: { status: "VERIFIED", createdAt: { gte: start, lt: end } },
        _sum: { amount: true },
      });
      months.push({
        month: start.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        revenue: Number(result._sum.amount ?? 0),
      });
    }

    return months;
  }

  async getUsers(params: {
    page: number;
    limit: number;
    search?: string;
    role?: string;
    status?: string;
  }) {
    const { page, limit, search, role, status } = params;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    if (role && ["STUDENT", "TUTOR", "ADMIN"].includes(role)) {
      where.role = role;
    }
    if (status === "active") where.is_active = true;
    if (status === "inactive") where.is_active = false;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          is_active: true,
          created_at: true,
          tutor_profile: { select: { is_verified: true, is_premium: true, average_rating: true } },
        },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        isActive: u.is_active,
        createdAt: u.created_at,
        isVerified: u.tutor_profile?.is_verified ?? false,
        isPremium: u.tutor_profile?.is_premium ?? false,
        averageRating: u.tutor_profile?.average_rating ? Number(u.tutor_profile.average_rating) : null,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserDetail(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        tutor_profile: true,
        student_profile: true,
        applications: { select: { id: true, status: true }, take: 5 },
        tuition_requests: { select: { id: true, status: true, title: true }, take: 5 },
      },
    });
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async updateUser(adminId: string, userId: string, dto: { isActive?: boolean; isPremium?: boolean }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    const updates: Record<string, unknown> = {};
    if (dto.isActive !== undefined) updates.is_active = dto.isActive;

    if (Object.keys(updates).length > 0) {
      await this.prisma.user.update({ where: { id: userId }, data: updates });
    }

    if (dto.isPremium !== undefined) {
      await this.prisma.tutorProfile.updateMany({
        where: { user_id: userId },
        data: { is_premium: dto.isPremium },
      });
    }

    await this.prisma.adminAudit.create({
      data: {
        id: randomUUID(),
        admin_id: adminId,
        action: "UPDATE_USER",
        target_type: "user",
        target_id: userId,
        metadata: JSON.parse(JSON.stringify(dto)),
      },
    });

    return { success: true };
  }

  async getPayments(params: {
    page: number;
    limit: number;
    status?: string;
    from?: string;
    to?: string;
  }) {
    const { page, limit, status, from, to } = params;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (from || to) {
      where.createdAt = {};
      if (from) (where.createdAt as Record<string, unknown>).gte = new Date(from);
      if (to) (where.createdAt as Record<string, unknown>).lte = new Date(to);
    }

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          application: { select: { id: true } },
          request: { select: { title: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      payments: payments.map((p) => ({
        id: p.id,
        userName: p.user.name ?? p.user.email,
        userEmail: p.user.email,
        requestTitle: p.request.title,
        applicationId: p.applicationId,
        method: p.method,
        amount: Number(p.amount),
        status: p.status,
        createdAt: p.createdAt,
        verifiedAt: p.verifiedAt,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getRequests(params: { page: number; limit: number; status?: string }) {
    const { page, limit, status } = params;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [requests, total] = await Promise.all([
      this.prisma.tuitionRequest.findMany({
        where,
        include: {
          student: { select: { name: true, email: true } },
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.tuitionRequest.count({ where }),
    ]);

    return {
      requests: requests.map((r) => ({
        id: r.id,
        title: r.title,
        studentName: r.student.name ?? r.student.email,
        studentEmail: r.student.email,
        status: r.status,
        subjects: r.subjects,
        budget: r.budget ? Number(r.budget) : null,
        applicationCount: r._count.applications,
        createdAt: r.createdAt,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deleteRequest(adminId: string, requestId: string) {
    const request = await this.prisma.tuitionRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundException("Request not found");

    await this.prisma.tuitionRequest.delete({ where: { id: requestId } });

    await this.prisma.adminAudit.create({
      data: {
        id: randomUUID(),
        admin_id: adminId,
        action: "DELETE_REQUEST",
        target_type: "tuition_request",
        target_id: requestId,
        metadata: { title: request.title },
      },
    });

    return { success: true };
  }

  async getDocuments(params: { page: number; limit: number; status?: string }) {
    const { page, limit, status } = params;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = status ? { status } : {};

    const [documents, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          reviewer: { select: { name: true } },
        },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.document.count({ where }),
    ]);

    return {
      documents: documents.map((d) => ({
        id: d.id,
        userId: d.user_id,
        userName: d.user.name ?? d.user.email,
        userEmail: d.user.email,
        type: d.type,
        status: d.status,
        reason: d.reason,
        reviewedBy: d.reviewer?.name,
        reviewedAt: d.reviewed_at,
        createdAt: d.created_at,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async approveDocument(adminId: string, documentId: string) {
    const doc = await this.prisma.document.findUnique({ where: { id: documentId } });
    if (!doc) throw new NotFoundException("Document not found");

    await this.prisma.document.update({
      where: { id: documentId },
      data: { status: "APPROVED", reviewed_by: adminId, reviewed_at: new Date() },
    });

    await this.prisma.tutorProfile.updateMany({
      where: { user_id: doc.user_id },
      data: { is_verified: true },
    });

    await this.prisma.adminAudit.create({
      data: {
        id: randomUUID(),
        admin_id: adminId,
        action: "APPROVE_DOCUMENT",
        target_type: "document",
        target_id: documentId,
      },
    });

    return { success: true };
  }

  async rejectDocument(adminId: string, documentId: string, reason?: string) {
    const doc = await this.prisma.document.findUnique({ where: { id: documentId } });
    if (!doc) throw new NotFoundException("Document not found");

    await this.prisma.document.update({
      where: { id: documentId },
      data: { status: "REJECTED", reviewed_by: adminId, reviewed_at: new Date(), reason },
    });

    const hasApproved = await this.prisma.document.findFirst({
      where: { user_id: doc.user_id, status: "APPROVED" },
    });
    if (!hasApproved) {
      await this.prisma.tutorProfile.updateMany({
        where: { user_id: doc.user_id },
        data: { is_verified: false },
      });
    }

    await this.prisma.adminAudit.create({
      data: {
        id: randomUUID(),
        admin_id: adminId,
        action: "REJECT_DOCUMENT",
        target_type: "document",
        target_id: documentId,
        metadata: { reason },
      },
    });

    return { success: true };
  }

  async getReviews(params: { page: number; limit: number }) {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        include: {
          student: { select: { name: true, email: true } },
          tutor: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.review.count(),
    ]);

    return {
      reviews: reviews.map((r) => ({
        id: r.id,
        overallRating: r.rating,
        comment: r.comment,
        studentName: r.student.name ?? r.student.email,
        tutorName: r.tutor.name ?? r.tutor.email,
        isHidden: r.is_hidden,
        createdAt: r.createdAt,
        dimensions: {
          ...(r.rating_communication != null ? { Communication: r.rating_communication } : {}),
          ...(r.rating_knowledge != null ? { Knowledge: r.rating_knowledge } : {}),
          ...(r.rating_punctuality != null ? { Punctuality: r.rating_punctuality } : {}),
          ...(r.rating_patience != null ? { Patience: r.rating_patience } : {}),
          ...(r.rating_value != null ? { Value: r.rating_value } : {}),
        },
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deleteReview(adminId: string, reviewId: string) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException("Review not found");

    await this.prisma.review.delete({ where: { id: reviewId } });

    await this.prisma.adminAudit.create({
      data: {
        id: randomUUID(),
        admin_id: adminId,
        action: "DELETE_REVIEW",
        target_type: "review",
        target_id: reviewId,
      },
    });

    return { success: true };
  }

  async toggleHideReview(adminId: string, reviewId: string) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException("Review not found");

    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: { is_hidden: !review.is_hidden },
    });

    await this.prisma.adminAudit.create({
      data: {
        id: randomUUID(),
        admin_id: adminId,
        action: updated.is_hidden ? "HIDE_REVIEW" : "UNHIDE_REVIEW",
        target_type: "review",
        target_id: reviewId,
      },
    });

    return { success: true, isHidden: updated.is_hidden };
  }

  async closeRequest(adminId: string, requestId: string) {
    const request = await this.prisma.tuitionRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundException("Request not found");

    await this.prisma.tuitionRequest.update({
      where: { id: requestId },
      data: { status: "CLOSED" },
    });

    await this.prisma.adminAudit.create({
      data: {
        id: randomUUID(),
        admin_id: adminId,
        action: "CLOSE_REQUEST",
        target_type: "tuition_request",
        target_id: requestId,
        metadata: { title: request.title },
      },
    });

    return { success: true };
  }
}
