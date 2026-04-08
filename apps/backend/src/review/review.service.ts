import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationService } from "../notification/notification.service";

@Injectable()
export class ReviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async createReview(reviewerId: string, dto: {
    sessionId: string;
    rating: number;
    comment?: string;
    ratingCommunication?: number;
    ratingKnowledge?: number;
    ratingPunctuality?: number;
    ratingPatience?: number;
    ratingValue?: number;
  }) {
    if (dto.rating < 1 || dto.rating > 5) {
      throw new BadRequestException("Rating must be between 1 and 5");
    }

    const session = await this.prisma.session.findUnique({
      where: { id: dto.sessionId },
      include: {
        application: {
          include: {
            request: { select: { id: true, studentId: true } },
          },
        },
      },
    });

    if (!session) throw new NotFoundException("Session not found");
    if (session.status !== "COMPLETED") {
      throw new BadRequestException("Can only review after a session is completed");
    }

    const isStudent = session.studentId === reviewerId;
    const isTutor = session.tutorId === reviewerId;

    if (!isStudent && !isTutor) {
      throw new ForbiddenException("You are not part of this session");
    }

    const tutorId = session.tutorId;
    const studentId = session.studentId;
    const tuitionRequestId = session.application.request.id;

    if (isStudent) {
      const existing = await this.prisma.review.findFirst({
        where: { tuition_request_id: tuitionRequestId, studentId: reviewerId },
      });
      if (existing) throw new BadRequestException("You have already reviewed this session");

      const review = await this.prisma.review.create({
        data: {
          tuition_request_id: tuitionRequestId,
          studentId: studentId,
          tutorId: tutorId,
          rating: dto.rating,
          comment: dto.comment,
          rating_communication: dto.ratingCommunication,
          rating_knowledge: dto.ratingKnowledge,
          rating_punctuality: dto.ratingPunctuality,
          rating_patience: dto.ratingPatience,
          rating_value: dto.ratingValue,
        },
      });

      await this.updateTutorRating(tutorId);

      await this.notificationService.create({
        userId: tutorId,
        type: "REVIEW_SUBMITTED",
        title: "New Review Received",
        message: `A student rated you ${dto.rating} star${dto.rating !== 1 ? "s" : ""}`,
        data: { reviewId: review.id, sessionId: dto.sessionId, rating: dto.rating },
      });

      return review;
    } else {
      const existing = await this.prisma.review.findFirst({
        where: { tuition_request_id: tuitionRequestId, studentId: tutorId },
      });
      if (existing) throw new BadRequestException("You have already reviewed this session");

      const review = await this.prisma.review.create({
        data: {
          tuition_request_id: tuitionRequestId,
          studentId: tutorId,
          tutorId: studentId,
          rating: dto.rating,
          comment: dto.comment,
          rating_communication: dto.ratingCommunication,
          rating_knowledge: dto.ratingKnowledge,
          rating_punctuality: dto.ratingPunctuality,
          rating_patience: dto.ratingPatience,
          rating_value: dto.ratingValue,
        },
      });

      await this.notificationService.create({
        userId: studentId,
        type: "REVIEW_SUBMITTED",
        title: "Your tutor reviewed you",
        message: `Your tutor rated the session ${dto.rating} star${dto.rating !== 1 ? "s" : ""}`,
        data: { reviewId: review.id, sessionId: dto.sessionId, rating: dto.rating },
      });

      return review;
    }
  }

  private async updateTutorRating(tutorId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { tutorId },
      select: { rating: true },
    });

    const total = reviews.length;
    if (total === 0) return;

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / total;

    await this.prisma.tutorProfile.updateMany({
      where: { user_id: tutorId },
      data: {
        average_rating: Math.round(avgRating * 100) / 100,
        total_reviews: total,
      },
    });
  }

  async getReviewsForTutor(tutorId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { tutorId },
        include: {
          student: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.review.count({ where: { tutorId } }),
    ]);

    return {
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        ratingCommunication: r.rating_communication,
        ratingKnowledge: r.rating_knowledge,
        ratingPunctuality: r.rating_punctuality,
        ratingPatience: r.rating_patience,
        ratingValue: r.rating_value,
        studentName: r.student.name ?? "Student",
        createdAt: r.createdAt,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async checkCanReview(reviewerId: string, sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        application: {
          include: { request: { select: { id: true } } },
        },
      },
    });

    if (!session) return { canReview: false, reason: "Session not found" };
    if (session.status !== "COMPLETED") return { canReview: false, reason: "Session not completed" };

    const isStudent = session.studentId === reviewerId;
    const isTutor = session.tutorId === reviewerId;
    if (!isStudent && !isTutor) return { canReview: false, reason: "Not part of this session" };

    const tuitionRequestId = session.application.request.id;
    const lookupStudentId = isStudent ? reviewerId : session.tutorId;

    const existing = await this.prisma.review.findFirst({
      where: { tuition_request_id: tuitionRequestId, studentId: lookupStudentId },
    });

    return {
      canReview: !existing,
      alreadyReviewed: !!existing,
    };
  }
}
