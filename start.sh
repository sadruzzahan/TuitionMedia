#!/bin/sh
set -e

echo "==> Starting TuitionMedia..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "==> Installing dependencies..."
  pnpm install --frozen-lockfile
fi

# Build shared-schema if needed
if [ ! -d "packages/shared-schema/dist" ]; then
  echo "==> Building shared-schema..."
  pnpm --filter shared-schema run build
fi

# Generate Prisma client (always run to ensure it matches schema)
echo "==> Generating Prisma client..."
cd apps/backend
pnpm exec prisma generate

# Always rebuild backend to ensure new code is compiled
echo "==> Building backend..."
pnpm run build

# Run database migrations
echo "==> Running database migrations..."
pnpm exec prisma migrate deploy
cd ../..

# Start backend in background
echo "==> Starting backend..."
cd apps/backend
node dist/main &
BACKEND_PID=$!
cd ../..

# Wait for backend to be ready
echo "==> Waiting for backend on port 3001..."
sleep 5

# Start frontend
echo "==> Starting frontend..."
cd apps/frontend
exec pnpm run dev
