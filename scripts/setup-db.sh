#!/bin/bash
# Run: SUPABASE_DB_PASSWORD=yourpassword ./scripts/setup-db.sh
# Or replace [YOUR-PASSWORD] in apps/backend/.env first
set -e
cd "$(dirname "$0")/.."

if [ -z "$SUPABASE_DB_PASSWORD" ]; then
  if grep -q '\[YOUR-PASSWORD\]' apps/backend/.env 2>/dev/null; then
    echo "Error: Set SUPABASE_DB_PASSWORD or replace [YOUR-PASSWORD] in apps/backend/.env"
    echo "Get password from: Supabase Dashboard > Project Settings > Database"
    exit 1
  fi
  echo "Using DATABASE_URL from apps/backend/.env"
else
  export DIRECT_URL="postgresql://postgres.nzelyyojjlocpymyndkt:${SUPABASE_DB_PASSWORD}@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres"
  export DATABASE_URL="postgresql://postgres.nzelyyojjlocpymyndkt:${SUPABASE_DB_PASSWORD}@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
fi

cd apps/backend
echo "Resetting database (drops existing tables) and applying migrations..."
npx prisma migrate reset --force
npx prisma generate
echo "Database ready."
