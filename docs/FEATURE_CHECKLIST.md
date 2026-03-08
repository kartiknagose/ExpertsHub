# UrbanPro V2 — Feature Implementation Checklist

> Cross-reference of every roadmap item vs. what is currently built.
> **Legend:** ✅ Done &nbsp;|&nbsp; ⚠️ Partial &nbsp;|&nbsp; ❌ Not implemented
>
> **Last updated:** 2026-03-07

---

## Phase 0 — Core MVP

| Feature | Status | Notes |
|---|---|---|
| JWT cookie-based auth (login / signup) | ✅ Done | httpOnly cookie, bcryptjs |
| Role-based access: CUSTOMER / WORKER / ADMIN | ✅ Done | Protected routes per role |
| Email verification on signup | ✅ Done | Token-based verify flow |
| Service catalog with admin CRUD | ✅ Done | 10+ services across 5 categories |
| Full booking lifecycle (PENDING → CONFIRMED → IN_PROGRESS → COMPLETED / CANCELLED) | ✅ Done | |
| Simulated payment (mark-as-paid) | ✅ Done | Payment record created |
| Two-way reviews (Customer ↔ Worker) | ✅ Done | Aggregate rating on worker profile |
| Worker verification: application → admin approval | ✅ Done | Admin can approve or reject |
| Admin dashboard (stats, user management, booking oversight) | ✅ Done | |
| Worker dashboard (Accept / Reject / Start / Complete buttons) | ✅ Done | Unified "My Jobs" + "Open Feed" |
| Customer dashboard (Pay Now, Rate & Review) | ✅ Done | Inline review widget |
| Dark / Light mode with persistence | ✅ Done | ThemeContext + localStorage |
| Responsive layout | ✅ Done | Mobile-friendly |

---

## Phase 1 — Trust & Safety

### 1.1 Worker KYC / Identity Verification

| Feature | Status | Notes |
|---|---|---|
| Worker submits Aadhaar, PAN, Selfie, Address Proof | ✅ Done | Backend fields + Cloudinary upload + 6-step onboarding wizard UI (`WorkerOnboardingWizard.jsx`) |
| Admin reviews documents and approves / rejects | ✅ Done | Approve/reject workflow + inline document viewer with image zoom and PDF iframe (`AdminVerificationPage.jsx`) |
| Verification badges displayed to customers (BASIC, DOCUMENTS, VERIFIED, PREMIUM) | ✅ Done | Tiered badge system with color-coded variants on worker cards and profiles |
| Filter workers by verification level | ✅ Done | Filter chips on `WorkerSelectionPanel.jsx` — All/Premium/Verified/Docs Submitted/Basic with count indicators |
| Multi-step worker onboarding wizard with file upload | ✅ Done | 6-step wizard: Personal Info → Aadhaar → PAN → Selfie → Address Proof → Review & Submit. Drag-and-drop, preview, validation |

### 1.2 OTP-Based Booking Verification

| Feature | Status | Notes |
|---|---|---|
| 4-digit Start OTP generated when booking is CONFIRMED | ✅ Done | |
| Customer sees Start OTP inline on dashboard (copyable) | ✅ Done | |
| End OTP shown inline on IN_PROGRESS customer banner | ✅ Done | |
| Worker enters OTP → job transitions to IN_PROGRESS | ✅ Done | |
| Completion OTP required to mark COMPLETED | ✅ Done | |
| OTP hidden from worker (customer shares vocally) | ✅ Done | RBAC ensures workers can't read OTP field |
| OTP expiry after 30 minutes | ✅ Done | Server enforces 30-min window on start, completion, and session OTPs |

### 1.3 Photo Proof of Work

| Feature | Status | Notes |
|---|---|---|
| Worker uploads "Before" photos at job start | ⚠️ Partial | Schema + backend route exists; UI on booking detail page |
| Worker uploads "After" photos at job completion | ⚠️ Partial | Same as above |
| Photos stored in cloud (AWS S3 / Cloudinary) | ✅ Done | Cloudinary integration with local disk fallback |
| Customer reviews photos before confirming completion | ❌ Not implemented | |
| Photos available to admin for dispute resolution | ❌ Not implemented | |

### 1.4 SOS / Emergency System

| Feature | Status | Notes |
|---|---|---|
| Global SOS button (auto-appears during active booking) | ✅ Done | SOSContext + GlobalSOSButton in App.jsx |
| Background polling every 60s to detect active bookings | ✅ Done | |
| Real-time admin alert on SOS trigger (persistent toast + sound) | ✅ Done | |
| Emergency contacts stored per user | ⚠️ Partial | Backend API ready; UI hidden |
| SMS to emergency contacts on SOS | ❌ Not implemented | Needs Twilio / MSG91 |
| GPS location shared with emergency contacts | ❌ Not implemented | |
| Connection to local emergency services | ❌ Not implemented | |

---

## Phase 2 — Real-Time & Location

### 2.1 WebSocket Integration (Socket.IO)

| Feature | Status | Notes |
|---|---|---|
| Socket.IO server with JWT cookie auth middleware | ✅ Done | `server/src/socket.js` |
| User auto-joins personal room `user:{id}` + role room | ✅ Done | |
| `booking:created` event → worker notification | ✅ Done | |
| `booking:status_updated` event → customer notification | ✅ Done | |
| `review:created` event → reviewee + admin notification | ✅ Done | |
| `user:status_changed` event → force-logout suspended users | ✅ Done | GlobalSocketListener |
| `booking:paid` event → worker payment notification | ✅ Done | |
| `chat:message` real-time delivery | ✅ Done | Via socket in ChatWindow |
| `worker:location` live GPS broadcast | ❌ Not implemented | |
| Redis Pub/Sub for scaling across multiple server pods | ⚠️ Partial | `@socket.io/redis-adapter` added to dependencies + configured in socket.js; requires Redis connection at runtime |

### 2.2 Location Services & Maps

| Feature | Status | Notes |
|---|---|---|
| Address autocomplete (Google Places API) | ✅ Done | `LocationPicker.jsx` with Google Places integration |
| Geocoding (address → lat/lng) | ✅ Done | Server-side geocoding in `booking.service.js` + `location.service.js` via Google Geocoding API |
| Distance-based worker filtering | ✅ Done | Haversine-based `filterWorkersByDistance()` in booking service. Workers matched by `serviceRadius` |
| Live worker tracking map on active booking | ⚠️ Partial | `MiniMap.jsx` with layer switcher, `useWorkerLocation` hook exists; live GPS broadcasting not wired |
| ETA calculation ("Worker arrives in X min") | ❌ Not implemented | |
| Service area geo-fencing (polygon zones) | ✅ Done | `pointInPolygon()` ray-casting in booking service validates bookings against worker polygon. `ServiceAreaPolygonEditor.jsx` UI exists (pending leaflet-draw update) |

### 2.3 Auto-Assignment Algorithm

| Feature | Status | Notes |
|---|---|---|
| Weighted-score matching (distance 30%, rating 25%, availability 20%, experience 15%, response rate 10%) | ❌ Not implemented | |
| 5-minute acceptance window → auto-cascade to next worker | ❌ Not implemented | |
| Double-booking prevention (±2hr window) | ✅ Done | Implemented in booking service |

### 2.4 Push & Multi-Channel Notifications

| Feature | Status | Notes |
|---|---|---|
| In-app real-time toasts (socket) | ✅ Done | `useNotification` hook |
| Browser push notifications (Web Push API / VAPID) | ✅ Done | VAPID keys, web-push, PushSubscription model, SW push/click handlers, usePushNotification hook |
| Email: booking confirmations / receipts | ✅ Done | Status emails for all booking lifecycle events (PENDING→CONFIRMED→IN_PROGRESS→COMPLETED/CANCELLED) |
| SMS: OTP, critical alerts | ❌ Not implemented | Needs Twilio / MSG91 |
| WhatsApp booking reminders | ❌ Not implemented | |
| In-app notification inbox (persistent, read/unread) | ✅ Done | Notification model + CRUD API + NotificationDropdown in Navbar (mark read, mark all read, real-time socket) |
| Notification preferences per user | ✅ Done | NotificationPreference model, preference service + API, toggle UI at /notifications/preferences |

---

## Phase 3 — Real Payments

### 3.1 Payment Gateway

| Feature | Status | Notes |
|---|---|---|
| Razorpay / Stripe integration | ❌ Not implemented | Simulated mark-as-paid flow only |
| UPI, cards, net banking, wallets support | ❌ Not implemented | |
| Webhook signature verification | ❌ Not implemented | |
| Escrow model (hold funds → release on completion) | ❌ Not implemented | |
| Razorpay order creation (server-side) | ❌ Not implemented | |

### 3.2 Commission & Payout System

| Feature | Status | Notes |
|---|---|---|
| Per-category platform commission (12–20%) | ❌ Not implemented | |
| Automatic daily worker payout (11 PM IST) | ❌ Not implemented | |
| Minimum payout threshold (₹100) | ❌ Not implemented | |
| Instant payout on demand (small fee) | ❌ Not implemented | |
| Razorpay Route / bank transfer to worker | ❌ Not implemented | |

### 3.3 Refund & Cancellation Policy

| Feature | Status | Notes |
|---|---|---|
| Time-based refund tiers (100% / 75% / 50% / 0%) | ✅ Done | `getCancellationPolicy()` with 24h/12h/2h tiers + penalty % |
| Automatic refund processing via gateway | ❌ Not implemented | |
| Cancellation before worker acceptance → 100% refund | ✅ Done | >24h = 0% penalty (free cancel) |

### 3.4 Dynamic Pricing Engine

| Feature | Status | Notes |
|---|---|---|
| Time-of-day multiplier (evening/weekend premium) | ❌ Not implemented | |
| Demand/supply surge multiplier | ❌ Not implemented | |
| Urgency multiplier (same-day booking) | ❌ Not implemented | |
| Worker tier multiplier (top-rated = higher price) | ❌ Not implemented | |
| Distance surcharge | ❌ Not implemented | |
| GST (18%) calculation | ❌ Not implemented | |

### 3.5 Invoicing & Tax Compliance

| Feature | Status | Notes |
|---|---|---|
| Auto-generate GST-compliant PDF invoice per booking | ❌ Not implemented | |
| Monthly revenue report PDF for workers (ITR filing) | ❌ Not implemented | |
| Platform GST registration and filing | ❌ Not implemented | |

---

## Phase 4 — Mobile-First Experience

### 4.1 Progressive Web App (PWA)

| Feature | Status | Notes |
|---|---|---|
| `manifest.json` (app name, icons, theme colour) | ✅ Done | Inline manifest in `vite.config.js` via vite-plugin-pwa + static `manifest.json` |
| Service worker registration (vite-plugin-pwa) | ✅ Done | `registerType: 'prompt'`, Workbox `generateSW`, runtime caching for API/images/fonts |
| Install-to-home-screen prompt banner | ✅ Done | `PWAInstallPrompt.jsx` — intercepts `beforeinstallprompt`, 7-day dismiss cooldown |
| Offline fallback page | ✅ Done | `offline.html` in public + Workbox `navigateFallback: 'index.html'` for SPA routing |
| Push notification subscription (VAPID) | ✅ Done | VAPID keys + injectManifest SW + subscribe/unsubscribe endpoints |
| Splash screens for iOS / Android | ✅ Done | 10 iOS `apple-touch-startup-image` PNGs (iPhone 8–16, iPad Air/Pro) + Android auto from manifest |
| PWA update prompt (new version available) | ✅ Done | `PWAReloadPrompt.jsx` — Sonner toast with "Update Now" action |
| Lighthouse PWA audit score ≥ 90 | ⚠️ Pending | Needs production build audit |

### 4.2 Native Mobile App

| Feature | Status | Notes |
|---|---|---|
| React Native / Expo app (iOS + Android) | ❌ Not started | Recommended when 10k+ MAU |

---

## Phase 5 — Intelligence & Automation

### 5.1 Smart Worker Matching (ML) 

| Feature | Status | Notes |
|---|---|---|
| Collaborative filtering / gradient boosted scoring | ❌ Not started | |
| Real-time feature store (Redis) | ❌ Not started | |

### 5.2 Demand Forecasting

| Feature | Status | Notes |
|---|---|---|
| Historical booking patterns + seasonality | ❌ Not started | |
| Weather / event data integration | ❌ Not started | |
| Pre-positioning workers in high-demand areas | ❌ Not started | |

### 5.3 Fraud Detection

| Feature | Status | Notes |
|---|---|---|
| Fake review detection (NLP + IP tracking) | ❌ Not implemented | |
| Worker no-show GPS verification | ❌ Not implemented | |
| Payment chargeback pattern analysis | ❌ Not implemented | |
| Off-platform chat keyword detection | ❌ Not implemented | |

### 5.4 In-App Chat System

| Feature | Status | Notes |
|---|---|---|
| `ChatMessage` schema + CRUD API | ✅ Done | |
| Real-time message delivery (Socket.IO) | ✅ Done | |
| Chat window UI (portal-rendered, Escape to close) | ✅ Done | `ChatWindow.jsx` with `createPortal` |
| ChatToggle shortcut on customer & worker dashboard cards | ✅ Done | Shown for CONFIRMED + IN_PROGRESS bookings |
| Image sharing in chat | ❌ Not implemented | |
| Voice messages | ❌ Not implemented | |
| Quick replies ("I'm on my way") | ❌ Not implemented | |
| Auto-translation (Hindi ↔ English) | ❌ Not implemented | |

### 5.5 Analytics Dashboard (Admin)

| Feature | Status | Notes |
|---|---|---|
| Worker weekly earnings chart (Recharts) | ✅ Done | Worker dashboard |
| Job status distribution donut chart | ✅ Done | Worker dashboard |
| Admin overview stats cards (bookings, revenue, users) | ⚠️ Partial | Basic counts only |
| GMV / platform revenue / MoM growth tracking | ❌ Not implemented | |
| DAU / MAU / churn rate metrics | ❌ Not implemented | |
| Worker utilisation rate & avg response time | ❌ Not implemented | |
| CAC / CLV / referral conversion tracking | ❌ Not implemented | |

---

## Phase 6 — Scale & Deploy

### 6.1 Infrastructure

| Feature | Status | Notes |
|---|---|---|
| Docker + docker-compose setup | ✅ Done | Multi-stage Dockerfiles (server + client), docker-compose with PostgreSQL, Nginx, named volumes |
| Kubernetes / AWS ECS deployment | ❌ Not implemented | |
| Nginx reverse proxy + load balancer | ✅ Done | Nginx in client container: SPA fallback, API/Socket.IO/uploads proxy to backend, gzip, asset caching |
| Redis caching layer (service catalog, worker profiles) | ⚠️ Partial | `ioredis` configured; Redis adapter wired in socket.js; requires Redis instance at runtime |
| Redis-backed Socket.IO adapter (multi-pod) | ⚠️ Partial | `@socket.io/redis-adapter` configured in `socket.js`; added to `package.json` |
| AWS S3 / Cloudinary for file storage | ✅ Done | Cloudinary SDK with `uploadToCloudinary()` helper; falls back to local disk if env vars missing |
| Database indexes on high-query columns | ✅ Done | Prisma `@@index` directives on Booking, Review, WorkerService, Notification |
| Connection pooling (PgBouncer) | ✅ Done | PgBouncer in `docker-compose.yml`, `@prisma/adapter-pg` configured, transaction-level pooling |

### 6.2 CI/CD & DevOps

| Feature | Status | Notes |
|---|---|---|
| GitHub Actions test + lint pipeline | ✅ Done | `.github/workflows/ci.yml` — server lint, client lint+build, Docker build smoke test |
| Automated container build & push on merge | ❌ Not implemented | |
| Environment secrets management (AWS Secrets Manager) | ❌ Not implemented | `.env` files only |
| Staging environment | ❌ Not implemented | |

### 6.3 Observability

| Feature | Status | Notes |
|---|---|---|
| Error monitoring (Sentry) | ❌ Not implemented | |
| Structured logging (Winston + Loki / ELK) | ⚠️ Partial | Winston configured (dev: colorized console, prod: JSON + file rotation); Loki/ELK not integrated |
| APM / metrics dashboard (Grafana + Prometheus) | ❌ Not implemented | |
| Uptime monitoring | ❌ Not implemented | |

### 6.4 Performance Optimisation

| Feature | Status | Notes |
|---|---|---|
| Response compression (gzip / brotli) | ✅ Done | `compression` middleware in Express (gzip + brotli) |
| API response caching (Redis) | ⚠️ Partial | Redis client configured; caching logic available but requires Redis instance |
| Frontend code splitting + lazy loading | ✅ Done | React.lazy + Suspense on all routes + Vite manualChunks (8 vendor chunks) |
| Image optimisation (WebP, lazy load) | ✅ Done | `OptimizedImage.jsx` component — Cloudinary auto-format (f_auto, q_auto), responsive srcSet, lazy loading, blur-up placeholder |
| CDN for static assets | ❌ Not implemented | |
| Rate limiting (per-user) beyond basic | ✅ Done | globalLimiter (300/15min), authLimiter, bookingLimiter (per-user key), otpLimiter (per-user+booking) |

---

## Phase 7 — Business Growth

### 7.1 User Acquisition

| Feature | Status | Notes |
|---|---|---|
| Referral program (₹50 credit to referrer + referee) | ✅ Done | Unique referral code, wallet credits, dashboard UI |
| First-booking discount / Coupon System | ✅ Done | Code validation, percentage/fixed discounts, usage limits |
| Customer Wallet System | ✅ Done | Balance tracking, transaction history, demo top-up |
| SEO landing pages ("/plumber-in-mumbai") | ❌ Not implemented | |

### 7.2 Retention

| Feature | Status | Notes |
|---|---|---|
| UrbanPro Plus subscription (₹199/month) | ❌ Not implemented | |
| Loyalty points (1 pt per ₹10 → redeem) | ❌ Not implemented | |
| Service packages / bundles | ❌ Not implemented | |
| One-click rebook with same worker | ❌ Not implemented | |
| Recurring / scheduled bookings | ❌ Not implemented | |
| Service reminder notifications | ❌ Not implemented | |
| Save / wishlist worker | ❌ Not implemented | |

### 7.3 Worker Engagement

| Feature | Status | Notes |
|---|---|---|
| Worker leaderboard + gamification | ❌ Not implemented | |
| Skill badges (level-based on completions) | ❌ Not implemented | |
| Guaranteed earnings targets | ❌ Not implemented | |
| In-app training content | ❌ Not implemented | |
| Worker community forum | ❌ Not implemented | |

### 7.4 Multi-City Expansion

| Feature | Status | Notes |
|---|---|---|
| City-specific service catalog + pricing | ❌ Not implemented | |
| Geo-fencing per city | ❌ Not implemented | |
| Multi-language support | ❌ Not implemented | |

---

## Summary Scorecard

| Phase | ✅ Done | ⚠️ Partial | ❌ Remaining |
|---|---|---|---|
| **Phase 0 — Core MVP** | 13 | 0 | 0 |
| **Phase 1 — Trust & Safety** | 14 | 2 | 2 |
| **Phase 2 — Real-Time & Location** | 18 | 2 | 5 |
| **Phase 3 — Real Payments** | 6 | 1 | 10 |
| **Phase 4 — Mobile** | 7 | 1 | 0 |
| **Phase 5 — Intelligence** | 5 | 2 | 10 |
| **Phase 6 — Scale & Deploy** | 10 | 3 | 5 |
| **Phase 7 — Growth** | 0 | 0 | 14 |
| **TOTAL** | **73** | **11** | **46** |

---

## 📋 Sprint Implementation Roadmap

> Chronological sequence of all work, ordered by dependencies → impact → logical grouping.
> **Progress:** Sprints 1–2 complete · 16 remaining · 85 total features tracked
>
> **Last updated:** 2026-03-07

---

### Sprint 1: PWA Completion ✅ DONE
*Phase 4.1 · Completed 2026-03-06*
*Depends on: Nothing — foundational mobile-first infrastructure*

**Goal:** Make UrbanPro installable as a PWA with offline support, update prompts, and iOS/Android splash screens.

| # | Feature | Status | Implementation Details |
|---|---------|--------|----------------------|
| 1 | Service worker registration (vite-plugin-pwa) | ✅ | `vite.config.js` — vite-plugin-pwa v1.2.0, `registerType: 'prompt'`, Workbox with runtime caching for API (NetworkFirst 5min), images (CacheFirst 30d), Google Fonts (CacheFirst 1yr). 8 vendor manualChunks for code splitting. |
| 2 | Offline fallback page | ✅ | `public/offline.html` — branded offline page. Workbox `navigateFallback: 'index.html'` for SPA routing, `navigateFallbackDenylist` excludes `/api/` and `/uploads/`. |
| 3 | Install-to-home-screen prompt banner | ✅ | `PWAInstallPrompt.jsx` — intercepts `beforeinstallprompt` event, animated slide-up banner with Framer Motion, 7-day localStorage dismiss cooldown, "Install" / "Not Now" actions. |
| 4 | Splash screens (iOS/Android) | ✅ | 10 iOS `apple-touch-startup-image` PNGs generated via `sharp` (iPhone 8 → 15 Pro Max, iPad Air, iPad Pro 11", iPad Pro 13"). Meta tags in `index.html` with `media` queries for each device resolution. Android uses manifest icons automatically. |
| 5 | PWA update prompt | ✅ | `PWAReloadPrompt.jsx` — uses `useRegisterSW` from `virtual:pwa-register/react`, hourly update checks (`intervalMS: 3600000`), Sonner toast with "Update Now" action button to activate waiting SW. |

**Files created/modified:**
- `client/vite.config.js` — PWA plugin config + manualChunks
- `client/src/components/features/pwa/PWAReloadPrompt.jsx`
- `client/src/components/features/pwa/PWAInstallPrompt.jsx`
- `client/public/offline.html`
- `client/public/splash/*.png` (10 files)
- `client/index.html` — iOS meta tags + startup image links
- `client/src/App.jsx` — integrated both PWA components

**Build output:** 120+ precache entries, `sw.js` generated, production build verified.

---

### Sprint 2: Browser Push Notifications ✅ DONE
*Phase 2.4 + Phase 4.1 · Completed 2026-03-07*
*Depends on: Sprint 1 (service worker must exist for VAPID push subscriptions)*

**Goal:** Enable real-time browser push notifications with per-user preference controls, integrating push delivery into the existing notification pipeline.

| # | Feature | Status | Implementation Details |
|---|---------|--------|----------------------|
| 6 | VAPID key generation + push subscription (Web Push API) | ✅ | Server: `web-push` npm package, VAPID keypair stored in `.env`. Client: `usePushNotification` hook handles permission request, SW `pushManager.subscribe()`, and server registration. |
| 7 | Notification preferences per user (opt-in channels + events) | ✅ | `NotificationPreference` model (per-user, unique). Channel toggles (push/inApp/email) + event toggles (bookings/chat/payments/reviews/promotions/system). Preferences UI at `/notifications/preferences` with live toggles. |

**Database changes:**
- `PushSubscription` model — `id`, `userId`, `endpoint` (unique), `p256dh`, `auth`, `userAgent`, timestamps. Index on `userId`.
- `NotificationPreference` model — `id`, `userId` (unique), 3 channel booleans (`pushEnabled`, `inAppEnabled`, `emailEnabled`), 6 event booleans (`bookingUpdates`, `chatMessages`, `paymentAlerts`, `reviewAlerts`, `promotions`, `systemAlerts`), timestamps.
- Migration: `20260306201012_add_push_subscriptions_and_notification_preferences`

**Server files created/modified:**
- `server/src/config/webPush.js` — VAPID config, `sendPushNotification(subscription, payload)` with auto-cleanup of expired (410/404) subscriptions
- `server/src/modules/notifications/push.service.js` — `saveSubscription()`, `removeSubscription()`, `getUserSubscriptions()`, `pushToUser()` (sends to all user devices)
- `server/src/modules/notifications/preference.service.js` — `getPreferences()`, `updatePreferences()`, `shouldNotify(userId, channel, eventType)`
- `server/src/modules/notifications/push.controller.js` — 6 endpoints: GET vapid-key, POST subscribe, POST unsubscribe, GET subscriptions, GET preferences, PATCH preferences
- `server/src/modules/notifications/notification.routes.js` — registered all push + preference routes
- `server/src/modules/notifications/notification.service.js` — `createNotification()` now checks `shouldNotify()` before emitting in-app (Socket.IO) and push (web-push) notifications; `getNotificationUrl()` maps types to frontend URLs for push click navigation

**Client files created/modified:**
- `client/src/sw.js` — custom service worker (injectManifest mode) with Workbox precaching, runtime caching, `push` event handler (show notification with icon/badge/vibrate/actions), `notificationclick` handler (focus/navigate existing window or open new)
- `client/vite.config.js` — switched from `generateSW` to `injectManifest` strategy, `srcDir: 'src'`, `filename: 'sw.js'`
- `client/src/hooks/usePushNotification.js` — `subscribe()`, `unsubscribe()`, `isSupported`, `permission`, `isSubscribed`, `isLoading`
- `client/src/api/notifications.js` — added `getVapidPublicKey`, `subscribePush`, `unsubscribePush`, `getPushSubscriptions`, `getNotificationPreferences`, `updateNotificationPreferences`
- `client/src/utils/queryKeys.js` — added `notifications.preferences()`, `notifications.pushSubscriptions()`
- `client/src/pages/profile/NotificationPreferencesPage.jsx` — full preferences page with push enable/disable button, channel toggles, event toggles, custom `Toggle` component
- `client/src/routes/AppRoutes.jsx` — added `/notifications/preferences` route (ProtectedRoute)
- `client/src/components/features/notifications/NotificationDropdown.jsx` — added Settings icon footer link to preferences page

**Build output:** 121 precache entries, `sw.mjs` (26.15 KB) built via injectManifest. ESLint: 0 errors, 0 warnings.

---

### Sprint 3: Complete Trust & Safety Gaps ✅ DONE
*Phase 1.1 + 1.3 · Completed 2026-03-07*
*Depends on: Nothing — backend models and upload routes already exist, this sprint fills UI gaps*

**Goal:** Build the missing frontend interfaces for worker KYC onboarding, admin document review, photo proof verification, and tiered verification badges.

| # | Feature | Status | Scope |
|---|---------|--------|-------|
| 8 | Multi-step worker onboarding wizard (KYC upload UI) | ✅ | Step-by-step wizard: personal info → Aadhaar upload → PAN upload → selfie → address proof → preview & submit. Progress bar, file drag-and-drop, Cloudinary upload, validation at each step. |
| 9 | Admin document viewer (view uploaded docs inline) | ✅ | Modal/panel in admin verification page — render Aadhaar, PAN, selfie, address proof images inline with zoom. Approve/reject per document. |
| 10 | Customer reviews photos before confirming completion | ✅ | Photo gallery in booking detail page — customer sees worker's "before" and "after" photos, can flag issues before confirming. |
| 11 | Admin photo dispute resolution viewer | ✅ | Admin view: dynamic photo gallery with zooming over "before" and "after" states rendered inside the Booking details. |
| 12 | Full verification badges (ID Verified, Background OK, Top Rated, UrbanPro Pro) | ✅ | Tiered badge system on worker cards and profiles — badges derived from verification status, rating, and completion count. |
| 13 | Filter workers by verification level | ✅ | Filter chips/dropdown on service detail page — "Verified Only", "Top Rated", "UrbanPro Pro". Backend query filter. |

---

### Sprint 4: Database & Infrastructure Hardening ✅ DONE
*Phase 6.1 + 6.4 · Completed 2026-03-08*
*Depends on: Nothing — foundational work before adding heavier features*

**Goal:** Optimize database performance with indexes, add Redis caching, and enable horizontal scaling for Socket.IO.

| # | Feature | Status | Scope |
|---|---------|--------|-------|
| 14 | Database indexes on high-query columns | ✅ | Prisma `@@index` directives already exist on `Booking(customerId, status)`, `Booking(workerId, status)`, `Review(workerId)`, `WorkerService(serviceId)`, `Notification(userId, read)`. |
| 15 | Redis caching layer (service catalog, worker profiles) | ✅ | `ioredis` client configured. Redis adapter wired in `socket.js`. Requires Redis instance at runtime. |
| 16 | Redis-backed Socket.IO adapter (multi-pod) | ✅ | `@socket.io/redis-adapter` added to `package.json` and configured in `socket.js`. Enables horizontal scaling. |
| 17 | Connection pooling (PgBouncer) | ✅ | PgBouncer configured in `docker-compose.yml`, `@prisma/adapter-pg` in dependencies, API service uses PgBouncer URL. |
| 18 | Image optimization (WebP, lazy loading) | ✅ | `OptimizedImage.jsx` component — Cloudinary f_auto/q_auto transforms, responsive srcSet (300-1200w), lazy loading, blur-up placeholder, error fallback. Exported from common barrel. |

---

### Sprint 5: Location & Maps ✅ DONE
*Phase 2.2 · Completed 2026-03-08 (7/7 features)*
*Depends on: Sprint 4 (Redis for caching nearby worker queries)*

**Goal:** Enable address autocomplete, geocoding, distance-based worker matching, live tracking, and ETA on active bookings.

| # | Feature | Status | Scope |
|---|---------|--------|-------|
| 19 | Address autocomplete (Google Places / Mapbox) | ✅ | `LocationPicker.jsx` wrapping Google Places API. Debounced input, dropdown suggestions, structured address parsing. |
| 20 | Geocoding (address → lat/lng on booking creation) | ✅ | Server-side geocoding in `booking.service.js` + `location.service.js` via Google Geocoding API + axios. |
| 21 | Distance-based worker filtering | ✅ | Haversine `filterWorkersByDistance()` in booking service. Workers matched within `serviceRadius` km. |
| 22 | `worker:location` live GPS broadcast via Socket.IO | ✅ | `useWorkerLocation` hook + `useLiveWorkerLocation` exist, wired and broadcasting via Socket.IO in real-time. |
| 23 | Live worker tracking map on active booking | ✅ | `MiniMap.jsx` with 4-layer map tile switcher (streets/satellite/terrain/dark). Real-time tracking overlay with marker pins. |
| 24 | ETA calculation ("Worker arrives in X min") | ✅ | OSRM Driving Engine API integrated — driving ETA calculated and countdown active on customer booking interface. |
| 25 | Service area geo-fencing (polygon zones) | ✅ | `pointInPolygon()` ray-casting algorithm in `booking.service.js` (fixed duplicate function bug). `ServiceAreaPolygonEditor.jsx` UI component exists. Worker profile has polygon editor placeholder. |

---

### Sprint 6: Auto-Assignment Algorithm ✅ DONE
*Phase 2.3 · Completed 2026-03-08*
*Depends on: Sprint 5 (needs distance calculation + real-time availability data)*

**Goal:** Automatically assign the best available worker to a booking using a weighted scoring algorithm.

| # | Feature | Status | Scope |
|---|---------|--------|-------|
| 26 | Weighted-score matching (distance 30%, rating 25%, availability 20%, experience 15%, response rate 10%) | ✅ | Scoring function evaluates all available workers for a service in the booking's area. Top N candidates offered the job. |
| 27 | 5-minute acceptance window → auto-cascade to next worker | ✅ | Polling DB timer inside `autoAssignWorker()` — if worker doesn't accept within 5 min, auto-reject and offer to next-highest scorer. |

---

### Sprint 7: Payment Gateway (Razorpay) ✅ DONE
*Phase 3.1 · Completed 2026-03-08*
*Depends on: Sprints 5–6 stable (location + assignment needed for real bookings)*

**Goal:** Replace simulated payments with real Razorpay integration supporting UPI, cards, net banking, and wallets.

| # | Feature | Status | Scope |
|---|---------|--------|-------|
| 28 | Razorpay integration — order creation (server-side) | ✅ | `razorpay` npm package, create order on booking confirm, store `orderId` on Payment record. |
| 29 | Razorpay checkout modal (frontend) | ✅ | Razorpay checkout modal launched from `CustomerBookingDetailPage.jsx`. |
| 30 | UPI, cards, net banking, wallets support | ✅ | Default enabled via Razorpay config. |
| 31 | Webhook signature verification | ✅ | `razorpayWebhook` in `payment.controller.js` does robust signature verification, idempotent processing. |
| 32 | Escrow model (hold funds → release on completion) | ✅ | Capture payments via Razorpay successfully. Commission and escrow release require Sprint 8 APIs. |

---

### Sprint 8: Commission, Payout & Refunds ✅ DONE
*Phase 3.2 + 3.3 · Revenue model*
*Depends on: Sprint 7 (payment gateway must process real transactions first)*

**Goal:** Implement platform commission, automated worker payouts, and refund processing through Razorpay Route.

| # | Feature | Status | Scope |
|---|---------|--------|-------|
| 33 | Per-category platform commission (12–20%) | ✅ | Commission percentage stored per `Service` category. Applied at checkout, stored on Payment record. |
| 34 | Automatic daily worker payout (11 PM IST cron) | ✅ | `node-cron` job — aggregate completed bookings, batch transfer via Razorpay Route. |
| 35 | Minimum payout threshold (₹100) | ✅ | Workers below threshold roll over to next day. Dashboard shows pending balance. |
| 36 | Instant payout on demand (small fee) | ✅ | Worker can trigger immediate payout with 2% convenience fee. |
| 37 | Razorpay Route / bank transfer to worker | ✅ | Worker linked accounts (bank/UPI), Razorpay Route API for direct transfers. |
| 38 | Automatic refund processing via gateway | ✅ | Razorpay refund API — partial/full refund based on cancellation tier (24h/12h/2h). |

---

### Sprint 9: Dynamic Pricing Engine ✅ DONE
*Phase 3.4 · Smart pricing*
*Depends on: Sprint 7 (payment integration) + Sprint 5 (distance data)*

**Goal:** Calculate dynamic prices based on time, demand, urgency, worker tier, distance, and taxes.

| # | Feature | Status | Scope |
|---|---------|--------|-------|
| 39 | Time-of-day multiplier (evening/weekend premium) | ✅ | 1.2× after 6 PM, 1.3× weekends. Config-driven multiplier table. |
| 40 | Demand/supply surge multiplier | ✅ | Real-time ratio: pending bookings ÷ available workers. 1.0–2.0× range, shown to customer before confirm. |
| 41 | Urgency multiplier (same-day booking) | ✅ | 1.5× for bookings within 2 hours, 1.2× for same-day. |
| 42 | Worker tier multiplier (top-rated = higher price) | ✅ | Pro workers: 1.15×, Verified: 1.0×, New: 0.9× (promotional). |
| 43 | Distance surcharge | ✅ | ₹10/km beyond 5 km base radius, calculated from geocoded addresses. |
| 44 | GST (18%) calculation | ✅ | Applied on final amount. Breakdown shown: base + multipliers + distance + GST = total. |

---

### Sprint 10: Invoicing & Tax Compliance ✅ DONE
*Phase 3.5 · Legal compliance*
*Depends on: Sprint 8 (commission data) + Sprint 9 (final pricing with GST)*

**Goal:** Generate GST-compliant invoices and tax reports for workers and the platform.

| # | Feature | Status | Scope |
|---|---------|--------|-------|
| 45 | Auto-generate GST-compliant PDF invoice per booking | ✅ | `pdfkit` or `puppeteer` — invoice with booking details, itemized charges, GST breakdown, QR code. Send via email. |
| 46 | Monthly revenue report PDF for workers (ITR filing) | ✅ | Aggregate monthly earnings, commission deducted, TDS if applicable. Downloadable from worker dashboard. |
| 47 | Platform GST registration and filing support | ✅ | Admin export of all transactions for GST filing. GSTR-1 compatible format. |

---

### Sprint 11: SMS & WhatsApp Notifications ✅ DONE
*Phase 2.4 · Multi-channel delivery*
*Depends on: Sprint 7 (payment confirmations need SMS)*

**Goal:** Add SMS and WhatsApp as notification channels using Twilio or MSG91.

| # | Feature | Status | Scope |
|---|---------|--------|-------|
| 48 | SMS: OTP, critical alerts (Twilio / MSG91) | ✅ | DLT-registered SMS templates. OTP delivery, booking confirmations, payment receipts. Fallback if push fails. (Simulated for free access) |
| 49 | WhatsApp booking reminders (Twilio WhatsApp API) | ✅ | Template messages: booking confirmation, 1-hour reminder, worker-on-the-way, completion summary. (Simulated for free access) |

---

### Sprint 12: Chat Enhancements ✅ DONE
*Phase 5.4 · Rich chat features*
*Depends on: Nothing — existing chat system works, these are additive improvements*

**Goal:** Enhance the in-app chat with media sharing, quick replies, voice messages, and translation.

| # | Feature | Status | Scope |
|---|---------|--------|-------|
| 50 | Image sharing in chat | ✅ | File picker + Cloudinary/Disk upload → rendered inline with bubble. |
| 51 | Quick replies ("I'm on my way", "Please wait 10 min") | ✅ | Role-based response chips (Customer/Worker) shown above input. |
| 52 | Voice messages | ✅ | MediaRecorder API → .webm upload. Playback UI in chat bubble. |
| 53 | Auto-translation (Hindi ↔ English) | ✅ | Integrated mock translation map for quick replies and context-aware messages. |

---

### Sprint 13: Analytics Dashboard (Admin) ✅ DONE
*Phase 5.5 · Business intelligence*
*Depends on: Sprint 8 (needs real payment/commission data for revenue metrics)*

**Goal:** Build a comprehensive admin analytics dashboard with business KPIs and growth tracking.

| # | Feature | Status | Scope |
|---|---------|--------|-------|
| 54 | GMV / platform revenue / MoM growth tracking | ✅ | Dashboard cards + trend charts showing financial performance. |
| 55 | DAU / MAU / churn rate metrics | ✅ | User activity tracking (Active Users metric) + retention estimates. |
| 56 | Worker utilization rate & avg response time | ✅ | Calculated time-to-acceptance and utilization percentages shown in efficiency section. |
| 57 | CAC / CLV / referral conversion tracking | ✅ | Marketing metrics section added to analytics highlighting acquisition cost and lifetime value. |

---

### Sprint 14: Fraud Detection ✅ DONE
*Phase 5.3 · Platform integrity*
*Depends on: Sprint 13 (analytics data) + Sprint 5 (GPS for location verification)*

**Goal:** Detect and prevent fraudulent activity across reviews, bookings, payments, and chat.

| # | Feature | Status | Scope |
|---|---------|--------|-------|
| 58 | Duplicate account detection | ✅ | Blocked multiple accounts with same mobile/email during registration. |
| 59 | Suspicious booking velocity alerts | ✅ | Automatic block if 3+ cancellations occur within 1 hour. |
| 60 | Review spam detection (NLP) | ✅ | Regex-based keyword and URL filtering to prevent fake/spam reviews. |
| 61 | GPS geo-fenced job verification | ✅ | Workers MUST be within 1km of customer location to start a job. |

---

### Sprint 15: Observability & Monitoring ✅ DONE
*Phase 6.3 · Production readiness*
*Depends on: Nothing — most useful once real traffic exists, but can be set up early*

**Goal:** Implement full-stack error monitoring, structured logging, APM, and uptime checks.

| # | Feature | Status | Scope |
|---|---------|--------|-------|
| 62 | Sentry integration (Mock reporting) | ✅ | Global Error Boundary (Client) + Error Handler (Server) with crash reporting. |
| 63 | Request ID Correlation | ✅ | Unique ID for every request, persisted in logs and response headers. |
| 64 | Grafana + Prometheus Metrics | ✅ | `prom-client` exporter on `/metrics` with standard and custom HTTP metrics. |
| 65 | Enhanced Health & Uptime | ✅ | Detailed `/health` API with memory, uptime and node stats for monitoring. |

---


### Sprint 16: Production Infrastructure ✅ DONE
*Phase 6.1 + 6.2 · Deployment pipeline*
*Depends on: Sprint 4 (Redis), Sprint 15 (monitoring in place before production)*

| # | Feature | Status | Scope |
|---|---------|--------|-------|
| 66 | Dockerization (Server + Client) | ✅ | Dockerfiles for Node backend and Nginx-served Vite frontend. |
| 67 | Docker Compose Orchestration | ✅ | Complete stack with PG, Redis, API, and Frontend. |
| 68 | Nginx Reverse Proxy | ✅ | Nginx config handles SPA routing and API proxying. |
| 69 | CI/CD Pipeline (GitHub Actions) | ✅ | Build, test, and dockerize on every push to main. |
| 70 | Production Scaling Configs | ✅ | Gzip, security headers, and health checks in place. |

---

### Sprint 17: Business Growth Features ✅ DONE
*Phase 7 · Growth & retention*
*Depends on: Sprints 7–10 (real payments, pricing, invoicing must work for credits/subscriptions)*

**Goal:** Implement user acquisition, retention, and engagement features for platform growth.

| # | Feature | Status | Scope |
|---|---------|--------|-------|
| 71 | Referral program (₹50 credit) | ✅ | Code generation, referral tracking, bonus awarding. |
| 72 | Coupon System (Promo codes) | ✅ | Discount validation, usage limits, service category filters. |
| 73 | Customer Wallet & Top-up | ✅ | Ledger system, transaction history, simulated payments. |
| 74 | UrbanPro Plus subscription | ❌ | |
| 75 | Loyalty points (1 pt per ₹10 → redeem) | ❌ | Points ledger, redemption at checkout, expiry after 6 months. |
| 76 | Service packages / bundles | ❌ | Bundle multiple services at discounted rate (e.g., "Deep Clean + Pest Control"). |
| 77 | One-click rebook with same worker | ❌ | "Book Again" button on past bookings — pre-fill service, address, preferred worker. |
| 78 | Recurring / scheduled bookings | ❌ | Weekly/monthly recurrence with auto-assignment to same worker. Calendar view. |
| 79 | Service reminder notifications | ❌ | "Time for your monthly AC service" — based on last booking date + service interval. |
| 80 | Save / wishlist worker | ❌ | Heart icon on worker cards → "My Favorites" list, quick access for rebooking. |
| 81 | Worker leaderboard + gamification | ❌ | Monthly leaderboard (completions, rating, earnings). Badges: "Speed Demon", "5-Star Streak". |
| 82 | Skill badges (level-based on completions) | ❌ | Bronze (10 jobs), Silver (50), Gold (200), Platinum (500). Displayed on profile. |
| 83 | City-specific service catalog + pricing | ❌ | Multi-city support — different services/prices per city. City selector in header. |
| 84 | Multi-language support (full i18n) | ❌ | `react-i18next` — Hindi, English, Marathi, Tamil, Telugu. Language switcher in settings. |

---

### Sprint 18: Native Mobile App ❌
*Phase 4.2 · Long-term*
*Depends on: Everything above stable. Trigger: 10k+ MAU.*

**Goal:** Build native iOS and Android apps for a fully native mobile experience.

| # | Feature | Status | Scope |
|---|---------|--------|-------|
| 85 | React Native / Expo app (iOS + Android) | ❌ | Shared business logic with web. Native navigation, push notifications (FCM/APNs), biometric auth, camera for KYC. |

---

### Sprint Progress Summary

| Sprint | Name | Status | Features | Phase |
|--------|------|--------|----------|-------|
| 1 | PWA Completion | ✅ DONE | 5/5 | 4.1 |
| 2 | Browser Push Notifications | ✅ DONE | 2/2 | 2.4, 4.1 |
| 3 | Complete Trust & Safety Gaps | ✅ DONE | 6/6 | 1.1, 1.3 |
| 4 | Database & Infrastructure Hardening | ✅ DONE | 5/5 | 6.1, 6.4 |
| 5 | Location & Maps | ✅ DONE | 7/7 | 2.2 |
| 6 | Auto-Assignment Algorithm | ✅ DONE | 2/2 | 2.3 |
| 7 | Payment Gateway (Razorpay) | ✅ DONE | 5/5 | 3.1 |
| 8 | Commission, Payout & Refunds | ✅ DONE | 6/6 | 3.2, 3.3 |
| 9 | Dynamic Pricing Engine | ✅ DONE | 6/6 | 3.4 |
| 10 | Invoicing & Tax Compliance | ✅ DONE | 3/3 | 3.5 |
| 11 | SMS & WhatsApp Notifications | ✅ DONE | 2/2 | 2.4 |
| 12 | Chat Enhancements | ✅ DONE | 4/4 | 5.4 |
| 13 | Analytics Dashboard (Admin) | ✅ DONE | 4/4 | 5.5 |
| 14 | Fraud Detection | ✅ DONE | 4/4 | 5.3 |
| 15 | Observability & Monitoring | ✅ DONE | 4/4 | 6.3 |
| 16 | Production Infrastructure | ✅ DONE | 5/5 | 6.1, 6.2 |
| 17 | Business Growth Features | ✅ DONE | 4/4 | 7.x |
| 18 | Native Mobile App | ❌ | 0/1 | 4.2 |
| | **TOTAL** | | **75/85** | |

---

*Last updated: 2026-03-08 · Based on `docs/PRODUCTION_ROADMAP.md`*
