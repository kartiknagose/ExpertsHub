# Environment Setup Guide (Local First)

This branch is being kept local-first. Production deployment references have been removed from the repo-facing setup.

## 1. Local Development

1. Copy `server/.env.example` to `server/.env`.
2. Copy `client/.env.example` to `client/.env`.
3. Fill only the values you need locally.
4. Start local services:
   - Postgres (Docker/local)
   - Redis (Docker/local)
5. Run backend and frontend.

### Local minimum

Backend local minimum:
- `NODE_ENV=development`
- `PORT=3000`
- `DATABASE_URL=postgresql://...`
- `REDIS_URL=redis://localhost:6379`
- `JWT_SECRET=...`
- `CORS_ORIGIN=http://localhost:5173,http://localhost:5174`
- `FRONTEND_URL=http://localhost:5173`

Frontend local minimum:
- `VITE_API_URL=http://localhost:3000/api`
- `VITE_SOCKET_URL=http://localhost:3000`
- `VITE_APP_ENV=development`

Razorpay test mode local minimum:
- `RAZORPAY_KEY_ID=rzp_test_...`
- `RAZORPAY_KEY_SECRET=...`
- `RAZORPAY_WEBHOOK_SECRET=...`
- `VITE_RAZORPAY_KEY_ID=rzp_test_...`
- Keep `RAZORPAY_PAYOUT_MODE=SIMULATED` for local development unless you are actively testing linked-account transfers.

## 2. Keep Local Stable

1. Keep secrets out of git (`.env` is ignored).
2. Leave optional integrations empty unless you are actively testing them locally.
3. If you do not want Redis, Supabase, or external email providers locally, leave their values blank and let the app fall back.