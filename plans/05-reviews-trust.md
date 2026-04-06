# Reviews, Ratings & Verification System

## What & Why
Trust is the #1 conversion driver for tutoring marketplaces. Bangladeshi parents choosing a tutor for their child need strong trust signals: verified identity, real reviews from past students, and clear credentials. The existing database has `Review` and `Document` models but no UI. This task builds the full review submission flow, public rating display, and a tutor verification badge system — the features that make TuitionMedia trustworthy and parents willing to pay.

## Done looks like
- After a session is marked "Completed" (Task #4), both parties are prompted to leave a review
- The review modal collects: overall star rating (1-5), ratings on 5 dimensions (Communication, Subject Knowledge, Punctuality, Patience, Value for Money), and a written comment (optional but encouraged, min 20 chars if provided)
- Only one review per application pair (student reviews tutor, tutor can optionally rate student too)
- Tutor profile pages (Task #2) show the aggregated star rating, rating count, breakdown per dimension, and the most recent reviews (paginated)
- Tutors with verified documents display a "✓ Verified" badge on their profile and on tutor cards in the browse page
- Document upload UI in the tutor's profile page: upload NID/passport (front and back), educational certificates; each document shows upload status (Pending Review, Verified, Rejected)
- An admin-facing review moderation interface to approve/reject documents and flag inappropriate reviews (covered in Task #6, this task builds the data layer and tutor-facing UI)
- A "Top Rated Tutors" section on the landing page (feeds Task #1 hero content)
- Existing `Review` model is extended with the dimension breakdown fields; existing `Document` model is used as-is with a status field

## Out of scope
- Automated ID verification via third-party API (manual admin review only for now)
- Tutor-to-student reviews display (students don't have public profiles)
- Review response by tutors (future work)
- Dispute/appeal system for reviews (future work)

## Tasks
1. **Extend Review model** — Add dimension rating fields to the `Review` model: `communicationRating`, `knowledgeRating`, `punctualityRating`, `patienceRating`, `valueRating` (all 1-5 integers), plus `comment` (optional text). Update the backend API: `POST /reviews` (submit review for a completed session), `GET /reviews/tutor/:tutorId` (paginated list for public profile). Validate that a review can only be submitted once per application and only for completed sessions.

2. **Rating aggregation** — In the tutor listing and profile APIs (Task #2), compute and return aggregated ratings: overall average (weighted average of all 5 dimensions), individual dimension averages, and total review count. Cache or compute on-the-fly via Prisma aggregation queries.

3. **Review submission UI** — Build a `ReviewModal` component triggered from the session history "Write a Review" button. Includes: star rating input for each dimension (interactive star icons), overall rating displayed live as you rate, optional comment textarea with character counter, and a submit button. Show a "Thank you" confirmation after submission. The modal should feel rewarding and celebratory to encourage completion.

4. **Rating display on tutor profiles** — On the public tutor profile page (`/tutors/[id]`): add a rating summary section with the overall star display, numeric score (e.g., "4.8"), review count, and a bar chart of each dimension's average score. Below, list individual reviews with: student name (first name only for privacy), date, star rating, and comment.

5. **Tutor rating on cards** — Update tutor cards in the browse page and dashboard to display the star rating badge (e.g., ⭐ 4.8 · 23 reviews). This requires the tutor listing API to include the pre-computed rating.

6. **Document upload UI** — In the tutor's profile page "Verification" tab, add a document upload section. Use a drag-and-drop file input (or a clean file picker). Show uploaded documents with their status badge (Pending/Verified/Rejected). On the backend, create `POST /documents` (upload a file, store metadata in the Document model) and `GET /documents/my` (list own documents). Store files as base64 or file reference (local disk for development).

7. **Verified badge logic** — A tutor is shown as "Verified" (badge on profile and cards) when at least one uploaded document has been marked as `VERIFIED` by an admin. Add this `isVerified` computed field to the public tutor profile API response.

## Relevant files
- `apps/backend/prisma/schema.prisma`
- `apps/backend/src/application/application.service.ts`
- `apps/frontend/src/app/(dashboard)/dashboard/tutor/applications/page.tsx`
- `apps/frontend/src/app/(dashboard)/dashboard/profile/page.tsx`
- `apps/frontend/src/lib/api.ts`
