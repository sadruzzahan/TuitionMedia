# Admin Dashboard & Platform Analytics

## What & Why
A sellable, production-ready platform needs operational tooling. The platform admin (you) needs to manage users, review verification documents, monitor payments, oversee platform health, and handle disputes. This task builds a dedicated admin panel that makes TuitionMedia operable as a real business in Bangladesh.

## Done looks like
- A protected `/admin` route accessible only to users with `role = ADMIN`
- Admin dashboard home showing key platform metrics: total users (students vs tutors), total connections made, platform revenue (BDT), active requests, requests fulfilled this month
- User management table: searchable list of all users with columns (name, email, role, joined date, verified status, active status). Admin can deactivate/reactivate accounts and promote a user to premium (featured tutor status).
- Tuition request oversight: list of all requests with status, creation date, application count, and the ability to close or remove inappropriate posts
- Payment transaction log: table of all payment records with user names, application reference, payment method (bKash/Nagad), amount, status, and date. Filterable by date range and status.
- Document verification queue: list of uploaded verification documents (from Task #5) with tutor name, document type, upload date, and status. Admin can preview (show filename/type), approve, or reject each document. Approving marks the tutor as verified.
- Review moderation: list of all submitted reviews with the ability to flag/hide inappropriate content
- Platform revenue summary: monthly revenue chart (bar chart by month), total revenue, average revenue per connection, projected monthly based on current rate
- All admin pages are accessible only to ADMIN role — backend middleware enforces this. Frontend redirects non-admin users away.

## Out of scope
- Multi-admin roles / permissions (single admin role for now)
- Email communication tools for admin-to-user messaging (future work)
- Automated fraud detection (future work)
- Financial reporting / accounting exports (future work)

## Tasks
1. **Admin auth guard** — Add an `AdminGuard` in NestJS that checks `role === ADMIN` on protected admin endpoints. Apply to all `/admin/*` routes. Add a frontend route guard that redirects non-admin users from `/admin/*` to their dashboard.

2. **Admin stats API** — Create `GET /admin/stats` endpoint returning: total users by role, total connections (CONNECTED applications), total revenue (sum of verified payments), active open requests count, month-over-month growth figures.

3. **User management API** — Create `GET /admin/users` (paginated, searchable by name/email, filterable by role/status) and `PUT /admin/users/:id` (toggle `is_active`, toggle `is_premium`). Also `GET /admin/users/:id` for user detail.

4. **Payment and request oversight APIs** — Create `GET /admin/payments` (paginated transaction log with filters), `GET /admin/requests` (all tuition requests with admin-level detail), `DELETE /admin/requests/:id` (remove inappropriate post).

5. **Document verification API** — Create `GET /admin/documents` (queue of pending documents), `PUT /admin/documents/:id/approve`, `PUT /admin/documents/:id/reject`. Approving a document should set the tutor's verified flag.

6. **Admin dashboard home page** — Build `/admin` page with: a stats grid (6 KPI cards), a recent activity feed (last 10 connections, payments, registrations), and quick-action links to each management section. Use recharts for the monthly revenue bar chart.

7. **User management UI** — `/admin/users` page with a data table (sortable columns, search input, role filter tabs), pagination, and row-action buttons (View, Deactivate, Make Premium). A user detail slide-over showing full profile info and activity history.

8. **Payments & requests UI** — `/admin/payments` page with transaction table (date range filter, status filter, search by user name). `/admin/requests` page with request list and a remove action.

9. **Document queue UI** — `/admin/documents` page showing pending verification documents in a card list. Each card shows tutor name, document type, upload timestamp, and Approve/Reject buttons. On approval, the tutor's verified badge activates immediately.

10. **Review moderation UI** — `/admin/reviews` page with a list of reviews, each showing reviewer, tutor, rating, comment, and a "Hide Review" toggle.

## Relevant files
- `apps/backend/src/app.module.ts`
- `apps/backend/src/auth/auth.module.ts`
- `apps/backend/prisma/schema.prisma`
- `apps/frontend/src/app/(dashboard)/layout.tsx`
- `apps/frontend/src/store/auth-store.ts`
