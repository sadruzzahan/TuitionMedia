import { Module } from "@nestjs/common";
import { TuitionRequestController } from "./tuition-request.controller";
import { TuitionRequestService } from "./tuition-request.service";

@Module({
  controllers: [TuitionRequestController],
  providers: [TuitionRequestService],
  exports: [TuitionRequestService],
})
export class TuitionRequestModule {}
