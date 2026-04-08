import { Controller, Get, Param, Query, Req, UseGuards } from "@nestjs/common";
import { TutorDiscoveryService } from "./tutor-discovery.service";
import { OptionalJwtAuthGuard } from "../auth/optional-jwt-auth.guard";

@Controller("tutors")
export class TutorDiscoveryController {
  constructor(private readonly service: TutorDiscoveryService) {}

  @Get()
  findAll(
    @Query("subject") subject?: string,
    @Query("subjects") subjects?: string,
    @Query("division") division?: string,
    @Query("area") area?: string,
    @Query("gender") gender?: string,
    @Query("gradeLevel") gradeLevel?: string,
    @Query("teachingMode") teachingMode?: string,
    @Query("availableDay") availableDay?: string,
    @Query("minRate") minRate?: string,
    @Query("maxRate") maxRate?: string,
    @Query("sort") sort?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.service.findAll({
      subject,
      subjects,
      division,
      area,
      gender,
      gradeLevel,
      teachingMode,
      availableDay,
      minRate: minRate ? Number(minRate) : undefined,
      maxRate: maxRate ? Number(maxRate) : undefined,
      sort: sort as "relevance" | "rating" | "rate_asc" | "rate_desc" | "newest" | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get(":id")
  @UseGuards(OptionalJwtAuthGuard)
  findById(
    @Param("id") id: string,
    @Req() req: { user?: { id: string } | null },
  ) {
    return this.service.findById(id, req.user?.id);
  }
}
