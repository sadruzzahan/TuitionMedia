import { Controller, Get, Param, Query, Req } from "@nestjs/common";
import { TutorDiscoveryService } from "./tutor-discovery.service";

@Controller("tutors")
export class TutorDiscoveryController {
  constructor(private readonly service: TutorDiscoveryService) {}

  @Get()
  findAll(
    @Query("subject") subject?: string,
    @Query("division") division?: string,
    @Query("area") area?: string,
    @Query("gender") gender?: string,
    @Query("minRate") minRate?: string,
    @Query("maxRate") maxRate?: string,
    @Query("sort") sort?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.service.findAll({
      subject,
      division,
      area,
      gender,
      minRate: minRate ? Number(minRate) : undefined,
      maxRate: maxRate ? Number(maxRate) : undefined,
      sort: sort as "relevance" | "rating" | "rate_asc" | "rate_desc" | "newest" | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get(":id")
  findById(
    @Param("id") id: string,
    @Req() req: { user?: { id: string } },
  ) {
    return this.service.findById(id, req.user?.id);
  }
}
