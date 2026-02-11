# UrbanPro Full Expected Working

## Overview
UrbanPro is a marketplace that connects customers with service professionals. The platform supports multiple booking modes, role-based experiences, and end-to-end booking management from discovery to completion and review.

## Core Roles
- Customer: browses services, selects booking mode, schedules jobs, reviews workers.
- Worker: manages profile, services, availability, bookings, and verification status.
- Admin: manages services catalog, users, workers, and overall marketplace health.

## Booking Modes (Target Behavior)
1. Direct Worker Booking (MVP)
   - Customer selects a worker for a service and requests a time slot.
   - Booking status starts at PENDING, worker can confirm or decline.
   - Status flow: PENDING -> CONFIRMED -> IN_PROGRESS -> COMPLETED (or CANCELLED).

2. Service-First Auto-Assign
   - Customer selects service, schedule, and location.
   - System assigns the best available worker using a ranking model.
   - Customer receives instant confirmation if a worker is assigned.

3. Request + Bids System
   - Customer posts a request with budget and preferred schedule.
   - Workers submit bids and proposals.
   - Customer selects a bid and the booking is created.

4. Instant / On-Demand Booking
   - Customer requests an immediate service.
   - Nearest available worker receives a short accept window.
   - Booking is confirmed when the worker accepts.

## Customer Experience
- Browse services and view service details with available booking modes.
- Book a service using the selected booking mode.
- Manage bookings, reschedule or cancel when allowed.
- Leave reviews for completed bookings.
- Maintain customer profile and address for smoother checkout.

## Worker Experience
- Complete worker profile (bio, skills, service areas, hourly rate, photo).
- Offer services from the catalog.
- Manage availability in weekly time slots.
- Receive booking requests, confirm or update status.
- View reviews and improve profile rating.
- Apply for verification to build trust.

## Admin Experience
- Monitor marketplace KPIs (users, workers, bookings, pending jobs).
- Manage the service catalog and categories.
- Review worker profiles and verification requests.
- Oversee bookings and resolve issues.

## Reviews and Ratings
- Customers can review completed bookings once.
- Worker rating is aggregated from review scores.
- Reviews are visible on worker profiles and service details.

## Availability and Scheduling
- Workers define weekly availability.
- Booking modes use availability to validate or rank worker selection.

## Auth and Security
- Authentication uses secure cookies.
- Role-based access for worker and admin routes.
- Email verification is required for full account trust.

## Uploads
- Profile photos are uploaded and served from a static uploads folder.

## Error Handling and Empty States
- Clear error messages for invalid bookings or missing profiles.
- Meaningful empty states when no data exists.

## Observability and Operations
- Health endpoint for uptime checks.
- Basic request logging and error handling.

## Non-Functional Expectations
- Responsive UI for mobile and desktop.
- Professional styling with consistent theming.
- Fast page transitions and safe loading states.
