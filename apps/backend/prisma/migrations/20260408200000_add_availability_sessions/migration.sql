-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'SESSION_BOOKED';
ALTER TYPE "NotificationType" ADD VALUE 'SESSION_CONFIRMED';
ALTER TYPE "NotificationType" ADD VALUE 'SESSION_CANCELLED';
ALTER TYPE "NotificationType" ADD VALUE 'SESSION_COMPLETED';

-- CreateTable
CREATE TABLE "availability" (
    "id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_hour" INTEGER NOT NULL,
    "end_hour" INTEGER NOT NULL,

    CONSTRAINT "availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "notes" TEXT,
    "status" "SessionStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "availability_tutor_id_idx" ON "availability"("tutor_id");

-- CreateIndex
CREATE INDEX "sessions_student_id_idx" ON "sessions"("student_id");

-- CreateIndex
CREATE INDEX "sessions_tutor_id_idx" ON "sessions"("tutor_id");

-- CreateIndex
CREATE INDEX "sessions_application_id_idx" ON "sessions"("application_id");

-- CreateIndex
CREATE INDEX "sessions_scheduled_at_idx" ON "sessions"("scheduled_at");

-- AddForeignKey
ALTER TABLE "availability" ADD CONSTRAINT "availability_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
