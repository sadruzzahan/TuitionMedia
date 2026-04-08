-- AlterTable: add available_days to tutor_profiles
ALTER TABLE "tutor_profiles" ADD COLUMN IF NOT EXISTS "available_days" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Create or replace trigger function to keep average_rating and total_reviews in sync
CREATE OR REPLACE FUNCTION sync_tutor_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_tutor_id TEXT;
BEGIN
  v_tutor_id := COALESCE(NEW."tutorId", OLD."tutorId");
  UPDATE tutor_profiles
  SET
    average_rating = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM reviews
      WHERE "tutorId" = v_tutor_id
    ),
    total_reviews = (
      SELECT COUNT(*)::int
      FROM reviews
      WHERE "tutorId" = v_tutor_id
    )
  WHERE user_id = v_tutor_id;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_tutor_rating ON reviews;
CREATE TRIGGER trg_sync_tutor_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION sync_tutor_rating();
