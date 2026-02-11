# UrbanPro Project Status

## Completed
### Backend
- Auth with role-based access control.
- Services catalog: list, detail, and admin create.
- Workers: profile upsert, add/remove services, public services lookup.
- Bookings: create, list, status updates, cancel; includes service, worker, customer, and review data.
- Customers: profile and address management.
- Uploads endpoint for profile photos.
- Availability: add, list, remove worker time slots.
- Reviews: create and list for customer and worker.
- Verification: worker submit and view status (basic flow).
- Admin: dashboard stats, user list, worker list.

### Frontend
- Global layout with navbar, sidebar, footer, theme support.
- Public pages and auth pages (login, register, forgot/reset, verify email).
- Services list and detail page.
- Booking form with worker selection (Direct Worker Booking).
- Booking mode selector UI on service detail (Direct enabled, others marked coming soon).
- Customer profile setup and profile page.
- Customer dashboard, bookings, and reviews pages.
- Worker profile setup and profile page.
- Worker services, bookings, availability, and verification pages.
- Admin dashboards: stats, services, workers, bookings, users.

## Remaining
### Booking Modes (per BOOKING_MODES.md)
- Service-First Auto-Assign: ranking algorithm and assignment logic, UI flow.
- Request + Bids: new schema, endpoints, and UI for job requests and bids.
- Instant / On-Demand: real-time worker selection and accept window.

### Reviews and Visibility
- Show reviews on worker profile pages.
- Show reviews and rating previews on service detail and worker cards.

### Availability Integration
- Use worker availability to validate or suggest booking times.
- Availability-aware auto-assign logic.

### Verification Workflow
- Admin review workflow for verification requests.
- Upload and store verification documents and media.

### Admin Enhancements
- Service update and delete.
- Worker approval flags and verification controls.
- Booking dispute handling.

### Quality and Operations
- Automated tests for booking flows and role restrictions.
- Seed data scripts for demos.
- Audit logging and analytics.

## Notes
- Live API only, so the UI relies on real data in the database.
- Direct Worker Booking is the only active booking mode today.
