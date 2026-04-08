import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { JwtService } from "@nestjs/jwt";
import { ChatService } from "./chat.service";
import { NotificationService } from "../notification/notification.service";

interface AuthSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: "*",
    credentials: true,
  },
  namespace: "/",
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server!: Server;

  private userSockets = new Map<string, Set<string>>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
    private readonly notificationService: NotificationService,
  ) {}

  afterInit() {
    this.notificationService.setGateway(this);
  }

  async handleConnection(client: AuthSocket) {
    try {
      const token =
        client.handshake.auth?.token ??
        client.handshake.headers?.authorization?.replace("Bearer ", "");
      if (!token) {
        client.disconnect();
        return;
      }
      const secret = process.env.SESSION_SECRET ?? process.env.JWT_SECRET;
      const payload = this.jwtService.verify<{ sub: string }>(token, { secret });
      client.userId = payload.sub;

      if (!this.userSockets.has(payload.sub)) {
        this.userSockets.set(payload.sub, new Set());
      }
      this.userSockets.get(payload.sub)!.add(client.id);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthSocket) {
    if (client.userId) {
      const sockets = this.userSockets.get(client.userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(client.userId);
        }
      }
    }
  }

  @SubscribeMessage("join_room")
  async handleJoinRoom(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { applicationId: string },
  ) {
    if (!client.userId) return;
    const canAccess = await this.chatService.canAccessChat(
      data.applicationId,
      client.userId,
    );
    if (!canAccess) {
      client.emit("error", { message: "Not authorized to join this room" });
      return;
    }
    await client.join(`app:${data.applicationId}`);
    client.emit("joined_room", { applicationId: data.applicationId });
  }

  @SubscribeMessage("send_message")
  async handleSendMessage(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { applicationId: string; content: string },
  ) {
    if (!client.userId) return;
    if (!data.content?.trim()) return;

    try {
      const { message, recipientId, requestId } = await this.chatService.createMessage(
        data.applicationId,
        client.userId,
        data.content.trim(),
      );

      this.server.to(`app:${data.applicationId}`).emit("new_message", message);

      await this.notificationService.create({
        userId: recipientId,
        type: "NEW_MESSAGE",
        title: "New message",
        message: data.content.trim().slice(0, 80),
        data: { applicationId: data.applicationId, messageId: message.id, requestId },
      });
    } catch {
      client.emit("error", { message: "Failed to send message" });
    }
  }

  @SubscribeMessage("mark_read")
  async handleMarkRead(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { applicationId: string },
  ) {
    if (!client.userId) return;
    const canAccess = await this.chatService.canAccessChat(data.applicationId, client.userId);
    if (!canAccess) {
      client.emit("error", { message: "Not authorized" });
      return;
    }
    await this.chatService.markRead(data.applicationId, client.userId);
  }

  emitToUser(userId: string, event: string, payload: unknown) {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      for (const socketId of sockets) {
        this.server.to(socketId).emit(event, payload);
      }
    }
  }
}
