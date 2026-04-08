import { Controller, Get, Param, Query, UseGuards, Request } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ChatService } from "./chat.service";

@Controller("messages")
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(":applicationId")
  async getMessages(
    @Param("applicationId") applicationId: string,
    @Query("cursor") cursor: string | undefined,
    @Request() req: { user: { id: string } },
  ) {
    return this.chatService.getMessages(applicationId, req.user.id, cursor);
  }
}
