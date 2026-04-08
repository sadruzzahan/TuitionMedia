-- AlterTable: add grade_levels and teaching_mode to tutor_profiles
ALTER TABLE "tutor_profiles" ADD COLUMN IF NOT EXISTS "grade_levels" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "tutor_profiles" ADD COLUMN IF NOT EXISTS "teaching_mode" TEXT;
