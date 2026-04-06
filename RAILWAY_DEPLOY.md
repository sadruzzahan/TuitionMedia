# Railway Deployment Guide

## Architecture

Recommended Railway setup:
- **1 Postgres service** - Managed PostgreSQL
- **1 Backend service** - NestJS API
- **1 Frontend service** - Next.js app

## Deployment Order

1. Deploy Postgres first
2. Deploy Backend (depends on Postgres)
3. Deploy Frontend (depends on Backend)

---

## Backend Service

### Build Command
```bash
pnpm install && pnpm --filter shared-schema build && pnpm --filter backend exec prisma generate && pnpm --filter backend build
```

### Start Command
```bash
pnpm --filter backend start
```

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `JWT_SECRET` | Secret for JWT token signing | `your-secure-random-string-min-32-chars` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://your-frontend.railway.app` |
| `PORT` | Server port (auto-set by Railway) | `3001` |

### Migration Command (run once after first deploy)
```bash
railway run --service backend pnpm --filter backend exec prisma migrate deploy
```

Or via Railway dashboard CLI:
```bash
pnpm --filter backend exec prisma migrate deploy
```

### Create Admin User (run after migration)
```bash
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=your-secure-password pnpm --filter backend seed:admin
```

Or via Railway CLI:
```bash
railway run --service backend --env ADMIN_EMAIL=admin@example.com --env ADMIN_PASSWORD=your-secure-password pnpm --filter backend seed:admin
```

### Health Check
- **Path:** `/health`
- **Expected Response:** `{ "status": "ok" }`

---

## Frontend Service

### Build Command
```bash
pnpm install && pnpm --filter shared-schema build && pnpm --filter frontend build
```

### Start Command
```bash
pnpm --filter frontend start
```

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://your-backend.railway.app` |

---

## Complete Setup Steps

### 1. Create PostgreSQL Service
```bash
railway add --plugin postgresql
```

Note the `DATABASE_URL` that Railway provides.

### 2. Create Backend Service
```bash
railway add --from github --repo your-repo --service backend
```

Set root directory to `apps/backend` or use the build/start commands above.

Set environment variables:
- `DATABASE_URL` (reference Postgres service: `${{Postgres.DATABASE_URL}}`)
- `JWT_SECRET` (generate a secure random string)
- `FRONTEND_URL` (set after frontend is deployed)

### 3. Run Migrations
After first backend deployment:
```bash
railway run --service backend pnpm --filter backend exec prisma migrate deploy
```

### 4. Create Admin User
After migrations complete:
```bash
railway run --service backend --env ADMIN_EMAIL=admin@example.com --env ADMIN_PASSWORD=SecurePass123! pnpm --filter backend seed:admin
```

### 5. Create Frontend Service
```bash
railway add --from github --repo your-repo --service frontend
```

Set environment variables:
- `NEXT_PUBLIC_API_URL` (reference backend service: `https://${{backend.RAILWAY_PUBLIC_DOMAIN}}`)

### 6. Update CORS
After frontend is deployed, update `FRONTEND_URL` in backend to the frontend's public URL.

---

## Troubleshooting

### Backend won't start
- Check `JWT_SECRET` is set
- Check `DATABASE_URL` is valid
- Check migrations have run

### Frontend can't reach API
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend is running and healthy
- Check CORS settings in backend

### Database connection issues
- Ensure Postgres service is running
- Verify `DATABASE_URL` format includes `sslmode=require` for Railway

### Admin login fails
- Verify admin user was created via seed script
- Check password is correct
- Check `JWT_SECRET` is set

---

## Notes

- The `DIRECT_URL` has been removed from Prisma schema as it's not needed for Railway
- JWT_SECRET is now required - the app will fail to start without it
- Public registration only allows STUDENT and TUTOR roles (ADMIN must be created via seed script)
- Run migrations BEFORE seeding admin user
