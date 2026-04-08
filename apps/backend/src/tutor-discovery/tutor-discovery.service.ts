import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface TutorListQuery {
  subject?: string;
  division?: string;
  area?: string;
  minRate?: number;
  maxRate?: number;
  sort?: "rating" | "rate_asc" | "rate_desc" | "newest";
  page?: number;
  limit?: number;
}

@Injectable()
export class TutorDiscoveryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: TutorListQuery) {
    const {
      subject,
      division,
      area,
      minRate,
      maxRate,
      sort = "rating",
      page = 1,
      limit = 12,
    } = query;

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      is_profile_public: true,
      ...(division && { division }),
      ...(area && { areas: { has: area } }),
      ...(minRate || maxRate
        ? {
            hourly_rate: {
              ...(minRate && { gte: minRate }),
              ...(maxRate && { lte: maxRate }),
            },
          }
        : {}),
      ...(subject && {
        subjects: { has: subject },
      }),
    };

    const orderBy: Record<string, unknown>[] = [];
    if (sort === "rating") {
      orderBy.push({ average_rating: "desc" });
    } else if (sort === "rate_asc") {
      orderBy.push({ hourly_rate: "asc" });
    } else if (sort === "rate_desc") {
      orderBy.push({ hourly_rate: "desc" });
    } else if (sort === "newest") {
      orderBy.push({ created_at: "desc" });
    }

    const [total, featured, regular] = await Promise.all([
      this.prisma.tutorProfile.count({ where }),
      this.prisma.tutorProfile.findMany({
        where: { ...where, is_premium: true },
        include: {
          user: { select: { id: true, name: true, is_verified: true } },
        },
        orderBy,
        take: 4,
      }),
      this.prisma.tutorProfile.findMany({
        where: { ...where, is_premium: false },
        include: {
          user: { select: { id: true, name: true, is_verified: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    const mapTutor = (t: typeof featured[0], isPremium: boolean) => ({
      id: t.user_id,
      name: t.user.name,
      bio: t.bio ? t.bio.slice(0, 120) + (t.bio.length > 120 ? "..." : "") : null,
      subjects: t.subjects,
      hourlyRate: Number(t.hourly_rate),
      division: t.division,
      areas: t.areas,
      education: t.education,
      experience: t.experience,
      isVerified: t.is_verified,
      isPremium: isPremium,
      averageRating: t.average_rating ? Number(t.average_rating) : null,
      totalReviews: t.total_reviews,
    });

    return {
      featured: featured.map((t) => mapTutor(t, true)),
      tutors: regular.map((t) => mapTutor(t, false)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(tutorUserId: string, viewerUserId?: string) {
    const profile = await this.prisma.tutorProfile.findUnique({
      where: { user_id: tutorUserId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            is_verified: true,
            created_at: true,
          },
        },
      },
    });

    if (!profile || !profile.is_profile_public) {
      throw new NotFoundException("Tutor not found");
    }

    let isConnected = false;
    if (viewerUserId) {
      const connection = await this.prisma.application.findFirst({
        where: {
          tutorId: tutorUserId,
          status: "CONNECTED",
          request: { studentId: viewerUserId },
        },
      });
      isConnected = !!connection;
    }

    const reviews = await this.prisma.review.findMany({
      where: { tutorId: tutorUserId },
      include: {
        student: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return {
      id: profile.user_id,
      name: profile.user.name,
      bio: profile.bio,
      subjects: profile.subjects,
      hourlyRate: Number(profile.hourly_rate),
      division: profile.division,
      areas: profile.areas,
      education: profile.education,
      experience: profile.experience,
      qualifications: profile.qualifications,
      isVerified: profile.is_verified,
      isPremium: profile.is_premium,
      isOnline: profile.is_online,
      averageRating: profile.average_rating ? Number(profile.average_rating) : null,
      totalReviews: profile.total_reviews,
      totalStudents: profile.total_students,
      memberSince: profile.user.created_at,
      contact: isConnected
        ? { email: profile.user.email, phone: profile.user.phone }
        : null,
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        studentName: r.student.name ? r.student.name.split(" ")[0] : "Student",
        createdAt: r.createdAt,
      })),
    };
  }
}
