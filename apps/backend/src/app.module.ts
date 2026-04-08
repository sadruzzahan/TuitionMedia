import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { TuitionRequestModule } from "./tuition-request/tuition-request.module";
import { ApplicationModule } from "./application/application.module";
import { PaymentModule } from "./payment/payment.module";
import { TutorDiscoveryModule } from "./tutor-discovery/tutor-discovery.module";
import { NotificationModule } from "./notification/notification.module";
import { ChatModule } from "./chat/chat.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    TuitionRequestModule,
    ApplicationModule,
    PaymentModule,
    TutorDiscoveryModule,
    NotificationModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
