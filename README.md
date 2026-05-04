# TuitionMedia

  [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
  [![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?style=flat-square&logo=nestjs&logoColor=white)](https://nestjs.com/)
  [![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org/)
  [![Turborepo](https://img.shields.io/badge/Turborepo-monorepo-EF4444?style=flat-square&logo=turborepo&logoColor=white)](https://turbo.build/)

  > A production-grade **student ↔ tutor marketplace** covering the full engagement lifecycle — from tuition requests through applications, trials, sessions, payments, reviews, and messaging — with local Bangladesh payment support (bKash / Nagad) and real-time Socket.IO notifications.

  ---

  ## Overview

  TuitionMedia solves a real coordination problem: students post detailed subject/location/budget requirements; tutors apply, go through a structured trial, and get booked for recurring sessions. Admins monitor quality, resolve disputes, and surface analytics. Every role gets a tailored UI backed by shared, type-safe contracts.

  ---

  ## Tech Stack

  | Layer | Technology |
  |-------|-----------|
  | Monorepo | **Turborepo** + pnpm workspaces |
  | Frontend | **Next.js 15** (App Router), React 19, Tailwind CSS 3, shadcn/Radix UI, Zustand, Framer Motion, Recharts |
  | Backend | **NestJS 10**, Prisma ORM, PostgreSQL, Socket.IO |
  | Shared Contracts | `packages/shared-schema` — Zod schemas + TypeScript types used by both apps |
  | Realtime | Socket.IO server + `socket.io-client` in Next.js app |
  | Payments | bKash / Nagad component flows (Bangladesh-local) |
  | Auth | JWT-based sessions with role guards (student / tutor / admin) |
  | Testing | Jest (unit + integration) |

  ---

  ## Features

  ### For Students
  - Post detailed tuition requests (subject, grade level, location, budget, schedule)
  - Browse and shortlist tutor applications
  - Book trials with fee escrow
  - Confirm sessions, leave reviews, and message tutors in real-time

  ### For Tutors
  - Profile with qualifications, subjects, and availability
  - Apply to open requests; track application status
  - Manage session calendars and earnings
  - Receive instant notifications via Socket.IO

  ### For Admins
  - Full dashboard with user management, request oversight, and dispute resolution
  - Analytics (Recharts) for platform health — active requests, conversion rates, revenue
  - Tutor verification workflow

  ### Platform
  - Real-time messaging with Socket.IO (instant delivery, read receipts)
  - Bangladesh-local payment UX (bKash / Nagad)
  - Shared Zod validation layer eliminates client/server contract drift
  - Turborepo task graph for parallel builds and caching

  ---

  ## Repository Structure

  ```
  TuitionMedia/
  ├── apps/
  │   ├── frontend/          # Next.js 15 App Router
  │   └── backend/           # NestJS API + Socket.IO server
  ├── packages/
  │   └── shared-schema/     # Zod schemas + TS types (shared contracts)
  ├── turbo.json             # Turborepo pipeline config
  └── pnpm-workspace.yaml
  ```

  ---

  ## Getting Started

  ### Prerequisites

  - Node.js 20+
  - pnpm 9+
  - PostgreSQL 14+

  ### Setup

  ```bash
  # Clone the repository
  git clone https://github.com/sadruzzahan/TuitionMedia.git
  cd TuitionMedia

  # Install dependencies
  pnpm install

  # Configure environment variables
  cp apps/backend/.env.example apps/backend/.env
  cp apps/frontend/.env.example apps/frontend/.env.local
  # → Set DATABASE_URL, JWT_SECRET, SOCKET_PORT, and payment keys

  # Run database migrations
  pnpm --filter backend prisma migrate dev

  # Start all services in parallel
  pnpm dev
  ```

  The frontend runs on [http://localhost:3000](http://localhost:3000) and the backend on [http://localhost:4000](http://localhost:4000).

  ---

  ## Demo

  > **Status:** Local development — staging environment in progress.
  > Clone and run locally to explore all features (see setup above).

  ### Screenshots

  | Student Dashboard | Tutor Applications | Admin Panel |
  |:-:|:-:|:-:|
  | *(screenshot placeholder)* | *(screenshot placeholder)* | *(screenshot placeholder)* |

  ---

  ## Roadmap

  - [ ] Stripe / international payment gateway
  - [ ] Video session integration (Daily.co or Livekit)
  - [ ] Mobile app (React Native / Expo)
  - [ ] AI-powered tutor matching based on student history

  ---

  ## Contributing

  Pull requests are welcome. Please open an issue first to discuss what you'd like to change.

  ---

  ## License

  MIT — see [LICENSE](LICENSE) for details.

  ---

  > Built by [@sadruzzahan](https://github.com/sadruzzahan) — open to remote product engineering roles and serious freelance engagements.
  