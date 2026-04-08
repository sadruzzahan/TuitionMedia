import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface TutorListQuery {
  subject?: string;
  subjects?: string;
  division?: string;
  area?: string;
  gender?: string;
  gradeLevel?: string;
  teachingMode?: string;
  availableDay?: string;
  minRate?: number;
  maxRate?: number;
  sort?: "relevance" | "rating" | "rate_asc" | "rate_desc" | "newest";
  page?: number;
  limit?: number;
}

@Injectable()
export class TutorDiscoveryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: TutorListQuery) {
    const {
      subject,
      subjects,
      division,
      area,
      gender,
      gradeLevel,
      teachingMode,
      availableDay,
      minRate,
      maxRate,
      sort = "relevance",
      page = 1,
      limit = 12,
    } = query;

    const skip = (page - 1) * limit;

    const subjectFilters: Record<string, unknown>[] = [];
    if (subject) subjectFilters.push({ subjects: { has: subject } });
    if (subjects) {
      const arr = subjects.split(",").map((s) => s.trim()).filter(Boolean);
      if (arr.length > 0) {
        subjectFilters.push(...arr.map((s) => ({ subjects: { has: s } })));
      }
    }

    const where: Record<string, unknown> = {
      is_profile_public: true,
      ...(division && { division }),
      ...(area && { areas: { has: area } }),
      ...(gender && { gender }),
      ...(gradeLevel && { grade_levels: { has: gradeLevel } }),
      ...(teachingMode && { teaching_mode: teachingMode }),
      ...(availableDay && { available_days: { has: availableDay } }),
      ...(minRate || maxRate
        ? {
            hourly_rate: {
              ...(minRate && { gte: minRate }),
              ...(maxRate && { lte: maxRate }),
            },
          }
        : {}),
      ...(subjectFilters.length > 0 && { OR: subjectFilters }),
    };

    const orderBy: Record<string, unknown>[] = [];
    if (sort === "relevance") {
      orderBy.push({ is_premium: "desc" });
      orderBy.push({ average_rating: "desc" });
      orderBy.push({ total_reviews: "desc" });
    } else if (sort === "rating") {
      orderBy.push({ average_rating: "desc" });
    } else if (sort === "rate_asc") {
      orderBy.push({ hourly_rate: "asc" });
    } else if (sort === "rate_desc") {
      orderBy.push({ hourly_rate: "desc" });
    } else if (sort === "newest") {
      orderBy.push({ created_at: "desc" });
    }

    const featuredWhere = { ...where, is_premium: true };
    const regularWhere = { ...where, is_premium: false };

    const [total, regularCount, featuredTutors, regularTutors] = await Promise.all([
      this.prisma.tutorProfile.count({ where }),
      this.prisma.tutorProfile.count({ where: regularWhere }),
      this.prisma.tutorProfile.findMany({
        where: featuredWhere,
        include: {
          user: { select: { id: true, name: true, is_verified: true } },
        },
        orderBy,
        take: 6,
      }),
      this.prisma.tutorProfile.findMany({
        where: regularWhere,
        include: {
          user: { select: { id: true, name: true, is_verified: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    const mapTutor = (t: typeof regularTutors[0]) => ({
      id: t.user_id,
      name: t.user.name,
      bio: t.bio ? t.bio.slice(0, 120) + (t.bio.length > 120 ? "..." : "") : null,
      subjects: t.subjects,
      hourlyRate: Number(t.hourly_rate),
      division: t.division,
      areas: t.areas,
      education: t.education,
      experience: t.experience,
      gender: t.gender,
      gradeLevels: t.grade_levels,
      teachingMode: t.teaching_mode,
      isVerified: t.is_verified,
      isPremium: t.is_premium,
      averageRating: t.average_rating ? Number(t.average_rating) : null,
      totalReviews: t.total_reviews,
      totalStudents: t.total_students,
    });

    return {
      featured: featuredTutors.map(mapTutor),
      tutors: regularTutors.map(mapTutor),
      total,
      page,
      totalPages: Math.ceil(regularCount / limit),
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

    const allReviewsForBreakdown = await this.prisma.review.findMany({
      where: { tutorId: tutorUserId, is_hidden: false },
      select: {
        rating: true,
        rating_communication: true,
        rating_knowledge: true,
        rating_punctuality: true,
        rating_patience: true,
        rating_value: true,
      },
    });

    const displayReviews = await this.prisma.review.findMany({
      where: { tutorId: tutorUserId, is_hidden: false },
      include: {
        student: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const ratingBreakdown = this.computeRatingBreakdown(allReviewsForBreakdown);

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
      gender: profile.gender,
      gradeLevels: profile.grade_levels,
      teachingMode: profile.teaching_mode,
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
      ratingBreakdown,
      reviews: displayReviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        studentName: r.student.name ? r.student.name.split(" ")[0] : "Student",
        createdAt: r.createdAt,
        breakdown: {
          communication: r.rating_communication,
          knowledge: r.rating_knowledge,
          punctuality: r.rating_punctuality,
          patience: r.rating_patience,
          value: r.rating_value,
        },
      })),
    };
  }

  private computeRatingBreakdown(reviews: {
    rating: number;
    rating_communication: number | null;
    rating_knowledge: number | null;
    rating_punctuality: number | null;
    rating_patience: number | null;
    rating_value: number | null;
  }[]) {
    if (reviews.length === 0) return null;

    const withSub = reviews.filter((r) =>
      r.rating_communication || r.rating_knowledge || r.rating_punctuality || r.rating_patience || r.rating_value
    );

    if (withSub.length === 0) {
      const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
      return {
        communication: Number(avg.toFixed(1)),
        knowledge: Number(avg.toFixed(1)),
        punctuality: Number(avg.toFixed(1)),
        patience: Number(avg.toFixed(1)),
        value: Number(avg.toFixed(1)),
        hasDetailedBreakdown: false,
      };
    }

    const avg = (field: (r: typeof withSub[0]) => number | null) => {
      const vals = withSub.map(field).filter((v) => v !== null) as number[];
      return vals.length > 0 ? Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)) : null;
    };

    return {
      communication: avg((r) => r.rating_communication),
      knowledge: avg((r) => r.rating_knowledge),
      punctuality: avg((r) => r.rating_punctuality),
      patience: avg((r) => r.rating_patience),
      value: avg((r) => r.rating_value),
      hasDetailedBreakdown: true,
    };
  }
}
