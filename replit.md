# TuitionMedia — Bangladesh Tutoring Marketplace

## Project Overview
A full-stack tutoring marketplace built for Bangladesh. Students post tuition requests, tutors apply, and connect via a trial-first model. Students pay ৳0 — tutors pay a finder's fee (50% of proposed monthly rate, min ৳300) AFTER the student/guardian approves the trial.

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
| `NEXT_PUBLIC_API_URL` | Shared env | Frontend → backend REST URL (e.g. `/api`) |
| `NEXT_PUBLIC_SOCKET_URL` | Shared env | Socket.IO backend URL (direct, not proxied) |

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
| `/dashboard/student` | STUDENT | List my tuition requests + Upcoming Sessions widget |
| `/dashboard/student/new` | STUDENT | Post a new request |
| `/dashboard/student/:id` | STUDENT | Request details + accept/reject applications + Book Session |
| `/dashboard/student/sessions` | STUDENT | Upcoming & past sessions list |
| `/dashboard/tutor` | TUTOR | Job board — browse open requests |
| `/dashboard/tutor/applications` | TUTOR | My applications + payment status + Upcoming Sessions widget |
| `/dashboard/tutor/sessions` | TUTOR | Upcoming & past sessions (confirm/cancel/complete) |
| `/dashboard/tutor/schedule` | TUTOR | Availability picker + session history |
| `/dashboard/profile` | All | Edit profile |

## Business Model — Trial-First Commission System
- **Students pay ৳0** — everything is free for students
- **Tutors pay finder's fee** = 50% of proposed monthly rate (minimum ৳300)
- The finder's fee is triggered ONLY after:
  1. Student accepts the tutor (trial starts free, chat unlocked)
  2. Student/guardian marks "Guardian Approved" after trial classes
  3. Tutor pays the fee via bKash/Nagad → contact info unlocked for both
- Payment via bKash / Nagad (OTP demo simulation)
- Helper: `calcFinderFee(proposedRate)` = `Math.max(Math.round(rate * 0.5), 300)` — used in both `application.service.ts` and `payment.service.ts`

## Application Status Flow
- `PENDING` → tutor applied, awaiting student review
- `ACCEPTED` → student accepted for **free trial**; `trial_started_at` set; chat unlocked
- `TRIAL_APPROVED` → student/guardian approved; `trial_approved_at` set; tutor must pay finder's fee
- `BOTH_PAID` → tutor paid finder's fee; `contact_unlocked = true`; full contact info visible
- `CONNECTED` → alias for BOTH_PAID (legacy)
- `REJECTED` / `WITHDRAWN` / `CANCELLED` → application terminated
- **Chat access**: allowed from `ACCEPTED` onwards (trial, approved, paid, connected)
- **Contact info**: only unlocked after tutor pays (`BOTH_PAID`/`CONNECTED`)

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
- [x] Task #3: Real-time Messaging & Notifications — **COMPLETE**
  - `Message` model added to Prisma schema (applicationId, senderId, content, createdAt, readAt)
  - `ChatGateway` (Socket.IO) with JWT auth, join_room, send_message, mark_read events
  - `NotificationModule` with REST endpoints: `GET /notifications`, `GET /notifications/unread-count`, `POST /notifications/mark-all-read`, `POST /notifications/:id/read`
  - `ChatController`: `GET /messages/:applicationId`
  - Real-time notifications emitted to users when new application received, accepted, rejected, or payment verified
  - `NotificationBell` component with live unread count badge, dropdown with icons/timestamps/links
  - `ChatDrawer` slide-in component with scrollable message list and multi-line input (Enter to send)
  - "Message" button appears on student request detail page and tutor applications page when `status === BOTH_PAID`
  - `useSocket` hook manages shared Socket.IO connection with JWT auth
  - `NEXT_PUBLIC_SOCKET_URL` env var for direct backend WebSocket connection
- [x] Task #4: Session Scheduling & Management — **COMPLETE**
  - `Availability` model: tutorId, dayOfWeek, startHour, endHour
  - `Session` model: applicationId, studentId, tutorId, scheduledAt, durationMinutes, subject, notes, status (PENDING/CONFIRMED/COMPLETED/CANCELLED)
  - `SessionStatus` and new `NotificationType` values (SESSION_BOOKED/CONFIRMED/CANCELLED/COMPLETED)
  - `SessionModule` with REST API: PUT /sessions/availability, GET /sessions/availability/:tutorId, GET /sessions/availability/:tutorId/slots, POST /sessions/book/:applicationId, POST /sessions/:id/confirm|cancel|complete, GET /sessions/upcoming, GET /sessions/history
  - Frontend: `AvailabilityPicker` for weekly slot management, `BookSessionDialog` with calendar week view, `SessionCard` with action buttons, `UpcomingSessionsWidget`, `SessionHistory`
  - Tutor Schedule page (/dashboard/tutor/schedule): weekly availability picker + session history
  - Tutor Sessions page (/dashboard/tutor/sessions): upcoming sessions (confirm/cancel/complete) + history tab
  - Student Sessions page (/dashboard/student/sessions): upcoming + history
  - Book Session button on student request detail page (only for BOTH_PAID/CONNECTED applications)
  - UpcomingSessionsWidget embedded in student dashboard and tutor applications pages
  - Notification routing for all session types (SESSION_BOOKED → tutor, SESSION_CONFIRMED → student, etc.)
  - Navigation sidebar updated for both roles with Sessions + Schedule links
- [ ] Task #5: Reviews, Ratings & Verification
- [ ] Task #6: Admin Dashboard & Platform Analytics

## UI Design System
- **Color**: Dark background `hsl(220, 30%, 5%)`, cyan/teal gradient primary
- **Glass morphism**: `.glass`, `.glass-card`, `.glass-dark` utility classes in globals.css
- **Glow effects**: `.glow-cyan`, `.glow-cyan-sm`, `.glow-amber`
- **Text gradients**: `.text-gradient` (cyan→teal→emerald), `.text-gradient-warm`, `.text-gradient-cool`
- **Animations**: `.animate-float`, `.animate-pulse-glow`, `.animate-fade-up`, `.animate-blob`
- **Bottom floating navbar**:
  - Dashboard: cyan theme, `layoutId="nav-active-pill"`, fixed at `bottom-5`
  - Admin: amber theme, `layoutId="admin-nav-active"`, fixed at `bottom-5`
  - Both use `pb-28` on main content to clear the nav
- **Public nav** (`components/public-nav.tsx`): scroll-aware (transparent → backdrop-blur), animated active pill with `layoutId="nav-indicator"`, mobile slide-down drawer
- **Home page** uses shared `PublicNav` component (not custom header)

## SSR Notes (Next.js 15 + React 19)
- `(dashboard)/layout.tsx` is a server component with `export const dynamic = 'force-dynamic'` to prevent zustand/motion prerender crashes
- `(public)/layout.tsx` has `export const dynamic = 'force-dynamic'` for the same reason
- Dashboard client layout lives in `layout-client.tsx`
- Individual dashboard pages use `profile-content.tsx` / `dashboard-content.tsx` wrapper pattern

## Plan Files
See `plans/` directory for detailed task plans.
