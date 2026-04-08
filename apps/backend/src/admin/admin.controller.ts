import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Request,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from "@nestjs/common";
import { AdminService } from "./admin.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("stats")
  async getStats() {
    return this.adminService.getStats();
  }

  @Get("users")
  async getUsers(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query("search") search?: string,
    @Query("role") role?: string,
    @Query("status") status?: string,
  ) {
    return this.adminService.getUsers({ page, limit: Math.min(limit, 100), search, role, status });
  }

  @Get("users/:id")
  async getUserDetail(@Param("id") id: string) {
    return this.adminService.getUserDetail(id);
  }

  @Put("users/:id")
  async updateUser(
    @Request() req: { user: { id: string } },
    @Param("id") id: string,
    @Body() body: { isActive?: boolean; isPremium?: boolean },
  ) {
    return this.adminService.updateUser(req.user.id, id, body);
  }

  @Get("payments")
  async getPayments(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query("status") status?: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    return this.adminService.getPayments({ page, limit: Math.min(limit, 100), status, from, to });
  }

  @Get("requests")
  async getRequests(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query("status") status?: string,
  ) {
    return this.adminService.getRequests({ page, limit: Math.min(limit, 100), status });
  }

  @Delete("requests/:id")
  async deleteRequest(
    @Request() req: { user: { id: string } },
    @Param("id") id: string,
  ) {
    return this.adminService.deleteRequest(req.user.id, id);
  }

  @Get("documents")
  async getDocuments(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query("status") status?: string,
  ) {
    return this.adminService.getDocuments({ page, limit: Math.min(limit, 100), status });
  }

  @Put("documents/:id/approve")
  async approveDocument(
    @Request() req: { user: { id: string } },
    @Param("id") id: string,
  ) {
    return this.adminService.approveDocument(req.user.id, id);
  }

  @Put("documents/:id/reject")
  async rejectDocument(
    @Request() req: { user: { id: string } },
    @Param("id") id: string,
    @Body() body: { reason?: string },
  ) {
    return this.adminService.rejectDocument(req.user.id, id, body.reason);
  }

  @Get("reviews")
  async getReviews(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.adminService.getReviews({ page, limit: Math.min(limit, 100) });
  }

  @Delete("reviews/:id")
  async deleteReview(
    @Request() req: { user: { id: string } },
    @Param("id") id: string,
  ) {
    return this.adminService.deleteReview(req.user.id, id);
  }
}
