#!/bin/sh
set -e

export PATH=/home/runner/bin:$PATH
PNPM="node /home/runner/.corepack/v1/pnpm/10.7.0/bin/pnpm.cjs"

echo "==> Starting TuitionMedia..."

# Build shared-schema if needed
if [ ! -d "packages/shared-schema/dist" ]; then
  echo "==> Building shared-schema..."
  $PNPM --filter shared-schema run build
fi

# Start backend in background
echo "==> Starting backend..."
cd apps/backend
node dist/main &
BACKEND_PID=$!
cd ../..

# Wait for backend to be ready
echo "==> Waiting for backend on port 3001..."
sleep 3

# Start frontend
echo "==> Starting frontend..."
cd apps/frontend
exec $PNPM run dev
