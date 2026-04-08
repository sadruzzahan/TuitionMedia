-- AlterTable
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "session_id" TEXT;

-- DropIndex
DROP INDEX IF EXISTS "reviews_tuition_request_id_student_id_key";

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "reviews_session_id_student_id_key" ON "reviews"("session_id", "student_id");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
