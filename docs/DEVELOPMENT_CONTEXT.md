# Development Context & Handoff Guide

## 🚀 Project Overview
**UrbanPro V2** is a home services marketplace (like Urban Company) connecting customers with service professionals (cleaners, plumbers, etc.).

**Current Phase:** Trust & Safety (Booking Verification, Safety, and Analytics).

## 🧠 AI Handoff Protocol
**For Copilot / Cursor / Other AI:**
1.  **Read this file first** to understand the current state and architectural decisions.
2.  **Check `docs/PRODUCTION_ROADMAP.md`** for the high-level goals.
3.  **Update this file** after completing a significant task to keep the context fresh for the next session.

---

## ✅ Completed Tasks

### 1. Safety, Disposal & Emergency Handling (Revised)
*   **Status**: Initial SOS system decommissioned; focused on physical verification.
*   **Implementation**:
    *   **SOS Alert System**: Removed from all dashboards/cards to streamline UI (can be reintroduced via WebSocket phase later).
    *   **Photo Proof of Work**: Workers MUST upload a "Before Start" and "After Completion" photo. Photos are stored and linked to the booking for dispute resolution.
    *   **Emergency Contacts**: Backend API ready; UI currently hidden.

### 2. OTP Verification & Activity Progress
*   **Goal**: Secured physical presence and job state transitions.
*   **Implementation**:
    *   **Two-Factor Verification**: 4-digit OTPs generated for both Start and Completion.
    *   **Security**: OTPs are hidden from workers; customers must share them vocally to prevent fraudulent "Start/Complete" marking.
    *   **Dashboard Integration**: Quick-action buttons (Pay Now, Rate & Review) added directly to customer activity cards upon job completion.

### 3. Service Reliability (Location & Availability)
*   **Goal**: Prevent logistical conflicts.
*   **Implementation**:
    *   **Double-Booking Prevention**: Workers are blocked from accepting jobs that overlap within a +/- 2-hour window.
    *   **Service Area Matching**: Customers can only book workers whose defined `serviceAreas` include their location.
    *   **Worker Analytics**: Integrated charts for weekly earnings and job distribution.

---

## 🏗 Technical Implementation Details

### Database Schema (Prisma)
*   **Updated**: Added `startOtp`, `completionOtp`, `photos`, and `serviceAreas`.
*   **Worker Profile**: Added `bio`, `specialties`, and `serviceAreas`.

### Backend (Node.js/Express)
*   **Booking Service**: Centralized logic for OTP verification and availability checks.
*   **Security**: Enhanced RBAC (Role Based Access Control) to ensure workers cannot see customer OTPs.

### Frontend (React/Vite)
*   **UI/UX**: Transitioned to high-premium dark/light mode with Framer Motion animations.
*   **State Management**: Optimized TanStack Query (React Query) for smooth optimistic updates.

---

## ✅ Current Status
*   **Database**: Migrated with new models for OTPs and Photos.
*   **Backend**: Availability logic and OTP handshake fully functional.
*   **Frontend**: UI cleaned of SOS buttons; verification flow polished.
*   **Next step (Recommended)**: **Phase 2: Real-Time & Location (WebSockets)**.
    *   Implement Socket.io for instant booking notifications.
    *   Real-time status updates (polling currently).
    *   Live tracking map for workers.

## 🔮 Future Improvements
1.  **WebSocket Integration**: Instant job offers and status changes.
2.  **Real Payment Gateway**: Integrate Razorpay for actual money flow.
3.  **PWA Support**: Optimize for mobile-first "Add to Home Screen" experience.

---

## ✅ Recent Work: Realtime Notifications (Socket.IO)

**Goal**: Add instant booking updates for customers and workers.

**What was implemented**:
- **Socket.IO server**: `server/src/socket.js` initializes Socket.IO with JWT cookie parsing and auto-joins user rooms.
- **Server emits**: booking create/status updates emit `booking:created` and `booking:status_updated` in `server/src/modules/bookings/booking.controller.js`.
- **Client hook**: `client/src/hooks/useSocket.js` connects to the server, joins rooms on connect, and dispatches a `upro:socket-ready` event so pages can attach listeners after refresh.
- **Customer dashboard listeners**: `client/src/pages/customer/CustomerDashboardPage.jsx` shows toast and refetches bookings on realtime events.
- **Worker dashboard + bookings listeners**: `client/src/pages/worker/WorkerDashboardPage.jsx` and `client/src/pages/worker/WorkerBookingsPage.jsx` show toasts and refresh bookings.

**Stability fixes applied**:
- Disabled websocket upgrade in client (polling only) to prevent refresh-related disconnects.
- Added detailed socket debug logging in the client.
- Allowed multiple local frontend origins in server CORS to avoid Origin mismatch errors.
- Added dev-only debug endpoint `GET /api/debug/emit-sample` to emit a test event.

**How to test**:
1. Start server on port 3000.
2. Start client on port 5173.
3. Call `/api/debug/emit-sample` and verify toasts appear on customer and worker dashboards.

---

## ✅ Recent Work: Global SOS, Admin Safety & Data Integrity

**Goal**: Transform the partial SOS system into a global safety feature and harden Admin controls.

**Key Implementations**:
- **Global SOS System**:
  - Integrated `SOSContext` and `GlobalSOSButton` into the root `App.jsx`.
  - Automated background polling (every 60s) to detect active bookings and display the SOS button globally.
  - Implemented real-time Admin alerts that trigger a persistent toast and sound across all admin pages when an SOS is activated.
- **Advanced Admin Controls**:
  - **Account suspension**: Implemented `GlobalSocketListener` to force-logout users instantly when their `isActive` status is set to `false` by an admin.
  - **Database Integrity**: Updated `schema.prisma` with `onDelete: Cascade` rules. Deleting a user now safely clears all related data (Bookings, Reviews, Profiles) without database errors.
- **UI Responsiveness**:
  - Refined `Navbar.jsx` to keep the sidebar toggle visible on all mobile/split-screen views.
  - Added backdrop-blur overlays to the mobile sidebar for a premium feel.
  - Cleaned up `CustomerBookingDetailPage` by removing redundant "Modify" placeholders and intensifying "Cancel" actions.
- **Real-time Socket expansion**:
  - Added `review:created` notifications for admins and reviewees.
  - Added `booking:status_updated` emits for successful payments.

**Technical Changes**:
- **Prisma**: Modified 8+ relations to support `Cascade` behavior.
- **Socket.io**: Added targeted `user:status_changed` and `review:created` events.
- **Frontend**: Created `GlobalSocketListener` as a headless observer for system-wide alerts.

---

## ✅ Recent Work: Premium Worker Profile System & UI/UX Modernization

**Goal**: Transition from standard page-based profiles to a more modern, integrated, and "impressive" professional snapshot.

**Key Implementations**:
- **Consolidated "Master Profile" Drawer**:
  - Replaced standalone `WorkerPublicProfilePage` navigation with a high-end `WorkerProfileDrawer`.
  - **Design Language**: Shifted to a "Glassmorphic Bento" style—combining translucent overlays, mesh gradients, and organized content grids.
  - **Layered Interactivity**: Implemented a slide-over experience that preserves the user's dashboard context while providing deep dives into worker bios, portfolios, and reviews.
  - **Dynamic Tabs**: Internal navigation within the drawer (Overview, Services, Reviews) powered by `AnimatePresence` for fluid transitions.
- **Visual Polish**:
  - Integrated `Framer Motion` for all profile state transitions (entry, exit, tab switching).
  - Added "Verified Status" trust bars and high-contrast "Call to Action" footers pinned to the drawer.
- **Context Preservation**:
  - Integrated the drawer across the **Customer Dashboard** (recent activity) and **Booking Details** (assigned pro snapshot).
  - Ensured body-scroll locking and backdrop-blur overlays to focus attention on the professional's accolades.

**Technical Changes**:
- **Feature Architecture**: Centralized worker profile logic in `client/src/components/features/workers/WorkerProfileDrawer.jsx`.
- **Navigation Logic**: Reverted full-route navigation in favor of local state management (`isWorkerDrawerOpen`, `selectedWorkerId`) for a smoother single-page application (SPA) feel.
- **Cleanup**: Purged redundant exports and transitioned the `WorkerPublicProfilePage.jsx` into a high-end legacy fallback/direct-link asset.

---
---

## ✅ Recent Work: Worker Dashboard Consolidation & UI Fixes

**Goal**: Clean up the worker and customer dashboards by consolidating all job views and fixing display issues.

**Key Implementations**:

### Worker Dashboard Restructure
- **Merged "Active Jobs" + "Personal Job Requests" → unified "My Jobs" section**:
  - `myJobs` memo: consolidates `IN_PROGRESS`, `CONFIRMED`, and `PENDING` bookings, sorted by priority weight (IN_PROGRESS=4, CONFIRMED=3, PENDING=2, COMPLETED=1).
  - `feedJobs` memo: exclusively holds open public marketplace jobs (`isOpenJob: true`).
  - Removed now-unused `directOpportunities` and `recentBookings` memos.
- **Active Job Banner**: A dedicated pulsing green banner appears between the stats grid and charts whenever a job is `IN_PROGRESS`, showing service name, customer, price, and quick-action buttons ("View Details", "Complete Job").
- **"Open Job Feed"** is now a clearly separated section below "My Jobs".

### Card Layout Fix (Both Dashboards)
- **Problem**: The old single `flex-row` container caused text wrapping, clipping ("PAYO...", "₹59"), and the review widget overlapping the payout column.
- **Solution**: Redesigned card layout into **3 clear rows**:
  - **Row 1**: Icon + Info (flex-1 min-w-0) + Payout (shrink-0, hidden for COMPLETED)
  - **Row 2**: Action buttons — full-width, never clipped (Accept/Reject, Start/Cancel, Complete)
  - **Row 3**: Review section — always full-width (Rate widget or "Rated ✓" badge)

### Unified Review UI (Customer Side)
- Replaced the boring "Rate & Review" button + separate form with the same **inline yellow dashed box** used on the worker side.
- Stars always visible — click to rate instantly.
- 💬 message icon expands textarea for optional written comment.
- State unified to `activeReview: { bookingId, rating, comment }` (one card open at a time).
- "Submit Rating" disabled until a star is selected.

### Chat Window Bug Fix (Portal)
- Fixed `ChatWindow` fixed-positioning breaking when inside `active:scale` parent elements (booking cards apply CSS transforms on click).
- Solution: `createPortal(content, document.body)` — renders chat window directly to body, making `fixed` positioning viewport-relative.
- Added `Escape` key shortcut to close the chat window.

### Customer Dashboard Active Booking Banner
- Added an `activeBooking` memo (`IN_PROGRESS` booking).
- Shows a pulsing green banner at the top of the dashboard with the End OTP visible inline (so customer can share it quickly with worker without navigating to booking details).

**Technical Changes**:
- `client/src/pages/worker/WorkerDashboardPage.jsx`: Removed `directOpportunities`, `recentBookings`; added `myJobs`, `feedJobs`, `activeJob` memos; restructured render tree.
- `client/src/pages/customer/CustomerDashboardPage.jsx`: Replaced `reviewingId`/`reviewData` state with `activeReview`; added `activeBooking` memo; updated review section to inline yellow box.
- `client/src/components/features/chat/ChatWindow.jsx`: Implemented `createPortal` and Escape key listener.
---

## ✅ Recent Work: Phase 1 — Critical Security Fixes

> Reference: `docs/ISSUES_AND_IMPLEMENTATION_PLAN.md` — Phase 1

### Task 1.1 — Secure Socket.IO (Reject Unauthenticated Connections + Validate Room Joins)

**Problem**: The Socket.IO server allowed unauthenticated websocket connections (`if (!token) return next()`) and let any client join any room via `joinRoom` — including `admin`. An attacker could open a browser console, connect without logging in, emit `joinRoom('admin')`, and silently receive all admin-only events (SOS alerts with GPS coordinates, user management, booking data).

**What Changed**:

**Server — `server/src/socket.js`:**
- **Authentication middleware**: Changed from permissive (`next()` on no token) to strict — missing or invalid JWT now returns `next(new Error('Authentication required'))`, which **rejects the connection entirely**.
- **Auto-join on connect**: Authenticated users are automatically placed into their role-based rooms (`user:X`, `worker:X`, `customer:X`, `admin`) based on the verified JWT payload. No client-side room request needed.
- **Room join validation**: The `joinRoom` event handler now only allows:
  - `booking:*` rooms (for live booking tracking)
  - `conversation:*` rooms (for live chat)
  - All other room join attempts are **blocked and logged** as warnings.
  - This prevents non-admins from joining `admin`, and users from joining other users' private rooms.

**Client — `client/src/hooks/useSocket.js`:**
- **Conditional connection**: The `useEffect` now checks `if (!user?.id)` before attempting to connect. Anonymous visitors no longer waste resources on failed socket attempts.
- **Dependency on auth state**: Changed `useEffect` deps from `[]` (mount-once) to `[user?.id]` — socket connects on login, disconnects cleanly on logout.
- **Cleanup on logout**: When user becomes `null`, any existing socket is disconnected and the global `window.__UPRO_SOCKET` reference is removed.

**Security Impact**: Closes the most critical vulnerability in the app — unauthenticated real-time data access.

### Task 1.2 — Crypto-Secure OTP Generation

**Problem**: OTPs were generated with `Math.floor(1000 + Math.random() * 9000)`. `Math.random()` is not a cryptographically secure random number generator — its output can be predicted. OTPs guard job start/completion verification (physical presence proof).

**What Changed**:

**Server — `server/src/modules/bookings/booking.service.js`:**
- Added `const { randomInt } = require('crypto');` — Node.js built-in crypto module.
- Replaced `Math.floor(1000 + Math.random() * 9000).toString()` with `randomInt(1000, 10000).toString()`.
- `crypto.randomInt()` uses the OS-level CSPRNG (Cryptographically Secure Pseudo-Random Number Generator), making OTPs unpredictable.
- Same range (1000–9999), same 4-digit format — no frontend changes needed.

**Security Impact**: OTPs can no longer be predicted. Combined with rate limiting (Task 1.3, next), this makes OTP brute-forcing infeasible.

### Task 1.3 — Rate Limiting on OTP Verification Endpoints

**Problem**: The `POST /:id/start` and `POST /:id/complete` OTP endpoints had no rate limiting. With 9,000 possible 4-digit OTPs (1000–9999), an attacker could brute-force the correct OTP in seconds by trying all combinations.

**What Changed**:

**Server — `server/src/config/rateLimit.js`:**
- Added `otpLimiter` — a strict rate limiter allowing max **5 attempts per 15 minutes**.
- Key is `otp:{userId}:{bookingId}` so each booking has its own counter. An attacker can’t spread attempts across multiple bookings to bypass the limit.
- Returns a clear error message: "Too many OTP attempts. Please wait 15 minutes."
- Math: 5 attempts out of 9,000 possibilities = **0.05% chance** of guessing. Without this, it was 100%.

**Server — `server/src/modules/bookings/booking.routes.js`:**
- Imported `otpLimiter` alongside existing `bookingLimiter`.
- Applied `otpLimiter` middleware to both `POST /:id/start` and `POST /:id/complete` routes.
- Middleware order: `authenticate` → `requireWorker` → `otpLimiter` → controller. Auth checked first (no wasting rate-limit budget on unauthenticated requests).

**Security Impact**: Completes the OTP security trifecta with Task 1.2 — OTPs are now cryptographically unpredictable AND brute-force resistant.

### Task 1.4 — Block SVG Uploads (Stored XSS Prevention)

**Problem**: The upload file filters accepted any `image/*` MIME type, including `image/svg+xml`. SVG files can contain `<script>` tags and JS event handlers. Since uploads are served as static files via `express.static()`, a malicious SVG would execute JavaScript in any visitor’s browser — Stored XSS.

**What Changed**:

**Server — `server/src/modules/uploads/upload.routes.js`:**
- Added `SAFE_IMAGE_EXTENSIONS` whitelist: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.bmp`, `.tiff`.
- **`imageFileFilter`** (profile photos, booking photos): Now performs two checks:
  1. MIME type must be `image/*` but NOT contain `svg`.
  2. File extension must be in the safe whitelist.
- **`docFileFilter`** (verification documents): Same two checks, plus allows `application/pdf` with `.pdf` extension.
- Both filters return clear user-friendly error messages naming the allowed formats.
- **Defense in depth**: MIME type alone is insufficient (attackers can spoof it). Extension check is the second layer.

**Security Impact**: Eliminates Stored XSS via file upload — the most common file-upload attack vector.

### Task 1.5 — Add Authentication to `/location/nearby` Endpoint

**Problem**: `GET /location/nearby` returned real-time GPS coordinates of all online workers within a radius, with zero authentication. Any anonymous internet user could poll this endpoint to track every worker's live location — enabling surveillance, stalking, or data scraping.

**What Changed**:

**Server — `server/src/modules/location/location.routes.js`:**
- Added `authenticate` middleware to the `/nearby` route (was the only unprotected route in the file).
- Comment updated from "Public/Authenticated" to "Authenticated" to reflect the security intent.

**Client — No changes needed:**
- `client/src/api/location.js` already uses the shared axios instance with `withCredentials: true`, so auth cookies are sent automatically.

**Security Impact**: Worker GPS data is now protected — only authenticated users can query nearby workers.

### Task 1.6 — Move Database URL to `env("DATABASE_URL")`

**Problem**: `server/prisma/schema.prisma` had the database connection string (including username `postgres`, password `toor`, host, and database name) hardcoded directly in the file. This leaks credentials to anyone with repo access and makes multi-environment deployment impossible without editing the schema.

**What Changed**:

**Server — `server/prisma/schema.prisma`:**
- Changed `url = "postgresql://postgres:toor@..."` to `url = env("DATABASE_URL")`.
- Prisma natively reads from the `.env` file in the server root, which already had `DATABASE_URL` defined.

**Verified**: `npx prisma validate` confirms the schema is valid and loads the env variable correctly.

**No other changes needed**: `.env` was already gitignored and `.env.example` already documented the variable format.

**Security Impact**: Database credentials removed from version-controlled source code.

### Task 1.7 — Serve Uploads Through Authenticated Routes

**Problem**: All uploaded files (profile photos, verification documents, booking photos) were served via a single `express.static('/uploads', ...)` middleware with zero authentication. Anyone who knew or guessed a filename could access government IDs, personal documents, and booking photos directly.

**What Changed**:

**Server — `server/src/index.js`:**
- Removed the blanket `app.use('/uploads', express.static(...))` line.
- Split into three per-subdirectory routes:
  - `/uploads/profile-photos` — **public** (displayed on service pages, profiles, messages via `<img>` tags)
  - `/uploads/verification-docs` — **authenticated** (government IDs, personal documents)
  - `/uploads/booking-photos` — **authenticated** (private booking evidence)
- Added `const authenticate = require('./middleware/auth')` at the top of the static serving section.

**Why cookies work for `<img>` tags**: Auth cookies are set with `sameSite: 'lax'`. Since client (`localhost:5173`) and server (`localhost:3000`) are same-site (both `localhost`), browsers include cookies on sub-resource requests. In production behind a reverse proxy, both are same-origin.

**Client — No changes needed**: URLs stored in DB remain `/uploads/verification-docs/...` and `/uploads/booking-photos/...`. The `resolveProfilePhotoUrl()` utility resolves them to absolute server URLs. Cookies are sent automatically.

**Security Impact**: Verification documents and booking photos now require authentication. Profile photos remain public as intended.

### Task 1.8 — Remove `VITE_UI_PREVIEW_MODE` Bypass

**Problem**: `WorkerRoute` and `CustomerRoute` in `ProtectedRoute.jsx` had an `if (import.meta.env.VITE_UI_PREVIEW_MODE === 'true') return children;` check that bypassed ALL authentication. If this env variable leaked into a production build (Vite inlines `VITE_*` at build time), any user could access worker/customer dashboards without logging in.

**What Changed**:

**Client — `client/src/routes/ProtectedRoute.jsx`:**
- Removed the `VITE_UI_PREVIEW_MODE` check from `WorkerRoute` (was at line 187).
- Removed the `VITE_UI_PREVIEW_MODE` check from `CustomerRoute` (was at line 232).
- No replacement added — preview mode has no legitimate purpose. If UI-only development is needed, use Storybook or mock the auth context instead.

**Security Impact**: Protected routes now always enforce authentication. No env variable can bypass auth.

### Task 1.9 — Restrict CORS Localhost to Development Only

**Problem**: `server/src/config/cors.js` hardcoded `http://localhost:5173` and `http://localhost:5174` in the allowed origins array regardless of `NODE_ENV`. In production, this meant an attacker running a malicious page on their localhost could make credentialed cross-origin requests to the production API.

**What Changed**:

**Server — `server/src/config/cors.js`:**
- Imported `NODE_ENV` from `./env` (alongside `CORS_ORIGIN`).
- Changed `allowedOrigins` to start with only `[CORS_ORIGIN]`.
- Added conditional: `if (NODE_ENV !== 'production')` then push `localhost:5173` and `localhost:5174`.
- In production, only the configured `CORS_ORIGIN` (e.g., `https://urbanpro.com`) is allowed.
- In development, localhost ports are still allowed for convenience.

**Security Impact**: Production CORS is now locked to the configured domain only. Localhost origins are dev-only.

### Task 1.10 — Validate `profilePhotoUrl` (Only Accept Upload URLs)

**Problem**: Both `worker.controller.js` and `customer.controller.js` accepted any string as `profilePhotoUrl` from `req.body` and saved it directly to the database. An attacker could set their photo URL to `javascript:alert(1)`, `data:text/html,...`, or an external tracking URL. When rendered in other users' browsers via `<img src=...>`, this could cause XSS or privacy leaks.

**What Changed**:

**New file — `server/src/common/utils/validateUploadUrl.js`:**
- Created `isValidUploadUrl(url, allowedPrefixes)` utility.
- Validates that the URL starts with one of the allowed prefixes (e.g., `/uploads/profile-photos/`).
- Rejects null, non-string, and any URL not matching the whitelist.

**Server — `server/src/modules/workers/worker.controller.js`:**
- Imported `isValidUploadUrl`.
- Before saving, validates `profilePhotoUrl` against `['/uploads/profile-photos/']`.
- Returns 400 with clear error message if invalid.

**Server — `server/src/modules/customers/customer.controller.js`:**
- Same validation added.

**Security Impact**: Profile photo URLs are now whitelisted to only accept paths from the upload endpoint. Blocks XSS payloads and external tracking URLs.

---

**✅ Phase 1 — Critical Security Fixes: COMPLETE (Tasks 1.1–1.10)**

## Phase 2 — Critical Bug Fixes

### Task 2.1 — Replace `throw new Error` with `throw new AppError(statusCode, msg)` in Booking Service

**Problem**: All 40 error throws in `booking.service.js` used plain `throw new Error('message')` with no HTTP status code. The global error handler defaults unknown errors to 500 Internal Server Error. Users saw 500s for things like "Booking not found" (should be 404) or "Invalid OTP" (should be 400).

**What Changed**:

**Server — `server/src/modules/bookings/booking.service.js`:**
- Added `const AppError = require('../../common/errors/AppError')` import.
- Converted all 40 `throw new Error(...)` to `throw new AppError(statusCode, ...)` with correct HTTP codes:
  - **400 Bad Request** (14 occurrences): Invalid dates, bad addresses, price validation, invalid OTPs, invalid state transitions, already cancelled/paid.
  - **403 Forbidden** (9 occurrences): Permission denied — not assigned worker, not booking customer, not a worker.
  - **404 Not Found** (10 occurrences): Booking/worker/service not found.
  - **409 Conflict** (6 occurrences): Worker already booked, booking already accepted, slot unavailable.
- 1 remaining `throw new Error` is inside a `/* */` comment block (dead code) — left as-is.

**How the error handler uses this**: `errorHandler.js` reads `err.statusCode` (set by AppError constructor) and returns the correct HTTP status. Previously all these fell through to `500`.

**Impact**: Frontend now receives correct HTTP status codes, enabling proper error handling (e.g., showing "not found" vs "server error" messages).

### Task 2.2 + 2.4 — Wrap `createBooking` in Transaction & Fix `isWorkerAvailable` to Use `tx`

**Problem (2.2)**: `createBooking` performed multiple DB reads (worker exists, availability check, service lookup, worker-offers-service) then a write (create booking) — all outside a transaction. Between the availability check and the create, another request could book the same worker for the same slot.

**Problem (2.4)**: `isWorkerAvailable()` always queried against the global `prisma` client, even when called from inside a `$transaction()` callback. This meant the availability check wasn't isolated — it read stale data outside the transaction boundary.

**What Changed**:

**Server — `server/src/modules/bookings/booking.service.js`:**
- **`isWorkerAvailable(workerId, date, client = prisma)`**: Added optional third parameter `client` (defaults to `prisma`). All queries inside now use `client.booking.findFirst()` instead of `prisma.booking.findFirst()`.
- **`createBooking()`**: Pure validations (date, address, price) stay outside the transaction. All DB operations (worker profile lookup, availability check, service lookup, worker-offers-service, booking create) are wrapped in `prisma.$transaction(async (tx) => { ... })`. All queries inside use `tx.` and `isWorkerAvailable(..., tx)`.
- **`acceptBooking()`**: Was already inside a `$transaction` but called `isWorkerAvailable(worker.id, booking.scheduledAt)` without `tx`. Fixed to pass `tx` as third argument.
- Fixed `service.name` reference in socket broadcast — `service` is now scoped inside the transaction, so changed to `newBooking.service.name` (included via Prisma `include`).

**Impact**: Eliminates double-booking race condition. Availability is now checked and the booking is created atomically.

### Task 2.3 — Add `parseInt` NaN Validation to All Controllers

**Problem**: Controllers accepting `:id` URL params used `parseInt(req.params.id)` without checking if the result was `NaN`. A request like `GET /api/bookings/abc` would pass `NaN` to Prisma, causing a cryptic unhandled error instead of a clean 400 response.

**What Changed**:

**New file — `server/src/common/utils/parseId.js`:**
- Created `parseId(value, label)` utility that parses a string to integer, throws `AppError(400, 'Invalid {label}')` if NaN or < 1.
- Reusable across all controllers.

**Controllers updated (12 occurrences across 4 files):**
- `booking.controller.js` (7): All `parseInt(req.params.id)` → `parseId(req.params.id, 'Booking ID')`
- `verification.controller.js` (1): `parseInt` → `parseId(..., 'Application ID')`
- `safety.controller.js` (2): `parseInt` → `parseId(..., 'Contact ID')` and `parseId(..., 'Alert ID')`
- `admin.controller.js` (2): `Number()` → `parseId(..., 'User ID')`

**Not changed**: `service.controller.js` and `availability.controller.js` already had their own `Number.isNaN()` checks.

**Impact**: Invalid IDs now return clean `400 Bad Request` with descriptive message instead of crashing.

### Task 2.5 — Wrap `createReview` Rating Recalculation in Transaction

**Problem**: `createReview` in `review.service.js` performed 4 separate DB operations (create review, aggregate ratings, update user, update workerProfile) without a transaction. If any step after the review creation failed, the review existed but the user's average rating was stale.

**What Changed**:

**Server — `server/src/modules/reviews/review.service.js`:**
- Added `AppError` import, converted all 6 `throw new Error` to `throw new AppError` with proper status codes (400, 403, 404, 409).
- Wrapped steps 4–7 (review create + aggregate + user update + workerProfile update) in `prisma.$transaction(async (tx) => { ... })`. All queries inside use `tx.` instead of `prisma.`.

**Impact**: Review creation and rating recalculation are now atomic — either all succeed or all roll back.

### Task 2.6 — Wrap `reviewApplication` in Transaction

**Problem**: `reviewApplication` in `verification.service.js` updated the application status and then synced the worker profile in a separate query wrapped in a try/catch that silently swallowed errors. If the profile update failed, the application was marked APPROVED but `WorkerProfile.isVerified` stayed `false`.

**What Changed**:

**Server — `server/src/modules/verification/verification.service.js`:**
- Added `AppError` import.
- Converted `throw new Error` to `throw new AppError(404, ...)` for missing application and `AppError(409, ...)` for duplicate application.
- Wrapped `workerVerificationApplication.update` + `workerProfile.update` in `prisma.$transaction(async (tx) => { ... })`. Removed the swallowing try/catch — errors now propagate properly.

**Impact**: Application approval and profile verification sync are now atomic. If the profile update fails, the application status rolls back too.

### Task 2.7 — Standardize ALL Services/Controllers to Use `AppError`

**Problem**: Multiple services and controllers still used plain `throw new Error(...)` which produces a generic 500 response. Some controllers used `res.status(400); throw new Error(...)` — setting a status on `res` before throwing, which is fragile and bypasses the centralized error handler's status logic.

**What Changed**:

**Server — `server/src/modules/location/location.service.js`:**
- Added `AppError` import.
- Converted `throw new Error('Worker profile not found')` → `throw new AppError(404, ...)`.

**Server — `server/src/modules/safety/safety.controller.js`:**
- Added `AppError` import.
- Converted 2 `res.status(400); throw new Error(...)` patterns → `throw new AppError(400, ...)`. Removed the now-unnecessary `res.status()` calls.

**Previously converted in prior session (verified clean):**
- `chat.service.js`, `worker.service.js`, `availability.service.js`, `service.service.js` — all already use AppError.

**Remaining `throw new Error` (intentionally kept):**
- Zod `.refine()` callbacks in `booking.schemas.js` and `service.schemas.js` — Zod handles these internally.
- Commented-out code in `booking.service.js` line 101.
- `debug.routes.js` — dev-only debug route.

**Impact**: All user-facing service/controller errors now use `AppError(statusCode, message)`, ensuring proper HTTP status codes and consistent error responses.

### Task 2.8 — Standardize Error Response Format

**Problem**: Error responses used 3+ different shapes: `{ error }`, `{ message }`, `{ message, errors }`. Frontend had to handle all variants. Controllers used manual `return res.status(xxx).json({error})` bypassing the centralized error handler. `location.controller.js` used manual try/catch that leaked internal errors via `res.status(500).json({ error: error.message })`.

**What Changed**:

**Middleware (5 files):**
- `errorHandler.js` — Added `statusCode` field to response body: `{ error, statusCode, stack? }`.
- `validation.js` — Changed `{ message, errors }` to `{ error, statusCode: 400, errors }` (unified key name).
- `auth.js` — Added `statusCode: 401` to both error responses.
- `requireRole.js` — Added `statusCode` (401, 403) to both error responses.
- `notFoundHandler.js` — Added `statusCode: 404`.

**Controllers (7 files) — converted manual `res.status().json()` to `throw new AppError()`:**
- `worker.controller.js` — 3 conversions + AppError import added.
- `customer.controller.js` — 1 conversion + AppError import added.
- `service.controller.js` — 5 conversions + AppError import added.
- `admin.controller.js` — 2 conversions + AppError import added.
- `auth.controller.js` — 1 conversion (`{ message }` → AppError) + AppError import added.
- `availability.controller.js` — 1 conversion + AppError import added.
- `location.controller.js` — Full rewrite: replaced manual try/catch with `asyncHandler` + `AppError`. Eliminated 3 `res.status(500).json({ error: error.message })` catch blocks that leaked internal errors. Converted 8 manual error returns to `throw new AppError()`.

**Impact**: All error responses now flow through the centralized error handler with format `{ error: string, statusCode: number }`. Frontend only needs to read `error.response.data.error`.

### Task 2.9 — Fix `listMyPayments` for Workers

**Problem**: The `/payments/me` route allowed both CUSTOMER and WORKER roles, but `listMyPayments` always filtered by `customerId: userId`. Workers always got empty results because payments are linked to customers, not workers directly.

**What Changed**:

**Server — `server/src/modules/payments/payment.service.js`:**
- `listMyPayments(userId, role)` now accepts a `role` parameter.
- If `role === 'WORKER'`, filters by `{ booking: { workerProfile: { userId } } }` (through the booking's worker profile).
- Otherwise (customer), keeps the original `{ customerId: userId }` filter.

**Server — `server/src/modules/payments/payment.controller.js`:**
- Passes `req.user.role` as second argument to `listMyPayments`.

**Impact**: Workers can now see payments for bookings they worked on.

### Task 2.10 — Add try/catch to `chat.service.js` `getIo()`

**Problem**: `getIo()` in `chat.service.js` was called without try/catch. Since `getIo()` throws if Socket.IO isn't initialized, this would crash the entire `sendMessage` operation — even though the message was already persisted to the database. Additionally, the `notificationService.createNotification()` call was fire-and-forget without `.catch()`, risking unhandled promise rejections.

**What Changed**:

**Server — `server/src/modules/chat/chat.service.js`:**
- Wrapped `getIo()` + socket emit calls in try/catch with a console.warn fallback. Removed dead `if (io)` check (unreachable since `getIo()` throws before returning null).
- Added `.catch()` to the fire-and-forget `notificationService.createNotification()` call to prevent unhandled promise rejections.

**Impact**: Chat message sending is resilient — socket/notification failures are logged but don't crash the request or lose the message.

### Task 2.11 — Add `SIGINT`/`SIGTERM` Graceful Shutdown

**Problem**: `prisma.$disconnect()` was never called on process termination. On `SIGINT`/`SIGTERM` (e.g., Ctrl+C or container stop), the database connection pool was left open, potentially exhausting connections over repeated restarts.

**What Changed**:

**Server — `server/src/index.js`:**
- Added `shutdown(signal)` handler after `server.listen()`.
- On `SIGINT` or `SIGTERM`: closes the HTTP server (stops accepting new connections), disconnects Prisma, then `process.exit(0)`.
- Added a 10-second forced exit timeout in case graceful shutdown hangs.

**Impact**: Server shuts down cleanly, releasing database connections and allowing in-flight requests to complete.

### Task 2.12 — Fix `BookingStatusBadge` `accent` Variant

**Problem**: `BookingStatusBadge` maps `IN_PROGRESS` to `variant="accent"`, but `Badge.jsx` didn't define an `accent` variant. `variantStyles['accent']` was `undefined`, so the badge rendered with no background/border colors.

**What Changed**:

**Client — `client/src/components/common/Badge.jsx`:**
- Added `accent` variant to `variantStyles` using the existing `accent-*` color tokens from Tailwind config (fuchsia/purple palette): dark mode = `bg-accent-900/50 text-accent-300 border-accent-700`, light mode = `bg-accent-100 text-accent-700 border-accent-200`.
- Added `accent: 'bg-accent-500'` to `dotColors`.

**Impact**: `IN_PROGRESS` bookings now display a visible purple accent badge instead of an unstyled one.

### Task 2.13 — Fix Password Validation Mismatch

**Problem**: Client-side `LoginPage.jsx` and `RegisterPage.jsx` used `z.string().min(6)` while the server `auth.schemas.js` requires `min(8)`. Users could pass client validation with a 6-7 character password but get rejected by the server with a confusing error.

**What Changed**:

**Client — `client/src/pages/auth/LoginPage.jsx`:**
- Changed `password: z.string().min(6, ...)` → `min(8, 'Password must be at least 8 characters')`.

**Client — `client/src/pages/auth/RegisterPage.jsx`:**
- Changed `password` and `confirmPassword` from `min(6)` → `min(8)` to match server.

**Impact**: All password validation (client login, client register, client reset, server) now consistently requires 8+ characters.

### Task 2.14 — Fix `useKeyboardShortcuts` Infinite Re-Render

**Problem**: `useKeyboardShortcuts` had `[shortcuts]` as the `useEffect` dependency. Since callers pass an inline array created each render, the effect tore down and re-registered the `keydown` listener on every single render — an infinite loop of setup/cleanup. Similarly, `useKeyboardShortcut` (singular) had `callback` in its deps, which re-registers whenever the callback isn't memoized.

**What Changed**:

**Client — `client/src/hooks/useKeyboardShortcut.js`:**
- Added `useRef` import.
- `useKeyboardShortcut`: Stores `callback` in a `callbackRef` (updated each render). Removed `callback` from deps — effect only re-runs when key/modifier options actually change.
- `useKeyboardShortcuts`: Stores `shortcuts` array in a `shortcutsRef` (updated each render). Changed deps to `[]` — effect registers once, reads latest shortcuts from the ref.

**Impact**: Both hooks now register the `keydown` listener once (or only when primitive config changes) instead of on every render. Eliminates performance overhead and potential infinite re-render loops.

### Task 2.15 — URL-Encode Email Verification Token

**Problem**: Email verification and password reset tokens (JWTs) were interpolated directly into URLs without `encodeURIComponent()`. JWT base64 characters like `+`, `/`, `=` would corrupt the query parameter.

**What Changed**:

**Client — `client/src/api/auth.js`:**
- `verifyEmail()`: Wrapped `token` in `encodeURIComponent()` before building the URL.

**Server — `server/src/modules/auth/auth.controller.js`:**
- Both `register` and `registerWorker` handlers: wrapped `verificationToken` in `encodeURIComponent()` when building the verification link.

**Server — `server/src/modules/auth/auth.service.js`:**
- `requestPasswordReset()`: wrapped `token` in `encodeURIComponent()` when building the reset link.

**Impact**: Email verification and password reset tokens with special characters no longer get corrupted in URLs.

---

## Phase 2 Completion Notes

All 15 Phase 2 tasks (2.1–2.15) are complete. Summary:
- **Transactions**: booking creation, review creation, verification application review all wrapped in `prisma.$transaction()`
- **Error handling**: All services/controllers use `AppError(statusCode, msg)`, unified response format `{ error, statusCode }`, manual try/catch in location controller replaced with `asyncHandler`
- **Data integrity**: `parseId()` guards all URL params, `isWorkerAvailable` uses transaction handle
- **Resilience**: graceful shutdown, chat socket try/catch, notification `.catch()`
- **Client fixes**: Badge accent variant, password validation alignment, keyboard shortcut infinite re-render, token URL encoding

---

## Phase 3: API & Architecture Cleanup

### Task 3.1 — Convert location/notification controllers to asyncHandler
- **What**: Ensure both `location.controller.js` and `notification.controller.js` use `asyncHandler` + `AppError` instead of manual try/catch
- **Status**: Both already converted — `location.controller.js` was fully rewritten in Task 2.8 (replaced manual try/catch with asyncHandler + AppError), and `notification.controller.js` was already using asyncHandler + parseId. No changes needed.
- **Files verified**: `server/src/modules/location/location.controller.js`, `server/src/modules/notifications/notification.controller.js`

### Task 3.2 — Add validation schemas to admin endpoints
- **What**: Created `admin.schemas.js` with express-validator schemas for admin endpoints that previously had no input validation
- **Why**: Issue 2G-3 — admin endpoints accepted arbitrary input with only inline checks. Proper schema validation provides consistent error responses and separates concerns
- **How**: Created `getUsersSchema` (validates optional `role` query param against allowed values) and `updateUserStatusSchema` (validates `isActive` is a required boolean). Wired schemas + `validate` middleware into `admin.routes.js`. Removed inline validation from controller (`allowedRoles` set, `typeof isActive` check) since middleware now handles it
- **Files changed**: `server/src/modules/admin/admin.schemas.js` (new), `admin.routes.js`, `admin.controller.js`

### Task 3.3 — Add validation to emergency contact CRUD
- **What**: Created `safety.schemas.js` with express-validator schema for `POST /contacts` endpoint
- **Why**: Issue 2B-13 — emergency contact creation accepted arbitrary data with no validation (no name/phone/relation checks)
- **How**: Created `addContactSchema` validating: `name` (2–100 chars, trimmed), `phone` (valid mobile number), `relation` (2–50 chars, trimmed). Wired schema + `validate` middleware into `safety.routes.js`
- **Files changed**: `server/src/modules/safety/safety.schemas.js` (new), `safety.routes.js`

### Task 3.4 — Add chat message length/content validation
- **What**: Created `chat.schemas.js` with express-validator schema for `POST /:conversationId/messages` endpoint
- **Why**: Issue 2B-11 — no sanitization or length validation on message `content`, allowing DB bloat, DoS, and potential XSS
- **How**: Created `sendMessageSchema` validating: `content` (trimmed, required, max 2000 chars). Wired schema + `validate` middleware into `chat.routes.js`
- **Files changed**: `server/src/modules/chat/chat.schemas.js` (new), `chat.routes.js`

### Task 3.5 — Add pagination to ALL list endpoints
- **What**: Added offset-based pagination to 16 list endpoints across 9 modules
- **Why**: Issues 2G-4, 3D-4 — all list endpoints returned ALL records with no limit, enabling DB bloat and DoS
- **How**: Created `parsePagination` utility (`server/src/common/utils/parsePagination.js`) that extracts `page`/`limit` from query params (defaults: page=1, limit=20, max=100). Each service function now accepts `{ skip, limit }`, runs `findMany` + `count` in parallel via `Promise.all`, and returns `{ data, total }`. Controllers include `pagination: { page, limit, total, totalPages }` in responses alongside existing data keys for backward compatibility. Also optimized `getPendingReviews` to use Prisma `reviews: { none: { reviewerId } }` filter instead of JS post-filtering.
- **Endpoints paginated**: `getBookingsByUser`, `getOpenBookingsForWorker`, `getMessages`, `getUserConversations`, `listServices`, `getServiceWorkers`, `listApplications`, `getActiveSosAlerts`, `getMyReviews`, `getReviewsAboutMe`, `getPendingReviews`, `listMyPayments`, `listAllPayments`, `listUsers`, `listWorkers`, `getUserNotifications`
- **Files changed**: `parsePagination.js` (new), 9 service files, 9 controller files

### Task 3.6 — Deduplicate registration logic (Issues 2F-2, 2F-3)
- **Problem**: `registerUser` (CUSTOMER) and `registerWorker` (WORKER) in `auth.service.js` were nearly identical — only the `role` field differed. Same duplication existed in the controller (`exports.register` vs `exports.registerWorker`).
- **Fix**:
  - **auth.service.js**: Merged into a single `registerUser({ name, email, mobile, password, role = 'CUSTOMER' })`. Added role validation (`CUSTOMER` or `WORKER`). Removed `registerWorker` entirely.
  - **auth.controller.js**: Merged into a single `exports.register` handler that reads `role` from `req.body`. Removed `exports.registerWorker`. Kept the dev-mode verification-link file write for all registrations.
  - **auth.schemas.js**: Added optional `role` validator to `registerSchema` (must be `CUSTOMER` or `WORKER`). Created `registerWorkerSchema` that injects `role = 'WORKER'` into `req.body` via middleware, so the `/register-worker` endpoint doesn't require the client to send `role`.
  - **auth.routes.js**: `/register-worker` now uses `registerWorkerSchema` + unified `register` handler. `/register` and `/register-customer` kept as-is (default to CUSTOMER). Removed `registerWorker` import.
- **Backward compatible**: Client-side code calling `/register-worker` continues to work unchanged — the endpoint still exists, just uses the unified handler now.
- **Files changed**: `auth.service.js`, `auth.controller.js`, `auth.routes.js`, `auth.schemas.js`

### Task 3.7 — Extract worker profile lookup helper (Issue 2F-6)
- **Problem**: Worker profile lookup (`prisma.workerProfile.findUnique({ where: { userId } })` + null check) was duplicated 8 times across `booking.service.js` — in `getBookingsByUser`, `getBookingById`, `updateBookingStatus`, `cancelBooking`, `getOpenBookingsForWorker`, `acceptBooking`, `verifyBookingStart`, `verifyBookingCompletion`.
- **Fix**: Created two internal helpers at the top of `booking.service.js`:
  1. **`requireWorkerProfile(userId, errorMessage, statusCode, include)`** — Fetches worker profile by userId, throws AppError if not found. Supports optional Prisma `include` clause for cases like `getOpenBookingsForWorker` that needs services.
  2. **`isWorkerForBooking(userId, booking)`** — Returns boolean indicating whether the userId is the assigned worker for a booking. No throw on failure.
- **Replacements made (8 instances → 2 helpers)**:
  - `acceptBooking`, `verifyBookingStart`, `verifyBookingCompletion` → `requireWorkerProfile(userId, msg, 403)`
  - `getOpenBookingsForWorker` → `requireWorkerProfile(userId, msg, 404, { services: ... })`
  - `getBookingById`, `updateBookingStatus`, `cancelBooking` → `isWorkerForBooking(userId, booking)` 
  - `getBookingsByUser` → simplified inline (sentinel -1 fallback, unique behavior)
- **Not changed**: `createBooking` instance 1 (looks up by profile `id` inside `tx`, different pattern)
- **Files changed**: `booking.service.js`

### Task 3.8 — Add `scheduledAt` and `paymentStatus` indexes (Issues 2H-3, 2H-4)
- **Problem**: `Booking.scheduledAt` is used in range queries (finding bookings within date ranges for availability checks) but had no index, causing full table scans. `Booking.paymentStatus` is filtered frequently but also lacked an index.
- **Fix**: Added `@@index([scheduledAt])` and `@@index([paymentStatus])` to the `Booking` model in `schema.prisma`.
- **Migration**: `20260304185037_add_booking_scheduled_at_payment_status_indexes` — creates two new indexes on the `Booking` table.
- **Files changed**: `schema.prisma`

### Task 3.9 — Fix cascade rules for EmergencyContact, BookingPhoto, Payment (Issues 2H-5, 2H-8)
- **Problem**: `Payment`, `BookingPhoto`, and `EmergencyContact` models lacked `onDelete: Cascade` on their foreign key relations. This means:
  - Deleting a `Booking` would fail if it had associated `Payment` or `BookingPhoto` records (FK constraint error)
  - Deleting a `User` would fail if they had `EmergencyContact` or `Payment` records
  - Orphan records could accumulate if deletions were forced at the DB level
- **Fix**: Added `onDelete: Cascade` to 4 relations:
  - `Payment.booking` → `Booking` (cascade on booking delete)
  - `Payment.customer` → `User` (cascade on user delete)
  - `BookingPhoto.booking` → `Booking` (cascade on booking delete)
  - `EmergencyContact.user` → `User` (cascade on user delete)
- **Note**: `Review` and `SOSAlert` already had correct cascade rules — no changes needed.
- **Migration**: `20260304185439_fix_cascade_rules_payment_bookingphoto_emergencycontact`
- **Files changed**: `schema.prisma`

### Task 3.10 — Add unique constraint on Availability (Issue 2H-9)
- **Problem**: The `Availability` model had no unique constraint — two concurrent requests could create duplicate slots for the same worker/day/time, since the app-level overlap check in `availability.service.js` is not atomic (race condition per Issue 2C-6).
- **Fix**: Added `@@unique([workerId, dayOfWeek, startTime, endTime])` to the `Availability` model in `schema.prisma`. This creates a database-level unique index that prevents exact duplicate slots regardless of race conditions.
- **Verification**: Checked for existing duplicate data before applying — none found.
- **Note**: The app-level overlap check (`hasOverlap` in `availability.service.js`) still protects against overlapping-but-not-identical time ranges (e.g., 09:00-11:00 vs 10:00-12:00). The DB constraint only prevents exact duplicates.
- **Migration**: `20260304190635_add_availability_unique_constraint`
- **Files changed**: `schema.prisma`

### Task 3.11 — Create proper SOSAlert.triggeredBy foreign key (Issue 2H-6)
- **Problem**: `SOSAlert.triggeredBy` was a plain `Int` column with no foreign key relation to the `User` table. This means:
  - No referential integrity — could store a user ID that doesn't exist
  - No cascade — deleting a user would leave orphaned SOS alert records
  - No Prisma relation — can't use `include: { triggeredByUser: true }` in queries
- **Fix**: Converted `triggeredBy` from plain `Int` to a proper foreign key relation:
  - Added `triggeredByUser User @relation(fields: [triggeredBy], references: [id], onDelete: Cascade)` to SOSAlert model
  - Added `sosAlerts SOSAlert[]` reverse relation to User model
  - Added `@@index([triggeredBy])` for query performance
- **Service code**: No changes needed — `safety.service.js` already sets `triggeredBy: userId` (an integer), which is fully compatible with the FK constraint
- **Migration**: `20260305110000_add_sosalert_triggeredby_fk`
- **Files changed**: `schema.prisma`

### Task 3.12 — Add estimatedDuration field to Booking model (Issue 4-1)
- **Problem**: System hardcoded a 2-hour time window for ALL bookings. A lock change (20 min) blocked the same slot as a renovation (8 hrs). The `isWorkerAvailable()` function used fixed `2 * 60 * 60 * 1000` ms math, meaning short jobs wasted slots and long jobs could overlap.
- **Fix**: Multi-part change:
  1. **Schema**: Added `estimatedDuration Int?` (nullable, in minutes) to Booking model
  2. **Service — `isWorkerAvailable()`**: Rewrote from a simple "find any booking within ±2 hours" query to a proper overlap algorithm:
     - Fetches candidate bookings within a generous ±8-hour outer window
     - Computes each existing booking's actual time range using its `estimatedDuration` (fallback: 120 min)
     - Checks: `existingStart < newEnd && existingEnd > newStart` for true overlap
     - Now accepts a 4th parameter `durationMinutes` for the new booking's duration
  3. **Service — `createBooking()`**: Destructures and stores `estimatedDuration` from `bookingData`
  4. **Service — `acceptBooking()`**: Passes `booking.estimatedDuration` to availability check
  5. **Validation**: Added `estimatedDuration` to `createBookingSchema` — optional Int, 15–1440 minutes
- **Backward compatibility**: Field is nullable with a `DEFAULT_DURATION_MINUTES = 120` fallback. Existing bookings without the field work exactly as before.
- **Migration**: `20260305120000_add_booking_estimated_duration`
- **Files changed**: `schema.prisma`, `booking.service.js`, `booking.schemas.js`

---

## Phase 3 Complete ✅
All 12 tasks in Phase 3 (API & Architecture Cleanup) are done. Next: Phase 4 — Frontend Consistency & Quality.

---

## Phase 4: Frontend Consistency & Quality

### Task 4.1 — Replace all raw HTML inputs with common components (Issue 3C-1)
- **Problem**: 10+ pages used raw `<input>`, `<select>`, `<textarea>` elements with manual dark/light theme ternaries instead of the existing common component library (`Input`, `Select`, `Textarea`). This caused inconsistent styling, duplicated theme logic, and accessibility gaps.
- **New components created**: `Select.jsx`, `Textarea.jsx` in `components/common/` — mirror the Input API (label, error, icon, forwardRef, dark/light theme)
- **Files modified**:
  - `AdminServicesPage.jsx` — raw `<input>` + `<textarea>` → `<Input>` + `<Textarea>`
  - `AdminVerificationPage.jsx` — raw `<input>` → `<Input>`
  - `AdminWorkersPage.jsx` — raw `<input>` → `<Input>`
  - `WorkerAvailabilityPage.jsx` — raw `<select>` + 2x `<input type="time">` → `<Select>` + `<Input type="time">`
  - `WorkerServicesPage.jsx` — raw search `<input>` → `<Input>` with search icon
  - `WorkerVerificationPage.jsx` — raw `<textarea>` → `<Textarea>` (hidden file inputs left as-is)
  - `WorkerReviewsPage.jsx` — raw `<textarea>` → `<Textarea>`
  - `ServiceDetailPage.jsx` — 4 raw form fields → `<Input>` + `<Textarea>` with icons, error messages, and React Hook Form `register()` support
- **Intentionally NOT replaced**: Hidden file inputs (`className="hidden"` / `opacity-0`) are part of custom upload UX; OTP inputs have specialized modal styling (deferred to Task 5.1 OtpVerificationModal); `type="hidden"` form fields are React Hook Form plumbing
- **Barrel export**: `Select` and `Textarea` added to `components/common/index.js`

### Task 4.2 — Replace `window.confirm()` with `ConfirmDialog` (Issue 3C-3)
- **Problem**: 4 pages used native `window.confirm()` for booking cancellation, which is unstyled, blocks the thread, and inconsistent with the existing `ConfirmDialog` component.
- **Pattern**: Each page gets a `cancelConfirm` state (holds booking ID or null), a `handleCancelConfirm` function, and a `<ConfirmDialog>` rendered with `variant="danger"` and `loading={cancelMutation.isPending}`.
- **Files modified**:
  - `CustomerDashboardPage.jsx` — cancel booking confirmation
  - `WorkerDashboardPage.jsx` — cancel booking confirmation
  - `WorkerBookingsPage.jsx` — cancel booking confirmation
  - `CustomerBookingsPage.jsx` — cancel booking confirmation (extra instance not in original docs)
- **Also found**: `ServiceDetailPage.jsx` already had ConfirmDialog for booking cancellation; admin pages already used ConfirmDialog pattern

### Task 4.3 — Replace `DollarSign` with `IndianRupee` icon (Issue 3C-4)
- **Problem**: Lucide's `DollarSign` (`$`) icon was used where the currency is Indian Rupee (`₹`). Lucide provides a proper `IndianRupee` icon.
- **Files modified**:
  - `WorkerEarningsPage.jsx` — bank transfer section icon
  - `WorkerDashboardPage.jsx` — dead import replaced (was imported but unused in JSX)
  - `WorkerProfilePage.jsx` — hourly rate display + rate input icon
  - `ServiceDetailPage.jsx` — price badge + offer price input icon
  - `WorkerProfileModern.jsx` — "Safety & Quality" badges section
  - `WorkerProfileWindow.jsx` — removed custom `DollarSign` component (rendered `₹` via div), replaced with proper `IndianRupee` from lucide-react

### Task 4.4 — Create `api/notifications.js` and `api/chat.js` (Issue 3G-3)
- **Problem**: NotificationDropdown, ChatWindow, and MessagesPage imported `axiosInstance` directly instead of using the centralized API layer.
- **Files created**:
  - `api/notifications.js` — `getNotifications`, `markNotificationAsRead`, `markAllNotificationsAsRead`
  - `api/chat.js` — `getUserConversations`, `getConversationByBooking`, `getMessages`, `sendMessage`
- **Files modified**:
  - `api/index.js` — added barrel exports for `notifications` and `chat`
  - `components/common/NotificationDropdown.jsx` — switched to `notificationsApi`
  - `components/features/ChatWindow.jsx` — switched to `chatApi`
  - `pages/profile/MessagesPage.jsx` — switched to `chatApi`

### Task 4.5 — Fix `publicPaths` in axios interceptor (Issue 3B-1)
- **Problem**: `publicPaths` array was incomplete (only 4 entries, missing 14+ public routes) and included dead `/register-worker`. Root path `/` check used `startsWith('/')` which matched ALL paths.
- **File modified**: `api/axios.js`
  - Expanded to 18 public routes (all `/services/*`, `/about`, `/contact`, `/pricing`, `/terms`, `/privacy`, `/faq`, etc.)
  - Fixed root path check: exact equality `path === '/'` instead of `startsWith('/')`
  - Removed dead `/register-worker` route

### Task 4.6 — Centralize all inline API calls to `api/` layer
- **Status**: Verified already complete. No `axiosInstance` imports outside `api/` folder.
- **Note**: `AddressAutocomplete.jsx` uses raw `axios` (not `axiosInstance`) for external OpenStreetMap Nominatim API — intentionally excluded.

### Task 4.7 — Standardize query keys to `queryKeys` utility (Issue 3G-4)
- **Problem**: 32+ inline hardcoded `queryKey: ['string']` patterns across ~20 files, making bulk cache invalidation unreliable.
- **File expanded**: `utils/queryKeys.js` — from ~20 lines / 9 keys to ~90 lines / 35+ key factories covering: bookings (all/customer/worker/admin/open/detail), reviews, services, worker, admin (dashboard/users/workers/verifications/bookings/services/sos), verification, chat, safety, notifications, profile, health
- **Files migrated** (~20): AdminWorkersPage, AdminVerificationPage, AdminUsersPage, AdminSOSAlertsPage, AdminDashboardPage, AdminBookingsPage, AdminServicesPage, WorkerDashboardPage, WorkerServicesPage, WorkerEarningsPage, WorkerAvailabilityPage, WorkerVerificationPage, WorkerReviewsPage, CustomerDashboardPage, CustomerReviewsPage, ServiceDetailPage, ServicesPage, MessagesPage, SystemStatusPage, EmergencyContactsPage, NotificationDropdown, ChatWindow, WorkerProfileWindow, WorkerProfileModern, GlobalSocketListener

### Task 4.8 — Fix dark-mode unconditional card in WorkerDashboard (Issue 3C-2)
- **Problem**: Status card in `WorkerDashboardPage.jsx` used a dark gradient unconditionally, ignoring the `isDark` theme state.
- **Fix**: Added `isDark` ternary — dark mode gets `from-gray-800 to-gray-700`, light mode keeps the colored gradient.

### Task 4.9 — Fix grid-cols-3 with 2 cards (Issue 3A-9)
- **Problem**: `CustomerBookingsPage.jsx` used `grid-cols-3` but only rendered 2 stat cards.
- **Fix**: Changed to `grid-cols-2`.

### Task 4.10 — Fix USD pricing/contact placeholders (Issue 3H)
- **Problem**: PricingPage showed USD pricing ($9/$29/$99), ContactPage showed US phone format.
- **Fix**: PricingPage → ₹749/₹2,499/₹7,999 per month. ContactPage → +91 98765 43210, Indian address.

### Task 4.11 — Remove dead exports and unused code (Issue 3G)
- **Removed exports**:
  - `AdminPublicRoute` from `ProtectedRoute.jsx` — unused, was identical to `PublicRoute`
  - `setLoading` from `AuthContext.jsx` value — dead, not consumed by any component
  - Singular `useKeyboardShortcut` from `useKeyboardShortcut.js` — dead, only plural version used
  - `getCustomerReviews` / `getWorkerReviews` from `api/reviews.js` — dead legacy endpoints
  - `getNearbyWorkers` from `api/location.js` — dead, endpoint moved to booking flow

### Task 4.12 — Use `useLocation()` instead of global `location` (Issue 3A-8)
- **Problem**: `RegisterPage.jsx` read `location.search` (global `window.location`) instead of React Router's `useLocation()`.
- **Fix**: Added `useLocation()` import, use `loc.search` from the router hook.

### Task 4.13 — Add `useMemo` to AuthContext value (Issue 3F)
- **Problem**: AuthContext value object recreated every render, causing cascading re-renders to all consumers.
- **Fix**: Wrapped value in `useMemo` with proper dependency array (`state`, `login`, `logout`, `register`, `setUser`, `refreshUser`).

### Task 4.14 — Add file size validation to `ImageUpload` (Issue 3D)
- **Problem**: `ImageUpload.jsx` had no client-side file size validation. Large files would fail on the server with an unhelpful error.
- **Fix**: Added 5MB (`5 * 1024 * 1024`) limit. Shows toast with actual file size on rejection.

---

## Phase 5: Frontend DRY (Deduplication)

### Task 5.1 — Create `<OtpVerificationModal>` shared component
- **Issue**: Nearly identical OTP code + photo-upload modal UI triplicated across WorkerDashboardPage, WorkerBookingsPage, WorkerBookingDetailPage (each had ~50–60 lines of inline state, mutations, handler, and Modal JSX).
- **Fix**: Created `components/features/bookings/OtpVerificationModal.jsx` (~167 lines) — self-contained component that manages `otpCode`, `selectedFile`, `isUploading` state internally, has own `verifyStartMutation`/`verifyCompleteMutation`, and uses `Input` + `ImageUpload` common components for consistent UI.
- **Props**: `isOpen`, `onClose`, `otpAction` ('start'|'complete'), `bookingId`, `invalidateKeys` (array of query key arrays), `onSuccess` (optional callback).
- **Refactored files**:
  - `WorkerDashboardPage.jsx`: 657→553 lines. Removed inline OTP state/mutations/handler/JSX; removed `verifyBookingStart`, `verifyBookingCompletion`, `uploadBookingPhoto` imports.
  - `WorkerBookingsPage.jsx`: Already refactored (303 lines). Uses shared component with `invalidateKeys={[queryKeys.bookings.worker()]}`.
  - `WorkerBookingDetailPage.jsx`: 870→758 lines. Removed inline OTP state/mutations/handler/JSX; removed `ImageUpload` import; simplified `openOtpModal` helper. Uses `invalidateKeys={[queryKeys.bookings.detail(id)]}`.
- **Net reduction**: ~220 lines of duplicated code removed across 3 files.

### Task 5.2 — Create `useBookingActions` hook
- **Issue**: WorkerDashboardPage and WorkerBookingsPage had nearly identical booking action logic — `activeActionId` + `cancelConfirmId` + `otpBookingRef` state, `acceptMutation`/`cancelMutation`/`reviewMutation` definitions, and a large `handleBookingAction` dispatcher function (~50+ lines each).
- **Fix**: Created `hooks/useBookingActions.js` (~150 lines) — shared hook managing all booking action state, mutations, and the dispatcher. Accepts `{ invalidateKeys }` config so each page can specify which query keys to invalidate.
- **Returns**: `{ handleBookingAction, activeActionId, isAnyPending, otpModalProps, cancelConfirmProps }`. `otpModalProps` spreads directly onto `<OtpVerificationModal>`, `cancelConfirmProps` spreads directly onto `<ConfirmDialog>`.
- **Refactored files**:
  - `WorkerBookingsPage.jsx`: 303→~135 lines. Removed `useRef`, `useMutation`, `useQueryClient`, `toast`, `cancelBooking`, `acceptBooking`, `createReview` imports; replaced all inline state/mutations/handler with hook.
  - `WorkerDashboardPage.jsx`: 553→428 lines. Same pattern but with `invalidateKeys: [queryKeys.bookings.worker(), queryKeys.bookings.open()]` to also refresh open jobs on accept.
- **WorkerBookingDetailPage**: Intentionally NOT refactored — has fundamentally different action pattern (statusMutation for accept, cancel-with-reason modal, per-booking detail query invalidation).
- **Net reduction**: ~290 lines of duplicated code eliminated across 2 files.

### Task 5.3 — Create `<CancellationModal>` shared component
- **Issue**: Nearly identical cancel-with-reason modal duplicated in WorkerBookingDetailPage and CustomerBookingDetailPage (~40 lines of state, mutation, handler, and Modal JSX each). Both had `isCancelModalOpen` + `cancelReason` state, a `cancelMutation` calling `cancelBooking(id, reason)`, a `handleCancelSubmit` function, and a Modal with warning icon + Input + two buttons.
- **Fix**: Created `components/features/bookings/CancellationModal.jsx` (~105 lines) — self-contained component with internal `cancelReason` state and `cancelMutation`. Uses role-based config (`ROLE_CONFIG`) to drive title, icon, copy, and labels for WORKER vs CUSTOMER roles.
- **Props**: `isOpen`, `onClose`, `bookingId`, `role` ('WORKER'|'CUSTOMER'), `invalidateKeys` (array of query key arrays).
- **Refactored files**:
  - `WorkerBookingDetailPage.jsx`: 758→645 lines. Removed `cancelReason` state, `cancelMutation`, `handleCancelSubmit`. Simplified `openCancelModal` (no longer resets reason). Removed `ShieldAlert` icon, `Modal`/`Input` imports, `cancelBooking` import. Removed `loading={cancelMutation.isPending}` from trigger buttons (irrelevant when modal covers them).
  - `CustomerBookingDetailPage.jsx`: 690→634 lines. Removed `cancelReason` state, `cancelMutation`, `handleCancelSubmit`. Removed `AlertCircle` icon, `Modal`/`Input` imports, `cancelBooking` import.
- **Net reduction**: ~170 lines of duplicated code removed across 2 files.

### Task 5.4 — Replace manual socket boilerplate with `useSocketEvent`
- **Issue**: 8 files had nearly identical manual socket attach/detach/handleReady/cleanup boilerplate (~30–40 lines each) instead of using the existing `useSocketEvent` hook. Total ~250+ lines of duplicated pattern.
- **Fix**: Replaced all manual `useEffect` socket blocks with `useSocketEvent(event, callback, deps)` calls. One call per event.
- **Refactored files** (8 total):
  - `WorkerBookingDetailPage.jsx`: 1 event (`booking:status_updated`) — 40 lines → 20 lines
  - `CustomerBookingDetailPage.jsx`: 1 event (`booking:status_updated`) — 40 lines → 20 lines
  - `AdminWorkersPage.jsx`: 4 events (verification:created/updated, admin:workers/users_updated) — 50 lines → 12 lines
  - `AdminVerificationPage.jsx`: 2 events (verification:created/updated) — 40 lines → 10 lines
  - `AdminUsersPage.jsx`: 2 events (admin:users/workers_updated) — 40 lines → 10 lines
  - `MainLayout.jsx`: 1 event (`sos:alert`) — 30 lines → 12 lines
  - `SOSContext.jsx`: 2 events (booking:status_updated, booking:created) — 30 lines → 2 lines
  - `GlobalSocketListener.jsx`: 6 events — 40 lines of boilerplate → 6 separate `useSocketEvent` calls
- **Net reduction**: ~200+ lines of socket boilerplate eliminated across 8 files.

### Task 5.5 — Replace `isDark ? '...' : '...'` with Tailwind `dark:` modifier
- **Issue**: ~800+ `isDark` ternaries across 78 files. Every component imported `useTheme` just to read `isDark` and build class strings like `isDark ? 'bg-gray-800' : 'bg-white'`. Tailwind's `darkMode: 'class'` makes this unnecessary — the `dark:` prefix handles it automatically.
- **Fix**: Converted all `isDark ? 'dark-class' : 'light-class'` ternaries to `'light-class dark:dark-class'` and removed `useTheme` imports/destructuring from files that only used `isDark`.
- **Scope**: 75+ files converted across all layers:
  - **Common components** (18): Card, Button, Input, Select, Textarea, Modal, Badge, StatCard, Spinner, EmptyState, QuickReview, BookingCard, SimpleChart, PageHeader, ConfirmDialog, AsyncState, Skeleton, ProfileIncompleteAlert
  - **Layout components** (4): MainLayout, Sidebar, Navbar (kept isDark for Sun/Moon toggle), Footer
  - **Feature components** (12): GlobalSOSButton, WorkerProfileWindow, WorkerProfileModern, UserMiniProfile, OtpVerificationModal, NotificationDropdown, MiniMap (kept isDark for map layer init), ChatWindow, LocationPicker, LiveTrackingMap, AddressAutocomplete
  - **Page files** (45+): All admin, auth, customer, legal, profile, public, safety, services, and worker pages
- **Intentionally kept `isDark`** (3 files):
  - `ThemeContext.jsx` — defines `isDark`
  - `Navbar.jsx` — Sun/Moon icon toggle (`isDark ? <Sun/> : <Moon/>`)
  - `MiniMap.jsx` — initial map layer state (`useState(isDark ? 'dark' : 'streets')`)
- **Net reduction**: ~800 isDark ternaries eliminated, ~75 `useTheme` imports removed.

### Task 5.6 — Extract loading spinner from ProtectedRoute
- **Issue**: `ProtectedRoute.jsx` contained 5 identical 7-line loading spinner blocks (centered `<Spinner>` with "Loading..." text), one for each guard (auth, admin, worker, customer, base).
- **Fix**: Created `<FullPageSpinner />` component in `client/src/components/common/Spinner.jsx` and replaced all 5 blocks with one-liner `<FullPageSpinner />` calls.
- **Files changed**: `Spinner.jsx` (added export), `ProtectedRoute.jsx` (213→170 lines).

### Task 5.7 — Break down large components (870+ lines)
- **Issue**: Three page-level components exceeded 600+ lines with deeply nested JSX, making them hard to maintain.
- **Fix**: Extracted sub-components into `components/` folders alongside each page:
  - **WorkerBookingDetailPage** (870→588 lines) → 5 sub-components:
    - `BookingTimeline.jsx` — status lifecycle stepper
    - `BookingReviewSection.jsx` — review form / submitted-state card
    - `BookingAssignmentDetails.jsx` — date/time/location/price/minimap card
    - `WorkerContactSidebar.jsx` — customer profile, tracking toggle, contact buttons
    - `BookingActionButtons.jsx` — status-dependent action buttons (desktop + mobile)
  - **CustomerBookingDetailPage** (588→339 lines) → 4 sub-components:
    - `BookingDetailsGrid.jsx` — date, time, location, map in 2×2 grid + notes
    - `CustomerWorkerSection.jsx` — worker info sidebar with review form
    - `CustomerOTPSection.jsx` — OTP security banner
    - `CustomerMobileActions.jsx` — mobile sticky bottom action bar
  - **ServiceDetailPage** (635→270 lines) → 3 sub-components:
    - `ServiceHeader.jsx` — category badge, title, description, trust signals
    - `WorkerSelectionPanel.jsx` — auto-assign view + direct worker grid with search
    - `BookingFormPanel.jsx` — sticky right-column form with pricing summary
- **Files created**: 12 new sub-component files across `pages/worker/components/`, `pages/customer/components/`, `pages/services/components/`.
- **Net reduction**: 2093→1197 lines across the 3 parent pages (~43% reduction).

---

## Phase 6: Accessibility & Performance

### Task 6.1 — Add ARIA labels to icon-only buttons (Issue 5A-1)
- **Status**: Completed in prior session. All icon-only `<Button>` components across the app were given proper `aria-label` attributes.

### Task 6.2 — Add `alt` text to all `<img>` tags (Issue 5A-2)
- **Status**: Completed in prior session. All `<img>` tags across the app were given descriptive `alt` attributes or `alt=""` for decorative images.

### Task 6.3 — Color-only indicator alternatives (Issue 5A-3)
- **Problem**: Multiple pages used colored dots (green, amber, red) as the sole indicator of status — invisible to screen readers and colorblind users.
- **Fix**: Added `aria-hidden="true"` to decorative dots that already had adjacent text labels, and added `sr-only` text for dots that conveyed information without text.
- **Files modified**:
  - `WorkerDashboardPage.jsx` — added sr-only "New direct requests available" text next to warning ping dot
  - `WorkerBookingDetailPage.jsx` — added `aria-hidden="true"` + sr-only "Customer verified" next to green dot
  - `MessagesPage.jsx` — added `aria-hidden="true"` + sr-only "Online" next to green dot
  - `CustomerBookingDetailPage.jsx` — added `aria-hidden="true"` to decorative dots (already had adjacent text)
  - `CustomerWorkerSection.jsx` — added `aria-hidden="true"` to pulse dot (already had "On-site now" text)

### Task 6.4 — Focus trap in Modal (Issue 5A-4)
- **Problem**: `Modal.jsx` had no focus management — Tab key moved focus behind the overlay, breaking keyboard navigation and screen reader flow.
- **Fix**: Added complete focus trap to `Modal.jsx`:
  - Auto-focuses first focusable element on open
  - Tab/Shift+Tab cycles within modal boundaries
  - Restores focus to the previously-focused element on close
  - Added `role="dialog"`, `aria-modal="true"`, `aria-label`, `tabIndex={-1}` for ARIA compliance
  - Used `useRef`, `useCallback`, and `FOCUSABLE_SELECTOR` constant for querySelectorAll

### Task 6.5 — Skip-to-content link in MainLayout (Issue 5A-5)
- **Problem**: Keyboard users had to Tab through the entire Navbar and Sidebar to reach the main content area.
- **Fix**: Added an accessible skip-to-content `<a>` tag with `sr-only focus:not-sr-only` Tailwind classes at the top of `MainLayout.jsx`, targeting `#main-content`. Added `id="main-content"` to the `<main>` element.

### Task 6.6 — StarRating keyboard accessible (Issue 5A-6)
- **Problem**: `StarRating.jsx` used clickable `<button>` elements but provided no keyboard navigation pattern. Users couldn't use arrow keys to move between stars.
- **Fix**: Converted to WAI-ARIA radiogroup pattern:
  - Container: `role="radiogroup"` with `aria-label`
  - Each star button: `role="radio"` with `aria-checked`
  - Arrow key navigation (Left/Right/Up/Down) + Home/End keys
  - Roving `tabIndex` (only selected star is tabbable)
  - `focus-visible:ring-2` styling for keyboard focus indicator
  - Used `useRef` array and `useCallback` for `handleKeyDown`

### Task 6.7 — Route-level code splitting (Issue 5B-1)
- **Status**: Already implemented. `AppRoutes.jsx` uses `React.lazy()` + `<Suspense>` for all page-level components. No changes needed.

### Task 6.8 — React.memo on list items (Issue 5B-2)
- **Problem**: `BookingCard` and `StatCard` are rendered in lists/grids and re-render on every parent state change even when their props haven't changed.
- **Fix**: Wrapped both components with `React.memo`:
  - `BookingCard.jsx` — `export const BookingCard = memo(function BookingCard({...}))`
  - `StatCard.jsx` — `export const StatCard = memo(function StatCard({...}))`

### Task 6.9 — Replace `dangerouslySetInnerHTML` CSS (Issue 5C-1)
- **Problem**: `LiveTrackingMap.jsx` and `MiniMap.jsx` used `<style dangerouslySetInnerHTML>` to inject CSS for map styling — an XSS vector and CSP violation.
- **Fix**: Extracted all CSS into a new `map-styles.css` file at `components/features/location/map-styles.css`. Both components now `import './map-styles.css'` and the `dangerouslySetInnerHTML` blocks were removed.
- **CSS contents**: `.upro-branded-minimap`, `.upro-engine-map`, `.upro-popup` styles with `@media (prefers-color-scheme: dark)` variants.

### Task 6.10 — Disable polling when tab inactive (Issue 5B-3)
- **Problem**: 6 components with `refetchInterval` continued polling the API even when the browser tab was in the background, wasting bandwidth and server resources.
- **Fix**: Added `refetchIntervalInBackground: false` to all TanStack Query hooks with `refetchInterval`:
  - `WorkerBookingsPage.jsx` (30s interval)
  - `CustomerBookingsPage.jsx` (30s interval)
  - `CustomerBookingDetailPage.jsx` (10s conditional interval)
  - `SystemStatusPage.jsx` (15s interval, 2 queries)
  - `NotificationDropdown.jsx` (60s interval)
  - `AdminSOSAlertsPage.jsx` (30s interval)
- Additionally, `SOSContext.jsx` (which uses raw `setInterval`, not TanStack Query) was updated with the Page Visibility API — `document.addEventListener('visibilitychange', ...)` to pause/resume the 30s polling interval when the tab is hidden/visible.

### Task 6.11 — Socket only for authenticated users (Issue 5C-2)
- **Status**: Already implemented. `useSocket.js` guards on `if (!user?.id)` and skips connection for unauthenticated users. No changes needed.

---

**✅ Phase 6 — Accessibility & Performance: COMPLETE (Tasks 6.1–6.11)**

---

## Phase 7: Session-Based Booking Architecture

### 7.1 BookingSession & BookingStatusHistory Models
- Added `BookingSession` model: id, bookingId (FK→Booking, cascade), sessionDate, startTime, endTime, isActive, startOtp, otpVerified, notes, createdAt. Indexed on bookingId and sessionDate.
- Added `BookingStatusHistory` model: id, bookingId (FK→Booking, cascade), fromStatus, toStatus, changedBy (nullable FK→User for system-initiated), reason, createdAt. Indexed on bookingId and changedBy.
- Added reverse relations on Booking (`sessions`, `statusHistory`) and User (`statusChanges`).
- **Files**: `server/prisma/schema.prisma`

### 7.2 Migration
- Migration `20260305170903_add_booking_session_and_status_history` applied.
- Second migration `20260305173436_add_cancellation_policy_and_nullable_changedby` added `cancellationPenaltyPercent Int?` to Booking and made `changedBy` nullable on BookingStatusHistory (for system-initiated events like auto-expiry).

### 7.3 Session CRUD in booking.service.js
- `getBookingSessions(bookingId, userId, role)` — Auth-checked session list.
- `createSession(bookingId, userId, { sessionDate, notes })` — Schedules next visit, generates 4-digit OTP.
- `startSession(sessionId, otp, userId)` — Verifies OTP, sets isActive=true, records start time.
- `endSession(sessionId, userId, { notes })` — Sets isActive=false, records endTime.
- Added corresponding controller handlers with Socket.IO events (`session:scheduled`, `session:started`, `session:ended`) and notification creation.
- Added 6 new routes: GET/POST sessions, start/end session, reschedule, history.
- **Files**: `server/src/modules/bookings/booking.service.js`, `booking.controller.js`, `booking.routes.js`

### 7.4 Session-Aware Availability Check
- Completely rewrote `isWorkerAvailable()` with two-phase logic:
  1. **PENDING/CONFIRMED bookings**: Standard time-overlap check.
  2. **IN_PROGRESS bookings**: Session-aware — worker is blocked only if an active session exists OR a scheduled future session overlaps. Bookings without sessions fall back to scheduledAt overlap.
- **Files**: `server/src/modules/bookings/booking.service.js`

### 7.5 Pause / Next Visit (Backend)
- Implemented via `createSession` (schedule next visit) + `endSession` (pause current work).
- Worker calls `endSession` to stop current session, then `createSession` to schedule next date.

### 7.6 Daily Re-Verification OTP
- `createSession` generates a fresh 4-digit OTP per session.
- `startSession` verifies the OTP before allowing the session to begin.
- Customer sees the OTP on their booking detail page for the pending session.

### 7.7 Overrun Detection
- Added `detectOverrunSessions()` — finds all active sessions where elapsed time exceeds the booking's `estimatedDuration`. Returns overrun details (sessionId, bookingId, customerId, overrunMinutes) for notification dispatch by a scheduled job.
- **Files**: `server/src/modules/bookings/booking.service.js`

### 7.8 Booking Timeout / Auto-Expiry
- Added `expirePendingBookings(hoursThreshold=24)` — batch-cancels PENDING bookings older than the threshold, records audit trail for each with `changedBy: null` (system-initiated).
- **Files**: `server/src/modules/bookings/booking.service.js`

### 7.9 Cancellation Policy / Penalty Logic
- Added `getCancellationPolicy(booking)` — returns `{ allowed, penaltyPercent, reason }` based on time until scheduled date:
  - >24h: free (0%), 12-24h: 25%, 2-12h: 50%, <2h: 100%, IN_PROGRESS: 100%.
  - COMPLETED/CANCELLED: not allowed.
- Integrated into `cancelBooking` — enforces policy, stores `cancellationPenaltyPercent` on booking record. Admins bypass penalties (0%).
- Added `GET /:id/cancellation-policy` route and controller for frontend preview.
- **Files**: `server/src/modules/bookings/booking.service.js`, `booking.controller.js`, `booking.routes.js`, `server/prisma/schema.prisma`

### 7.10 Rescheduling Mechanism
- Added `rescheduleBooking(bookingId, userId, role, { newScheduledDate })` — validates permissions, checks worker availability at new date, updates booking, records audit trail.
- Route: `PATCH /:id/reschedule`.
- **Files**: `server/src/modules/bookings/booking.service.js`, `booking.controller.js`, `booking.routes.js`

### 7.11 Booking Status Audit Trail
- Added `recordStatusChange(bookingId, fromStatus, toStatus, changedBy, reason, client)` helper.
- Integrated into all status transitions: `updateBookingStatus`, `cancelBooking`, `acceptBooking`, `verifyBookingStart`, `verifyBookingCompletion`, `rescheduleBooking`, `expirePendingBookings`.
- History viewable via `GET /:id/history` with changer info.
- **Files**: `server/src/modules/bookings/booking.service.js`, `booking.controller.js`, `booking.routes.js`

### 7.12 Customer UI: Session Timeline Display
- Created `BookingSessionsTimeline` shared component — fetches and displays all sessions as a visual timeline with status indicators (active/completed/pending), time ranges, duration, notes, and OTP display.
- Integrated into `CustomerBookingDetailPage` — shown when booking is IN_PROGRESS.
- **Files**: `client/src/components/features/bookings/BookingSessionsTimeline.jsx`, `client/src/pages/customer/CustomerBookingDetailPage.jsx`

### 7.13 Worker UI: Session Management Panel
- Created `WorkerSessionPanel` component — full session management for workers:
  - **Active session**: Shows live status with "End Session" button.
  - **Pending session**: OTP input to start session.
  - **No active/pending**: "Schedule Next Visit" with date picker and notes.
  - Session count summary.
- Also integrated `BookingSessionsTimeline` in worker sidebar for session history.
- **Files**: `client/src/pages/worker/components/WorkerSessionPanel.jsx`, `client/src/pages/worker/WorkerBookingDetailPage.jsx`

### Client API Layer
- Added to `client/src/api/bookings.js`: `getBookingSessions`, `createSession`, `startSession`, `endSession`, `rescheduleBooking`, `getBookingStatusHistory`, `getCancellationPolicy`.
- Updated `client/src/utils/queryKeys.js`: Added `sessions(id)` and `history(id)` query keys.

---

**✅ Phase 7 — Session-Based Booking Architecture: COMPLETE (Tasks 7.1–7.13)**