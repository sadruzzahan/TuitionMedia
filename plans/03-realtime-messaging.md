# Real-time Messaging & Notifications

## What & Why
Once a student and tutor are connected (both have paid the platform fee), they need to communicate directly within the platform. Currently, TuitionMedia reveals phone numbers post-connection, but in-app chat keeps users on the platform, increases trust, reduces fraud, and creates a data moat. Additionally, real-time notifications (application received, accepted, payment status) greatly improve the user experience. This task adds a Socket.IO-powered chat and notification system.

## Done looks like
- After both parties are connected (application status = `CONNECTED`), a "Message" button appears in the student's request detail page and the tutor's applications page
- Clicking "Message" opens an in-app chat interface — a slide-in drawer or a `/messages` page — showing the conversation thread between the student and tutor for that application
- Chat messages are persisted to the database (new `Message` model) and delivered in real-time via WebSocket
- The message input supports multi-line text and an Enter-to-send option
- A notification bell icon in the dashboard navbar shows an unread count badge
- Clicking the bell opens a dropdown with recent notifications (application received, application accepted, payment verified, new message)
- Notifications are delivered in real-time via WebSocket when the user is online, and stored in the database (existing `Notification` model) for offline delivery
- On page load, the app fetches unread notification count and recent notifications from the backend
- Each notification links to the relevant page (e.g., clicking "New application" goes to the student's request detail page)
- Chat is restricted to connected pairs only — the backend validates this before allowing message sending
- Message timestamps displayed in relative format (e.g., "2 minutes ago") and absolute on hover

## Out of scope
- Group chat or multi-party conversations
- File/image sharing in chat (future work)
- Video calling integration (future work)
- Push notifications to mobile devices (future work)
- Email notifications (future work)

## Tasks
1. **Message database model** — Add a `Message` model to the Prisma schema with fields: `id`, `applicationId` (FK to Application), `senderId` (FK to User), `content` (text), `createdAt`, `readAt` (nullable). Create and run a migration.

2. **NestJS WebSocket gateway** — Create a `ChatGateway` using `@nestjs/websockets` and `socket.io`. Handle events: `joinRoom` (user joins an application-specific room after auth validation), `sendMessage` (persist to DB, emit to room), `markRead` (update `readAt`). Authenticate the WebSocket connection using the JWT from the handshake auth header.

3. **Notification WebSocket events** — Extend the WebSocket gateway (or create a `NotificationsGateway`) to emit real-time events to connected users when: a new application is received, an application is accepted/rejected, a payment is verified. Wire these events into the existing application and payment service logic.

4. **Chat REST API** — Add `GET /messages/:applicationId` endpoint to load message history (paginated, most recent first), with authorization check (only the student or tutor involved can read). Add `GET /notifications` and `GET /notifications/unread-count` endpoints using the existing `Notification` model.

5. **Frontend Socket.IO client setup** — Install `socket.io-client` in the frontend. Create a `useSocket` hook that connects on dashboard mount using the JWT token, handles reconnection, and exposes methods: `joinRoom(applicationId)`, `sendMessage(applicationId, content)`, `onMessage(callback)`, `onNotification(callback)`.

6. **Chat UI component** — Build a `ChatDrawer` component (slides in from the right on desktop, full-screen on mobile) with: message list (scrollable, user messages right-aligned in teal, other party left-aligned in navy), message timestamp, read indicator, multi-line input with send button. Show "Message" CTA button on the student request detail page and tutor application item — only visible when status is `CONNECTED`.

7. **Notification bell UI** — Add a `NotificationBell` component to the dashboard navbar showing unread count badge. Clicking opens a `NotificationDropdown` with a list of recent notifications, each with an icon, message text, relative timestamp, and a link. "Mark all as read" action. Fetch initial count on mount; update via WebSocket events.

## Relevant files
- `apps/backend/src/app.module.ts`
- `apps/backend/prisma/schema.prisma`
- `apps/backend/src/application/application.service.ts`
- `apps/backend/src/payment`
- `apps/frontend/src/app/(dashboard)/layout.tsx`
- `apps/frontend/src/app/(dashboard)/dashboard/student/[id]/page.tsx`
- `apps/frontend/src/app/(dashboard)/dashboard/tutor/applications/page.tsx`
- `apps/frontend/src/lib/api.ts`
