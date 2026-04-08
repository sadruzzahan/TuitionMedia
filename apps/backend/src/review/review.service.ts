import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationService } from "../notification/notification.service";

@Injectable()
export class ReviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async createReview(studentId: string, dto: {
    tuitionRequestId: string;
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

    const request = await this.prisma.tuitionRequest.findUnique({
      where: { id: dto.tuitionRequestId },
    });

    if (!request) throw new NotFoundException("Tuition request not found");
    if (request.studentId !== studentId) throw new ForbiddenException("Not your request");

    const completedSession = await this.prisma.session.findFirst({
      where: { studentId, status: "COMPLETED", applicationId: { in: await this.getRequestApplicationIds(dto.tuitionRequestId) } },
    });
    if (!completedSession) {
      throw new BadRequestException("You must complete a session before leaving a review");
    }

    const connectedApp = await this.prisma.application.findFirst({
      where: {
        requestId: dto.tuitionRequestId,
        status: { in: ["BOTH_PAID", "CONNECTED", "ACCEPTED"] },
      },
      include: { tutor: { select: { id: true, name: true } } },
    });
    if (!connectedApp) {
      throw new BadRequestException("No connected tutor found for this request");
    }

    const existing = await this.prisma.review.findFirst({
      where: { tuition_request_id: dto.tuitionRequestId, studentId },
    });
    if (existing) throw new BadRequestException("You have already reviewed this tutor for this request");

    const tutorId = connectedApp.tutor.id;

    const review = await this.prisma.review.create({
      data: {
        tuition_request_id: dto.tuitionRequestId,
        studentId,
        tutorId,
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
      message: `A student left you a ${dto.rating}-star review`,
      data: { reviewId: review.id, rating: dto.rating },
    });

    return review;
  }

  private async getRequestApplicationIds(requestId: string): Promise<string[]> {
    const apps = await this.prisma.application.findMany({
      where: { requestId },
      select: { id: true },
    });
    return apps.map((a) => a.id);
  }

  private async updateTutorRating(tutorId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { tutorId },
      select: {
        rating: true,
      },
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

  async checkCanReview(studentId: string, tuitionRequestId: string) {
    const request = await this.prisma.tuitionRequest.findUnique({
      where: { id: tuitionRequestId },
    });

    if (!request || request.studentId !== studentId) return { canReview: false };

    const appIds = await this.getRequestApplicationIds(tuitionRequestId);
    const completedSession = await this.prisma.session.findFirst({
      where: { studentId, status: "COMPLETED", applicationId: { in: appIds } },
    });

    const existing = await this.prisma.review.findFirst({
      where: { tuition_request_id: tuitionRequestId, studentId },
    });

    return {
      canReview: !!completedSession && !existing,
      alreadyReviewed: !!existing,
    };
  }
}
