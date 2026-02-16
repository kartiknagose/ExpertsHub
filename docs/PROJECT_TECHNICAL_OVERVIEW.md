## UrbanPro V2 — Technical Overview

This document summarizes the technologies, folder structure, key files, and database schema for the UrbanPro V2 project. It is written to support your presentation and to help a technical reviewer (mentor) quickly understand the system.

---

**High-level summary**: UrbanPro V2 is a two-tier web application (React + Node/Express) backed by a PostgreSQL database managed with Prisma. The app implements user roles (Customer, Worker, Admin), booking flows with OTP verification, worker verification (documents/media), payments metadata, photo proofing for jobs, and safety-related features (SOS/emergency contacts).

---

**Technologies**

- Frontend: React 18, Vite, TailwindCSS, Framer Motion, TanStack Query (React Query), React Router v6, React Hook Form, Zod, Zustand (state), Sonner (toasts).
- Backend: Node.js, Express 5, Prisma ORM, PostgreSQL, Multer (uploads), Nodemailer, bcryptjs, jsonwebtoken, express-validator, helmet, cors, morgan.
- Dev tooling: Vite, ESLint, Nodemon, Prisma CLI.

---

**Repository layout (top-level)**

- `client/` — Frontend app (Vite + React). Key files: `package.json`, `vite.config.js`, `src/`.
- `server/` — Backend API (Express). Key files: `package.json`, `prisma/schema.prisma`, `src/`.
- `docs/` — Project documentation (this file added here).

---

**Frontend — `client/` (overview)**

Structure highlights (inside `client/src`):

- `main.jsx` — React entrypoint, configures TanStack Query, providers (`AuthProvider`, `NotificationProvider`), and renders the `App`.
- `App.jsx` — Root app wrapper with `ThemeProvider`, `ErrorBoundary`, `BrowserRouter`, and `AppRoutes`. Also includes a `SessionExpiredHandler` that listens for `auth:session-expired` events.
- `routes/` — `AppRoutes.jsx` defines all client routes; `ProtectedRoute.jsx` enforces auth access.
- `api/` — axios wrapper and per-domain service files (`auth.js`, `services.js`, `workers.js`, etc.) used by React Query hooks and components.
- `context/` — `AuthContext.jsx` (auth state & helpers), `NotificationContext.jsx`, `ThemeContext.jsx`.
- `components/` — UI components grouped by feature or common; contains `common/`, `auth/`, `features/`, `layout/` etc.
- `hooks/` — reusable hooks: `useAuth.js`, `useNotification.js`.
- `pages/` — route pages organized by role/feature: `admin/`, `auth/`, `customer/`, `worker/`, `services/`, `profile/`, `legal/`.
- `utils/` — helpers like `profilePhoto.js`, `queryKeys.js`, `statusHelpers.js`.

How the frontend talks to the backend:

- `client/src/api/axios.js` creates an Axios instance with interceptors to attach tokens, handle 401/session expires (dispatches `auth:session-expired`), and standardize error handling.
- React Query is used for server state — queries and mutations live next to components or in `features/` folders and use the axios api services.

Key commands (frontend):

```bash
cd client
npm install
npm run dev
```

---

**Backend — `server/` (overview)**

Structure highlights (inside `server/src`):

- `index.js` — Express app setup and routing. Uses Helmet, CORS, Morgan, JSON parsing, cookieParser, i18n, serves static `/uploads` from `src/uploads`, registers routes and error handlers.
- `config/` — environment loader (`env.js`), CORS options (`cors.js`), i18n setup (`i18n.js`), Prisma instance (`prisma.js`), rate limit config.
- `middleware/` — common express middleware: `auth.js`, `validation.js`, `requireRole.js`, `errorHandler.js`, `notFoundHandler.js`.
- `common/utils/` — utilities: `mailer.js`, `jwt.js`, `bcrypt.js`, `tokenGenerator.js`, async wrapper utilities.
- `modules/` — feature modules (each has controllers, routes, services, schemas where applicable): `auth`, `bookings`, `customers`, `workers`, `services`, `uploads`, `payments`, `reviews`, `safety`, `availability`, `verification`, `admin`.
- `uploads/` — static uploaded assets broken into `profile-photos`, `booking-photos`, `verification-docs`.

How the backend works (high-level):

- Routes are organized under `modules/*/*.routes.js` and call controllers which use `service` layers to perform operations over the Prisma client.
- Authentication: JWT-based tokens (helpers in `common/utils/jwt.js`), cookie handling, protected route middleware in `middleware/auth.js`.
- File uploads: `multer` used in `uploads` module; uploaded files are saved under `server/uploads/...` and served statically by `index.js`.
- Validation: `express-validator` + custom validation middleware.

Key commands (backend):

```bash
cd server
npm install
npm run dev       # nodemon
npm run prisma:migrate  # run prisma migrations
npm run prisma -- db push  # (or use prisma migrate commands based on workflow)
```

Environment: see `server/.env.example` — typical vars: `PORT`, `DATABASE_URL`, `JWT_SECRET`, SMTP details, `CORS_ORIGIN`.

---

**Database (Prisma + PostgreSQL)**

Location: `server/prisma/schema.prisma` (Prisma schema). Key points:

- Database provider: `postgresql` with URL pointing at `urbanpro_v2` database by default.
- Models of interest:
  - `User` — central user model with `role` enum (CUSTOMER/WORKER/ADMIN), personal data, relationships to `addresses`, `workerProfile`, `bookings`, `reviews`, `payments`, verification objects and tokens.
  - `WorkerProfile` — extended worker details: `bio`, `skills`, `hourlyRate`, `rating`, `serviceAreas`, `availability`, `services` relation, verification flags.
  - `Service` & `WorkerService` — services and many-to-many relation to workers.
  - `Booking` — booking lifecycle and OTPs: fields for `scheduledAt`, `status` (enum `BookingStatus`), `paymentStatus`, `startOtp`/`completionOtp`, `startedAt`, `completedAt`, `photos`, `sosAlerts`.
  - `Payment` — payment metadata tied to booking and customer; `status` uses `PaymentStatus` enum.
  - `Review` — rating & comments, unique per booking + reviewer.
  - `WorkerVerificationApplication` (and `WorkerVerificationDocument`, `WorkerVerificationMedia`, `WorkerVerificationReference`) — full verification flow data-model.
  - `SOSAlert`, `EmergencyContact`, `BookingPhoto`, `Availability`, `Address` — supporting models.

Enums: `Role`, `BookingStatus`, `PaymentStatus`, `VerificationStatus`, `VerificationDocumentType`, `VerificationMediaType`, `PhotoType`, `SOSStatus`.

Migration files are in `server/prisma/migrations/` and a seed script exists at `server/prisma/seed.js`.

---

**Files & lines worth highlighting in the presentation**

- `server/src/index.js` — show how the API endpoints are mounted, middleware order, and static uploads serving. ([server/src/index.js](server/src/index.js#L1-L200))
- `server/prisma/schema.prisma` — show the `Booking` model (OTP fields & state machine), `WorkerProfile`, and `WorkerVerificationApplication` to highlight Trust & Safety work. ([server/prisma/schema.prisma](server/prisma/schema.prisma#L1-L400))
- `client/src/main.jsx` — React Query configuration and global providers. ([client/src/main.jsx](client/src/main.jsx#L1-L200))
- `client/src/App.jsx` — routing, theme, and session expiry handling via `auth:session-expired` event. ([client/src/App.jsx](client/src/App.jsx#L1-L200))
- `client/src/api/axios.js` — central Axios interceptors (attach JWT, session-expire event). (open during Q/A if needed)

---

**How I analyzed the project**

- Scanned `client/` and `server/` to collect package manifests, entrypoints, and the Prisma schema.
- Read the main app files (`server/src/index.js`, `client/src/main.jsx`, `client/src/App.jsx`) and `server/prisma/schema.prisma` to extract run-time behavior, routes, and data model important for your presentation.

If you want a literal line-by-line explanation for every file, I can continue — it will take more time and I can either:

1. Produce a per-file, line-commented export (very long, multiple files), or
2. Generate a focused appendix with per-file one-paragraph summaries (quicker and presentation-friendly).

Tell me which you prefer; meanwhile I will commit this document into the repo and push it to your `origin` remote.

---

Authoring/commit note: `docs/PROJECT_TECHNICAL_OVERVIEW.md` created by assistant to prepare for the project's presentation.
