# ExpertsHub — Complete Project Analysis & Roadmap

> **Analysis Date:** 2026-04-05  
> **Scope:** Full-stack analysis of client (React/Vite), server (Express/Prisma), AI agent layer, and infrastructure  
> **Purpose:** Identify every broken, missing, and improvable aspect of the project with actionable fixes

---

## Table of Contents

1. [Unnecessary Files Removed](#1-unnecessary-files-removed)
2. [Implemented But Broken / Not Working Properly](#2-implemented-but-broken--not-working-properly)
3. [Missing & Necessary Features to Implement](#3-missing--necessary-features-to-implement)
4. [Performance & Robustness Improvements](#4-performance--robustness-improvements)
5. [Frontend Modification Suggestions](#5-frontend-modification-suggestions)
6. [Backend Update Suggestions](#6-backend-update-suggestions)
7. [AI Agent Layer Suggestions](#7-ai-agent-layer-suggestions)

---

## 1. Unnecessary Files Removed

The following files/directories were removed from the project as they served no purpose in production or development:

| Removed Path | Reason |
|---|---|
| `/tmp/` (root) | Empty temp directory |
| `/server/tmp/` | Contained only a stale AI session JSON |
| `/client/dist/` | Build output (should be generated fresh, not stored in repo) |
| `/client/dev-dist/` | Vite PWA dev-time service worker — regenerated automatically |
| `/server/reports/` | **58 old AI test report files** — duplicated timestamped JSON/MD debugging logs |
| `/server/admin-full-latest.txt` | Debug log artifact |
| `/server/admin-layer-full.latest.log` | Debug log artifact |
| `/server/ai-role-prompt-matrix.latest.log` | Debug log artifact |
| `/server/verification_link.txt` | Hardcoded test verification token — **security risk** |
| `/client/src/pages/profile/CustomerProfilePage_v1.jsx` | Old backup copy of profile page |
| `/client/src/config/check_en.js`, `check_en.mjs`, `compare_en_mr.mjs`, `debug_resources.mjs`, `eval_resources.mjs`, `fill_translations.mjs`, `find_hindi.mjs`, `fix_i18n.cjs`, `i18n.fixed.js`, `robust_fixer.mjs`, `search_hindi.mjs`, `search_keys.mjs`, `search_keys_v2.mjs`, `search_results.txt`, `strict_check_en.mjs`, `update_i18n_v3-v11.cjs` (9 files) | **24 debug/one-off i18n scripts** that were scratch tools — never imported anywhere |
| `/supabase/` | Contains only placeholder Deno function stubs (`cache-relay`, `health`) with no actual logic — project uses Express backend, not Supabase Edge Functions |
| Root `/package.json` + `/package-lock.json` + `/node_modules/` | Only declared `sharp` and `winston` — both already exist in `/server/package.json`. Root package.json caused confusion and redundant installs |

> [!IMPORTANT]
> The `/docs/` folder was **preserved** as requested.

---

## 2. Implemented But Broken / Not Working Properly

### 2.1 — PWA Service Worker Registration Fails in Dev

**Symptom:** `Failed to resolve import 'virtual:pwa-register/react'` on dev server startup.

**Root Cause:** [PWAReloadPrompt.jsx](file:///d:/mini_project/ExpertsHub/client/src/components/features/pwa/PWAReloadPrompt.jsx) imports `virtual:pwa-register/react`, which is a virtual module provided by `vite-plugin-pwa`. The current `vite.config.js` uses `strategies: 'injectManifest'` which doesn't expose `virtual:pwa-register/react` — it uses `virtual:pwa-register` (plain).

**Absolute Fix:**
```diff
// client/src/components/features/pwa/PWAReloadPrompt.jsx
- import { useRegisterSW } from 'virtual:pwa-register/react';
+ // Option A: If using injectManifest strategy, implement manual registration
+ import { registerSW } from 'virtual:pwa-register';
+ import { useState, useEffect } from 'react';
+
+ export function PWAReloadPrompt() {
+   const [needRefresh, setNeedRefresh] = useState(false);
+   const [updateSW, setUpdateSW] = useState(null);
+
+   useEffect(() => {
+     const update = registerSW({
+       onNeedRefresh() { setNeedRefresh(true); },
+       onOfflineReady() { /* optional toast */ },
+     });
+     setUpdateSW(() => update);
+   }, []);
+   // ... rest of component
+ }
```

**Or** change `vite.config.js` strategy to `'generateSW'` if you don't need custom service worker logic:
```diff
// vite.config.js
  VitePWA({
-   strategies: 'injectManifest',
-   srcDir: 'src',
-   filename: 'sw.js',
+   strategies: 'generateSW',
    registerType: 'autoUpdate',
```

---

### 2.2 — `waitForWorkerAcceptance()` Polling Blocks Node.js Event Loop

**Symptom:** When an open booking is created, `autoAssignWorker()` runs in background but calls `waitForWorkerAcceptance()` which polls the DB every 5 seconds for up to 5 minutes per worker. With multiple candidates, this can run for 25+ minutes, holding a Promise chain and repeatedly hitting the database.

**Root Cause:** [booking.service.js L82-107](file:///d:/mini_project/ExpertsHub/server/src/modules/bookings/booking.service.js#L82-L107) uses a `while` loop with `setTimeout` inside — this is a polling pattern that's inherently inefficient and doesn't scale.

**Absolute Fix:**
Replace polling with **event-driven acceptance** via Socket.IO:

```javascript
// server/src/modules/bookings/booking.service.js
async function waitForWorkerAcceptance(bookingId, workerId, timeoutMs) {
  return new Promise((resolve) => {
    const { getIo } = require('../../socket');
    const io = getIo();
    const timeoutHandle = setTimeout(() => {
      io.removeAllListeners(`booking:${bookingId}:accepted`);
      resolve(false);
    }, timeoutMs);

    // Listen for the worker's acceptance event
    io.once(`booking:${bookingId}:accepted`, (acceptedWorkerId) => {
      clearTimeout(timeoutHandle);
      resolve(acceptedWorkerId === workerId);
    });
  });
}
```

And emit the event when worker accepts:
```javascript
// In booking.controller.js — acceptBooking handler:
io.emit(`booking:${bookingId}:accepted`, workerProfileId);
```

---

### 2.3 — `BookingFrequency` Enum Missing from Prisma Schema

**Symptom:** `schema.prisma` references `BookingFrequency` enum on the `Booking.frequency` field, but the actual `enum BookingFrequency` declaration is **never defined**. This causes `prisma migrate dev` to fail.

**Root Cause:** [schema.prisma L376](file:///d:/mini_project/ExpertsHub/server/prisma/schema.prisma#L376) uses `BookingFrequency @default(ONE_TIME)` but the enum type block is absent from the file.

**Absolute Fix:**
Add the enum before the Booking model:
```prisma
enum BookingFrequency {
  ONE_TIME
  DAILY
  WEEKLY
  BIWEEKLY
  MONTHLY
}
```

---

### 2.4 — `i18n.js` Config File Is 130KB — Contains All Translations Inline

**Symptom:** Extremely slow Hot Module Replacement (HMR), high memory usage in dev. The client's build memory was increased to 12GB (`--max-old-space-size=12288`) as a workaround.

**Root Cause:** [client/src/config/i18n.js](file:///d:/mini_project/ExpertsHub/client/src/config/i18n.js) is a single ~130KB file containing the full i18next initialization plus **all** English and Marathi translation strings inline.

**Absolute Fix:**
Split translations into separate JSON files:
```
client/src/locales/
  en/translation.json
  mr/translation.json
```

Then configure i18next with `i18next-http-backend` or static imports:
```javascript
// client/src/config/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en/translation.json';
import mr from '../locales/mr/translation.json';

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, mr: { translation: mr } },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
```

This reduces the core config file from 130KB to ~500 bytes and makes HMR instant.

---

### 2.5 — AI Service File Is 4,000 Lines / 138KB — Unmaintainable Monolith

**Symptom:** Any change to the AI agent layer requires editing a single massive file. IDE autocomplete is slow. Debugging is very difficult.

**Root Cause:** [server/src/modules/ai/service.js](file:///d:/mini_project/ExpertsHub/server/src/modules/ai/service.js) contains **everything**: intent detection, text extraction, NLP parsing, booking logic, admin flow, worker flow, customer flow, response formatting, session management — all in one file.

**Absolute Fix:**
Refactor into a modular structure:
```
server/src/modules/ai/
  service.js              → Entry point, orchestrator only (~200 lines)
  intentDetector.js       → detectIntent(), isBookingRequest(), etc.
  textExtractors.js       → extractTime(), extractOtp(), extractRating(), etc.
  flowHandlers/
    customerFlow.js       → handleCustomerMessage()
    workerFlow.js         → handleWorkerMessage()
    adminFlow.js          → handleAdminMessage()
  responseBuilder.js      → toTextResponse(), toConfirmResponse(), etc.
  promptBuilder.js        → buildSystemPrompt(), buildRoleMatrix()
  sanitizer.js            → sanitizeLlmInput(), normalizeText()
  contextManager.js       → getUserContext(), updateUserContextAfterExecution()
```

Each module exports pure functions. The main `service.js` imports and composes them.

---

### 2.6 — No Proper Error Handling in Socket.IO Room Join Queries

**Symptom:** If `prisma.booking.findUnique()` throws (e.g., DB connection lost), the `joinRoom` handler silently swallows the error. The user gets no feedback.

**Root Cause:** [socket.js L122-233](file:///d:/mini_project/ExpertsHub/server/src/socket.js#L122-L233) — each `joinRoom` branch makes async DB calls but has no `try/catch`.

**Absolute Fix:**
Wrap the entire `joinRoom` handler:
```javascript
socket.on('joinRoom', async (room) => {
  try {
    // ... existing room join logic
  } catch (err) {
    console.error(`Socket ${socket.id} joinRoom error for "${room}":`, err.message);
    socket.emit('error', { message: 'Could not join room. Please try again.' });
  }
});
```

---

### 2.7 — Customer Duplicate `Pagination.jsx` Components

**Symptom:** Two `Pagination.jsx` files exist — one at [components/common/Pagination.jsx](file:///d:/mini_project/ExpertsHub/client/src/components/common/Pagination.jsx) and another at [components/ui/Pagination.jsx](file:///d:/mini_project/ExpertsHub/client/src/components/ui/Pagination.jsx). Inconsistent usage across pages.

**Absolute Fix:**
Keep only `components/ui/Pagination.jsx` (the more complete version) and update all imports:
```javascript
// Before
import { Pagination } from '../components/common/Pagination';
// After
import { Pagination } from '../components/ui';
```

Then delete `components/common/Pagination.jsx`.

---

### 2.8 — Root `package.json` Caused Dependency Confusion

**Symptom:** The root `package.json` only contained `sharp` and `winston` — both already declared in `server/package.json`. Running `npm install` at root installs a separate `node_modules/` folder with 29KB of lockfile overhead.

**Note:** This has been **already fixed** — the root `package.json`, `package-lock.json`, and root `node_modules/` have been removed.

---

### 2.9 — `platformCommission` and `workerPayoutAmount` Never Calculated

**Symptom:** When a booking is created, `platformCommission` and `workerPayoutAmount` fields in the Booking model remain `null`. Workers don't know their actual earnings.

**Root Cause:** [booking.service.js L537-579](file:///d:/mini_project/ExpertsHub/server/src/modules/bookings/booking.service.js#L537-L579) — the `createBooking` function calculates `totalPrice` via dynamic pricing, but never sets `platformCommission` or `workerPayoutAmount`.

**Absolute Fix:**
After calculating `pricing`, compute commission:
```javascript
const commissionRate = service.commissionRate || 15.0; // Default 15%
const totalAfterCoupon = appliedCoupon
  ? Math.max(0, Number(pricing.totalPrice) - appliedCoupon.discountAmount)
  : Number(pricing.totalPrice);
const platformCommission = (totalAfterCoupon * commissionRate) / 100;
const workerPayoutAmount = totalAfterCoupon - platformCommission;

// In tx.booking.create data:
platformCommission: platformCommission,
workerPayoutAmount: workerPayoutAmount,
```

---

### 2.10 — SMS and WhatsApp Services Are Stubbed

**Symptom:** `sms.service.js` and `whatsapp.service.js` are imported and called throughout the codebase, but they contain only placeholder implementations that log to console.

**Root Cause:** These were designed as notification channels but never connected to actual providers (e.g., Twilio, MSG91, WhatsApp Business API).

**Absolute Fix (for now):**
Add a clear flag and graceful degradation:
```javascript
// server/src/modules/notifications/sms.service.js
const SMS_ENABLED = Boolean(process.env.SMS_PROVIDER_API_KEY);

class SMSService {
  static async send(phone, message) {
    if (!SMS_ENABLED) {
      console.log(`[SMS_STUB] Would send to ${phone}: ${message}`);
      return { success: true, stubbed: true };
    }
    // Actual Twilio/MSG91 implementation here
  }
}
```

---

## 3. Missing & Necessary Features to Implement

### 3.1 — No Webhook Handler for Razorpay Payments

**Current State:** The server has `rawBody` capture configured in `index.js` for `/api/payments/webhook`, but there is no actual webhook route handler in `payment.routes.js`.

**Why It's Critical:** Without a webhook, payment status updates (successful payments, refunds, failures) from Razorpay are never received by the server. Bookings stay as `PENDING` payment even after users pay.

**Absolute Proper Way to Implement:**
```javascript
// server/src/modules/payments/payment.routes.js
const { paymentWebhookLimiter } = require('../../config/rateLimit');

router.post('/webhook', paymentWebhookLimiter, async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return res.status(500).json({ error: 'Webhook not configured' });
  
  const signature = req.headers['x-razorpay-signature'];
  const body = req.rawBody;
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  
  if (!crypto.timingSafeEqual(
    Buffer.from(signature), Buffer.from(expectedSignature)
  )) {
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const event = JSON.parse(body);
  
  switch (event.event) {
    case 'payment.captured':
      await handlePaymentCaptured(event.payload.payment.entity);
      break;
    case 'payment.failed':
      await handlePaymentFailed(event.payload.payment.entity);
      break;
    case 'refund.processed':
      await handleRefundProcessed(event.payload.refund.entity);
      break;
  }
  
  res.json({ status: 'ok' });
});
```

---

### 3.2 — No Worker Acceptance/Rejection Flow for Bookings

**Current State:** Workers receive booking offers via socket `booking:offered`, but there's no endpoint for workers to accept or reject bookings.

**Why It's Critical:** The entire auto-assignment system (`autoAssignWorker`, `waitForWorkerAcceptance`) relies on workers accepting bookings, but there's no API route for this action.

**Absolute Proper Way to Implement:**
```javascript
// server/src/modules/bookings/booking.routes.js
router.post('/:id/accept', authenticate, requireRole('WORKER'), async (req, res) => {
  const booking = await bookingService.acceptBooking(req.params.id, req.user.id);
  res.json({ success: true, booking });
});

router.post('/:id/reject', authenticate, requireRole('WORKER'), async (req, res) => {
  await bookingService.rejectBooking(req.params.id, req.user.id, req.body.reason);
  res.json({ success: true });
});
```

And in `booking.service.js`:
```javascript
async function acceptBooking(bookingId, userId) {
  const workerProfile = await requireWorkerProfile(userId);
  
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new AppError(404, 'Booking not found');
    if (booking.offeredToWorkerId !== workerProfile.id) {
      throw new AppError(403, 'This booking was not offered to you');
    }
    if (booking.status !== 'PENDING') {
      throw new AppError(400, 'Booking can no longer be accepted');
    }
    
    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: {
        workerProfileId: workerProfile.id,
        status: 'CONFIRMED',
        offeredToWorkerId: null,
      },
    });
    
    // Emit socket event for auto-assignment listener
    const { getIo } = require('../../socket');
    getIo().emit(`booking:${bookingId}:accepted`, workerProfile.id);
    
    return updated;
  });
}
```

---

### 3.3 — No Email Actually Sent for Verification / Password Reset

**Current State:** The `mailer.js` utility is comprehensive (supports SMTP, Resend, SendGrid), but the `auth.controller.js` registration flow doesn't call `sendVerificationEmail()` after generating the token.

**Why It's Critical:** Users register but never receive verification emails. The token is generated and stored in DB, but the actual email dispatch call is missing.

**Absolute Proper Way to Implement:**
In `auth.controller.js`, after `registerUser()`:
```javascript
const { sendVerificationEmail } = require('../../common/utils/mailer');

// After registration:
const verificationLink = `${FRONTEND_URL}/verify-email?token=${result.verificationToken}`;

// Non-blocking email send (don't block the response)
sendVerificationEmail({ to: result.user.email, link: verificationLink })
  .then(() => logger.info(`Verification email sent to ${result.user.email}`))
  .catch((err) => logger.error('Failed to send verification email:', err));
```

Similarly for password reset in `requestPasswordReset()`:
```javascript
const { sendPasswordResetEmail } = require('../../common/utils/mailer');

// After creating reset token:
sendPasswordResetEmail({ to: recipientEmail, link: resetLink })
  .catch((err) => logger.error('Failed to send password reset email:', err));
```

---

### 3.4 — No Input Sanitization / XSS Prevention on Client

**Current State:** User inputs (names, addresses, review comments, chat messages) are rendered directly without sanitization.

**Why It's Critical:** Stored XSS attacks — a malicious user could inject `<script>` tags in their name, review comments, or chat messages that execute when rendered by other users.

**Absolute Proper Way to Implement:**
1. Server-side — sanitize all string inputs:
```javascript
// server/src/common/utils/sanitize.js
const sanitizeHtml = (str) => String(str || '')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#x27;')
  .replace(/\//g, '&#x2F;');

module.exports = { sanitizeHtml };
```

2. Apply in validation schemas:
```javascript
// In auth.schemas.js, booking.schemas.js, etc.
name: z.string().transform(sanitizeHtml),
```

3. React already escapes JSX content by default, but avoid `dangerouslySetInnerHTML` anywhere.

---

### 3.5 — No Database Indexing for Chat Messages Search

**Current State:** `Message` model has indexes on `conversationId` and `senderId`, but no full-text search capability.

**Why It's Critical:** As chat volume grows, searching messages becomes extremely slow.

**Absolute Proper Way to Implement:**
Add a PostgreSQL GIN index for full-text search:
```prisma
model Message {
  // ... existing fields
  @@index([conversationId, createdAt])
}
```

And in the migration SQL:
```sql
CREATE INDEX messages_content_trgm ON "Message" USING gin (content gin_trgm_ops);
```

---

### 3.6 — No Booking Cancellation Refund Flow

**Current State:** Bookings can be cancelled with `cancellationPenaltyPercent` calculated, but **no actual refund** is initiated. The payment remains as `PAID` in the database.

**Absolute Proper Way to Implement:**
```javascript
// server/src/modules/bookings/booking.service.js
async function cancelBookingWithRefund(bookingId, userId, role, reason) {
  const booking = await getBookingById(bookingId, userId, role);
  
  if (['COMPLETED', 'CANCELLED'].includes(booking.status)) {
    throw new AppError(400, 'Cannot cancel a completed or already cancelled booking.');
  }
  
  // Calculate refund based on cancellation policy
  const penaltyPercent = calculateCancellationPenalty(booking);
  const refundAmount = booking.paymentStatus === 'PAID'
    ? Number(booking.totalPrice) * ((100 - penaltyPercent) / 100)
    : 0;
  
  return prisma.$transaction(async (tx) => {
    // Update booking status
    await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        cancellationReason: reason,
        cancellationPenaltyPercent: penaltyPercent,
        paymentStatus: refundAmount > 0 ? 'REFUNDED' : booking.paymentStatus,
      },
    });
    
    // If refund needed, initiate via Razorpay
    if (refundAmount > 0 && booking.paymentReference) {
      const razorpay = getRazorpayClient();
      await razorpay.payments.refund(booking.paymentReference, {
        amount: Math.round(refundAmount * 100), // paise
        notes: { bookingId: String(bookingId), reason },
      });
    }
    
    // Credit worker's wallet back (deduct the pending payout)
    if (booking.workerProfile && booking.workerPayoutAmount) {
      await tx.workerProfile.update({
        where: { id: booking.workerProfileId },
        data: {
          walletBalance: { decrement: booking.workerPayoutAmount },
        },
      });
    }
  });
}
```

---

### 3.7 — No Admin Logging / Audit Trail for Admin Actions

**Current State:** Admin can update user status, delete users, manage services, etc. but none of these actions are logged.

**Absolute Proper Way to Implement:**
Create an `AdminAuditLog` model:
```prisma
model AdminAuditLog {
  id        Int      @id @default(autoincrement())
  adminId   Int
  action    String    // e.g., "DELETE_USER", "UPDATE_SERVICE"
  targetId  Int?      // ID of the affected entity
  targetType String?  // e.g., "User", "Service", "Coupon"
  details   Json?     // Before/after snapshot
  ipAddress String?
  createdAt DateTime @default(now())

  @@index([adminId])
  @@index([action, createdAt])
}
```

And middleware:
```javascript
function logAdminAction(action) {
  return async (req, res, next) => {
    res.on('finish', async () => {
      if (res.statusCode < 400) {
        await prisma.adminAuditLog.create({
          data: {
            adminId: req.user.id,
            action,
            targetId: Number(req.params.id) || null,
            details: req.body,
            ipAddress: req.ip,
          },
        });
      }
    });
    next();
  };
}
```

---

### 3.8 — No Proper Session Invalidation on Password Change

**Current State:** When a user changes their password, old JWT tokens remain valid until they expire. A compromised token continues to work.

**Absolute Proper Way to Implement:**
Add a `tokenVersion` field to the User model:
```prisma
model User {
  // ... existing fields
  tokenVersion Int @default(0)
}
```

Include `tokenVersion` in JWT payload:
```javascript
const token = signJwt({ id: user.id, role: user.role, v: user.tokenVersion });
```

In auth middleware, verify version:
```javascript
const user = await prisma.user.findUnique({ where: { id: payload.id } });
if (user.tokenVersion !== payload.v) {
  return res.status(401).json({ error: 'Session expired' });
}
```

On password change, increment `tokenVersion`:
```javascript
await prisma.user.update({
  where: { id: userId },
  data: { passwordHash, tokenVersion: { increment: 1 } },
});
```

---

### 3.9 — No File Size / Type Validation for Uploads

**Current State:** [upload.routes.js](file:///d:/mini_project/ExpertsHub/server/src/modules/uploads/upload.routes.js) has multer configured but there's no strict validation of file types and sizes per upload category.

**Absolute Proper Way to Implement:**
```javascript
const UPLOAD_CONFIGS = {
  'profile-photos': {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  'verification-docs': {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
  },
  'chat-attachments': {
    maxSize: 15 * 1024 * 1024, // 15MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'audio/mpeg', 'audio/webm'],
  },
};

const fileFilter = (category) => (req, file, cb) => {
  const config = UPLOAD_CONFIGS[category];
  if (!config) return cb(new Error('Invalid upload category'));
  if (!config.allowedTypes.includes(file.mimetype)) {
    return cb(new Error(`File type ${file.mimetype} not allowed`));
  }
  cb(null, true);
};
```

---

### 3.10 — No Booking Invoice Generation

**Current State:** `invoice.service.js` and `invoice.routes.js` exist but are disconnected — invoices are never auto-generated upon booking completion.

**Absolute Proper Way to Implement:**
In the booking completion flow (`updateBookingStatus` when status → `COMPLETED`):
```javascript
if (newStatus === 'COMPLETED') {
  // Auto-generate invoice
  const { generateInvoice } = require('../invoices/invoice.service');
  await generateInvoice(bookingId);
}
```

---

## 4. Performance & Robustness Improvements

### 4.1 — Add Database Connection Pooling Configuration

**Current State:** Prisma uses default connection pool settings. Under load, connections may be exhausted.

**Absolute Fix:**
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")  // For migrations
}

generator client {
  provider = "prisma-client-js"
  // Connection pool size (default is 2 * CPU cores + 1)
  // Set explicitly for production
}
```

And in the connection URL, add pooling parameters:
```
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public&connection_limit=20&pool_timeout=30"
```

---

### 4.2 — Add Redis Caching for Frequently Accessed Data

**Current State:** Redis is configured but barely used. Every API call hits the database directly.

**What to Cache:**
| Data | TTL | Reason |
|---|---|---|
| Service list | 5 min | Rarely changes, queried on every page load |
| Worker profiles for service pages | 2 min | Frequently viewed |
| User notification count | 30 sec | Checked on every page navigation |
| Dashboard statistics (admin) | 1 min | Expensive aggregate queries |

**Absolute Fix:**
```javascript
// server/src/modules/cache/cache.service.js
const redis = require('../../config/redis');

async function cacheGet(key) {
  const raw = await redis.get(key);
  return raw ? JSON.parse(raw) : null;
}

async function cacheSet(key, data, ttlSeconds = 300) {
  await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
}

async function cacheInvalidate(pattern) {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) await redis.del(...keys);
}
```

---

### 4.3 — Add Request Timeout Middleware

**Current State:** No global request timeout. Slow database queries or crashes in handlers can hang connections indefinitely.

**Absolute Fix:**
```javascript
// server/src/middleware/timeout.js
module.exports = (ms = 30000) => (req, res, next) => {
  res.setTimeout(ms, () => {
    if (!res.headersSent) {
      res.status(503).json({ error: 'Request timed out. Please try again.' });
    }
  });
  next();
};

// In index.js:
app.use(require('./middleware/timeout')(30000));
```

---

### 4.4 — Implement Graceful Degradation for External Services

**Current State:** If Cloudinary, Razorpay, or Groq AI are down, the entire feature crashes.

**Absolute Fix:**
```javascript
// Create a circuit breaker utility
class CircuitBreaker {
  constructor(name, options = {}) {
    this.name = name;
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000;
    this.failures = 0;
    this.lastFailure = 0;
    this.state = 'CLOSED'; // CLOSED (working), OPEN (broken), HALF_OPEN (testing)
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailure > this.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error(`${this.name} circuit is OPEN — service unavailable`);
      }
    }

    try {
      const result = await fn();
      this.failures = 0;
      this.state = 'CLOSED';
      return result;
    } catch (err) {
      this.failures++;
      this.lastFailure = Date.now();
      if (this.failures >= this.failureThreshold) {
        this.state = 'OPEN';
      }
      throw err;
    }
  }
}
```

---

### 4.5 — Add API Response Compression and ETags

**Current State:** `compression()` middleware is applied, but no ETag support for GET responses.

**Absolute Fix:**
```javascript
// Already uses compression, add ETag:
app.set('etag', 'strong');
```

---

### 4.6 — Add Database Query Logging in Development

**Current State:** No visibility into what queries Prisma runs, making debugging slow.

**Absolute Fix:**
```javascript
// server/src/config/prisma.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ]
    : ['error'],
});

if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    if (e.duration > 100) {
      console.warn(`[SLOW QUERY] ${e.duration}ms: ${e.query}`);
    }
  });
}

module.exports = prisma;
```

---

### 4.7 — Add Health Check for All Dependencies

**Current State:** `/health` only returns server uptime. No check for database, Redis, or external services.

**Absolute Fix:**
```javascript
app.get('/health', async (req, res) => {
  const checks = {};
  
  // Database
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: 'ok' };
  } catch (err) {
    checks.database = { status: 'error', message: err.message };
  }
  
  // Redis
  try {
    const redis = require('./config/redis');
    await redis.ping();
    checks.redis = { status: 'ok' };
  } catch (err) {
    checks.redis = { status: 'error', message: err.message };
  }
  
  const allOk = Object.values(checks).every(c => c.status === 'ok');
  
  res.status(allOk ? 200 : 503).json({
    status: allOk ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks,
  });
});
```

---

### 4.8 — Implement Worker Location Broadcast Throttling

**Current State:** Workers update their location via socket, which gets stored in DB. There's no throttling, so a worker's app can send location updates every second.

**Absolute Fix:**
```javascript
// In socket.js, throttle location updates to once every 10 seconds
const locationThrottles = new Map();

socket.on('location:update', async (data) => {
  const key = `loc:${socket.user.id}`;
  const last = locationThrottles.get(key) || 0;
  if (Date.now() - last < 10000) return; // Skip if less than 10s
  locationThrottles.set(key, Date.now());
  
  // Process location update
  await prisma.workerLocation.upsert({
    where: { workerProfileId: data.workerProfileId },
    update: { latitude: data.lat, longitude: data.lng, lastUpdated: new Date() },
    create: { workerProfileId: data.workerProfileId, latitude: data.lat, longitude: data.lng },
  });
});
```

---

## 5. Frontend Modification Suggestions

### 5.1 — Add Global Toast/Notification System

**Current State:** The app uses `sonner` for toasts but there's `toastDeduper.js` utility that adds complexity. Toast behavior is inconsistent across pages.

**Suggestion:**
Create a centralized toast provider:
```jsx
// client/src/components/common/ToastProvider.jsx
import { Toaster } from 'sonner';

export function ToastProvider() {
  return (
    <Toaster 
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        duration: 4000,
        style: { borderRadius: '12px' },
      }}
    />
  );
}
```

Add it once in `App.jsx` and use `toast.success()`, `toast.error()` etc. everywhere consistently.

---

### 5.2 — Add Loading Skeletons Instead of Spinners

**Current State:** Most pages show a full-screen spinner while loading. This is jarring.

**Suggestion:**
Replace loading spinners with skeleton screens that match the layout. The `Skeleton.jsx` component exists but is rarely used.

For each page, create a skeleton variant:
```jsx
// Example: CustomerDashboardSkeleton.jsx
export function CustomerDashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {[1,2,3].map(i => (
        <Skeleton key={i} className="h-32 rounded-xl" />
      ))}
      <Skeleton className="h-64 rounded-xl col-span-full" />
    </div>
  );
}
```

---

### 5.3 — Implement Proper Form Validation Feedback

**Current State:** The app uses `react-hook-form` + `zod`, but error messages are often shown only after submission. No real-time field validation.

**Suggestion:**
Enable `mode: 'onBlur'` or `mode: 'onChange'` in form hooks:
```jsx
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
  mode: 'onBlur', // Validate each field when it loses focus
});
```

And display inline errors with animations:
```jsx
{errors.email && (
  <motion.p 
    initial={{ opacity: 0, y: -5 }} 
    animate={{ opacity: 1, y: 0 }}
    className="text-red-500 text-sm mt-1"
  >
    {errors.email.message}
  </motion.p>
)}
```

---

### 5.4 — Add Offline Capability Indicators

**Current State:** PWA is configured but there's no visual indicator when the user goes offline.

**Suggestion:**
```jsx
// client/src/components/common/OfflineBanner.jsx
import { useState, useEffect } from 'react';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white text-center py-2 z-50">
      ⚠️ You are offline. Some features may not be available.
    </div>
  );
}
```

---

### 5.5 — Implement Dark Mode Properly

**Current State:** `ThemeContext.jsx` exists and toggles a CSS class, but many components don't properly support dark mode — colors are hardcoded.

**Suggestion:**
Define a design token system in `index.css`:
```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --text-primary: #1a1a2e;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
  --accent: #7c3aed;
}

[data-theme="dark"] {
  --bg-primary: #0f0f1a;
  --bg-secondary: #1a1a2e;
  --text-primary: #f0f0f5;
  --text-secondary: #9ca3af;
  --border-color: #2d2d44;
  --accent: #a78bfa;
}
```

Then use CSS variables instead of hardcoded colors throughout all components.

---

### 5.6 — Add Optimistic Updates for Better UX

**Current State:** All mutations wait for server response before updating UI. This makes interactions feel slow.

**Suggestion for booking status and notifications:**
```jsx
// Using React Query's optimistic updates
const cancelMutation = useMutation({
  mutationFn: (bookingId) => cancelBooking(bookingId, reason),
  onMutate: async (bookingId) => {
    await queryClient.cancelQueries(['bookings']);
    const previous = queryClient.getQueryData(['bookings']);
    queryClient.setQueryData(['bookings'], (old) =>
      old.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b)
    );
    return { previous };
  },
  onError: (err, bookingId, context) => {
    queryClient.setQueryData(['bookings'], context.previous);
    toast.error('Failed to cancel booking');
  },
  onSettled: () => queryClient.invalidateQueries(['bookings']),
});
```

---

## 6. Backend Update Suggestions

### 6.1 — Implement Proper API Versioning

**Current State:** All routes are under `/api/*` with no version prefix.

**Suggestion:**
Move all routes under `/api/v1/*`:
```javascript
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/bookings', bookingRoutes);
// etc.

// Keep backward compatibility:
app.use('/api/auth', authRoutes); // Can remove later
```

This allows breaking changes in future versions without disrupting existing clients.

---

### 6.2 — Add Standardized API Response Format

**Current State:** Different endpoints return inconsistent response shapes (`{ data }`, `{ user }`, `{ booking }`, `{ error }`).

**Suggestion:**
```javascript
// server/src/common/utils/apiResponse.js
function success(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  });
}

function error(res, message, statusCode = 500, details = null) {
  return res.status(statusCode).json({
    success: false,
    error: { message, details },
    timestamp: new Date().toISOString(),
  });
}

module.exports = { success, error };
```

---

### 6.3 — Add Database Migrations CI Check

**Current State:** No validation that Prisma migrations are in sync with the schema.

**Suggestion:**
Add to CI/CD pipeline:
```bash
npx prisma migrate diff --from-migrations ./prisma/migrations --to-schema-datamodel ./prisma/schema.prisma --exit-code
```

This fails if there are unapplied schema changes.

---

### 6.4 — Implement Soft Delete for Users

**Current State:** `deleteAdminUser` permanently deletes users and all their related data via cascading deletes.

**Suggestion:**
Change to soft delete:
```prisma
model User {
  // ... existing fields
  deletedAt DateTime?
}
```

Update queries to filter deleted users:
```javascript
// In all user queries
where: { deletedAt: null, ...otherFilters }
```

---

### 6.5 — Add Request Validation Middleware

**Current State:** Each controller manually validates request body. No consistent pattern.

**Suggestion:**
Create a reusable validation middleware:
```javascript
// server/src/middleware/validate.js
const { ZodError } = require('zod');

function validate(schema) {
  return (req, res, next) => {
    try {
      req.validated = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            details: err.errors.map(e => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
        });
      }
      next(err);
    }
  };
}
```

---

### 6.6 — Implement Worker Rating Recalculation

**Current State:** Worker ratings exist but the recalculation logic after a new review is not guaranteed to be atomic.

**Suggestion:**
After each review submission, recalculate in a transaction:
```javascript
await prisma.$transaction(async (tx) => {
  await tx.review.create({ data: reviewData });
  
  const stats = await tx.review.aggregate({
    where: { revieweeId: workerId },
    _avg: { rating: true },
    _count: { rating: true },
  });
  
  await tx.user.update({
    where: { id: workerId },
    data: {
      rating: Math.round(stats._avg.rating * 10) / 10,
      totalReviews: stats._count.rating,
    },
  });
  
  // Also update workerProfile.rating
  const profile = await tx.workerProfile.findUnique({
    where: { userId: workerId },
  });
  if (profile) {
    await tx.workerProfile.update({
      where: { id: profile.id },
      data: {
        rating: Math.round(stats._avg.rating * 10) / 10,
        totalReviews: stats._count.rating,
      },
    });
  }
});
```

---

## 7. AI Agent Layer Suggestions

### 7.1 — Add Conversation Memory with Sliding Window

**Current State:** The AI loads last 6 audit records for context, but doesn't maintain a coherent conversation thread.

**Suggestion:**
Implement a proper sliding window context:
```javascript
// server/src/modules/ai/contextManager.js
class ConversationMemory {
  constructor(maxTurns = 10) {
    this.store = new Map(); // sessionKey → messages[]
    this.maxTurns = maxTurns;
  }

  addTurn(sessionKey, userMessage, assistantMessage) {
    if (!this.store.has(sessionKey)) {
      this.store.set(sessionKey, []);
    }
    const turns = this.store.get(sessionKey);
    turns.push(
      { role: 'user', content: userMessage },
      { role: 'assistant', content: assistantMessage }
    );
    // Keep only last N turns
    if (turns.length > this.maxTurns * 2) {
      turns.splice(0, turns.length - this.maxTurns * 2);
    }
  }

  getHistory(sessionKey) {
    return this.store.get(sessionKey) || [];
  }

  clear(sessionKey) {
    this.store.delete(sessionKey);
  }
}
```

Pass conversation history to LLM calls:
```javascript
const history = memory.getHistory(sessionKey);
const messages = [
  { role: 'system', content: systemPrompt },
  ...history,
  { role: 'user', content: userMessage },
];
```

---

### 7.2 — Implement Intent Confidence Thresholds

**Current State:** The `detectIntent()` function returns the first match based on keyword count. Low-confidence intents can trigger wrong tool calls.

**Suggestion:**
Add confidence scoring with thresholds:
```javascript
function detectIntent(message) {
  const text = normalizeText(message).toLowerCase();
  const wordCount = text.split(/\s+/).length;
  
  const scores = {};
  for (const [intent, keywords] of Object.entries(intentPatterns)) {
    const matches = keywords.filter(k => text.includes(k)).length;
    scores[intent] = matches / Math.max(wordCount, 1); // Normalize by message length
  }
  
  const [bestIntent, bestScore] = Object.entries(scores)
    .sort(([,a], [,b]) => b - a)[0] || [null, 0];
  
  if (bestScore < 0.15) {
    // Low confidence — ask for clarification instead of guessing
    return { intent: null, score: bestScore, confidence: 'low' };
  }
  
  return { intent: bestIntent, score: bestScore, confidence: bestScore > 0.4 ? 'high' : 'medium' };
}
```

---

### 7.3 — Add Prompt Injection Detection

**Current State:** `sanitizeLlmInput()` does basic regex stripping of "ignore/disregard" patterns, but sophisticated prompt injections can bypass this.

**Suggestion:**
Add a multi-layer defense:
```javascript
function detectPromptInjection(text) {
  const patterns = [
    /ignore\s+(all\s+)?previous/i,
    /disregard\s+(all\s+)?instructions/i,
    /you\s+are\s+now\s+a/i,
    /pretend\s+(to\s+be|you\s+are)/i,
    /switch\s+to\s+.*mode/i,
    /\bDAN\b/,
    /act\s+as\s+(if|a)/i,
    /override\s+(system|safety)/i,
    /reveal\s+(your|the)\s+(system|instructions)/i,
  ];
  
  return patterns.some(p => p.test(text));
}

// In the main handler:
if (detectPromptInjection(userMessage)) {
  return toTextResponse({
    sessionId,
    message: "I can only help with bookings, services, and account management. How can I assist you?",
  });
}
```

---

### 7.4 — Implement Fallback LLM Provider

**Current State:** Only Groq is used. If Groq goes down, the entire AI layer fails.

**Suggestion:**
```javascript
// server/src/modules/ai/llmClient.js
const PROVIDERS = [
  { name: 'groq', endpoint: 'https://api.groq.com/...', apiKey: process.env.GROQ_API_KEY },
  { name: 'openai', endpoint: 'https://api.openai.com/...', apiKey: process.env.OPENAI_API_KEY },
];

async function callLlmWithFallback(messages, options = {}) {
  for (const provider of PROVIDERS) {
    if (!provider.apiKey) continue;
    try {
      return await callProvider(provider, messages, options);
    } catch (err) {
      console.warn(`[LLM] ${provider.name} failed: ${err.message}, trying next...`);
    }
  }
  throw new Error('All LLM providers failed');
}
```

---

### 7.5 — Add Rate-Aware AI Response Caching

**Current State:** `apiResponseCache` exists in `stateStore.js` but is only used for tool execution results. Identical queries (e.g., "show my wallet") make fresh API + LLM calls every time.

**Suggestion:**
Cache read-only tool results with very short TTL:
```javascript
const CACHEABLE_TOOLS = new Set([
  'getWallet', 'getBookings', 'getNotifications',
  'getEmergencyContacts', 'getVerificationStatus',
]);

async function executeToolWithCache(toolCall, userContext) {
  if (!CACHEABLE_TOOLS.has(toolCall.toolName)) {
    return executeTool(toolCall);
  }
  
  const cacheKey = `${userContext.userId}:${toolCall.toolName}:${JSON.stringify(toolCall.params)}`;
  const cached = getCachedResponse(cacheKey);
  if (cached) return cached;
  
  const result = await executeTool(toolCall);
  if (result.success) {
    setCachedResponse(cacheKey, result, 30); // 30 second TTL
  }
  return result;
}
```

---

### 7.6 — Add AI Usage Analytics Dashboard

**Current State:** AI audits are stored in `AIActionAudit` table but there's no aggregation view for insights.

**Suggestion:**
Create an analytics endpoint:
```javascript
// server/src/modules/ai/ai.controller.js
async function getAIAnalytics(req, res) {
  const [intentBreakdown, errorRate, avgDuration, topUsers] = await Promise.all([
    prisma.aIActionAudit.groupBy({
      by: ['intent'],
      _count: true,
      orderBy: { _count: { intent: 'desc' } },
      take: 20,
    }),
    prisma.aIActionAudit.aggregate({
      _count: true,
      where: { status: 'FAILED' },
    }),
    prisma.aIActionAudit.aggregate({
      _avg: { durationMs: true },
    }),
    prisma.aIActionAudit.groupBy({
      by: ['userId'],
      _count: true,
      orderBy: { _count: { userId: 'desc' } },
      take: 10,
    }),
  ]);
  
  res.json({ intentBreakdown, errorRate, avgDuration, topUsers });
}
```

---

### 7.7 — Add Multi-Language AI Responses

**Current State:** AI responds only in English. The frontend supports English and Marathi (`i18n`), but the AI layer ignores the user's language preference.

**Suggestion:**
Pass user language to the system prompt:
```javascript
function buildSystemPrompt(role, language = 'en') {
  const langInstruction = language === 'mr'
    ? 'IMPORTANT: Respond in Marathi (मराठी) using Devanagari script.'
    : 'Respond in English.';
  
  return `You are ExpertsHub AI assistant. ${langInstruction}\n${roleSpecificPrompt(role)}`;
}
```

And detect language from user context or browser setting:
```javascript
const userLang = req.headers['accept-language']?.startsWith('mr') ? 'mr' : 'en';
```

---

## Summary of Priority Actions

| Priority | Item | Impact |
|---|---|---|
| 🔴 **P0** | Fix Razorpay webhook handler (3.1) | Payments broken |
| 🔴 **P0** | Fix `BookingFrequency` enum missing (2.3) | DB migrations fail |
| 🔴 **P0** | Fix PWA registration (2.1) | Dev server error |
| 🟠 **P1** | Implement worker accept/reject flow (3.2) | Core booking flow incomplete |
| 🟠 **P1** | Fix commission/payout calculation (2.9) | Workers can't see earnings |
| 🟠 **P1** | Add verification email dispatch (3.3) | Users can't verify |
| 🟠 **P1** | Add cancellation/refund flow (3.6) | No refunds possible |
| 🟡 **P2** | Refactor AI `service.js` monolith (2.5) | Maintainability |
| 🟡 **P2** | Split i18n file (2.4) | Dev performance |
| 🟡 **P2** | Add session invalidation (3.8) | Security |
| 🟡 **P2** | Add Redis caching (4.2) | Performance |
| 🟢 **P3** | Dark mode tokens (5.5) | Design quality |
| 🟢 **P3** | Optimistic updates (5.6) | UX polish |
| 🟢 **P3** | AI conversation memory (7.1) | AI quality |
| 🟢 **P3** | Multi-language AI (7.7) | Regional support |

---

> [!TIP]
> Start with **P0** items first — these are things that will prevent the application from functioning correctly in production. Then move to **P1** which completes the core booking + payment loop. **P2** and **P3** improve quality and polish.
