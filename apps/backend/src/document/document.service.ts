import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationService } from "../notification/notification.service";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = [
  "NID",
  "PASSPORT",
  "DEGREE_CERTIFICATE",
  "TEACHING_CERTIFICATE",
  "STUDENT_ID",
  "OTHER",
];

@Injectable()
export class DocumentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async uploadDocument(userId: string, dto: {
    type: string;
    fileUrl: string;
  }) {
    if (!ALLOWED_TYPES.includes(dto.type)) {
      throw new BadRequestException(`Invalid document type. Allowed: ${ALLOWED_TYPES.join(", ")}`);
    }

    const existing = await this.prisma.document.findFirst({
      where: { user_id: userId, type: dto.type, status: "PENDING" },
    });
    if (existing) {
      throw new BadRequestException("You already have a pending document of this type. Please wait for it to be reviewed.");
    }

    const doc = await this.prisma.document.create({
      data: {
        id: randomUUID(),
        user_id: userId,
        type: dto.type,
        file_url: dto.fileUrl,
        status: "PENDING",
      },
    });

    return doc;
  }

  async getMyDocuments(userId: string) {
    return this.prisma.document.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
    });
  }

  async approveDocument(adminId: string, documentId: string) {
    const doc = await this.prisma.document.findUnique({ where: { id: documentId } });
    if (!doc) throw new NotFoundException("Document not found");

    const updated = await this.prisma.document.update({
      where: { id: documentId },
      data: {
        status: "APPROVED",
        reviewed_by: adminId,
        reviewed_at: new Date(),
      },
    });

    await this.prisma.tutorProfile.updateMany({
      where: { user_id: doc.user_id },
      data: { is_verified: true },
    });

    await this.notificationService.create({
      userId: doc.user_id,
      type: "DOCUMENT_APPROVED",
      title: "Document Approved",
      message: `Your ${doc.type.replace(/_/g, " ").toLowerCase()} has been verified. Your profile is now marked as verified!`,
      data: { documentId: doc.id },
    });

    return updated;
  }

  async rejectDocument(adminId: string, documentId: string, reason?: string) {
    const doc = await this.prisma.document.findUnique({ where: { id: documentId } });
    if (!doc) throw new NotFoundException("Document not found");

    const updated = await this.prisma.document.update({
      where: { id: documentId },
      data: {
        status: "REJECTED",
        reviewed_by: adminId,
        reviewed_at: new Date(),
        reason,
      },
    });

    await this.notificationService.create({
      userId: doc.user_id,
      type: "DOCUMENT_REJECTED",
      title: "Document Not Accepted",
      message: reason
        ? `Your ${doc.type.replace(/_/g, " ").toLowerCase()} was rejected: ${reason}`
        : `Your ${doc.type.replace(/_/g, " ").toLowerCase()} was not accepted. Please re-submit.`,
      data: { documentId: doc.id },
    });

    return updated;
  }
}
