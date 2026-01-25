# UrbanPro Reference (Paste into new project)

## Project Vision
Home services marketplace connecting customers with local service pros (like Thumbtack/Urban Company): browse services, book workers, manage bookings, reviews, and payments.

## Current Codebase (this repo)
- Frontend: React + Vite + TypeScript (client/)
- Backend: Node.js + Express + TypeScript + Prisma + PostgreSQL (server/)
- Database models: User, Address, Worker, Service, WorkerService, Booking, Review, Availability

## Critical Flaws Found (do NOT repeat)
1) Secrets exposed: .env committed; real SMTP creds, Supabase keys, weak default JWT secret.
2) Email auto-verification: users marked emailVerified=true on register.
3) Tokens in localStorage; no httpOnly cookies.
4) No rate limiting, helmet, or input validation (zod/validator unused).
5) Prisma "db push" only; no migrations; schema changes risk data loss.
6) Booking race conditions: accept booking without transaction/lock.
7) CAPTCHA bypass in dev with test keys.
8) Excessive console logs; no real logger.
9) Missing reviews/availability enforcement logic despite models.
10) No tests (backend) and minimal docs.

## Recommended Stack for Rebuild (JS, no TS)
- Backend: Node.js 20, Express, PostgreSQL, Prisma (JS), JWT (httpOnly cookies), bcryptjs, express-validator, helmet, cors, express-rate-limit, multer, nodemailer, morgan.
- Frontend: React 18 (JS), Vite, React Router, React Query, React Hook Form, Axios, Tailwind (or MUI), react-hot-toast, react-icons, date-fns.
- Dev: dotenv, nodemon, ESLint+Prettier.

## Safer Defaults
- Never commit .env; add .env.example.
- Strong JWT secret; use httpOnly, secure cookies; short expiries + refresh tokens later.
- Enable helmet, rate limiting, CORS allowlist.
- Validate all inputs (express-validator/zod); sanitize.
- Use Prisma migrations; add indexes on foreign keys/status fields.
- Use transactions for booking accept/decline.
- Hash passwords with bcrypt; enforce stronger password policy.
- Store files in Cloudinary/S3 if needed; validate MIME/size.

## Minimal Data Model (start simple)
- User: id, name, email (unique), passwordHash, role (CUSTOMER/WORKER/ADMIN), emailVerified, createdAt.
- Service: id, name, description, category, basePrice.
- WorkerProfile: id, userId (unique), bio, skills JSON, hourlyRate, rating, totalReviews.
- Booking: id, customerId, workerId (nullable until assigned), serviceId, scheduledAt, status (PENDING/CONFIRMED/IN_PROGRESS/COMPLETED/CANCELLED), totalPrice, address, notes.
- Review: id, bookingId (unique), workerId, customerId, rating, comment.

## MVP Feature Order (vertical slices)
1) Auth: register/login, bcrypt, JWT httpOnly cookies, email verify (no auto-verify).
2) Services: list services, service detail.
3) Worker profiles: create/update, list workers for a service.
4) Booking: create booking, view my bookings, cancel; worker accept/decline with transaction.
5) Reviews: submit after completed booking; display worker ratings.
6) Hardening: rate limit, helmet, validation, logging, error handler, 404.

## File/Folder Blueprint (new project)
```
urbanpro-v2/
  server/
    src/
      config/ (env, db/prisma)
      middleware/ (auth, validate, error)
      utils/ (jwt, email, logger)
      controllers/ (auth, user, service, booking, review)
      routes/ (auth, users, services, bookings, reviews)
      index.js
    prisma/
      schema.prisma
      migrations/
    .env.example
  client/
    src/
      components/
      pages/
      context/AuthContext.jsx
      services/api.js
      App.jsx
      main.jsx
    .env.example
  docs/
    PROJECT_REFERENCE.md
```

## API Shape (suggested)
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET  /api/auth/me
- GET  /api/services
- GET  /api/services/:id
- GET  /api/services/:id/workers
- POST /api/bookings
- GET  /api/bookings (by role)
- PATCH/POST /api/bookings/:id/accept | /decline | /cancel | /complete
- POST /api/reviews
- GET  /api/reviews/worker/:workerId

## Frontend Flow (MVP)
- Public: Home, Services list/detail, Login, Register, Verify Email.
- Authenticated Customer: Dashboard, My bookings, Book service flow.
- Authenticated Worker: Dashboard, Pending requests, My bookings, Profile.

## Security Checklist
- httpOnly + secure cookies for JWT
- CSRF safe by using same-site=strict/lax for cookies
- Rate limit auth routes
- Input validation & sanitization
- Helmet + CORS allowlist
- Password policy (min length/complexity)
- Avoid storing tokens in localStorage
- Log auth events (info), errors (error), no secrets in logs

## Testing To Add
- Backend: auth, services, bookings (accept/decline transaction), reviews.
- Frontend: critical flows (login, create booking) with integration tests later.

## What to Paste in New Chat to Restore Context
```
PROJECT: UrbanPro v2 (home services marketplace) rebuilding from scratch.
STACK: Node+Express (JS), PostgreSQL+Prisma, React+Vite+Tailwind, React Query, JWT httpOnly cookies.
REFERENCE: See PROJECT_REFERENCE.md from old repo (critical flaws and plan).
STATUS: [fill in]
QUESTION: [fill in]
```

## Using the Existing Frontend Safely
- Keep the current `client/` as a reference UI; do not carry over its `.env` (remove secrets) and add a fresh `client/.env.example` with only placeholders (e.g., `VITE_API_URL=`).
- Repoint all API calls via a single axios base URL (already in `src/services/api.ts`); ensure it reads from `VITE_API_URL` only.
- Audit routes/components you’ll keep (Home, Services, ServiceDetail, Auth pages, Dashboards) and prune unfinished ones to reduce complexity.
- Keep TypeScript if you want the existing types; otherwise you can progressively convert files to `.jsx`—but prioritize wiring to the new backend first.
- Run `npm install` inside `client/`, then `npm run build` to catch breakages early; fix any TypeScript errors or missing env vars.
- Remove any hard-coded test keys, Supabase refs, or legacy integrations you won’t use in v2.

### Minimal steps to integrate the old frontend with the new backend
1) Copy `client/` into the new repo (or keep it in-place) but delete `.env`; create `.env.example` with `VITE_API_URL=http://localhost:3000/api`.
2) Update axios base URL to match the new backend host/port.
3) Align API paths to the suggested API shape in this doc (auth, services, bookings, reviews). Adjust client calls accordingly.
4) Run `npm run dev` and click through: Login → Signup → Services list/detail → Booking → Dashboards. Note failing calls and map them to backend TODOs.
5) Remove unused dependencies (e.g., Supabase) if not needed; keep Tailwind/MUI stack consistent.

### Known frontend gaps carried from the old project
- No payment UI; no review submission UI wired to APIs.
- Booking flow may assume old backend shapes; expect to adjust payloads/response mappings.
- Auth currently stores tokens in `localStorage`; plan to migrate to httpOnly cookies on the backend and thin client auth state accordingly.
