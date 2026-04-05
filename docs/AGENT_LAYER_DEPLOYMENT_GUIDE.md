# Agent Layer Deployment Guide

This guide helps you deploy the current ExpertsHub codebase with the new AI agent layer (tools, chat, admin/worker automation, sockets, cron).

## 1. What Changed Since Your Previous Hosting

Your old deployment likely predates:
- AI agent execution paths in `server/src/modules/ai/*`
- Admin and worker agent tools (tool registry + executor)
- New admin routes for verification/payments
- Background automation (availability reminders, payout cron)
- Realtime event dependencies (Redis + Socket.IO)

If you deploy only frontend changes without backend env + runtime changes, agent features will fail.

## 2. Required Production Services

You need all of these running:
- Postgres database
- Redis instance
- Node backend (`server`) with env vars below
- Frontend (`client`) pointing to new backend URL

## 3. Required Backend Environment Variables

Minimum required for stable startup:
- `NODE_ENV=production`
- `PORT=5000` (or platform-assigned)
- `DATABASE_URL=...`
- `REDIS_URL=...`
- `JWT_SECRET=...`
- `CORS_ORIGIN=https://your-frontend-domain`
- `FRONTEND_URL=https://your-frontend-domain`

Agent layer required:
- `GROQ_API_KEY=...`
- `GROQ_MODEL=llama3-8b-8192` (or your chosen model)
- `GROQ_TIMEOUT_MS=20000`
- `AI_TOOL_TIMEOUT_MS=12000`
- `INTERNAL_API_BASE_URL=http://127.0.0.1:${PORT}`

Optional (voice/chat enhancements):
- `AI_VOICE_MAX_BYTES=15728640`
- `OPENAI_API_KEY=...`
- `GEMINI_API_KEY=...`

Payments/notifications (if used in production):
- `RAZORPAY_KEY_ID=...`
- `RAZORPAY_KEY_SECRET=...`
- `RAZORPAY_WEBHOOK_SECRET=...`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL`
- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`

## 4. Frontend Environment / Hosting

For Vercel:
- Ensure frontend points to your backend:
  - `VITE_API_URL=https://your-backend-domain/api`
  - `VITE_SOCKET_URL=https://your-backend-domain`
- If using `client/vercel.json` rewrites, update destination to your latest backend domain.

## 5. Backend Deployment Steps (Render or similar)

1. Build command (server):
```bash
npm install && npx prisma generate && npx prisma migrate deploy
```

2. Start command (server):
```bash
npm start
```

3. Verify health endpoint:
- `GET /health` must return 200.

4. Verify DB migrations are applied before traffic.

## 6. Docker Compose Path (single-host)

Root `docker-compose.yml` is now updated for agent-layer deployment:
- Adds agent env placeholders (`GROQ_*`, `AI_*`, `INTERNAL_API_BASE_URL`)
- Adds healthchecks for `db`, `redis`, `server`
- Ensures service startup waits for healthy dependencies

Run:
```bash
docker compose --env-file .env up -d --build
```

## 7. Post-Deploy Smoke Test Checklist

Run against production backend:

1. Health and auth:
- `GET /health`
- Login works for admin and worker accounts

2. Agent chat:
- `POST /api/ai/chat` with admin token
- `POST /api/ai/chat` with worker token

3. Admin tools:
- Dashboard, users, workers, verification queue, coupons

4. Worker tools:
- Availability CRUD
- Verification apply/status
- Payout details/history

5. Realtime:
- Socket connection works after login
- Admin receives events for verification/coupon updates

## 8. Common Failure Patterns

1. `AI temporarily unavailable`:
- Missing/invalid `GROQ_API_KEY`
- Firewall blocking outbound LLM API calls

2. Tool execution timeout:
- `AI_TOOL_TIMEOUT_MS` too low
- `INTERNAL_API_BASE_URL` wrong

3. Socket instability:
- Redis misconfigured or not reachable
- Missing sticky session support behind load balancer

4. CORS/session issues:
- `CORS_ORIGIN` mismatch with actual frontend domain
- Cookie settings not compatible with HTTPS domain

## 9. Secure Deployment Rules

- Never commit real secrets to `.env.example` or source files.
- Rotate any key that was ever exposed in git history.
- Keep `.env.example` placeholders only.

## 10. Quick Go-Live Order

1. Deploy backend with new env vars
2. Validate `/health`
3. Run AI/admin smoke tests
4. Deploy frontend pointing to new backend URL
5. Validate end-to-end chat + tool flows
6. Monitor logs for 30-60 minutes after cutover
