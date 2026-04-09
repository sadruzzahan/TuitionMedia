-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ApplicationStatus" ADD VALUE 'TRIAL';
ALTER TYPE "ApplicationStatus" ADD VALUE 'TRIAL_APPROVED';
ALTER TYPE "ApplicationStatus" ADD VALUE 'CANCELLED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'TRIAL_STARTED';
ALTER TYPE "NotificationType" ADD VALUE 'TRIAL_APPROVED';

-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "finder_fee" DECIMAL(10,2),
ADD COLUMN     "trial_approved_at" TIMESTAMP(3),
ADD COLUMN     "trial_started_at" TIMESTAMP(3);
