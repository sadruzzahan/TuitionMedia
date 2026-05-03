# TuitionMedia

**Turborepo** monorepo: a **student ↔ tutor marketplace** with **admin** oversight—tuition requests, tutor applications, trials, sessions, booking fees, reviews, notifications, and Bangladesh-local payment UX (**bKash** / **Nagad** components in the frontend). **Next.js 15** (App Router) frontend and **NestJS** + **Prisma** backend share contracts from **`packages/shared-schema`** (Zod + TypeScript types). Realtime messaging uses **Socket.IO** on the server and **`socket.io-client`** in the app.

## Stack

| Layer | Choices |
|--------|---------|
| Monorepo | **Turborepo** + **pnpm** workspaces (`pnpm-workspace.yaml`) |
| Frontend | `apps/frontend` — Next.js **15.1**, React 19, Tailwind 3, shadcn-style Radix UI, Zustand, Motion, Recharts |
| Backend | `apps/backend` — NestJS 10, Prisma 6, Passport JWT, **@nestjs/platform-socket.io** |
| Shared | `packages/shared-schema` — Zod schemas consumed by both apps |
| Database | PostgreSQL (Prisma schema under `apps/backend/prisma`) |

**Engines**: Node **≥ 20** (root `package.json`).

## Prerequisites

- PostgreSQL
- pnpm (root declares `pnpm` as devDependency; `corepack enable` recommended)

## Setup

1. **Install**

   ```bash
   pnpm install
   ```

2. **Database**

   ```bash
   cp apps/backend/.env.example apps/backend/.env
   # Set DATABASE_URL and JWT secrets (see .env.example)
   pnpm --filter backend exec prisma migrate dev
   ```

   Root shortcuts: `pnpm run db:migrate`, `pnpm run db:generate`, `pnpm run db:studio`.

3. **Run**

   ```bash
   pnpm dev                 # turbo: all dev tasks
   ```

   Or individually:

   - **Backend**: `pnpm --filter backend dev` — Nest watch mode; listens on **`PORT`** or **3001** (`apps/backend/src/main.ts`).
   - **Frontend**: `pnpm --filter frontend dev` — Next with **Turbopack** on **port 5000**, host `0.0.0.0`.

4. **Frontend API URL**

   Set `NEXT_PUBLIC_API_URL=http://localhost:3001` in `apps/frontend/.env.local` (or your deployed API origin).

**CORS**: `main.ts` allows `FRONTEND_URL` (default `http://localhost:3000`), explicit `http://localhost:5000` and `3002`, plus `REPLIT_DOMAINS` split list when set.

## Root scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | `turbo run dev` |
| `pnpm build` | `turbo run build` |
| `pnpm lint` | `turbo run lint` |
| `pnpm clean` | Clean turbo outputs + root `node_modules` |
| `pnpm format` | Prettier over common file types |

## Project layout

```
TuitionMedia/
├── apps/
│   ├── frontend/          # Next.js App Router: public marketing, tutor discovery, dashboards
│   └── backend/           # NestJS modules, Prisma, WebSockets, JWT auth
├── packages/
│   └── shared-schema/     # Shared Zod + types
├── plans/                 # Internal planning markdowns
├── turbo.json
├── pyproject.toml / main.py   # ancillary Python at repo root (if used in your workflow)
└── package.json
```

## Domain features (implemented)

- **Roles**: student, tutor, admin — signup/login and JWT-protected dashboards.
- **Students**: post requests, browse tutors, book sessions, reviews, chat drawer, session history/upcoming widgets.
- **Tutors**: profile, schedule/availability, applications to requests, session management.
- **Payments UI**: bKash/Nagad flows and payment method selector (integrate webhooks before production money movement).
- **Admin**: dashboard plans and routes as present under `(dashboard)` and prisma models for fees/reviews/sessions.

## Seeds (backend)

`apps/backend/package.json` defines `seed:admin`, `seed:test`, `seed:featured` via `ts-node` scripts in `prisma/`. Default Prisma seed invokes `seed-admin`.

## License

Private package (`private: true` in root `package.json`); treat licensing as specified by the repository owner if a separate license file is added.
