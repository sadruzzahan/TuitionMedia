# TuitionMedia

A modern, animated full-stack platform connecting **Students** (tuition requesters) with **Tutors** (applicants), overseen by **Admins**.

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
   pnpm --filter backend dev   # Backend on :3001
   pnpm --filter frontend dev # Frontend on :3000
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

## Features

- **Auth**: Signup, Login, JWT, role-based access
- **Students**: Post tuition requests, view & accept tutor applications
- **Tutors**: Browse job board, apply with cover letter, track applications
- **Matching**: Accept application → request IN_PROGRESS, tutor notified
- **UI**: Dark theme, glassmorphism, Motion animations, responsive
