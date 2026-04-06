-- Apply both migrations in order
-- Run this directly in Supabase SQL Editor

-- ============================================
-- MIGRATION 1: Initial Schema
-- ============================================

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'TUTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "TuitionRequestStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'CLOSED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tutor_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "bio" TEXT,
    "subjects" TEXT[],
    "hourly_rate" DECIMAL(10,2),
    "education" TEXT,
    "experience" INTEGER,
    "qualifications" TEXT[],
    "rating" DECIMAL(3,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tutor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "grade" TEXT,
    "school" TEXT,
    "subjects" TEXT[],
    "goals" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tuition_requests" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "budget" DECIMAL(10,2),
    "status" "TuitionRequestStatus" NOT NULL DEFAULT 'OPEN',
    "location" TEXT,
    "contact_unlocked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tuition_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tutor_posts" (
    "id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "hourly_rate" DECIMAL(10,2) NOT NULL,
    "location" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tutor_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tutor_profiles_user_id_key" ON "tutor_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_user_id_key" ON "student_profiles"("user_id");

-- CreateIndex
CREATE INDEX "tuition_requests_subject_idx" ON "tuition_requests"("subject");

-- CreateIndex
CREATE INDEX "tutor_posts_subject_idx" ON "tutor_posts"("subject");

-- CreateIndex
CREATE UNIQUE INDEX "applications_request_id_tutor_id_key" ON "applications"("request_id", "tutor_id");

-- AddForeignKey
ALTER TABLE "tutor_profiles" ADD CONSTRAINT "tutor_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tuition_requests" ADD CONSTRAINT "tuition_requests_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "tuition_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutor_posts" ADD CONSTRAINT "tutor_posts_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "tuition_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- MIGRATION 2: Payment & Bangladesh System
-- ============================================

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
ALTER TABLE "student_profiles" 
DROP COLUMN "location",
ADD COLUMN "division" TEXT,
ADD COLUMN "areas" TEXT[];

-- AlterTable
ALTER TABLE "tuition_requests" 
DROP COLUMN "subject",
DROP COLUMN "location",
ADD COLUMN "subjects" TEXT[],
ADD COLUMN "division" TEXT,
ADD COLUMN "area" TEXT;

-- AlterTable
ALTER TABLE "tutor_posts" 
DROP COLUMN "subject",
DROP COLUMN "location",
ADD COLUMN "subjects" TEXT[],
ADD COLUMN "division" TEXT,
ADD COLUMN "areas" TEXT[];

-- AlterTable
ALTER TABLE "tutor_profiles" 
DROP COLUMN "location",
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
