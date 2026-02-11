# UrbanPro V2 — Comprehensive Project Issues Document

> **Generated:** 2026-02-10  
> **Scope:** Full codebase audit — Frontend (client), Backend (server), Database, Architecture  
> **Total Issues Found:** 52  

---

## Table of Contents

1. [Critical Bugs (P0)](#1-critical-bugs-p0)
2. [Functional Bugs (P1)](#2-functional-bugs-p1)
3. [UI/UX Issues (P2)](#3-uiux-issues-p2)
4. [Architecture & Code Quality (P3)](#4-architecture--code-quality-p3)
5. [Security Concerns (P4)](#5-security-concerns-p4)
6. [Performance Issues (P5)](#6-performance-issues-p5)
7. [Missing Features (P6)](#7-missing-features-p6)
8. [SEO & Metadata (P7)](#8-seo--metadata-p7)
9. [Accessibility (P8)](#9-accessibility-p8)
10. [Content & Presentation (P9)](#10-content--presentation-p9)

---

## 1. Critical Bugs (P0)

### ISSUE-001: `window.location.assign()` Used Instead of React Router Navigation
- **Severity:** 🔴 Critical
- **Category:** Performance / UX Bug
- **Files Affected:** 
  - `client/src/pages/customer/CustomerDashboardPage.jsx` (lines 92, 211, 214, 217, 220, 257)
  - `client/src/pages/worker/WorkerDashboardPage.jsx` (lines 108, 168, 171, 255, 258, 281, 312, 315, 318, 321, 324)
  - `client/src/pages/admin/AdminDashboardPage.jsx` (lines 158, 199, 211, 214, 217, 220, 223)
  - `client/src/pages/customer/CustomerBookingsPage.jsx` (lines 90, 102)
  - `client/src/pages/profile/CustomerProfilePage.jsx` (lines 292, 295)
  - `client/src/pages/worker/WorkerServicesPage.jsx` (line 79)
  - `client/src/pages/worker/WorkerBookingsPage.jsx` (line 138)
  - `client/src/pages/auth/ForgotPasswordPage.jsx` (line 88)
- **Description:** Throughout the application, navigation buttons use `window.location.assign('/path')` instead of React Router's `useNavigate()`. This causes:
  - Full page reload on every navigation click
  - Complete destruction of all React state (component state, context)
  - React Query cache is wiped, requiring all API data to re-fetch
  - App feels sluggish like a traditional server-rendered site
  - Defeats the purpose of a Single Page Application (SPA)
- **Total Occurrences:** 31 instances across 8 files
- **Fix:** Replace all `window.location.assign(path)` with `navigate(path)` from `useNavigate()` hook.

---

### ISSUE-002: Footer Always Renders in Dark Theme Regardless of Mode
- **Severity:** 🔴 Critical
- **Category:** Visual Bug
- **File:** `client/src/components/layout/Footer.jsx`
- **Description:** The Footer component has hardcoded dark styling:
  ```jsx
  style={{ background: 'linear-gradient(90deg, rgba(20,10,50,0.95) 0%, rgba(10,10,40,0.98) 100%)' }}
  ```
  It also uses hardcoded dark-mode classes like `text-dark-300` and `text-dark-500` without any `isDark` conditional. In light mode, the footer appears as a jarring dark blob against a white/light background, creating a severe visual inconsistency.
- **Fix:** Make footer theme-aware using `useTheme()` and conditional classes, similar to other components.

---

### ISSUE-003: `index.html` Title is "client"
- **Severity:** 🔴 Critical
- **Category:** SEO / Presentation
- **File:** `client/index.html` (line 7)
- **Description:** The HTML `<title>` tag is set to the default Vite scaffold value `"client"`. This is what users see in:
  - Browser tabs
  - Bookmarks
  - Search engine results
  - Social media shares
- **Fix:** Change to `"UrbanPro — AI-Powered Local Services Marketplace"` and add meta description tag.

---

### ISSUE-004: Notification System Has No Visible UI Rendering
- **Severity:** 🔴 Critical
- **Category:** Functional Bug
- **Files:**
  - `client/src/context/NotificationContext.jsx`
  - `client/src/main.jsx`
- **Description:** The `NotificationContext` stores notification state (an array of `{ id, message, type }` objects) and provides `showError`, `showSuccess`, `showWarning`, `showInfo` methods. However, **there is no toast/notification UI component** that reads from this context and renders the notifications on screen. The `sonner` library is listed as a dependency in `package.json` but is **never imported or used** anywhere in the codebase. Notifications are collected but never displayed to the user.
- **Fix:** Either integrate `sonner`'s `<Toaster />` component, or build a custom notification renderer that consumes `NotificationContext`.

---

## 2. Functional Bugs (P1)

### ISSUE-005: Navbar User Dropdown Has No Click-Outside-to-Close
- **Severity:** 🟠 High
- **Category:** UX Bug
- **File:** `client/src/components/layout/Navbar.jsx`
- **Description:** The user menu dropdown toggles with `userMenuOpen` state but has no event listener to close it when clicking outside the menu. Once opened, users must click the toggle button again to close it — violating standard dropdown behavior.
- **Fix:** Add a `useEffect` with `mousedown` event listener on `document` to detect clicks outside the dropdown ref and close it.

---

### ISSUE-006: ProtectedRoute Loading Spinners Ignore Dark Mode
- **Severity:** 🟠 High
- **Category:** Theme Bug
- **File:** `client/src/routes/ProtectedRoute.jsx`
- **Description:** The loading states for `ProtectedRoute`, `AdminRoute`, `PublicRoute`, and `AdminPublicRoute` all use hardcoded light-mode classes:
  ```jsx
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <p className="text-gray-600">Loading...</p>
  ```
  Only `WorkerRoute` and `CustomerRoute` use `dark:` classes. In dark mode, users briefly see a white/light-gray flash before the page loads.
- **Fix:** Apply `dark:bg-dark-900 dark:text-gray-400` classes consistently across all route wrappers.

---

### ISSUE-007: Mobile Sidebar Close Button Has Poor Contrast in Light Mode
- **Severity:** 🟡 Medium
- **Category:** Theme Bug
- **File:** `client/src/components/layout/Sidebar.jsx` (line 96)
- **Description:** The mobile close button always uses dark-mode text colors: `text-gray-400 hover:text-gray-200`. In light mode, this text is nearly invisible against the white sidebar background.
- **Fix:** Apply `isDark` conditional styling like `isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-900'`.

---

### ISSUE-008: Password Visibility Toggle Icon Ignores Dark Mode
- **Severity:** 🟡 Medium
- **Category:** Theme Bug
- **File:** `client/src/components/common/Input.jsx` (line 107)
- **Description:** The password show/hide toggle button uses hardcoded classes `text-gray-400 hover:text-gray-600`. In dark mode, the hover state (`text-gray-600`) is darker than the resting state, making it appear to dim instead of brighten on hover.
- **Fix:** Use `isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'`.

---

### ISSUE-009: Service Price Shown in USD (`$`) But Earnings in INR
- **Severity:** 🟡 Medium
- **Category:** Data Consistency
- **Files:**
  - `client/src/pages/services/ServiceDetailPage.jsx` (line 156: `$${service.basePrice}`)
  - `client/src/pages/worker/WorkerDashboardPage.jsx` (line 151: `INR {earnings.toFixed(0)}`)
  - `client/src/pages/services/ServiceDetailPage.jsx` (line 248: `$${worker.hourlyRate}/hr`)
- **Description:** Currency is inconsistent across the application. Service prices use `$` (USD), worker hourly rates use `$`, but worker earnings use `INR`. This suggests a localization issue that was partially addressed.
- **Fix:** Standardize on a single currency or use a currency formatting utility that reads from a config.

---

### ISSUE-010: 404 Page is Inline JSX in Router — No Layout/Styling
- **Severity:** 🟡 Medium
- **Category:** UI Bug
- **File:** `client/src/routes/AppRoutes.jsx`
- **Description:** The 404 "Not Found" route renders inline JSX without the `MainLayout` wrapper, meaning there's no Navbar, Footer, or proper page styling. Users hitting a 404 see a bare, unstyled page that looks broken.
- **Fix:** Create a dedicated `NotFoundPage.jsx` component wrapped in `MainLayout` with proper branding.

---

### ISSUE-011: Seed Script Only Creates Admin — No Test Data
- **Severity:** 🟡 Medium
- **Category:** Development
- **File:** `server/prisma/seed.js`
- **Description:** The database seed script only creates a single admin user. For development and demo purposes, there are no:
  - Sample customer accounts
  - Sample worker accounts with profiles
  - Sample services
  - Sample bookings
  - Sample reviews
- **Impact:** All dashboard pages show "No data" or empty states, making it impossible to demo or test the app out of the box.
- **Fix:** Expand seed script to create sample data for all models.

---

## 3. UI/UX Issues (P2)

### ISSUE-012: Landing Page Hero Section Lacks Visual Impact
- **Severity:** 🟠 High
- **Category:** First Impression / Design
- **File:** `client/src/pages/public/LandingPage.jsx`
- **Description:** The hero section has:
  - No hero image, illustration, or visual asset — just text and CSS gradient orbs
  - Generic gradient background effects that feel placeholder-like
  - Statistics section shows hardcoded fake numbers ("500+ Workers", "10K+ Bookings") with no animation
  - No testimonials/social proof section
  - No featured worker cards showcase
  - Service category buttons have no icons (just text labels)
- **Impact:** First impression is underwhelming for a business marketplace.
- **Fix:** Add hero illustration, animated counter stats, testimonial carousel, featured worker cards, and category icons.

---

### ISSUE-013: No Skeleton/Shimmer Loading States
- **Severity:** 🟠 High
- **Category:** Perceived Performance
- **Files:** All dashboard pages, service pages, booking pages
- **Description:** When data loads, the app shows a bare `<Spinner />` centered on the page. The content area is completely empty until data arrives. This looks amateurish compared to modern apps that show skeleton placeholders matching the expected content shape.
- **Fix:** Create a `<Skeleton />` component with shimmer animation and use it in all data-fetching views.

---

### ISSUE-014: Dashboard Stat Cards Have No Visual Differentiation
- **Severity:** 🟠 High
- **Category:** Design
- **Files:**
  - `client/src/pages/customer/CustomerDashboardPage.jsx`
  - `client/src/pages/worker/WorkerDashboardPage.jsx`
  - `client/src/pages/admin/AdminDashboardPage.jsx`
- **Description:** All stat cards (Total Bookings, Pending, Completed, etc.) look identical — same border, same background, same text style. There is:
  - No icon in each card (customer/worker dashboards)
  - No color coding per stat type (e.g., green for completed, yellow for pending)
  - No trend indicators (↑ 12% vs last month)
  - No entry animations (staggered fade-in)
  - No animated counting transitions for numbers
- **Fix:** Add per-stat icon + color, animated number counting, and staggered card entrance.

---

### ISSUE-015: Service Cards in ServicesPage Are Visually Flat
- **Severity:** 🟡 Medium
- **Category:** Design
- **File:** `client/src/pages/services/ServicesPage.jsx`
- **Description:** Service listing cards show:
  - A generic `Tag` icon for every service (no unique icons per category)
  - No service image/thumbnail
  - No worker count badge ("12 workers available")
  - No rating/popularity indicator
  - No hover animation or interactive depth
  - No price range display
- **Fix:** Enhance service cards with category-specific icons, worker availability count, rating display, and hover effects.

---

### ISSUE-016: No Glassmorphism or Modern UI Effects
- **Severity:** 🟡 Medium
- **Category:** Design Polish
- **Files:** Various component files
- **Description:** Cards use basic `bg-white border rounded-xl shadow-sm`. The design doesn't employ any modern UI patterns such as:
  - Glassmorphism (`backdrop-blur`, translucent backgrounds)
  - Gradient borders on hover
  - Mesh gradient section backgrounds
  - Frosted glass effects for overlays
  - Depth layering with multiple shadow levels
- **Fix:** Add CSS utility classes for glassmorphism and apply to key surfaces like modals, cards, and hero sections.

---

### ISSUE-017: No Animated Page Transitions
- **Severity:** 🟡 Medium
- **Category:** Polish
- **Files:** `client/src/routes/AppRoutes.jsx`, `client/src/App.jsx`
- **Description:** Route changes happen instantly with no transition. Adding Framer Motion `<AnimatePresence>` with page-level enter/exit animations would make the app feel much more polished and native.
- **Fix:** Wrap page routes with `<AnimatePresence>` and add `motion.div` page wrappers with fade/slide animations.

---

### ISSUE-018: No Empty State Illustrations
- **Severity:** 🟡 Medium
- **Category:** Design
- **Files:** Multiple dashboard and listing pages
- **Description:** When data is empty (no bookings, no services, no reviews), pages show plain text like "No bookings yet." or "No services added yet." Modern apps use custom illustrations or lottie animations for empty states to keep users engaged and guide them toward actions.
- **Fix:** Add SVG illustrations or Lottie animations for each empty state scenario.

---

### ISSUE-019: About, Blog, Careers, FAQ, Contact Pages Are Stubs
- **Severity:** 🟡 Medium
- **Category:** Content / Design
- **Files:**
  - `client/src/pages/public/AboutPage.jsx` (75 lines)
  - `client/src/pages/public/BlogPage.jsx` (53 lines — 3 hardcoded posts, no links)
  - `client/src/pages/public/CareersPage.jsx` (47 lines — 3 hardcoded jobs, "Apply via email")
  - `client/src/pages/public/FaqPage.jsx` (57 lines — 4 static FAQs, no accordion)
  - `client/src/pages/public/ContactPage.jsx` (77 lines — no contact form)
  - `client/src/pages/public/PricingPage.jsx` (71 lines — no CTA buttons)
  - `client/src/pages/public/SecurityPage.jsx` (56 lines — minimal content)
- **Description:** All informational pages are minimal placeholder stubs with hardcoded static data. They have:
  - No images or visual assets
  - No accordion or accordion for FAQ
  - No contact form in Contact page
  - Blog posts have no "Read More" links or dates
  - Career listings have no "Apply" button functionality
  - Pricing page has no CTA buttons per tier
- **Fix:** Either flesh out these pages with proper content and interactivity, or remove them from navigation until ready.

---

### ISSUE-020: Pricing Page Tiers Have No CTA Buttons
- **Severity:** 🟡 Medium
- **Category:** Conversion / UX
- **File:** `client/src/pages/public/PricingPage.jsx`
- **Description:** Each pricing tier card displays features and price but has **no call-to-action button** ("Get Started", "Subscribe", "Contact Sales"). Users see the pricing but have no way to act on it.
- **Fix:** Add CTA buttons to each pricing tier card.

---

### ISSUE-021: Booking Form UX Could Be Improved
- **Severity:** 🟡 Medium
- **Category:** UX
- **File:** `client/src/pages/services/ServiceDetailPage.jsx`
- **Description:** The booking form works but has UX issues:
  - Worker selection is a plain `<select>` dropdown with no visual info (no photo, rating, or availability)
  - No date picker calendar — uses raw `datetime-local` input which varies across browsers
  - "Notes" field is a single-line `<input>` instead of a `<textarea>` for longer messages
  - No confirmation step before booking (no summary/review modal)
  - Success message is plain text — no visual feedback (e.g., check mark animation, confetti)
- **Fix:** Add worker cards for selection, use a proper date picker, add textarea, show booking confirmation modal.

---

## 4. Architecture & Code Quality (P3)

### ISSUE-022: No Error Boundary Components
- **Severity:** 🟠 High
- **Category:** Reliability
- **Files:** None (missing)
- **Description:** The entire application has no React Error Boundary. If any component throws a runtime error (e.g., undefined property access, API response shape mismatch), the **entire app** crashes to a white screen with no recovery option. Users must manually refresh the page.
- **Fix:** Create an `<ErrorBoundary>` component wrapping the app and individual page sections with fallback UIs.

---

### ISSUE-023: No Lazy Loading / Code Splitting for Routes
- **Severity:** 🟠 High
- **Category:** Performance
- **File:** `client/src/routes/AppRoutes.jsx`
- **Description:** All 39 page components are eagerly imported at the top of `AppRoutes.jsx`. This means the initial JavaScript bundle includes every page (admin, worker, customer, auth, public, legal) even if the user only visits the landing page.
- **Impact:** Larger initial bundle → slower first load → worse Lighthouse/Core Web Vitals scores.
- **Fix:** Use `React.lazy()` + `<Suspense>` for route-based code splitting.

---

### ISSUE-024: Duplicate Navigation Configuration in 3 Places
- **Severity:** 🟡 Medium
- **Category:** Maintainability
- **Files:**
  - `client/src/components/layout/Navbar.jsx` — `navLinks` and `userMenuItems` objects
  - `client/src/components/layout/Sidebar.jsx` — `navConfig` object
  - `client/src/routes/AppRoutes.jsx` — route definitions
- **Description:** Navigation items are defined independently in the navbar, sidebar, and router. This leads to:
  - Sidebar admin nav has 4 items; navbar has different items
  - Adding a new page requires editing 3 separate files
  - Risk of navigation targets going out of sync
- **Fix:** Create a single `navigationConfig.js` consumed by all three components.

---

### ISSUE-025: Theme Handling Is Inconsistent — Manual `isDark` vs. Tailwind `dark:` Prefix
- **Severity:** 🟡 Medium
- **Category:** Maintainability / DX
- **Files:** All component files
- **Description:** The app uses two different theming approaches inconsistently:
  1. **Manual approach:** `const { isDark } = useTheme()` then `isDark ? 'text-gray-100' : 'text-gray-900'` (used in ~95% of components)
  2. **Tailwind dark: prefix:** `className="text-gray-600 dark:text-gray-400"` (used only in `WorkerRoute` and `CustomerRoute` loading states)
  
  The manual approach requires importing `useTheme()` in every component, creates verbose ternary expressions everywhere, and is error-prone (easy to miss one element). The `dark:` prefix approach is cleaner but only works because `ThemeContext` adds/removes the `dark` class on `<html>`.
- **Fix:** Standardize on Tailwind's `dark:` prefix system since the `dark` class is already being toggled on `documentElement`. This would eliminate the need for `useTheme()` in most components.

---

### ISSUE-026: `useReducer` Used in AuthContext Despite Zustand Dependency
- **Severity:** 🟢 Low
- **Category:** Dependency Bloat
- **Files:**
  - `client/src/context/AuthContext.jsx` (uses `useReducer`)
  - `client/package.json` (lists `zustand` as dependency)
- **Description:** The project lists `zustand` as a dependency but never imports or uses it anywhere. Auth state uses `useReducer` within Context API. Either the migration to Zustand was abandoned, or it was included speculatively.
- **Fix:** Either remove `zustand` from dependencies or migrate auth state to Zustand for consistency.

---

### ISSUE-027: Axios Interceptor Uses `window.location.href` for Auth Redirect
- **Severity:** 🟡 Medium
- **Category:** UX / Architecture
- **File:** `client/src/api/axios.js` (line 56)
- **Description:** On 401 responses, the axios interceptor does: `window.location.href = '/login'`. This causes a hard refresh, destroying all app state. Additionally:
  - No token refresh mechanism — expired JWT immediately boots user out
  - No user-friendly "session expired" message before redirect
  - Possible redirect loop if login page itself triggers a 401
- **Fix:** Use React Router's navigation context or a global event system to handle auth redirects without hard reloads. Add a toast notification before redirecting.

---

### ISSUE-028: No `.env.example` File for Development Setup
- **Severity:** 🟡 Medium
- **Category:** Developer Experience
- **Files:** `.env` files exist but no `.env.example`
- **Description:** The `.env` files contain actual secrets (JWT secret, database URL). New developers cloning the repo won't know what environment variables are required. The actual `.env` file should be in `.gitignore` (verify this), and `.env.example` should document required variables with placeholder values.
- **Fix:** Create `.env.example` files for both client and server with placeholder values.

---

### ISSUE-029: `Spinner` Component Defined Inline Inside `Button.jsx`
- **Severity:** 🟢 Low
- **Category:** Code Quality
- **File:** `client/src/components/common/Button.jsx` (lines 76-81)
- **Description:** The loading spinner SVG is defined as an inline function component `Spinner` inside the `Button` render function. This creates a new function on every render.
- **Fix:** Move it outside the component as a static component or import from the existing `Spinner` common component.

---

## 5. Security Concerns (P4)

### ISSUE-030: JWT Secret Has a Hardcoded Fallback in Source Code
- **Severity:** 🔴 Critical
- **Category:** Security
- **File:** `server/src/config/env.js` (line 5)
- **Description:** The JWT secret has a hardcoded fallback: `const JWT_SECRET = process.env.JWT_SECRET || 'change_this_dev_secret'`. If the environment variable is not set in production, the app silently uses a publicly-known, easily-guessable secret, allowing attackers to forge valid JWT tokens.
- **Fix:** Throw an error if `JWT_SECRET` is not set in production. Keep the fallback only for development.

---

### ISSUE-031: Admin Credentials Stored in `.env` Comments
- **Severity:** 🟠 High
- **Category:** Security
- **File:** `server/.env` (lines 14-15)
- **Description:** The `.env` file contains plaintext admin credentials as comments:
  ```
  # Email: admin@urbanpro.com
  # Password: Admin@12345
  ```
  If `.env` is committed to version control (which should be verified), credentials are publicly exposed.
- **Fix:** Remove credential comments from `.env`. Ensure `.env` is in `.gitignore`. Document credentials securely elsewhere.

---

### ISSUE-032: `express-rate-limit` Only Applied to Specific Routes
- **Severity:** 🟡 Medium
- **Category:** Security
- **Files:** 
  - `server/src/modules/auth/auth.routes.js`
  - `server/src/modules/bookings/booking.routes.js`
  - `server/src/config/rateLimit.js`
- **Description:** Rate limiting is configured and applied only to auth and booking routes. Global rate limiting on all API endpoints is absent, leaving the remaining endpoints vulnerable to abuse or brute-force attacks.
- **Fix:** Apply a global rate limiter in `index.js` as middleware, with stricter limits on sensitive routes.

---

### ISSUE-033: CORS Origin Hardcoded and No Validation
- **Severity:** 🟡 Medium
- **Category:** Security
- **File:** `server/src/config/env.js`
- **Description:** CORS origin defaults to `http://localhost:5173`. In production deployments, if `CORS_ORIGIN` is not set, the API only accepts requests from localhost, potentially making the frontend-backend connection fail silently.
- **Fix:** Validate CORS origin at startup and fail loudly if not properly configured for production.

---

### ISSUE-034: `VITE_UI_PREVIEW_MODE` Bypasses Authentication Guards
- **Severity:** 🟠 High
- **Category:** Security
- **Files:**
  - `client/src/routes/ProtectedRoute.jsx` (WorkerRoute line 181, CustomerRoute line 226)
  - `client/.env` (`VITE_UI_PREVIEW_MODE=true`)
- **Description:** When `VITE_UI_PREVIEW_MODE` is set to `'true'`, `WorkerRoute` and `CustomerRoute` bypass all authentication checks and render `children` directly. This is currently enabled in the production `.env` file. If accidentally deployed to production, all protected pages would be publicly accessible.
- **Fix:** Remove this flag from `.env`, move it to `.env.development` only, and ensure it's never enabled in production builds.

---

## 6. Performance Issues (P5)

### ISSUE-035: No Memoization on Complex Renders
- **Severity:** 🟡 Medium
- **Category:** Performance
- **Files:** Dashboard pages, service listing pages
- **Description:** Components like `CustomerDashboardPage`, `WorkerDashboardPage`, and `ServicesPage` compute derived data (summaries, filtered lists) using `useMemo`, which is good. However, the card components themselves (`Card`, `Button`) re-render on every parent re-render because they aren't wrapped in `React.memo`. Given that `Card` imports `motion` from Framer Motion and calls `useTheme()`, unnecessary re-renders could impact performance with large lists.
- **Fix:** Apply `React.memo` to stable presentational components, especially `Card`, `Badge`, and `CardTitle`.

---

### ISSUE-036: Images Not Optimized — No Lazy Loading for User Avatars
- **Severity:** 🟡 Medium
- **Category:** Performance
- **Files:** `client/src/components/layout/Sidebar.jsx`, profile pages
- **Description:** Profile images and avatars are rendered with standard `<img>` tags without `loading="lazy"` attribute. Additionally, there's no fallback for slow-loading images (no blur placeholder, no progressive loading).
- **Fix:** Add `loading="lazy"` to all images, consider using blur-up placeholders.

---

### ISSUE-037: React Query Cache Configuration May Be Too Aggressive
- **Severity:** 🟢 Low
- **Category:** Performance
- **File:** `client/src/main.jsx`
- **Description:** The React Query client is initialized with default settings. For a marketplace app, some queries (e.g., service details) could benefit from longer `staleTime` to reduce unnecessary refetches. The service workers query in `ServiceDetailPage.jsx` sets `staleTime: 5 * 60 * 1000` (good), but most other queries use the default, meaning they refetch on every window focus.
- **Fix:** Set sensible defaults for `staleTime` and `gcTime` in the QueryClient configuration.

---

### ISSUE-038: No Image Compression or CDN Configuration
- **Severity:** 🟡 Medium
- **Category:** Performance / Infrastructure
- **File:** `server/src/index.js`
- **Description:** File uploads go to `server/uploads/` which is served as a static directory. There is:
  - No image compression/resizing on upload (a 5MB photo is served as-is)
  - No CDN integration
  - No cache headers for static assets
- **Fix:** Add image processing (e.g., `sharp` library) for compression/resizing on upload. Add cache-control headers for static files.

---

## 7. Missing Features (P6)

### ISSUE-039: No Data Visualization / Charts on Dashboards
- **Severity:** 🟠 High
- **Category:** Missing Feature
- **Files:** All dashboard pages
- **Description:** Admin and worker dashboards show raw numbers in cards but have no visual charts or graphs:
  - No booking trends chart (line/area chart over time)
  - No revenue over time visualization
  - No worker performance distribution
  - No service popularity chart (pie/donut)
  - No booking status breakdown visualization
- **Fix:** Integrate a charting library (e.g., Recharts, Chart.js) and add at least 2-3 charts per dashboard.

---

### ISSUE-040: No Real-Time Notifications / WebSocket Support
- **Severity:** 🟡 Medium
- **Category:** Missing Feature
- **Description:** The app has no real-time communication. When a booking is created, the worker isn't notified until they manually refresh. No push notifications, no WebSocket events, no SSE (Server-Sent Events).
- **Fix:** Add Socket.io or SSE for real-time booking notifications, status updates, and chat.

---

### ISSUE-041: No Pagination on Any List View
- **Severity:** 🟡 Medium
- **Category:** Missing Feature / Scalability
- **Files:** Services listing, bookings listing, admin users list, admin bookings list
- **Description:** All list views load and render the entire dataset at once. With growth, this causes:
  - Slow API responses (fetching 1000+ records)
  - DOM bloat (rendering 1000+ card components)
  - Poor memory usage
- **Fix:** Add cursor-based or offset pagination to APIs and corresponding pagination UI (or infinite scroll) on frontend.

---

### ISSUE-042: No Global Search Functionality
- **Severity:** 🟡 Medium
- **Category:** Missing Feature
- **Description:** There is no global search bar in the navbar to quickly find services, workers, or bookings. The services page has a category filter and search, but there's no app-wide search experience.
- **Fix:** Add a command-palette style global search (Cmd+K / Ctrl+K) or a navbar search bar.

---

### ISSUE-043: No Payment Integration UI
- **Severity:** 🟡 Medium
- **Category:** Missing Feature
- **Files:** Prisma schema has `Payment` model, but no frontend pages
- **Description:** The database schema includes a `Payment` model with `amount`, `method`, `status`, and `transactionId` fields. However, there are no frontend pages or components for:
  - Making payments
  - Viewing payment history
  - Payment receipts
  - Refund requests
- **Fix:** Build payment flow UI (even simulated for demo purposes).

---

### ISSUE-044: No Image Upload Preview or Crop
- **Severity:** 🟡 Medium
- **Category:** Missing Feature
- **Files:** Profile setup/edit pages
- **Description:** Profile photo upload is handled by the backend via multer, but the frontend has no:
  - Image preview before upload
  - Drag-and-drop upload zone
  - Image crop/resize tool
  - Upload progress indicator
- **Fix:** Add an image preview component with crop functionality.

---

### ISSUE-045: No i18n on Frontend Despite Backend Support
- **Severity:** 🟢 Low
- **Category:** Missing Feature
- **Files:** `server/src/config/i18n.js` exists, but no client counterpart
- **Description:** The server has i18n configuration, suggesting multi-language was planned. However, the frontend has no internationalization setup — all strings are hardcoded in English.
- **Fix:** Add `react-i18next` or similar and externalize strings to translation files.

---

### ISSUE-046: No PWA/Offline Support
- **Severity:** 🟢 Low
- **Category:** Missing Feature
- **Description:** For a service marketplace where workers may be in areas with poor connectivity, PWA support would be valuable. Currently:
  - No `manifest.json`
  - No service worker
  - No offline fallback page
  - No app install prompt
- **Fix:** Add Vite PWA plugin (`vite-plugin-pwa`) with basic offline caching.

---

## 8. SEO & Metadata (P7)

### ISSUE-047: No Per-Page Title/Meta Tags
- **Severity:** 🟠 High
- **Category:** SEO
- **Files:** All page components
- **Description:** No page component sets its own `<title>` or `<meta>` tags. Every page shows the same `"client"` title. For a marketplace, each page should have unique, descriptive titles:
  - "Browse Local Services | UrbanPro"
  - "Plumbing Service Details | UrbanPro"
  - "My Bookings | UrbanPro Dashboard"
- **Fix:** Install `react-helmet-async` and add `<Helmet>` tags to every page component.

---

### ISSUE-048: No Favicon / Missing Branding Assets
- **Severity:** 🟡 Medium
- **Category:** Branding
- **File:** `client/index.html` (line 5)
- **Description:** The favicon is the default Vite logo (`/vite.svg`). There is no UrbanPro branded favicon, apple-touch-icon, or OG image for social sharing.
- **Fix:** Create branded favicon in multiple sizes and add appropriate meta tags.

---

### ISSUE-049: No `robots.txt` or `sitemap.xml`
- **Severity:** 🟢 Low
- **Category:** SEO
- **Description:** The app has no `robots.txt` to guide search engine crawlers and no `sitemap.xml` for indexing. For a marketplace that wants organic traffic, these are essential.
- **Fix:** Add `public/robots.txt` and generate a dynamic `sitemap.xml`.

---

## 9. Accessibility (P8)

### ISSUE-050: Limited `aria-label` Usage Across Interactive Elements
- **Severity:** 🟡 Medium
- **Category:** Accessibility
- **Files:** All component files
- **Description:** Only 3 files (`Footer.jsx`, `Navbar.jsx`, `Sidebar.jsx`) use `aria-label`. Interactive elements throughout the app (buttons, inputs, modals, dropdowns) lack proper ARIA attributes:
  - Custom dropdown has no `role="menu"` / `role="menuitem"`
  - Modal has no `role="dialog"` / `aria-modal="true"` / `aria-labelledby`
  - Icon-only buttons have no accessible labels
  - Form inputs don't associate labels via `htmlFor` + `id`
- **Fix:** Add ARIA attributes to all interactive components. Label inputs with `htmlFor`/`id` pairs.

---

### ISSUE-051: No Keyboard Navigation Support for Custom Components
- **Severity:** 🟡 Medium
- **Category:** Accessibility
- **Files:** Booking mode selector, dropdown menus, custom select elements
- **Description:** Custom interactive elements like the booking mode selector in `ServiceDetailPage.jsx` (the radio-button-like cards) and the navbar dropdown have no keyboard support:
  - Can't navigate between booking modes with arrow keys
  - Can't close dropdown with Escape (only Modal has this)
  - No focus trap in mobile menu
- **Fix:** Add `onKeyDown` handlers, `tabIndex`, focus management, and `role` attributes.

---

## 10. Content & Presentation (P9)

### ISSUE-052: No README or Documentation for Project Setup
- **Severity:** 🟡 Medium
- **Category:** Documentation
- **Description:** While `UrbanPro_Full_Workflow.md` exists as a system design document, there is no standard `README.md` at the project root with:
  - Project overview and screenshots
  - Tech stack badges
  - Setup instructions (prerequisites, install, run)
  - Environment variable documentation
  - API endpoint documentation
  - Deployment instructions
  - Contributing guidelines
- **Fix:** Create a comprehensive `README.md` with setup instructions, architecture overview, and screenshots.

---

## Summary Matrix

| Category | Count | Severity Distribution |
|----------|-------|----------------------|
| Critical Bugs (P0) | 4 | 🔴🔴🔴🔴 |
| Functional Bugs (P1) | 7 | 🟠🟠🟡🟡🟡🟡🟡 |
| UI/UX Issues (P2) | 10 | 🟠🟠🟠🟡🟡🟡🟡🟡🟡🟡 |
| Architecture & Code Quality (P3) | 8 | 🟠🟠🟡🟡🟡🟡🟢🟢 |
| Security Concerns (P4) | 5 | 🔴🟠🟠🟡🟡 |
| Performance Issues (P5) | 4 | 🟡🟡🟡🟢 |
| Missing Features (P6) | 8 | 🟠🟡🟡🟡🟡🟡🟢🟢 |
| SEO & Metadata (P7) | 3 | 🟠🟡🟢 |
| Accessibility (P8) | 2 | 🟡🟡 |
| Content & Presentation (P9) | 1 | 🟡 |
| **Total** | **52** | |

---

## Recommended Fix Order

### Phase 1: Critical Fixes (Day 1-2)
1. ISSUE-001: Replace all `window.location.assign` → `useNavigate()`
2. ISSUE-002: Fix footer dark/light theme
3. ISSUE-003: Fix `index.html` title and meta
4. ISSUE-004: Add toast notification UI
5. ISSUE-030: Remove JWT secret fallback in production
6. ISSUE-034: Disable `VITE_UI_PREVIEW_MODE` in production

### Phase 2: Core UX (Day 3-5)
7. ISSUE-005: Add click-outside for navbar dropdown
8. ISSUE-006: Fix loading screen dark mode
9. ISSUE-012: Enhance landing page hero
10. ISSUE-013: Add skeleton loaders
11. ISSUE-014: Enhance dashboard stat cards
12. ISSUE-022: Add error boundaries
13. ISSUE-023: Add lazy loading for routes

### Phase 3: Polish & Features (Day 6-10)
14. ISSUE-009: Standardize currency
15. ISSUE-010: Create proper 404 page
16. ISSUE-011: Expand seed data
17. ISSUE-015: Enhance service cards
18. ISSUE-039: Add charts to dashboards
19. ISSUE-041: Add pagination
20. ISSUE-047: Add per-page titles (react-helmet-async)

### Phase 4: Advanced (Week 2+)
21. All remaining issues by severity
