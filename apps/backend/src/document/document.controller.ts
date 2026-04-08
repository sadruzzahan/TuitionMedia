import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { DocumentService } from "./document.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";

@Controller("documents")
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("TUTOR")
  @Post()
  async upload(
    @Request() req: { user: { id: string } },
    @Body() body: { type: string; fileUrl: string },
  ) {
    return this.documentService.uploadDocument(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("TUTOR")
  @Get("my")
  async getMyDocuments(@Request() req: { user: { id: string } }) {
    return this.documentService.getMyDocuments(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Post(":id/approve")
  async approve(
    @Request() req: { user: { id: string; role: string } },
    @Param("id") id: string,
  ) {
    return this.documentService.approveDocument(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Post(":id/reject")
  async reject(
    @Request() req: { user: { id: string; role: string } },
    @Param("id") id: string,
    @Body() body: { reason?: string },
  ) {
    return this.documentService.rejectDocument(req.user.id, id, body.reason);
  }
}
