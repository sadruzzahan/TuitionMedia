-- AlterEnum
ALTER TYPE "OTPPurpose" ADD VALUE 'PAYMENT_VERIFICATION';

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'OTP_SENT', 'VERIFIED', 'FAILED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BKASH', 'NAGAD');

-- DropIndex
DROP INDEX "tuition_requests_subject_idx";

-- DropIndex
DROP INDEX "tutor_posts_subject_idx";

-- AlterTable
ALTER TABLE "applications" ADD COLUMN "cover_letter" TEXT;

-- AlterTable
ALTER TABLE "student_profiles" DROP COLUMN "location",
ADD COLUMN "division" TEXT,
ADD COLUMN "areas" TEXT[];

-- AlterTable
ALTER TABLE "tuition_requests" DROP COLUMN "subject",
DROP COLUMN "location",
ADD COLUMN "subjects" TEXT[],
ADD COLUMN "division" TEXT,
ADD COLUMN "area" TEXT;

-- AlterTable
ALTER TABLE "tutor_posts" DROP COLUMN "subject",
DROP COLUMN "location",
ADD COLUMN "subjects" TEXT[],
ADD COLUMN "division" TEXT,
ADD COLUMN "areas" TEXT[];

-- AlterTable
ALTER TABLE "tutor_profiles" DROP COLUMN "location",
ADD COLUMN "division" TEXT,
ADD COLUMN "areas" TEXT[];

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "phone_number" TEXT NOT NULL,
    "otp_code" TEXT,
    "otp_expires_at" TIMESTAMP(3),
    "transaction_id" TEXT,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payments_user_id_idx" ON "payments"("user_id");

-- CreateIndex
CREATE INDEX "payments_application_id_idx" ON "payments"("application_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "tuition_requests_subjects_idx" ON "tuition_requests" USING GIN ("subjects");

-- CreateIndex
CREATE INDEX "tuition_requests_division_area_idx" ON "tuition_requests"("division", "area");

-- CreateIndex
CREATE INDEX "tutor_posts_subjects_idx" ON "tutor_posts" USING GIN ("subjects");

-- CreateIndex
CREATE INDEX "tutor_posts_division_areas_idx" ON "tutor_posts"("division", "areas");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "tuition_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
