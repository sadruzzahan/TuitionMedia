import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from "@nestjs/common";
import { ReviewService } from "./review.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("reviews")
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createReview(
    @Request() req: { user: { id: string; role: string } },
    @Body() body: {
      tuitionRequestId: string;
      rating: number;
      comment?: string;
      ratingCommunication?: number;
      ratingKnowledge?: number;
      ratingPunctuality?: number;
      ratingPatience?: number;
      ratingValue?: number;
    },
  ) {
    return this.reviewService.createReview(req.user.id, body);
  }

  @Get("tutor/:tutorId")
  async getTutorReviews(
    @Param("tutorId") tutorId: string,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.reviewService.getReviewsForTutor(tutorId, page, Math.min(limit, 50));
  }

  @UseGuards(JwtAuthGuard)
  @Get("can-review/:tuitionRequestId")
  async checkCanReview(
    @Request() req: { user: { id: string } },
    @Param("tuitionRequestId") tuitionRequestId: string,
  ) {
    return this.reviewService.checkCanReview(req.user.id, tuitionRequestId);
  }
}
