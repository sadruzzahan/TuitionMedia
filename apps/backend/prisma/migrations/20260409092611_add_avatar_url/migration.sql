-- AlterTable
ALTER TABLE "tutor_profiles" ALTER COLUMN "grade_levels" DROP DEFAULT,
ALTER COLUMN "available_days" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatar_url" TEXT;
