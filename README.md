# TuitionMedia

A modern, animated full-stack platform connecting **Students** (tuition requesters) with **Tutors** (applicants), overseen by **Admins**.

## Recruiter snapshot

- **Problem** — unstructured tutor/student discovery → modeled marketplace with postings, competing applications, paid sessions, and reviews (`apps/backend/prisma/schema.prisma`).
- **Why it stands out here** — this repo is intentionally **different** from the Vite+Drizzle+Express template family elsewhere on the profile: **`Next.js 15` App Router frontend**, **`NestJS` modular backend**, **`Prisma`** migrations, and **`TurboRepo`** orchestration demonstrate breadth beyond a single scaffolding pattern.

## Highlights

- **Payments + fees** domain models (`BookingFee`, `Payment`, trial windows on applications) show real marketplace complexity.
- **Shared contracts** via `packages/shared-schema` keeps API + UI drift-resistant (Zod + TS types surfaced to both sides).
- **Realtime-ready UI stack** (`socket.io-client` on frontend) for messaging-centric flows.

## Stack

- **Monorepo**: Turborepo + pnpm workspaces
- **Frontend**: Next.js 15 (App Router), Tailwind CSS, shadcn/ui, Zustand, Lucide React
- **Backend**: NestJS, Prisma, Passport-JWT
- **Shared**: `packages/shared-schema` — Zod schemas and TypeScript types for both apps

## Prerequisites

- Node.js ≥ 20
- pnpm (e.g. `corepack enable && corepack prepare pnpm@9.14.2 --activate` or `npm install -g pnpm`)

## Setup

1. **Install dependencies**
   ```bash
   pnpm install
   # or: npm install pnpm -D && npx pnpm install
   ```

2. **Database** (PostgreSQL)
   ```bash
   cp apps/backend/.env.example apps/backend/.env
   # Edit DATABASE_URL in apps/backend/.env
   cd apps/backend && npx prisma migrate dev --name init
   ```

3. **Build & run**
   ```bash
   pnpm run build
   pnpm --filter backend dev      # Backend on :3001
   pnpm --filter frontend dev     # Frontend on :5000 (see apps/frontend/package.json)
   ```

4. **Frontend env** (optional): `apps/frontend/.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:3001`

## Scripts

| Command | Description |
|--------|-------------|
| `pnpm dev` | Run all apps in dev mode (Turbo) |
| `pnpm build` | Build all packages and apps |
| `pnpm lint` | Lint all workspaces |
| `pnpm --filter frontend dev` | Run only Next.js frontend |
| `pnpm --filter backend dev` | Run only NestJS backend |

## Project layout

```
tuition-media/
├── apps/
│   ├── frontend/     # Next.js 15
│   └── backend/      # NestJS + Prisma
├── packages/
│   └── shared-schema # Zod + shared types
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.base.json
```

## Screenshots | Demo links

_Add public demo URL + GIFs showing student request intake + tutor applicant flow._

## Features

- **Auth**: Signup, Login, JWT, role-based access
- **Students**: Post tuition requests, view & accept tutor applications
- **Tutors**: Browse job board, apply with cover letter, track applications
- **Matching**: Accept application → request IN_PROGRESS, tutor notified
- **UI**: Dark theme, glassmorphism, Motion animations, responsive

---

## Architecture notes

```text
apps/
├── frontend/   # Next.js 15 (Turbopack dev server on :5000 per package.json)
├── backend/    # NestJS bootstrap with CORS for local + Replit domains
packages/
└── shared-schema/
```

Nest entrypoint configures multi-origin access including `REPLIT_DOMAINS` parsing for preview URLs (`apps/backend/src/main.ts`).

---

## Roadmap | Known limitations

- Harden webhook/payment integrations before exposing production traffic.
- Add CI (lint/test) badge once pipelines exist.

---

## License

Inherited from repository root (MIT unless otherwise marked).
