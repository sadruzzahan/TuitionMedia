# Session Scheduling & Management

## What & Why
After two parties connect, they currently have no structured way to schedule sessions within the platform. A session scheduling system increases platform stickiness, gives both parties accountability, and is a prerequisite for meaningful reviews. This feature adds a lightweight calendar-based scheduling system: tutors set their weekly availability, students book time slots, and both parties see upcoming sessions in their dashboards.

## Done looks like
- A "Schedule" tab or section appears on the tutor's dashboard where they can set their weekly recurring availability (e.g., "Monday 4pm–8pm, Wednesday 5pm–7pm") using a visual time-block picker
- Students who are connected to a tutor can go to the tutor's profile or their accepted application and click "Book a Session" to see available slots on a calendar and pick a time
- After a student books a session, the tutor receives a notification and can confirm or suggest a different time
- Both parties see "Upcoming Sessions" in their dashboards: a card with tutor/student name, subject, date/time, session duration, and a "Join" placeholder button (for future video integration)
- A session can be marked as "Completed" by either party, which triggers a review prompt (Task #5)
- Sessions in the past are moved to a "Session History" section
- New database models: `Availability` (tutor recurring slots) and `Session` (booked instance with student, tutor, time, status)
- The calendar uses `react-big-calendar` (MIT, 831k weekly downloads, 8.6k GitHub stars) — already works with React 19

## Out of scope
- Video calling / virtual classroom (future work)
- Automated session reminders via SMS or email (future work)
- Payment per session (platform currently uses a one-time connection fee model)
- Integration with Google Calendar or external calendars (future work)

## Tasks
1. **Database models** — Add `Availability` model (tutorId, dayOfWeek 0-6, startHour, endHour, isRecurring) and `Session` model (studentId, tutorId, applicationId, scheduledAt, durationMinutes, status: PENDING/CONFIRMED/COMPLETED/CANCELLED, subject, notes) to the Prisma schema. Create and run migrations.

2. **Availability API** — Create endpoints: `PUT /availability` (tutor sets their weekly availability, replaces existing), `GET /availability/:tutorId` (public, returns available time blocks for the next 30 days excluding already-booked slots).

3. **Session booking API** — Create endpoints: `POST /sessions` (student books a slot, creates a Session in PENDING status, sends notification to tutor), `PUT /sessions/:id/confirm` (tutor confirms), `PUT /sessions/:id/complete` (either party marks complete — triggers review prompt logic), `PUT /sessions/:id/cancel` (either party cancels), `GET /sessions/upcoming` (returns current user's upcoming sessions), `GET /sessions/history` (past sessions).

4. **Tutor availability UI** — In the tutor's dashboard, add a "Schedule" tab. Implement a weekly grid time-block picker where tutors click to toggle available hours for each day. Display saved availability clearly. Show a summary of next 7 days' availability.

5. **Student booking flow** — Add a "Book a Session" button on the student's accepted application detail view (visible only for CONNECTED applications). Clicking opens a calendar (react-big-calendar month view) showing the tutor's available slots highlighted. Student clicks a slot, fills in subject/duration (30, 60, 90 min), adds optional notes, and confirms. Show a booking confirmation screen.

6. **Upcoming sessions dashboard widget** — Add an "Upcoming Sessions" card section to both the student and tutor dashboards. Each session card shows: avatar + name of the other party, subject, date/time, duration, status badge (Pending/Confirmed), and action buttons (Confirm, Cancel, Mark Complete). Sessions within 24 hours are highlighted.

7. **Session history** — Add a "History" tab in both dashboards showing past sessions with status (Completed/Cancelled), and a "Write a Review" button for completed sessions without a review yet.

## Relevant files
- `apps/backend/prisma/schema.prisma`
- `apps/backend/src/app.module.ts`
- `apps/backend/src/application/application.service.ts`
- `apps/frontend/src/app/(dashboard)/dashboard/student/[id]/page.tsx`
- `apps/frontend/src/app/(dashboard)/dashboard/tutor/page.tsx`
- `apps/frontend/src/app/(dashboard)/dashboard/tutor/applications/page.tsx`
