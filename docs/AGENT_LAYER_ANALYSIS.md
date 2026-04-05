# ExpertsHub Agent Layer — Comprehensive Analysis

> **Date:** April 2026  
> **Scope:** Full audit of `server/src/modules/ai/` — `service.js`, `toolRegistry.js`, `toolExecutor.js`, `ai.controller.js`, `ai.routes.js`, and supporting `client/src/api/ai.js`

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Critical Bugs & Wrong Implementations](#2-critical-bugs--wrong-implementations)
3. [Role-Based Inconsistencies](#3-role-based-inconsistencies)
4. [Tool Registry Issues](#4-tool-registry-issues)
5. [Service.js Anti-Patterns & Design Flaws](#5-servicejs-anti-patterns--design-flaws)
6. [Security Concerns](#6-security-concerns)
7. [Missing Agent Capabilities (Gaps)](#7-missing-agent-capabilities-gaps)
8. [Suggested Agent Tasks By Role](#8-suggested-agent-tasks-by-role)
9. [Performance & Scalability Issues](#9-performance--scalability-issues)
10. [Recommendations & Roadmap](#10-recommendations--roadmap)

---

## 1. Architecture Overview

The agent layer follows a **hybrid deterministic + LLM** approach:

```
User Message
  └─> Pending Confirmation? → Handle Confirm/Decline
  └─> Multi-command? → Split & Process Each
  └─> handleSingleCommand
       ├─> Deterministic Match? → Bypass LLM → Direct Tool Execution
       └─> No Match → runAgentLoop → Groq LLM
            └─> LLM Decides: text or tool_call
            └─> Execute Tool + Summarize via 2nd LLM call
  └─> enhanceOutgoingResponse
  └─> persistAiAudit + logAiAgent
  └─> Return to Client
```

**Files:**

| File | Size | Purpose |
|------|------|---------|
| `service.js` | **3,160 lines / 108 KB** | Core orchestration logic |
| `toolRegistry.js` | 329 lines | Static tool definitions (name, method, endpoint, roles) |
| `toolExecutor.js` | 207 lines | HTTP-based tool execution via internal API |
| `ai.controller.js` | 78 lines | Express request handlers (chat, voice, clearSession) |
| `ai.routes.js` | 27 lines | Route mounting with rate limiters |

---

## 2. Critical Bugs & Wrong Implementations

### 2.1 `scheduledAt` vs `scheduledDate` Field Mismatch

> **CAUTION:** The booking creation API expects `scheduledDate` in the request body (validated by `booking.schemas.js`), but the agent uses `scheduledAt` internally. This can cause the wrong time to be used.

**Evidence:**
- `booking.schemas.js` line 65: `body('scheduledDate')` — the validated field name
- `booking.controller.js` line 249: `const { serviceId, workerProfileId, scheduledDate, ...} = req.body`
- `service.js` line 2627: Agent sends `scheduledAt: pendingBooking.scheduledAt` + `scheduledDate: pendingBooking.scheduledAt`

The agent does send **both** `scheduledAt` and `scheduledDate` (line 2627), so this partially works — but only because of a later patch. The `toolRegistry.js` tool definition for `createBooking` has **no required params at all** (line 63), meaning no field validation happens on the agent side.

**Fix:** The `createBooking` tool should declare `requiredParams: ['serviceId', 'scheduledDate', 'addressDetails']` matching the actual API validation schema.

### 2.2 `createBooking` Tool Has Zero Required Params

```js
createBooking: {
    name: 'createBooking',
    requiredParams: [], // WRONG! API requires serviceId, scheduledDate, addressDetails
    allowedRoles: ['CUSTOMER'],
}
```

The actual booking API **requires** `serviceId`, `scheduledDate`, and `addressDetails` (min 10 chars). The agent builds these through the booking flow, but if the LLM path is used (via `runAgentLoop`), it can call `createBooking` with **no params** and it will pass the tool executor's validation, only to fail at the API level with an unhelpful error.

### 2.3 Reschedule Uses Wrong Field Name

```js
// service.js line 2690-2694
body: { scheduledAt: newTime.scheduledAt }
```

But the reschedule schema (`booking.schemas.js` line 257) validates `newScheduledDate`, not `scheduledAt`. The reschedule call will **always fail** with a validation error because the required field `newScheduledDate` is never sent.

### 2.4 Worker Booking Actions Skip OTP Requirement

The agent handles `accept`, `start`, and `complete` booking commands for workers (lines 2161-2225), but:
- **`start`** requires an OTP (`body('otp').matches(/^\d{4}$/)`) — the agent never collects or sends the OTP
- **`complete`** also requires an OTP — same issue

These API calls will **always fail** with validation errors because the agent never asks the worker for the OTP code.

### 2.5 Duplicate Role Check in toolExecutor.js

```js
// Lines 129-132: First check
if (!isRoleAllowed(tool.allowedRoles, role)) { ... }

// Lines 141-144: Exact same check repeated
if (!isRoleAllowed(tool.allowedRoles, role)) { ... }
```

And the same for `validateRequiredParams` (lines 134-138 and 145-148). This is dead code — an identical recheck that cannot produce a different result. It wastes CPU cycles and obscures the code.

### 2.6 Unreachable Code in Intent Detection

```js
// service.js line 2818
if (detected.intent && detected.score >= 1) { ... }

// service.js line 2870
if (detected.intent && detected.score === 1) { ... }
```

The second block (`score === 1`) is **unreachable**: if `score >= 1`, the first block already executes and returns. The "weak intent -> LLM" fallback at line 2870 can never trigger.

### 2.7 `bookingInput` Fragile Reference

```js
// service.js line 2644
serviceName: pendingBooking.serviceName || bookingInput.serviceName || null,
```

The variable `bookingInput` is declared at line 2409 inside the same block, but this reference pattern relies on JS scoping rules in a way that's confusing and fragile. Any refactoring could easily break this.

---

## 3. Role-Based Inconsistencies

### 3.1 `redeemWalletBalance` Allows `AUTHENTICATED` But Should Be Restricted

```js
redeemWalletBalance: {
    allowedRoles: ['AUTHENTICATED'], // Any user can redeem
}
```

The actual route (`growth.routes.js` line 35) allows any authenticated user, which technically matches. However, this is a **financial operation** — consider whether ADMIN accounts should really be able to redeem wallet balances.

### 3.2 `updateCustomerProfile` Has Incorrect Required Params

```js
updateCustomerProfile: {
    requiredParams: ['line1', 'city', 'state', 'postalCode', 'country'],
    allowedRoles: ['CUSTOMER'],
}
```

The actual `/api/customers/profile` POST endpoint accepts profile fields, not necessarily address fields directly in the root body. This rigid requirement means the LLM path will fail if it doesn't provide all 5 address fields even if only updating the name.

### 3.3 Worker Cannot View Their Own Wallet Transactions via Deterministic Path

The `getWallet` tool allows `['CUSTOMER', 'WORKER']`, but the `isViewTransactionsRequest` handler (line 1946) is gated by `userRole === 'CUSTOMER'`, meaning workers who ask "show my transactions" get routed to the LLM instead of the deterministic fast path.

### 3.4 Worker Commands Only Work Through Deterministic Path (Not Via LLM)

Worker-specific commands like accept/start/complete booking are only handled in the deterministic `if (userRole === 'WORKER')` block (lines 2101-2232). They are **not registered as tools** in the tool registry. If the LLM decides to help a worker, it has no tool to call for these operations.

### 3.5 Admin Navigation Routes Are Missing

The admin deterministic handler (lines 2234-2367) handles data fetching but doesn't handle admin-specific navigation requests like "open users page" or "show me the dashboard" navigation — those would fall through to the LLM.

### 3.6 Booking Creation Limited to CUSTOMER Only in Agent

```js
createBooking: { allowedRoles: ['CUSTOMER'] }
```

But the actual booking route (`booking.routes.js` line 49) uses `requireCustomerOrWorker`, meaning **workers can also create bookings**. The agent blocks workers from creating bookings even though the backend allows it.

---

## 4. Tool Registry Issues

### 4.1 Missing Tools

The following backend operations have **no corresponding agent tool**:

| Operation | Endpoint | Why It Matters |
|-----------|----------|----------------|
| Get booking by ID | `GET /api/bookings/:id` | Users can't ask "show details of booking 42" |
| Pay for booking | `POST /api/bookings/:id/pay` | Customers can't pay via chatbot |
| Accept booking | `POST /api/bookings/:id/accept` | Only handled deterministically, not as tool |
| Start booking | `POST /api/bookings/:id/start` | Same — requires OTP, not handled |
| Complete booking | `POST /api/bookings/:id/complete` | Same |
| Reschedule booking | `PATCH /api/bookings/:id/reschedule` | Only handled deterministically |
| Create review | `POST /api/reviews` | Users can't leave reviews via agent |
| Get my reviews | `GET /api/reviews/written` | Can't check reviews |
| SOS trigger | `POST /api/safety/sos` | Safety feature not accessible |
| Emergency contacts | `GET/POST/DELETE /api/safety/contacts` | Not accessible |
| Toggle favorite worker | `POST /api/growth/favorites/toggle` | Not accessible |
| Validate coupon | `POST /api/growth/coupons/validate` | Can't apply coupons |
| Loyalty points | `GET /api/growth/loyalty` | Not queryable |
| Worker services mgmt | `POST/DELETE /api/workers/services` | Workers can't manage services |
| Nearby workers | `GET /api/location/nearby` | Can't find nearby workers |
| Chat conversations | `GET /api/chat/conversations` | Can't list conversations |
| Admin: SOS alerts | `GET /api/safety/sos/alerts` | Admin can't check active SOS |
| Admin: Analytics | `GET /api/analytics/summary` | Handled deterministically but no tool |
| Admin: Create service | `POST /api/services` | Admin can't create services |
| Admin: Payments | `GET /api/admin/payments` | Admin can't view payments |

### 4.2 Hardcoded Query Parameters in Endpoint

```js
getTopWorkers: {
    endpoint: '/api/workers/leaderboard/top?limit=20', // Query in endpoint string
}
```

The `buildEndpoint` function uses `.replace(/:([A-Za-z0-9_]+)/g, ...)` for path params. Including query params in the endpoint string works but is inconsistent with the rest of the registry. It breaks if a user wants a different limit.

### 4.3 `tools/` Directory Is Empty

The `server/src/modules/ai/tools/` directory exists but is completely empty. This suggests it was meant for modular tool implementations but was never populated. All logic is crammed into `service.js`.

---

## 5. Service.js Anti-Patterns & Design Flaws

### 5.1 God File — 3,160 Lines

> **WARNING:** `service.js` at **108 KB / 3,160 lines** is far too large for a single file. It contains:
> - Session management & persistence
> - Intent detection
> - Booking flow orchestration
> - Worker recommendation engine
> - Price preview
> - Wallet/transaction formatting
> - Navigation routing
> - LLM communication
> - Response formatting & tone adjustment
> - Rate limiting
> - Caching
> - Idempotency
> - Audit logging
> - Multi-command splitting

This should be decomposed into at least 8-10 focused modules.

### 5.2 In-Memory State With File Persistence

```js
const pendingConfirmations = new Map();
const userRequestTracker = new Map();
const userContextStore = new Map();
// ... 4 more Maps
```

All state is held in Node.js process memory with a 15-second snapshot to `tmp/ai-session-state.json`. Problems:
- **Not scalable**: Breaks with multiple server instances
- **Data loss**: Up to 15 seconds of state can be lost on crash
- **No TTL cleanup**: Maps grow unbounded (except bookingAttemptTracker which has a 60s window)
- **File I/O on main thread**: `writeSessionSnapshot` uses synchronous `fs.writeFileSync` every 15 seconds

### 5.3 Two Separate Rate Limiters

There are **three** layers of rate limiting:
1. Express middleware (`aiChatLimiter` — 120 req/15 min)
2. `isUserRateLimited()` in service.js (12 req/10 sec)
3. `isBookingAttemptRateLimited()` (3 booking attempts/60 sec)

The first two overlap, and #2 doesn't benefit from shared state across instances.

### 5.4 Double LLM Call for Tool Execution

When the LLM path is used (`runAgentLoop`), the agent makes **two separate Groq API calls**:
1. First call: Parse user message -> get tool_call or text response
2. Second call: Format tool execution result into user-friendly text

This doubles latency and cost. The formatting call (lines 1762-1823) could be replaced with deterministic formatting like the existing `formatConversationalResponse` and `buildBypassDataResponse` functions.

### 5.5 LLM Receives All Tools Regardless of User Role

```js
const tools = listTools(); // Returns ALL 35+ tools
const promptTools = tools.map(toToolSchemaForPrompt);
```

The system prompt includes **all tools** (including admin tools) even for customer/worker roles. While the system prompt says "Current authenticated role: CUSTOMER", the LLM can still attempt to call admin tools (blocked at execution, but wastes prompt tokens and creates confusion).

**Fix:** Filter tools by user role before building the system prompt.

### 5.6 No Conversation History in LLM Context

The `runAgentLoop` sends recent audit history to the LLM, but this is a flattened summary of past intent/action/status — not actual message pairs. The LLM has no `assistant` message context, only a `system` + single `user` message. This means:
- The LLM cannot understand conversational context
- Follow-up messages like "what about the second one?" have no referent

---

## 6. Security Concerns

### 6.1 Agent Makes Internal HTTP Calls With User's Token

The agent proxies user actions by making HTTP requests to `http://127.0.0.1:PORT` using the user's own JWT. If the server is behind a reverse proxy, this creates a loopback that:
- Bypasses external rate limits
- Bypasses WAF/firewall rules
- Counts against internal rate limits

### 6.2 `deleteAdminUser` Tool Is Exposed to the LLM

The LLM can be prompted to call `deleteAdminUser` for admin users. While this requires confirmation, a sophisticated prompt injection in user messages could potentially bypass the confirmation check (e.g., crafting a message that `isConfirmMessage` interprets as "yes").

### 6.3 Booking Ownership Check Only for `cancelBooking`

```js
if (tool.name === 'cancelBooking') {
    const ownership = await ensureBookingOwnership(params, ...);
}
```

Only `cancelBooking` has ownership verification in the tool executor. Other booking operations don't verify that the booking belongs to the requesting user at the agent level (though the API itself may have ownership checks).

### 6.4 Session State File Contains Sensitive Data

`tmp/ai-session-state.json` contains:
- Pending booking details
- User context and preferences
- API response cache data

This file is world-readable and not encrypted.

### 6.5 `X-AI-Actor-User-Id` Header Can Be Used for Impersonation

```js
headers: {
    Authorization: `Bearer ${token}`,
    'X-AI-Actor-User-Id': String(userId), // Custom header
}
```

If any middleware trusts this header, it could be exploited. While the bearer token should take precedence, this is an unnecessary attack surface.

---

## 7. Missing Agent Capabilities (Gaps)

### 7.1 Customer Role — Missing Agent Tasks

| Task | Priority | Currently Available |
|------|----------|-------------------|
| Book a service (guided flow) | Done | Full flow with worker selection |
| Cancel a booking | Done | With confirmation |
| View bookings | Done | Deterministic bypass |
| View wallet | Done | Deterministic bypass |
| View notifications | Done | Deterministic bypass |
| **Pay for a booking** | HIGH | Not implemented |
| **Leave a review** | HIGH | Not implemented |
| **Apply coupon code** | MEDIUM | Not implemented |
| **View pending reviews** | MEDIUM | Not implemented |
| **Find nearby workers** | MEDIUM | Not implemented |
| **Toggle favorite worker** | LOW | Not implemented |
| **Check loyalty points** | LOW | Not implemented |
| **Trigger SOS** | CRITICAL | Not implemented |
| **Manage emergency contacts** | MEDIUM | Not implemented |

### 7.2 Worker Role — Missing Agent Tasks

| Task | Priority | Currently Available |
|------|----------|-------------------|
| View bookings | Done | Deterministic bypass |
| View wallet | Done | Deterministic bypass |
| View payouts | Done | Deterministic handler |
| View availability | Done | Deterministic handler |
| Accept a booking | Partial | Deterministic, but no response handling |
| Start a booking | BROKEN | Requires OTP — not collected |
| Complete a booking | BROKEN | Requires OTP — not collected |
| **View job board** | HIGH | Not implemented |
| **Manage offered services** | HIGH | Not implemented |
| **Update location** | MEDIUM | Not implemented |
| **View received reviews** | MEDIUM | Not implemented |
| **View earnings summary** | MEDIUM | Not implemented |
| **Trigger SOS** | CRITICAL | Not implemented |

### 7.3 Admin Role — Missing Capabilities

| Task | Priority | Currently Available |
|------|----------|-------------------|
| View dashboard | Done | Deterministic handler |
| View fraud alerts | Done | Deterministic handler |
| Manage users | Partial | Read only via deterministic path |
| Manage coupons | Partial | Read only via deterministic path |
| **Create/update services** | HIGH | Not implemented |
| **View payment reports** | MEDIUM | Not implemented |
| **View SOS alerts** | HIGH | Not implemented |
| **Resolve SOS alerts** | HIGH | Not implemented |
| **GST/Invoice reports** | MEDIUM | Not implemented |
| **Bulk operations** | LOW | Not implemented |

---

## 8. Suggested Agent Tasks By Role

### 8.1 Customer — Complete Task List

The AI agent for customers should function as a **personal booking concierge**:

1. **Service Discovery**
   - "What services are available?" -> List services
   - "Show me plumbers near me" -> Nearby workers + service filter
   - "Who's the best electrician?" -> Top workers for service

2. **Booking Lifecycle** (Core Flow)
   - "Book a plumber for tomorrow 3pm" -> Full guided flow
   - "Cancel my last booking" -> With confirmation
   - "Reschedule booking 42 to Friday 5pm" -> With date validation
   - "What's the status of my booking?" -> Latest booking details
   - "Pay for booking 42" -> Navigate to payment or initiate via wallet

3. **Financial**
   - "Show my wallet" -> Balance + recent transactions
   - "Add money to wallet" -> Navigate to top-up
   - "What's my pending bill?" -> Unpaid booking amounts
   - "Apply coupon SAVE20" -> Validate and apply coupon
   - "Show my loyalty points" -> Points balance

4. **Reviews & Trust**
   - "Leave a review for booking 42" -> Guided review flow
   - "Show reviews I need to write" -> Pending reviews
   - "Add worker to favorites" -> Toggle favorite

5. **Safety**
   - "SOS" / "I need help now" -> Immediate SOS trigger
   - "Show my emergency contacts" -> List
   - "Add emergency contact Mom 9876543210" -> Quick add

6. **Profile & Settings**
   - "Update my address" -> Navigate to profile
   - "Open my profile" -> Navigate

### 8.2 Worker — Complete Task List

The AI agent for workers should be a **job management assistant**:

1. **Job Management**
   - "Show my bookings" -> Current bookings
   - "Show open jobs" -> Job board
   - "Accept booking 42" -> With confirmation
   - "Show booking details" -> Single booking view

2. **Schedule & Availability**
   - "Show my availability" -> Current slots
   - "Add availability Monday 9am-5pm" -> Create slot
   - "Remove availability slot 3" -> Delete slot
   - "Am I available tomorrow?" -> Check conflicts

3. **Earnings & Payouts**
   - "Show my earnings" -> Wallet + payout balance
   - "Show payout history" -> Past payouts
   - "Update bank details" -> Navigate
   - "Request instant payout" -> With confirmation

4. **Profile & Verification**
   - "Check verification status" -> Current status
   - "Apply for verification" -> Start flow
   - "Update my services" -> Manage offered services
   - "Update my profile" -> Navigate

5. **Reviews & Performance**
   - "Show my reviews" -> Reviews received
   - "What's my rating?" -> Average rating + review count

### 8.3 Admin — Complete Task List

The AI agent for admins should be a **platform operations command center**:

1. **Dashboard & Analytics**
   - "Show dashboard" -> Admin summary
   - "Show analytics" -> Platform metrics
   - "Revenue this month" -> Summarized data

2. **User Management**
   - "List all users" -> User table
   - "Deactivate user 42" -> With confirmation
   - "Delete user 42" -> With double confirmation

3. **Moderation**
   - "Verification queue" -> Pending applications
   - "Approve verification 5" -> With confirmation
   - "Show fraud alerts" -> Active alerts
   - "Show SOS alerts" -> Active SOS, critical priority

4. **Coupon Management**
   - "List coupons" -> Active coupons
   - "Create coupon SUMMER25 25% off" -> With confirmation
   - "Disable coupon 3" -> With confirmation

5. **Service Management**
   - "Create service 'Deep Cleaning'" -> With confirmation
   - "Update service 2 price to 500" -> With confirmation

6. **Audit & Compliance**
   - "Show AI audit summary" -> Usage stats
   - "Show AI audit logs" -> Recent actions
   - "Show payment reports" -> Financial overview

---

## 9. Performance & Scalability Issues

### 9.1 In-Memory Maps With No Eviction

```
pendingConfirmations    — grows per active session, 10min expiry only on createBooking
userContextStore        — never cleaned except on session reset
userPreferenceStore     — never cleaned except on session reset
userJourneyStore        — never cleaned except on session reset
apiResponseCache        — 2-5 min TTL per entry, no max size
bookingAttemptTracker   — 60s window but entries never pruned
bookingIdempotencyStore — 2 min expiry, entries linger in map
userRequestTracker      — 10s window, entries linger in map
```

For a production system with thousands of users, these maps will consume increasing memory with no upper bound.

### 9.2 Synchronous File I/O

```js
fs.writeFileSync(SESSION_STATE_PATH, JSON.stringify(payload), 'utf8');
```

This blocks the event loop every 15 seconds. Should use `fs.promises.writeFile` or a dedicated worker thread.

### 9.3 Double Groq API Call

Two LLM requests per non-deterministic message means:
- 2x latency (typically 4-8 seconds total)
- 2x API cost  
- 2x token usage

### 9.4 No Request Deduplication

If a user double-clicks "send", two identical requests can execute simultaneously. The booking idempotency check exists but only for `createBooking`, not for `cancelBooking` or other destructive operations.

---

## 10. Recommendations & Roadmap

### Phase 1: Bug Fixes (Critical)

| # | Issue | Fix |
|---|-------|-----|
| 1 | `createBooking` requires no params | Set `requiredParams: ['serviceId', 'scheduledDate', 'addressDetails']` |
| 2 | Reschedule sends wrong field | Change `scheduledAt` to `newScheduledDate` in body |
| 3 | Worker start/complete skip OTP | Add OTP collection step or disable these agent paths |
| 4 | Unreachable `score === 1` block | Remove dead code at line 2870 |
| 5 | Duplicate role check in executor | Remove redundant re-check (lines 141-148) |

### Phase 2: Architecture Refactor

| # | Improvement | Description |
|---|-------------|-------------|
| 1 | Split `service.js` | Decompose into: `intentDetector.js`, `bookingFlow.js`, `workerRecommendation.js`, `responseFormatter.js`, `sessionManager.js`, `llmClient.js`, `auditLogger.js` |
| 2 | Move state to Redis/database | Replace in-memory Maps with Redis for multi-instance support |
| 3 | Filter tools by role | Only pass role-appropriate tools to LLM prompt |
| 4 | Eliminate double LLM call | Use deterministic formatting for tool results |
| 5 | Populate `tools/` directory | Move tool-specific logic to per-tool files |

### Phase 3: Feature Completion

| # | Feature | Roles |
|---|---------|-------|
| 1 | SOS / Safety features | ALL |
| 2 | Review creation flow | CUSTOMER, WORKER |
| 3 | Payment via agent | CUSTOMER |
| 4 | Job board for workers | WORKER |
| 5 | Service management for workers | WORKER |
| 6 | Coupon application | CUSTOMER |
| 7 | Admin SOS monitoring | ADMIN |
| 8 | Admin service CRUD | ADMIN |
| 9 | Nearby worker search | CUSTOMER |
| 10 | Conversation-aware LLM context | ALL |

### Phase 4: Production Hardening

| # | Improvement | Description |
|---|-------------|-------------|
| 1 | Use async file I/O | Replace `writeFileSync` with `fs.promises.writeFile` |
| 2 | Add Map size limits | Cap each map to ~10K entries with LRU eviction |
| 3 | Add request deduplication | Fingerprint-based dedup for all destructive operations |
| 4 | Rate limit consolidation | Remove in-service rate limiting, rely on middleware |
| 5 | Error classification | Return structured error codes, not raw error strings |
| 6 | Prompt injection defense | Sanitize user messages before sending to LLM |
| 7 | Encrypt session state file | Or move state to database entirely |

---

## Summary of All Issues Found

| # | Category | Severity | Issue |
|---|----------|----------|-------|
| 1 | Bug | CRITICAL | `createBooking` tool has zero required params |
| 2 | Bug | CRITICAL | Reschedule sends `scheduledAt` instead of `newScheduledDate` |
| 3 | Bug | CRITICAL | Worker start/complete skip OTP requirement |
| 4 | Bug | MEDIUM | Unreachable `score === 1` dead code |
| 5 | Bug | LOW | Duplicate role & param checks in executor |
| 6 | Role | CRITICAL | Worker can't create bookings via agent (backend allows it) |
| 7 | Role | MEDIUM | Worker deterministic path blocks transaction viewing |
| 8 | Role | MEDIUM | Admin tools sent to LLM for non-admin users |
| 9 | Role | LOW | `redeemWalletBalance` open to all roles |
| 10 | Security | CRITICAL | `deleteAdminUser` accessible via LLM with no extra guard |
| 11 | Security | MEDIUM | Session state file unencrypted |
| 12 | Security | MEDIUM | Ownership check only for `cancelBooking` |
| 13 | Security | LOW | `X-AI-Actor-User-Id` header leaks user context |
| 14 | Design | CRITICAL | `service.js` is a 3,160-line god file |
| 15 | Design | CRITICAL | In-memory state, not multi-instance safe |
| 16 | Design | MEDIUM | Double LLM call per non-deterministic request |
| 17 | Design | MEDIUM | No LLM conversation history (only audit summaries) |
| 18 | Design | MEDIUM | Synchronous file I/O on main thread |
| 19 | Gap | CRITICAL | SOS/Safety features missing from agent |
| 20 | Gap | CRITICAL | Payment via agent not implemented |
| 21 | Gap | MEDIUM | 20+ API endpoints have no agent tool |
| 22 | Gap | LOW | `tools/` directory empty |

---

> **Immediate Action Items:**
> 1. Fix `createBooking` required params in `toolRegistry.js`
> 2. Fix reschedule field name (`newScheduledDate`)
> 3. Disable or fix worker start/complete agent paths (OTP requirement)
> 4. Filter LLM tools by user role
> 5. Begin decomposing `service.js` into focused modules
