# UrbanPro V2 — Database Guide

This document explains the database schema, how tables relate to each other, and how data flows through the system. Written for beginners and developers.

---

## 1) Database Overview

**Type:** PostgreSQL (relational database)  
**ORM:** Prisma (makes it safe and easy to query)  
**Location:** Cloud-hosted or local instance (configured in `.env` as `DATABASE_URL`)  

### Why This Matters

The database is the **permanent storage** for all platform data. Without it:
- User accounts would disappear on server restart.
- Bookings would be lost.
- Reviews and ratings would vanish.

---

## 2) Core Tables & Models

All tables are defined in `server/prisma/schema.prisma`. Here's what each one does:

### User (Base Account)

Stores every person on the platform—customers, workers, and admins.

| Field | Type | Purpose |
|-------|------|---------|
| `id` | UUID | Unique identifier |
| `name` | String | Full name |
| `email` | String | Email (unique, login credential) |
| `mobile` | String | Phone number (unique) |
| `password` | String | Hashed password (never stored plaintext) |
| `role` | Enum: CUSTOMER, WORKER, ADMIN | Determines access level |
| `emailVerified` | Boolean | True if email confirmed via link |
| `isActive` | Boolean | False means suspended by admin |
| `profilePhoto` | String? | Path to uploaded profile image |
| `bio` | String? | Optional bio (customers use this too) |
| `createdAt` | DateTime | Account creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Relations:**
- Has one `WorkerProfile` (if role = WORKER)
- Has many `Bookings` as customer
- Has many `Reviews` as reviewer
- Has many `Payments` as payer
- Has many `VerificationApplications` as applicant

---

### WorkerProfile

Extra details for users with role = WORKER. One-to-one relation with User.

| Field | Type | Purpose |
|-------|------|---------|
| `id` | UUID | Unique identifier |
| `userId` | UUID | Foreign key to User |
| `isVerified` | Boolean | True if admin approved verification docs |
| `rating` | Float? | Average star rating (1–5) |
| `bio` | String? | Worker's professional bio |
| `serviceAreas` | String[] | Cities/areas where worker operates |
| `createdAt` | DateTime | Profile creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Relations:**
- Belongs to `User` (one-to-one)
- Has many `WorkerServices` (services this worker offers)
- Has many `Bookings` (jobs accepted by this worker)
- Has many `Reviews` (ratings given by customers)

**Example:**
```
User: John (WORKER) → WorkerProfile: John's skills, rating 4.8, works in NYC & Boston
```

---

### Service

Platform services that customers can book (e.g., "Home Cleaning", "Plumbing").

| Field | Type | Purpose |
|-------|------|---------|
| `id` | UUID | Unique identifier |
| `name` | String | Service name (unique, e.g., "Home Cleaning") |
| `category` | String? | Category (e.g., "Home", "Beauty") |
| `description` | String? | What the service includes |
| `basePrice` | Float? | Starting price (in Rs) |
| `createdAt` | DateTime | When added to platform |
| `updatedAt` | DateTime | Last update |

**Relations:**
- Has many `WorkerServices` (which workers offer this service)
- Has many `Bookings` (bookings for this service)

**Example:**
```
Service: "Home Cleaning" → basePrice: 500 Rs → offered by 50+ workers
```

---

### WorkerService

Junction table: which workers offer which services.

| Field | Type | Purpose |
|-------|------|---------|
| `id` | UUID | Unique identifier |
| `workerId` | UUID | Foreign key to WorkerProfile |
| `serviceId` | UUID | Foreign key to Service |
| `price` | Float? | Worker's custom price (overrides basePrice) |
| `createdAt` | DateTime | When worker added this service |

**Relations:**
- Belongs to `WorkerProfile`
- Belongs to `Service`

**Example:**
```
WorkerService: John (worker) offers "Home Cleaning" for 600 Rs (100 Rs markup)
```

---

### Booking (Core Workflow)

A customer's request for a service, accepted by a worker.

| Field | Type | Purpose |
|-------|------|---------|
| `id` | UUID | Unique identifier |
| `customerId` | UUID | Foreign key to User (customer) |
| `workerId` | UUID | Foreign key to WorkerProfile (assigned worker) |
| `serviceId` | UUID | Foreign key to Service |
| `status` | Enum | PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED |
| `scheduledAt` | DateTime | When service is scheduled |
| `scheduledDate` | DateTime | Alternative date field (same purpose) |
| `startOTP` | String? | One-time password to verify worker start |
| `completionOTP` | String? | One-time password to verify worker completion |
| `startVerifiedAt` | DateTime? | When worker entered start OTP |
| `completionVerifiedAt` | DateTime? | When worker entered completion OTP |
| `startPhotos` | String[]? | Before pics (uploaded by worker) |
| `completionPhotos` | String[]? | After pics (uploaded by worker) |
| `notes` | String? | Instructions or feedback |
| `cancelledBy` | Enum? | CUSTOMER, WORKER, or ADMIN |
| `cancelReason` | String? | Why booking was cancelled |
| `createdAt` | DateTime | When booking was made |
| `updatedAt` | DateTime | Last update |

**Relations:**
- Belongs to `User` (customer)
- Belongs to `WorkerProfile` (assigned worker)
- Belongs to `Service`
- Has one `Payment`
- Has many `Reviews`

**Booking State Transitions:**
```
PENDING → (worker accepts) → CONFIRMED → (worker starts) → IN_PROGRESS → (worker completes) → COMPLETED
   ↓ (cancel anytime)                                              ↓
   └─────────────────────────── CANCELLED ←─────────────────────┘
```

**Example:**
```
Booking #123:
- Customer: Alice
- Worker: John
- Service: Home Cleaning
- Scheduled: 2026-02-20 10:00 AM
- Status: IN_PROGRESS
- Start OTP verified ✓
- Awaiting completion OTP
```

---

### Review

Ratings and feedback given by customers to workers.

| Field | Type | Purpose |
|-------|------|---------|
| `id` | UUID | Unique identifier |
| `bookingId` | UUID | Foreign key to Booking (which job is reviewed) |
| `customerId` | UUID | Foreign key to User (who gave review) |
| `workerId` | UUID | Foreign key to WorkerProfile (who is reviewed) |
| `rating` | Int | Star rating (1–5) |
| `comment` | String? | Written feedback |
| `createdAt` | DateTime | When review posted |
| `updatedAt` | DateTime | Last edit |

**Relations:**
- Belongs to `Booking`
- Belongs to `User` (reviewer)
- Belongs to `WorkerProfile` (reviewed worker)

**Example:**
```
Review:
- Booking #123
- Customer: Alice → Worker: John
- Rating: 5 stars
- Comment: "Excellent work! Very professional."
```

---

### Payment

Payment records and settlement info.

| Field | Type | Purpose |
|-------|------|---------|
| `id` | UUID | Unique identifier |
| `bookingId` | UUID | Foreign key to Booking |
| `customerId` | UUID | Foreign key to User (payer) |
| `amount` | Float | Amount paid (in Rs) |
| `status` | Enum | PENDING, COMPLETED, FAILED |
| `method` | String? | Payment method (card, UPI, etc.) |
| `transactionId` | String? | External payment gateway ID |
| `createdAt` | DateTime | When payment was initiated |
| `updatedAt` | DateTime | Last update |

**Relations:**
- Belongs to `Booking`
- Belongs to `User` (payer)

**Example:**
```
Payment:
- Booking #123
- Amount: 600 Rs
- Status: COMPLETED
- Paid via: UPI on 2026-02-22
```

---

### VerificationApplication

Worker verification documents (background checks, credentials).

| Field | Type | Purpose |
|-------|------|---------|
| `id` | UUID | Unique identifier |
| `userId` | UUID | Foreign key to User (applying worker) |
| `status` | Enum | PENDING, MORE_INFO, APPROVED, REJECTED |
| `submittedAt` | DateTime | When application submitted |
| `reviewedAt` | DateTime? | When admin reviewed |
| `score` | Int? | Admin-assigned verification score |
| `notes` | String? | Worker's notes on why verified |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update |

**Relations:**
- Belongs to `User` (worker)
- Has many `VerificationDocuments`

**Example:**
```
VerificationApplication:
- Worker: John
- Status: PENDING
- Submitted: 2026-02-15
- Awaiting: Admin review of documents
```

---

### VerificationDocument

Individual files uploaded for verification (ID, passport, certificates).

| Field | Type | Purpose |
|-------|------|---------|
| `id` | UUID | Unique identifier |
| `applicationId` | UUID | Foreign key to VerificationApplication |
| `type` | String | Document type (IDENTITY, PROOF_OF_ADDRESS, etc.) |
| `url` | String | Path to uploaded file (in storage) |
| `uploadedAt` | DateTime | Upload timestamp |

**Relations:**
- Belongs to `VerificationApplication`

**Example:**
```
VerificationDocument:
- Application: John's verification
- Type: IDENTITY
- File: /uploads/verification-docs/john-id-photo.jpg
```

---

### VerificationMedia

Additional media (photos, videos) for verification.

| Field | Type | Purpose |
|-------|------|---------|
| `id` | UUID | Unique identifier |
| `applicationId` | UUID | Foreign key to VerificationApplication |
| `type` | String | Media type (PHOTO, VIDEO, etc.) |
| `url` | String | Path to media file |
| `uploadedAt` | DateTime | Upload timestamp |

**Relations:**
- Belongs to `VerificationApplication`

**Example:**
```
VerificationMedia:
- Application: John's verification
- Type: PHOTO
- File: /uploads/verification-docs/john-selfie-video.mp4
```

---

## 3) Relationships (How Tables Connect)

```
┌─────────────────────────────────────────────────────────────┐
│                        USER (Central Hub)                    │
│ (CUSTOMER, WORKER, ADMIN)                                   │
└────────┬─────────┬─────────────┬──────────────┬──────────────┘
         │         │             │              │
         │ (1:1)   │             │              │
         ▼         │          (1:M)             │ (1:M)
    WORKER        │             ▼              │
    PROFILE       │        REVIEW         VERIFICATION
         │        │      (customer's         APPLICATION
         │        │       feedback)               │
         │        │                              │
    (M:M) │       │                         (1:M)│
         ▼        │                              ▼
    SERVICE ◄─────┼──────────────────────── VERIFICATION
    (through      │                         DOCUMENT
     WORKER       │
     SERVICE)     │
         │        │
         │        │ (1:M)
         │        ▼
         │    BOOKING (Core Workflow)
         │        │
         │        │ (1:1)
         │        ▼
         │    PAYMENT
         │
         └────────┬─────────────────────────┐
                  │                         │
             (1:M)▼                     (1:M)▼
            BOOKING              BOOKING

       (Customer creates)    (Worker accepts)
```

---

## 4) Key Database Concepts

### Unique Constraints

These fields must be unique (no duplicates):

- **User.email** — Each user has unique email
- **User.mobile** — Each user has unique phone number
- **Service.name** — Service names are unique (e.g., only one "Home Cleaning")

This prevents accidental duplicates.

### Enums (Fixed Values)

Some fields only accept specific values:

- **User.role**: CUSTOMER, WORKER, ADMIN
- **Booking.status**: PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED
- **Booking.cancelledBy**: CUSTOMER, WORKER, ADMIN
- **Payment.status**: PENDING, COMPLETED, FAILED
- **VerificationApplication.status**: PENDING, MORE_INFO, APPROVED, REJECTED
- **Review.rating**: 1, 2, 3, 4, 5

### Foreign Keys

A foreign key is a reference to another table's primary key.

**Example:**
```
Booking.customerId references User.id
↓
If User #123 is deleted, all their bookings must be handled (delete or orphan)
```

### Timestamps

Every table has `createdAt` and `updatedAt`:
- `createdAt`: Set once, never changes (when record created)
- `updatedAt`: Changes every time record is modified

**Use:**
```
Get all users created in the last 7 days: WHERE createdAt >= now() - interval 7 day
Get top-rated workers: ORDER BY updatedAt DESC LIMIT 10
```

---

## 5) Common Queries (How Data is Fetched)

All queries use **Prisma**, which generates safe SQL automatically.

### Get a User with Their Worker Profile

```javascript
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    workerProfile: true, // Fetch related worker data
  },
});
```

### Get All Pending Bookings for a Worker

```javascript
const bookings = await prisma.booking.findMany({
  where: {
    workerId: workerId,
    status: 'PENDING',
  },
  include: {
    service: true,
    customer: true,
  },
});
```

### Get Worker with Their Services and Average Rating

```javascript
const worker = await prisma.workerProfile.findUnique({
  where: { id: workerId },
  include: {
    services: {
      include: { service: true },
    },
    reviews: true, // To calculate avg rating
  },
});

const avgRating = worker.reviews.length > 0
  ? worker.reviews.reduce((sum, r) => sum + r.rating, 0) / worker.reviews.length
  : 0;
```

### Get All Completed Bookings with Reviews

```javascript
const completedBookings = await prisma.booking.findMany({
  where: {
    status: 'COMPLETED',
  },
  include: {
    reviews: true,
    service: true,
    customer: true,
    workerProfile: true,
  },
});
```

---

## 6) Data Flow Examples

### Scenario 1: Customer Books a Service

```
1. Frontend: Customer selects "Home Cleaning" → clicks Book
2. API: POST /api/bookings { serviceId, workerId, scheduledAt }
3. Backend Controller: Validates request
4. Backend Service: Calls Prisma
   → INSERT INTO Booking (customerId, serviceId, workerId, status='PENDING', ...)
5. Database: Creates new Booking record
6. Response: Returns booking { id, status: 'PENDING', ... }
7. Socket.IO: Broadcasts 'booking:created' to worker rooms
8. Worker's App: Receives event → displays notification
```

### Scenario 2: Worker Completes Job

```
1. Frontend: Worker enters completion OTP
2. API: PATCH /api/bookings/:id { status: 'COMPLETED', completionOTP, completionPhotos }
3. Backend: Verifies OTP matches
4. Backend Service: Calls Prisma
   → UPDATE Booking SET status='COMPLETED', completionVerifiedAt=now(), ...
5. Database: Updates Booking record
6. Backend: May auto-create Payment record (if payment integration exists)
7. Response: Returns updated booking { status: 'COMPLETED', ... }
8. Socket.IO: Broadcasts 'booking:status_updated' to customer room
9. Customer's App: Shows "Job completed" → can now leave review
10. Customer Reviews: Creates Review record (rating, comment)
```

### Scenario 3: Admin Reviews Worker Verification

```
1. Admin sees pending VerificationApplication
2. Admin reviews VerificationDocuments (photos, PDFs)
3. Admin clicks "Approve"
4. API: PATCH /api/verification/applications/:id { status: 'APPROVED' }
5. Backend: Updates VerificationApplication
   → UPDATE VerificationApplication SET status='APPROVED', reviewedAt=now()
   → UPDATE WorkerProfile SET isVerified=true WHERE userId=...
6. Database: Updates both records
7. Worker's account is now verified ✓
8. Worker can now appear in search results, accept jobs, etc.
```

---

## 7) Database Migrations

Migrations are version-controlled changes to the database schema.

**Location:** `server/prisma/migrations/`

**When to Use:**
- Adding a new column to a table
- Changing a field type
- Adding or removing relationships
- Creating new tables

**How It Works:**

```bash
# 1. Modify schema.prisma
nano server/prisma/schema.prisma
# (e.g., add a new field: workerLicense String?)

# 2. Create migration
npx prisma migrate dev --name add_worker_license

# 3. This auto-generates SQL and updates database
# A new folder appears in migrations/ with timestamp + name
# e.g., 20260217_add_worker_license/migration.sql

# 4. Commit to version control
git add server/prisma/migrations/
git commit -m "feat: add worker license verification field"
```

**Example Migration File:**
```sql
-- server/prisma/migrations/20260217_add_worker_license/migration.sql

ALTER TABLE "WorkerProfile" ADD COLUMN "licenseNumber" TEXT;
ALTER TABLE "WorkerProfile" ADD COLUMN "licenseExpiry" TIMESTAMP(3);
ALTER TABLE "WorkerProfile" ADD CONSTRAINT "WorkerProfile_licenseNumber_key" UNIQUE ("licenseNumber");
```

---

## 8) Accessing the Database Safely

### ✅ ALWAYS Use Prisma (Safe)

```javascript
// Good: Prisma prevents SQL injection
const user = await prisma.user.findUnique({
  where: { email: userInput },
});
```

### ❌ NEVER Use Raw Queries Unless Necessary

```javascript
// Bad: Vulnerable to SQL injection
const user = await prisma.$queryRaw(
  `SELECT * FROM User WHERE email = '${userInput}'`
);

// Better if you must:
const user = await prisma.$queryRaw`
  SELECT * FROM User WHERE email = ${userInput}
`;
```

### Data Sanitization

Prisma automatically:
- Escapes strings to prevent SQL injection
- Validates field types before INSERT/UPDATE
- Enforces unique constraints
- Enforces foreign keys

---

## 9) Database Performance Tips

### Indexes (Speed Up Queries)

Frequent queries should use indexed columns:

```prisma
model User {
  id    String  @id @default(cuid())
  email String  @unique  // Indexed for fast lookups
  mobile String @unique  // Indexed
  role  Role    // Useful to index if filtering often
}

model Booking {
  workerId String  // Should be indexed for "get worker's bookings"
  status   String  // Should be indexed for "get PENDING bookings"
}
```

### N+1 Query Problem (Avoid)

**Bad:**
```javascript
const users = await prisma.user.findMany();
for (const user of users) {
  const profile = await prisma.workerProfile.findUnique({
    where: { userId: user.id },
  });
  // ❌ This runs separate query for EACH user!
}
```

**Good:**
```javascript
const users = await prisma.user.findMany({
  include: { workerProfile: true }, // Fetch all in ONE query
});
```

---

## 10) Database Backup & Recovery

### Regular Backups

Your database provider (AWS, Railway, Render, etc.) should automatically backup daily.

### Manual Backup (Local Dev)

```bash
# PostgreSQL dump to file
pg_dump $DATABASE_URL > backup.sql

# Restore from backup
psql $DATABASE_URL < backup.sql
```

### Testing with Seed Data

```bash
# Populate DB with test data (defined in server/prisma/seed.js)
npx prisma db seed

# Reset database (WARNING: deletes all data!)
npx prisma migrate reset
```

---

## 11) Common Database Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "Foreign key constraint failed" | Trying to delete user with bookings | Delete bookings first, or cascade delete |
| "Unique constraint failed" | Email/mobile already exists | Check input, handle duplicate error |
| "Column not found" | Schema mismatch (forgot to migrate) | Run `npx prisma migrate dev` |
| "Database connection timeout" | Server down or network issue | Check `DATABASE_URL`, test connectivity |
| "Prisma ORM out of sync" | schema.prisma doesn't match actual DB | Run `npx prisma db push` or `npx prisma migrate reset` |

---

## 12) Monitoring & Debugging

### Check Live Queries

```bash
# In PostgreSQL client
SELECT * FROM pg_stat_statements ORDER BY total_time DESC;
```

### Prisma Debug Logs

```bash
# Enable debug logging
DEBUG=prisma:* npm run dev
```

### Database Size

```bash
# Check how much space database uses
SELECT pg_size_pretty(pg_database_size('urbanpro_db'));
```

---

## 13) Summary

| Concept | Purpose |
|---------|---------|
| **Tables** | Store data (Users, Bookings, etc.) |
| **Relationships** | Connect tables (User has many Bookings) |
| **Enums** | Restrict values (status = PENDING or CONFIRMED only) |
| **Foreign Keys** | Enforce data integrity |
| **Timestamps** | Track when records created/updated |
| **Migrations** | Version-control schema changes |
| **Prisma** | Safe ORM to query database |
| **Indexing** | Speed up common queries |

**Golden Rules:**
1. Always use Prisma to query (never raw SQL).
2. Use `include:` to avoid N+1 queries.
3. Backup regularly.
4. Run migrations before deploying.
5. Test with seed data before production.

---

## 14) Next Steps

- Read `server/prisma/schema.prisma` for the complete, live schema.
- Check `server/prisma/migrations/` to see all historical changes.
- Run `npx prisma studio` to visually browse the database.
- Review `server/src/modules/*/service.js` files to see real Prisma usage.

