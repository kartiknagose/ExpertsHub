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

### 1. Safety, Disposal & Emergency Handling
*   **Goal**: Implement "Worst-Case Scenario" handling, including SOS alerts, emergency contacts, and photo proof for dispute resolution.
*   **Implementation**:
    *   **SOS Alert System**: Integrated a "Panic Button" for both Customers and Workers on active jobs. Captures GPS coordinates.
    *   **Emergency Contacts**: Backend API for managing contacts; notifications triggered on SOS.
    *   **Photo Proof of Work**: Workers MUST upload a "Before Start" and "After Completion" photo. Photos are stored and linked to the booking for dispute resolution.
    *   **Database**: Added `SOSAlert`, `EmergencyContact`, and `BookingPhoto` models.

### 2. Worker Verification Enhancements
*   **Goal**: Ensure workers provide demonstrable proof of experience.
*   **Implementation**:
    *   Updated `WorkerVerificationPage` to include "Photos of Past Work / Experience Proof".
    *   Repurposed "Notes" field for "Experience Details & References".
    *   Admin can now review these practical proofs instead of just formal certificates.

### 3. Dashboard Analytics (Real-Time)
*   **Goal**: Provide workers with business insights.
*   **Implementation**:
    *   Integrated `SimpleBarChart` and `SimpleDonutChart` into `WorkerDashboardPage`.
    *   Earnings chart aggregates real data from `COMPLETED` bookings over the last 7 days.
    *   Job Status chart shows the distribution of Active, Completed, and Cancelled jobs.

### 4. Booking Intelligence (Location & Availability)
*   **Goal**: Prevent double-booking and out-of-area requests.
*   **Implementation**:
    *   **Availability Check**: Bookings are blocked if a worker has a conflicting job within a +/- 2-hour window.
    *   **Location Check**: Bookings are only allowed if the customer's address matches the worker's defined `serviceAreas`.
    *   **Open Job Filtering**: Workers only see "Open Requests" that match their service areas.

### 5. OTP Verification for Job Start & Completion
*   **Goal**: Verified physical presence.
*   **Implementation**:
    *   **Start OTP**: Customer provides to worker at arrival; worker enters to move to `IN_PROGRESS`.
    *   **Completion OTP**: Customer provides to worker at finish; worker enters to move to `COMPLETED`.

---

## 🏗 Technical Implementation Details

### Database Schema (Prisma)
*   **Updated**: `SOSAlert`, `EmergencyContact`, `BookingPhoto`.
*   **User Model**: Added `emergencyContacts`.
*   **Booking Model**: Added `photos`, `sosAlerts`, `startOtp`, `completionOtp`, etc.

### Backend (Node.js/Express)
*   **Booking Service**: `src/modules/bookings/booking.service.js` (Location & Availability logic, OTP logic).
*   **Safety Module**: `src/modules/safety/` (SOS and Emergency Contacts).
*   **Uploads Module**: Updated to support `booking-photos`.

### Frontend (React/Vite)
*   **Worker/Customer Bookings**: Integrated `SOSButton` and `ImageUpload`.
*   **Worker Dashboard**: `src/pages/worker/WorkerDashboardPage.jsx` (New Analytics UI).
*   **Service Detail**: `src/pages/services/ServiceDetailPage.jsx` (Booking validations).

---

## 📂 Key File Map
| File | Purpose |
| :--- | :--- |
| `server/prisma/schema.prisma` | Database Schema (Latest: SOS, Photos, OTP). |
| `server/src/modules/bookings/booking.service.js` | Core booking logic (Availability, Location, OTP). |
| `client/src/components/safety/SOSButton.jsx` | Panic button with Geolocation. |
| `client/src/components/common/ImageUpload.jsx` | File upload for proof of work. |

---

## ✅ Current Status
*   **Database**: Migrated with new models for Safety and Photos.
*   **Backend**: Safety module and photo uploads fully implemented.
*   **Frontend**: UI updated with SOS button and Mandatory Photo Proof flow.
*   **Next Step**: Phase 2 Real-Time Updates (WebSockets) or Phase 3 Real Payments.

## 🔮 Future Improvements
1.  **WebSocket SOS**: Push SOS alerts to admin dashboard in real-time.
2.  **Live GPS Tracking**: Integrate Google Maps for real-time worker movement.
3.  **Chat System**: Secure in-app communication between customer and worker.
