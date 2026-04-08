import { Module } from "@nestjs/common";
import { TutorDiscoveryController } from "./tutor-discovery.controller";
import { TutorDiscoveryService } from "./tutor-discovery.service";

@Module({
  controllers: [TutorDiscoveryController],
  providers: [TutorDiscoveryService],
  exports: [TutorDiscoveryService],
})
export class TutorDiscoveryModule {}
