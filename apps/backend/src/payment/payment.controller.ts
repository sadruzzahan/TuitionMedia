import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import type { UserRole, PaymentMethod } from "@prisma/client";

interface JwtUser {
  id: string;
  email: string;
  role: UserRole;
}

@Controller("payments")
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /** Tutor pays finder's fee (50% of monthly rate) after trial approved */
  @Post("tutor/:applicationId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("TUTOR", "ADMIN")
  async initiateTutorPayment(
    @Param("applicationId") applicationId: string,
    @Req() req: { user: JwtUser },
    @Body() body: { phoneNumber: string; method: PaymentMethod },
  ) {
    if (!body.phoneNumber || !body.method) {
      throw new BadRequestException("Phone number and payment method are required");
    }
    const phoneRegex = /^01[3-9]\d{8}$/;
    if (!phoneRegex.test(body.phoneNumber)) {
      throw new BadRequestException("Invalid Bangladesh phone number format");
    }
    return this.paymentService.initiateTutorFinderFeePayment(
      applicationId,
      req.user.id,
      body.phoneNumber,
      body.method,
    );
  }

  /** Legacy student endpoint — redirects to tutor logic for backward compat */
  @Post("student/:applicationId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("STUDENT", "ADMIN")
  async initiateStudentPayment() {
    throw new BadRequestException("Students no longer pay a connection fee. Accept a tutor to start the trial period for free.");
  }

  @Post(":paymentId/verify")
  @UseGuards(JwtAuthGuard)
  async verifyPayment(
    @Param("paymentId") paymentId: string,
    @Req() req: { user: JwtUser },
    @Body() body: { otp: string },
  ) {
    if (!body.otp || !/^\d{6}$/.test(body.otp)) {
      throw new BadRequestException("Invalid OTP format. Must be 6 digits.");
    }
    return this.paymentService.verifyPayment(paymentId, req.user.id, body.otp);
  }

  @Post(":paymentId/resend-otp")
  @UseGuards(JwtAuthGuard)
  async resendOtp(
    @Param("paymentId") paymentId: string,
    @Req() req: { user: JwtUser },
  ) {
    return this.paymentService.resendOtp(paymentId, req.user.id);
  }

  @Get("status/:applicationId")
  @UseGuards(JwtAuthGuard)
  async getPaymentStatus(
    @Param("applicationId") applicationId: string,
    @Req() req: { user: JwtUser },
  ) {
    return this.paymentService.getPaymentStatus(applicationId, req.user.id);
  }

  @Get(":paymentId")
  @UseGuards(JwtAuthGuard)
  async getPayment(
    @Param("paymentId") paymentId: string,
    @Req() req: { user: JwtUser },
  ) {
    return this.paymentService.getPayment(paymentId, req.user.id);
  }
}
