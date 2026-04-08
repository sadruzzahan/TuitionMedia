-- AlterTable: add gender to tutor_profiles
ALTER TABLE "tutor_profiles" ADD COLUMN IF NOT EXISTS "gender" TEXT;

-- AlterTable: add rating breakdown fields to reviews
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "rating_communication" INTEGER;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "rating_knowledge" INTEGER;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "rating_punctuality" INTEGER;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "rating_patience" INTEGER;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "rating_value" INTEGER;
