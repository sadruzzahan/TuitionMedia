# Database Setup (Supabase)

Your app is running but the database needs your Supabase password.

## Get your password

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/nzelyyojjlocpymyndkt)
2. **Settings** → **Database**
3. Copy the **Database password** (or reset it if needed)

## Option A: One command

```bash
cd /home/zexorex/tuition-marketplace
SUPABASE_DB_PASSWORD="your-actual-password" ./scripts/setup-db.sh
```

## Option B: Edit .env

1. Open `apps/backend/.env`
2. Replace `[YOUR-PASSWORD]` with your actual database password (in both DIRECT_URL and DATABASE_URL)
3. Run:
   ```bash
   cd apps/backend && npx prisma migrate reset --force
   ```

## Restart backend

After the migration succeeds, restart the backend:

```bash
# Stop the current backend (Ctrl+C in its terminal)
cd apps/backend && npx pnpm run dev
```

---

**App URLs:**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
