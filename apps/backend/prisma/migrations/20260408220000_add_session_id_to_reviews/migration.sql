-- AlterTable: Add session_id reference to reviews
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "session_id" TEXT;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT IF NOT EXISTS "reviews_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
