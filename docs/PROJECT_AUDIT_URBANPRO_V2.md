## UrbanPro V2 – Project Audit (Frontend & Backend)

**Date**: 2026-03-14  
**Scope**: Full-stack review (React/Vite frontend in `client`, Node/Express/Prisma backend in `server`)

---

## 1. High-level architecture

- **Frontend**
  - React 18 SPA with React Router v6, React Query, TailwindCSS, i18next.
  - App shell: `main.jsx` (providers) and `App.jsx` (layouts, routes, global listeners).
  - Routing: `routes/AppRoutes.jsx` and role-aware guards in `routes/ProtectedRoute.jsx`.
  - Layouts: `components/layout/*` (`MainLayout`, `AuthLayout`, `Navbar`, `Sidebar`, `Footer`).
  - Design system:
    - New primitives in `components/ui/*` (`Button`, `Input`, `Select`, `Textarea`, `Checkbox`, `Card`, `Modal`, `Spinner`, etc.).
    - Domain-aware components in `components/common/*` (`PageHeader`, `StatusBadges`, `BookingCard`, `AsyncState`, etc.) re-export UI primitives via `components/common/index.js`.
  - Features & pages:
    - Auth (`pages/auth/*`), public marketing pages (`pages/public/*`), customer area (`pages/customer/*`, `pages/profile/*`), worker area (`pages/worker/*`), admin (`pages/admin/*`), legal (`pages/legal/*`), safety/location/growth features.

- **Backend**
  - Express 5 app with modular route/controller/service layers per domain, Prisma ORM, PostgreSQL, Socket.IO, cron jobs.
  - Entry: `server/src/index.js` (middleware, health/metrics, static, route mounting, Socket.IO, cron init).
  - Domains:
    - Auth, customers, workers, bookings, payments/payouts/invoices, location, safety/SOS, notifications (email/SMS/WhatsApp/push), chat, business growth (wallet, loyalty, Pro Plus, referrals, favorites, gift cards), analytics, cache, system.
  - Data layer:
    - `server/prisma/schema.prisma` and migrations define users, worker/customer profiles, services, bookings, payments, reviews, wallet, referrals, loyalty, Pro Plus, favorites, gift cards, fraud and status history.

---

## 2. Key inconsistencies & partial refactors

- **Customer profile duplication**
  - `CustomerProfilePage.jsx`: new, complex multi-tab “settings” experience (identity, address, emergency contacts, wallet/loyalty, ProPlus, account security).
  - `CustomerProfilePage_v1.jsx`: older, simpler profile/address form using `getPageLayout`.
  - **Routing uses only the new page**; v1 is dead code and should be deleted or clearly marked as legacy to avoid accidental edits.

- **UI library migration**
  - New UI primitives live in `components/ui/*`; older code often imports via `components/common`.
  - `components/common/index.js` re-exports UI primitives plus domain components to keep older imports working.
  - Recommendation:
    - For new work, import directly from `components/ui`.
    - Gradually migrate legacy imports away from `components/common` where they only need UI primitives.

- **Legal layout underused**
  - `pages/legal/LegalLayout.jsx` exists, but routes mount legal pages directly.
  - Future improvement: wrap all legal pages with `LegalLayout` for consistent structure, or remove the layout file if the pattern is abandoned.

- **Heavy business-growth coupling**
  - Frontend growth pages (`CustomerWalletPage`, `CustomerLoyaltyPage`, `CustomerProPlusPage`, `CustomerFavoritesPage`, `CustomerReferralsPage`) assume specific JSON shapes from backend `/wallet`, `/loyalty`, `/proplus`, `/favorites`, `/referrals` endpoints.
  - Backend `business_growth` services integrate deeply with bookings, payments and coupons.
  - Any changes to Prisma growth models or service methods must be coordinated with these pages.

- **Node-side i18n maintenance scripts inside `client/src`**
  - Files such as `check_en.js`, `check_en.mjs`, `compare_en_mr.mjs`, `update_i18n_v*.cjs`, `fix_i18n.cjs`, etc., are dev-only Node scripts living under `client/src/config`.
  - They tripped frontend ESLint (browser `no-undef` on `require`, `process`, `console`).
  - Resolution: `client/eslint.config.js` now ignores `src/config/**/*` so application linting focuses on browser code only.

---

## 3. Concrete fixes applied

### 3.1 Backend

- **Booking service export duplication**
  - File: `server/src/modules/bookings/booking.service.js`
  - Issue: `verifyBookingCompletion` was exported twice in `module.exports` (duplicate key).
  - Fix: removed the duplicate key, keeping a single export. Backend ESLint now passes for this file.

- **Reminder cron script hygiene**
  - File: `server/src/modules/bookings/reminder.cron.js`
  - Issues:
    - Unused `sendBookingReminderEmail` import.
    - Empty `catch` block in email section.
  - Fix:
    - Actually call `sendBookingReminderEmail(booking)` inside a guarded `try/catch`.
    - Log failures via `console.error` for observability.

- **Backend lint status**
  - `npm run lint` in `server` now passes with **0 errors** using the flat config in `server/eslint.config.mjs`.

### 3.2 Frontend – functional fixes

- **Live tracking map translation**
  - File: `client/src/components/features/location/LiveTrackingMap.jsx`
  - Issue: used `t('Waiting for valid location...')` without importing or initializing `t`.
  - Fix: imported `useTranslation` from `react-i18next` and created `const { t } = useTranslation();` inside `LiveTrackingMap`.

- **UI primitives (`Input`, `Select`, `Textarea`, `Checkbox`)**
  - Files:
    - `components/ui/Input.jsx`
    - `components/ui/Select.jsx`
    - `components/ui/Textarea.jsx`
    - `components/ui/Checkbox.jsx`
  - Issues:
    - ESLint flagged `motion` as unused due to naming patterns.
    - Some redundant imports (e.g., `useEffect` that wasn’t used).
  - Fixes:
    - Normalized `framer-motion` usage:
      - Import as `motion as Motion` and update usages (`<Motion.div>`, `<Motion.p>`).
      - Ensured opening and closing JSX tags match (`<Motion.div>`/`</Motion.div>`, etc.).
    - Removed unused React imports where applicable.

- **Legacy customer profile v1**
  - File: `client/src/pages/profile/CustomerProfilePage_v1.jsx`
  - Issue: `toast` imported from `sonner` but never used.
  - Fix: removed the unused `toast` import.

### 3.3 Frontend – lint / quality rules

- **ESLint config (frontend) tightened for app code, relaxed for scripts**
  - File: `client/eslint.config.js`
  - Changes:
    - Added `src/config/**/*` to `ignores` so Node-only translation utilities stop blocking the main lint.
    - Kept strict rules for application code:
      - `no-unused-vars` with patterns so only upper-case unused symbols are allowed (config already present).
      - `no-undef` enabled; `no-console` disabled (logging allowed).

- **React hooks & memoization (partial)**
  - Files still worth special attention:
    - `WorkerAvailabilityPage.jsx`: `useMemo` for grouped availability uses `dayLabels` but only depends on `availability`. The React compiler warns about dependency mismatch.
      - Recommended fix: include `dayLabels` in the dependency array, or move `rawDayLabels` → `dayLabels` fully outside the component.
    - `WorkerDashboardPage.jsx`: `stats` `useMemo` uses `t` but dependency list omits it.
      - Recommended fix: add `t` to the `useMemo` dependency array.
    - `WorkerEarningsPage.jsx`: `chartData` `useMemo` uses `i18n.language` but the dependency array only includes `payments`.
      - Recommended fix: add `i18n.language` (or the `i18n` instance) to the dependencies.

---

## 4. Known remaining issues / TODOs

These are **not yet fixed in code**, but are the next logical improvements:

- **`WorkerProfilePage.jsx` parsing error**
  - ESLint reports a JSX parsing error near the bottom of the file (line ~1026), suggesting an extra `}` inside JSX text.
  - Action:
    - Inspect the tail end of the component (HUD overlays & closing JSX) for stray `}` characters in text nodes and ensure all JSX tags are properly balanced.
    - Once fixed, re-run `npm run lint` in `client` and ensure this file parses cleanly.

- **`CustomerProfilePage.jsx` `motion` import**
  - ESLint currently sees `motion` from `framer-motion` as unused.
  - Action:
    - Either:
      - Rename to `motion as Motion` and update all `motion.div` / `motion.p` calls to `Motion.div` / `Motion.p`, **or**
      - Remove `motion` if no longer used, or inline the minimal animations via CSS.

- **Worker booking detail page**
  - File: `pages/worker/WorkerBookingDetailPage.jsx`
  - Issues:
    - `resolveProfilePhotoUrl` imported but not used.
    - Local `i18n` variable assigned but unused.
  - Action:
    - Remove unused imports/variables, or wire them into the actual UI (e.g. resolve photo URL before rendering avatar, or use `i18n.language` where appropriate).

- **React compiler memoization warnings**
  - Even after dependency fixes, you may still see non-critical `react-hooks/preserve-manual-memoization` warnings when running `npm run lint` for the client.
  - These warnings do **not** break the build, but indicate places where the React compiler cannot fully optimize manual `useMemo` calls.
  - Action:
    - If you want a fully silent lint, either:
      - Refactor such `useMemo` to rely on simpler inputs, or
      - Disable `react-hooks/preserve-manual-memoization` in your ESLint config.

---

## 5. Recommended next steps (implementation roadmap)

- **Cleanup legacy & dead code**
  - Remove `CustomerProfilePage_v1.jsx` once you confirm you no longer need the old UX.
  - Audit for other `_v1`/`_legacy` components and either delete or move them under a `legacy/` folder.

- **Standardize UI imports**
  - Enforce a convention:
    - `components/ui/*` for design-system primitives.
    - `components/common/*` only for domain-level, non-trivial compositions.
  - Optionally add an ESLint rule or a codemod to rewrite imports automatically over time.

- **Harden worker profile & availability flows**
  - Finish resolving the React hook memoization warnings in:
    - `WorkerAvailabilityPage.jsx`
    - `WorkerDashboardPage.jsx`
    - `WorkerEarningsPage.jsx`
  - Add a small set of integration tests (even just smoke tests) for:
    - Worker activation / going online.
    - Accepting an open booking.
    - Verifying OTP flows and earnings updates.

- **Add CI guardrails**
  - Ensure CI runs:
    - `npm run lint` in both `client` and `server`.
    - Optional: `npm run build` in `client` and a test or `node src/index.js --check-config` style smoke in `server`.

---

## 6. Summary

- **Backend**: ESLint is clean; critical duplication in `booking.service.js` and minor cron issues have been fixed.
- **Frontend**: Core runtime bugs (like undefined `t` in `LiveTrackingMap` and noisy Node-script lint errors) have been addressed; UI primitives are lint-clean; growth and profile flows remain structurally consistent with the backend.
- **Remaining work**: a small set of JSX and React hooks/memoization issues (primarily in worker-facing pages) plus optional cleanup of legacy components and memoization warnings.

