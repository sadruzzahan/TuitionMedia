# Complete UI/UX Overhaul & Public Marketing Site

## What & Why
TuitionMedia's current UI has a dark glassmorphism aesthetic with cyan/emerald accents — a strong foundation, but it lacks conversion-focused marketing pages, responsive mobile layouts, and a polished design system. Local Bangladesh competitors (hometutorbd.com, bdtutors.com) all use generic light-theme templates. This task upgrades the UI to a premium, market-differentiating design that makes TuitionMedia look world-class and builds trust with Bangladeshi families.

## Done looks like
- New landing page with: hero section (tagline + search bar + CTA), live stats (registered tutors, successful connections, cities covered), "How It Works" 3-step flow, featured tutor cards with ratings/photo, testimonials, subject category grid, and a strong CTA footer
- New `/how-it-works` public page explaining the student and tutor flows
- New `/pricing` public page showing the ৳500 connection fee model and tutor subscription plans (Free vs Premium)
- New `/tutors` public browse page (see Task #2 for backend, this task covers the page shell and layout)
- Fully responsive mobile-first layouts on all pages (hamburger nav, touch-friendly cards)
- Redesigned auth pages (login/signup) with a split-panel layout — visual on the left, form on the right
- Redesigned dashboard layout with a collapsible sidebar, user avatar, notification bell icon (placeholder), and breadcrumb navigation
- Redesigned student dashboard: request cards with status badges (Open, In Progress, Closed), a clear "Post New Request" CTA, and an applications panel with applicant mini-profiles
- Redesigned tutor dashboard: job board with subject-colored tags, location chips, budget badge, "Applied" status indicator
- Redesigned profile page: photo upload placeholder, tab-based sections (Basic Info, Professional Details, Payment Info)
- Design system tokens: a defined color palette (deep navy background, teal/violet gradient accents, red/green Bangladesh flag accent option), typography scale (Inter font), spacing scale, and reusable card/button variants
- All pages score Lighthouse mobile usability > 90

## Out of scope
- Real-time data population of the tutor browse page (covered in Task #2)
- Chat UI components (covered in Task #3)
- Calendar scheduling UI (covered in Task #4)
- Admin dashboard (covered in Task #6)
- Actual payment gateway changes

## Tasks
1. **Design system foundation** — Define Tailwind theme extension with brand colors (dark navy base, teal-violet gradient accent, red/green secondary), custom CSS variables, typography scale (Inter), and reusable component variants (card sizes, button variants, badge styles). Update `tailwind.config.ts`.

2. **New landing page** — Build a high-converting homepage with hero section containing a prominent search input (subject + location), animated statistics counter (tutors, connections, cities), "How It Works" 3-step section, subject category grid (SSC, HSC, A-Level, IELTS, BCS, Primary, University), featured tutor cards section (with rating stars, verified badge, rate display), testimonials carousel, and trust badges (verified tutors, secure payment, money-back guarantee framing).

3. **Public marketing pages** — Create `/how-it-works` (step-by-step visual flow for both student and tutor journey) and `/pricing` (clear pricing table: Student = free, Tutor Free tier vs Premium tier at ৳500/month, connection fee ৳500 per match explained). Include an FAQ accordion section.

4. **Redesign auth pages** — Login and signup get a split-panel layout with an animated illustration/graphic panel and a clean, branded form panel. Add role selection cards (Student / Tutor) on the signup page with distinct icons and benefit bullets for each role.

5. **Redesign dashboard shell** — New collapsible sidebar with role-based navigation items, user avatar with initials fallback, notification bell icon, role badge chip, and a mobile hamburger drawer. Add a top breadcrumb bar and page title header.

6. **Redesign student pages** — Student dashboard request list gets card-grid layout with status color badges, deadline indicator, application count chip. Request detail page gets a two-column layout: request info on left, applicant cards on right with tutor mini-profile (photo placeholder, rating, subjects, bid indicator).

7. **Redesign tutor pages** — Tutor job board gets a card layout with subject tags, division/area chips, budget range badge, posted-time indicator, and a clean Apply modal. Applications page gets a timeline-style status tracker showing the full application → acceptance → payment → connected flow.

8. **Redesign profile page** — Tab layout: (1) Basic Info with avatar upload placeholder, (2) Tutor/Student specific fields, (3) Account settings. Add a profile completion progress bar.

9. **Mobile responsiveness pass** — Audit and fix all pages for mobile breakpoints. Hamburger nav, full-width cards, touch targets ≥ 44px, readable font sizes on small screens.

## Relevant files
- `apps/frontend/src/app/(public)/page.tsx`
- `apps/frontend/src/app/(public)/login/page.tsx`
- `apps/frontend/src/app/(public)/signup/page.tsx`
- `apps/frontend/src/app/(dashboard)/layout.tsx`
- `apps/frontend/src/app/(dashboard)/dashboard/profile/page.tsx`
- `apps/frontend/src/app/(dashboard)/dashboard/student/page.tsx`
- `apps/frontend/src/app/(dashboard)/dashboard/student/new/page.tsx`
- `apps/frontend/src/app/(dashboard)/dashboard/student/[id]/page.tsx`
- `apps/frontend/src/app/(dashboard)/dashboard/tutor/page.tsx`
- `apps/frontend/src/app/(dashboard)/dashboard/tutor/applications/page.tsx`
- `apps/frontend/src/components/ui`
- `apps/frontend/tailwind.config.ts`
- `apps/frontend/src/app/globals.css`
