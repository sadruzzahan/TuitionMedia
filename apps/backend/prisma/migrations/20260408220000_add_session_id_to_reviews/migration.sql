-- AlterTable: Add session_id reference to reviews
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "session_id" TEXT;

-- AddForeignKey (idempotent via DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reviews_session_id_fkey'
  ) THEN
    ALTER TABLE "reviews" ADD CONSTRAINT "reviews_session_id_fkey"
      FOREIGN KEY ("session_id") REFERENCES "sessions"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END$$;
