# UrbanPro V2 — Feature Implementation Checklist

> Cross-reference of every roadmap item vs. what is currently built.
> **Legend:** ✅ Done &nbsp;|&nbsp; ⚠️ Partial &nbsp;|&nbsp; ❌ Not implemented
>
> **Last updated:** 2026-02-21

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
| Worker submits Aadhaar, PAN, Selfie, Address Proof | ⚠️ Partial | Backend fields exist; no cloud file upload (S3/Cloudinary) |
| Admin reviews documents and approves / rejects | ⚠️ Partial | Approve/reject workflow done; no document viewer in admin UI |
| Verification badges displayed to customers (ID Verified, Background OK, Top Rated, UrbanPro Pro) | ⚠️ Partial | Basic ✓ "Verified" badge only |
| Filter workers by verification level | ❌ Not implemented | |
| Multi-step worker onboarding wizard with file upload | ❌ Not implemented | |

### 1.2 OTP-Based Booking Verification

| Feature | Status | Notes |
|---|---|---|
| 4-digit Start OTP generated when booking is CONFIRMED | ✅ Done | |
| Customer sees Start OTP inline on dashboard (copyable) | ✅ Done | |
| End OTP shown inline on IN_PROGRESS customer banner | ✅ Done | |
| Worker enters OTP → job transitions to IN_PROGRESS | ✅ Done | |
| Completion OTP required to mark COMPLETED | ✅ Done | |
| OTP hidden from worker (customer shares vocally) | ✅ Done | RBAC ensures workers can't read OTP field |
| OTP expiry after 30 minutes | ❌ Not implemented | `otpGeneratedAt` column exists but not enforced |

### 1.3 Photo Proof of Work

| Feature | Status | Notes |
|---|---|---|
| Worker uploads "Before" photos at job start | ⚠️ Partial | Schema + backend route exists; UI on booking detail page |
| Worker uploads "After" photos at job completion | ⚠️ Partial | Same as above |
| Photos stored in cloud (AWS S3 / Cloudinary) | ❌ Not implemented | Currently local / base64 |
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
| Redis Pub/Sub for scaling across multiple server pods | ❌ Not implemented | |

### 2.2 Location Services & Maps

| Feature | Status | Notes |
|---|---|---|
| Address autocomplete (Google Places API) | ❌ Not implemented | |
| Geocoding (address → lat/lng) | ❌ Not implemented | |
| Distance-based worker filtering | ❌ Not implemented | Text-based `serviceAreas` string only |
| Live worker tracking map on active booking | ❌ Not implemented | |
| ETA calculation ("Worker arrives in X min") | ❌ Not implemented | |
| Service area geo-fencing (polygon zones) | ❌ Not implemented | |

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
| Browser push notifications (Web Push API / VAPID) | ❌ Not implemented | |
| Email: booking confirmations / receipts | ⚠️ Partial | Email verification only; no booking emails |
| SMS: OTP, critical alerts | ❌ Not implemented | Needs Twilio / MSG91 |
| WhatsApp booking reminders | ❌ Not implemented | |
| In-app notification inbox (persistent, read/unread) | ❌ Not implemented | `Notification` schema not created |
| Notification preferences per user | ❌ Not implemented | |

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
| Time-based refund tiers (100% / 75% / 50% / 0%) | ❌ Not implemented | |
| Automatic refund processing via gateway | ❌ Not implemented | |
| Cancellation before worker acceptance → 100% refund | ❌ Not implemented | |

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
| `manifest.json` (app name, icons, theme colour) | ❌ Not implemented | |
| Service worker registration (vite-plugin-pwa) | ❌ Not implemented | |
| Install-to-home-screen prompt banner | ❌ Not implemented | |
| Offline fallback page | ❌ Not implemented | |
| Push notification subscription (VAPID) | ❌ Not implemented | |
| Splash screens for iOS / Android | ❌ Not implemented | |
| Lighthouse PWA audit score ≥ 90 | ❌ Not audited | |

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
| Docker + docker-compose setup | ❌ Not implemented | |
| Kubernetes / AWS ECS deployment | ❌ Not implemented | |
| Nginx reverse proxy + load balancer | ❌ Not implemented | |
| Redis caching layer (service catalog, worker profiles) | ❌ Not implemented | |
| Redis-backed Socket.IO adapter (multi-pod) | ❌ Not implemented | |
| AWS S3 / Cloudinary for file storage | ❌ Not implemented | Local disk only |
| Database indexes on high-query columns | ❌ Not implemented | |
| Connection pooling (PgBouncer) | ❌ Not implemented | |

### 6.2 CI/CD & DevOps

| Feature | Status | Notes |
|---|---|---|
| GitHub Actions test + lint pipeline | ❌ Not implemented | |
| Automated container build & push on merge | ❌ Not implemented | |
| Environment secrets management (AWS Secrets Manager) | ❌ Not implemented | `.env` files only |
| Staging environment | ❌ Not implemented | |

### 6.3 Observability

| Feature | Status | Notes |
|---|---|---|
| Error monitoring (Sentry) | ❌ Not implemented | |
| Structured logging (Winston + Loki / ELK) | ❌ Not implemented | `console.log` only |
| APM / metrics dashboard (Grafana + Prometheus) | ❌ Not implemented | |
| Uptime monitoring | ❌ Not implemented | |

### 6.4 Performance Optimisation

| Feature | Status | Notes |
|---|---|---|
| Response compression (gzip / brotli) | ❌ Not implemented | |
| API response caching (Redis) | ❌ Not implemented | |
| Frontend code splitting + lazy loading | ⚠️ Partial | Vite defaults only |
| Image optimisation (WebP, lazy load) | ❌ Not implemented | |
| CDN for static assets | ❌ Not implemented | |
| Rate limiting (per-user) beyond basic | ❌ Not implemented | |

---

## Phase 7 — Business Growth

### 7.1 User Acquisition

| Feature | Status | Notes |
|---|---|---|
| Referral program (₹100 credit to referrer + referee) | ❌ Not implemented | |
| First-booking discount (30% off) | ❌ Not implemented | |
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
| **Phase 1 — Trust & Safety** | 7 | 5 | 6 |
| **Phase 2 — Real-Time & Location** | 9 | 1 | 15 |
| **Phase 3 — Real Payments** | 0 | 0 | 17 |
| **Phase 4 — Mobile** | 0 | 0 | 8 |
| **Phase 5 — Intelligence** | 5 | 2 | 10 |
| **Phase 6 — Scale & Deploy** | 0 | 1 | 17 |
| **Phase 7 — Growth** | 0 | 0 | 14 |
| **TOTAL** | **34** | **9** | **87** |

---

## 🎯 Recommended Next Steps (Highest Impact / Lowest Effort)

| Priority | Feature | Effort | Impact |
|---|---|---|---|
| 🔴 1 | OTP expiry enforcement (30 min) | 1 hr | Security win |
| 🔴 2 | AWS S3 / Cloudinary file upload | 1 day | Unblocks KYC + work photos |
| 🔴 3 | Booking confirmation emails (Nodemailer) | 1 day | Professional UX |
| 🔴 4 | Razorpay payment integration | 2–3 days | Real money flow |
| 🟡 5 | PWA manifest + service worker | 1 day | Installable app instantly |
| 🟡 6 | Browser push notifications (VAPID) | 1 day | Background alerts |
| 🟡 7 | Google Maps address autocomplete | 1 day | Better booking UX |
| 🟡 8 | Rate limiter hardening (express-rate-limit) | 2 hr | Security |
| 🟢 9 | Docker + docker-compose | 1 day | Deployment readiness |
| 🟢 10 | GitHub Actions CI/CD pipeline | 1 day | Automated deploys |

---

*Generated: 2026-02-21 · Based on `docs/PRODUCTION_ROADMAP.md`*
