# Tutor Discovery & Public Profiles

## What & Why
Currently TuitionMedia has no public tutor search or browsable tutor profiles. Students must post a request and wait for tutors to apply — a passive model. The most successful tutoring marketplaces (Preply, bdtutors.com with 20k users) center on tutor discoverability: students find and contact tutors directly. Adding a public tutor search page and individual tutor profiles will dramatically increase conversion and give the platform real marketplace value for Bangladesh.

## Done looks like
- Public `/tutors` page with a search bar (subject, division/area, grade level), filter sidebar (subjects multi-select, division dropdown, budget range slider, gender preference, availability), and a tutor card grid showing photo placeholder, name, subjects taught, hourly rate in BDT, star rating, verified badge, and "View Profile" CTA
- Tutor cards also show: first 2-3 lines of bio, response rate badge, and total sessions completed
- Individual tutor profile page at `/tutors/[id]` showing: full profile photo, name, verified badge, subjects (color tags), hourly rate, division/area, education background, bio, star rating breakdown (5 categories: Communication, Knowledge, Punctuality, Patience, Value), and review list
- A "Request This Tutor" button on the tutor profile page that either: (a) lets a student create a targeted request for this specific tutor, or (b) shows a "Direct Contact" modal (post-connection)
- Tutors who have set their profile as public appear on the browse page; tutors can toggle profile visibility in their dashboard
- Backend API endpoints: `GET /tutors` (with query params: subject, division, area, minRate, maxRate, gender, page, limit), `GET /tutors/:id` (public profile data)
- The tutor browse page is SEO-friendly (server-rendered via Next.js), with structured data and proper meta tags per tutor page
- Search results are paginated (12 tutors per page) with a result count
- A "Featured Tutors" section at the top (premium subscribers shown first) with a subtle "Featured" badge
- Tutors are sorted by: relevance (default), rating (high to low), rate (low to high, high to low), newest

## Out of scope
- In-platform chat (Task #3)
- Session booking/scheduling (Task #4)
- Review submission (Task #5, which populates the ratings shown here)
- Admin tutor management (Task #6)
- Real payment for premium listings (future work)

## Tasks
1. **Backend tutor listing API** — Create `GET /tutors` endpoint in a new `TutorDiscoveryController` with filtering (subject array, division, area, minRate, maxRate, gender), sorting, and pagination. Include aggregated rating score from the `Review` model. Mark tutors with an `is_profile_public` flag (add to `TutorProfile` model via Prisma migration).

2. **Backend tutor profile API** — Create `GET /tutors/:id` public endpoint returning full tutor profile data including subjects, rate, bio, education, division, areas, rating breakdown, and recent reviews (last 5). Contact info (phone, email) must remain hidden unless a `CONNECTED` application exists between the requesting user and this tutor.

3. **Tutor profile visibility toggle** — Add a "Make my profile public" toggle in the tutor's dashboard profile page. When enabled, the tutor appears in the browse page. Default: public.

4. **Tutor browse page** (`/tutors`) — Build the full search UI: sticky search header, collapsible filter sidebar (subjects checkboxes, division select, area select, budget range slider with BDT labels, gender radio), tutor card grid with all profile data, pagination controls, result count, "no results" state with suggestions, and a loading skeleton state.

5. **Tutor profile page** (`/tutors/[id]`) — Build the full public profile page: hero section with avatar/name/verified badge, rating summary (star display + score + review count), subject tags, hourly rate, bio section, education section, coverage area, rating breakdown table, recent reviews list. Include "Request This Tutor" CTA. Server-side render with Next.js for SEO.

6. **SEO & meta tags** — Add per-page meta titles, descriptions, and Open Graph tags for the `/tutors` page and individual `/tutors/[id]` pages. Add structured data (JSON-LD Person schema) for tutor profile pages.

7. **Featured tutor logic** — In the tutor browse page, show tutors with `is_premium = true` (to be set by admin, or auto-set on subscription, future) with a "Featured" badge pinned to top of results. For now, mark a few demo tutors as featured via a seeding script.

## Relevant files
- `apps/backend/src/auth/auth.service.ts`
- `apps/backend/src/auth/auth.controller.ts`
- `apps/backend/prisma/schema.prisma`
- `apps/frontend/src/app/(public)/page.tsx`
- `apps/frontend/src/lib/api.ts`
- `packages/shared-schema/src/index.ts`
