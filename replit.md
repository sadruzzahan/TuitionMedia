# TuitionMedia — Bangladesh Tutoring Marketplace

## Project Overview
A full-stack tutoring marketplace built for Bangladesh. Students post tuition requests, tutors apply, and both parties connect via a ৳500 flat connection fee.

## Architecture
- **Monorepo**: pnpm + Turborepo
- **Frontend**: Next.js 15 (App Router, Turbopack) — port 5000
- **Backend**: NestJS + Prisma + PostgreSQL — port 3001
- **DB**: Replit-managed PostgreSQL via `DATABASE_URL`

## Key Technology Choices
- `bcryptjs` (NOT `bcrypt`) — pure JS, no native compilation issues on Replit
- Prisma schema uses `DATABASE_URL` only (no `directUrl`)
- pnpm runs via `/home/runner/bin/pnpm` wrapper (corepack install)
- JWT authentication with `JWT_SECRET` env secret

## Environment Variables
| Key | Where | Purpose |
|-----|-------|---------|
| `DATABASE_URL` | Secret (Replit-managed) | PostgreSQL connection |
| `JWT_SECRET` | Secret | JWT signing |
| `PORT` | Shared env | Backend port (3001) |
| `FRONTEND_URL` | Shared env | CORS allowlist |
| `NEXT_PUBLIC_API_URL` | Shared env | Frontend → backend URL |

## Running the App
```bash
bash start.sh
```
- Builds `shared-schema` package
- Starts backend (`apps/backend`)
- Starts frontend (`apps/frontend`) on port 5000

## Pages & Routes

### Public
| Route | Description |
|-------|-------------|
| `/` | Landing page — Bangladesh-localised marketing site |
| `/login` | Sign in |
| `/signup` | Register as student or tutor |
| `/tutors` | Browse public tutor profiles with filters (subject, division, rate, sort) |
| `/tutors/[id]` | Individual tutor public profile with SEO meta, JSON-LD, reviews |

### Dashboard (auth required)
| Route | Role | Description |
|-------|------|-------------|
| `/dashboard/student` | STUDENT | List my tuition requests |
| `/dashboard/student/new` | STUDENT | Post a new request |
| `/dashboard/student/:id` | STUDENT | Request details + accept/reject applications |
| `/dashboard/tutor` | TUTOR | Job board — browse open requests |
| `/dashboard/tutor/applications` | TUTOR | My applications + payment status |
| `/dashboard/profile` | All | Edit profile |

## Business Model
- ৳500 connection fee from **student** when accepting a tutor
- ৳500 connection fee from **tutor** to unlock student contact info
- Payment via bKash / Nagad (OTP demo mode implemented)
- Contact info revealed only after both parties have paid

## Bangladesh Localisation
- Currency: BDT (৳)
- Location: 8 divisions + areas
- Subjects: SSC/HSC/O-Level/A-Level + university subjects
- Phone: `01XXXXXXXXX` format validation

## Task Progress
- [x] Task #1: UI/UX Overhaul & Marketing Site — **COMPLETE**
- [x] Task #2: Tutor Discovery & Public Profiles — **COMPLETE**
  - `GET /tutors` — filterable, sortable, paginated browse endpoint with featured section
  - `GET /tutors/:id` — public profile with reviews; hides contact until connected
  - `is_profile_public` toggle on tutor dashboard profile page
  - `/tutors` and `/tutors/[id]` frontend pages with SEO meta + JSON-LD
- [ ] Task #3: Real-time Messaging & Notifications
- [ ] Task #4: Session Scheduling & Management
- [ ] Task #5: Reviews, Ratings & Verification
- [ ] Task #6: Admin Dashboard & Platform Analytics

## SSR Notes (Next.js 15 + React 19)
- `(dashboard)/layout.tsx` is a server component with `export const dynamic = 'force-dynamic'` to prevent zustand/motion prerender crashes
- `(public)/layout.tsx` has `export const dynamic = 'force-dynamic'` for the same reason
- Dashboard client layout lives in `layout-client.tsx`
- Individual dashboard pages use `profile-content.tsx` / `dashboard-content.tsx` wrapper pattern

## Plan Files
See `plans/` directory for detailed task plans.
