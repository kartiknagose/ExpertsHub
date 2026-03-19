# Production Testing Action Plan

**Status:** ✅ Infrastructure Ready  
**Date:** March 19, 2026  
**Next Phase:** User Acceptance Testing (UAT)

---

## Phase 1: Quick Verification (5 mins)

Run this to confirm everything is operational:

```powershell
# PowerShell command (run from project root)
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6emxycGJ1eGpwc2F6cnFqeG9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1ODQ1NjcsImV4cCI6MjA4OTE2MDU2N30.YNMdBg2zn2vghhziUJANVxhJ5f-CBP8BUeT8PezKTZQ"
$secret = "urbanpro_cache_relay_secret_v1_2026"

# Test 1: Health
$tests = @(
    @{name="Supabase Health"; url="https://tzzlrpbuxjpsazrqjxob.supabase.co/functions/v1/health"; method="GET"},
    @{name="Render Backend"; url="https://urbanpro-api.onrender.com/health"; method="GET"}
)

foreach ($t in $tests) {
    try {
        $r = Invoke-WebRequest -Uri $t.url -Method $t.method -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✅ $($t.name): $($r.StatusCode)"
    } catch {
        Write-Host "❌ $($t.name): FAILED"
    }
}

# Test 2: Cache Relay
$h = @{"Authorization"="Bearer $anonKey";"apikey"=$anonKey;"x-cache-secret"=$secret;"content-type"="application/json"}
$r = Invoke-WebRequest -Uri "https://tzzlrpbuxjpsazrqjxob.supabase.co/functions/v1/cache-relay" -Method POST -Headers $h -Body (@{action="invalidate";target="service-catalog"} | ConvertTo-Json)
Write-Host "✅ Cache Relay: $($r.StatusCode) - $(($r.Content | ConvertFrom-Json).invalidated[0])"
```

---

## Phase 2: Browser Testing (30 mins)

### 2.1 Customer Registration Flow
**Goal:** Verify user can register and authenticate

**Steps:**
1. Open app in browser (your frontend URL)
2. Click "Sign Up" as Customer
3. Fill in form:
   - Email: `test_customer_$(Get-Random)@test.com`
   - Password: Strong password
   - Name: Test Customer
4. Submit
5. **Verify:**
   - ✅ Page redirects to login or verification
   - ✅ Check email inbox (if verification required)
   - ✅ Can login with new account
   - ✅ Dashboard loads without errors

**Expected Database State:**
```sql
-- In Supabase SQL Editor
SELECT id, email, created_at FROM auth.users 
WHERE email LIKE 'test_customer_%'
ORDER BY created_at DESC LIMIT 1;
```

### 2.2 Worker Registration Flow
**Goal:** Verify worker onboarding works

**Steps:**
1. Open app in different browser OR new incognito tab
2. Click "Sign Up" as Worker
3. Fill in:
   - Email: `test_worker_$(Get-Random)@test.com`
   - Password: Strong password
   - Service Type: (Select any)
   - Experience: Enter value
   - Location: Enter city
4. Upload verification documents (or skip if optional)
5. Submit
6. **Verify:**
   - ✅ Worker profile created
   - ✅ Verification status shows "pending"
   - ✅ Can access worker dashboard

### 2.3 Service Listing & Cache
**Goal:** Verify cache relay works with real data

**Steps:**
1. Login as customer
2. Search/browse services
3. Note service count
4. **In another browser tab**, login as admin/worker
5. Create/update a service
6. **Back in customer tab**, refresh service list
7. **Verify:**
   - ✅ New service appears immediately (cache invalidated)
   - ✅ No page reload needed for updates
   - ✅ Check Render logs show `/api/cache/relay` POST call

**Check Render Logs:**
```
Dashboard → Logs → Search "cache/relay"
Should see: POST /api/cache/relay - 200 OK
```

### 2.4 Real-time Features
**Goal:** Verify WebSocket and notifications

**Steps:**
1. Open 2 browser tabs (logged in as different users)
2. In Tab 1: Worker creates/accepts booking
3. In Tab 2: Customer receives notification instantly
4. **Verify:**
   - ✅ Notification appears < 2 seconds
   - ✅ No page refresh needed
   - ✅ Content is correct

---

## Phase 3: API Testing (10 mins)

Use curl or Postman to verify API endpoints:

```powershell
$baseUrl = "https://urbanpro-api.onrender.com"
$token = "your_jwt_token_from_login"

# Get services
$h = @{"Authorization"="Bearer $token"}
$r = Invoke-WebRequest -Uri "$baseUrl/api/services" -Headers $h
Write-Host "Services: $($r.Content | ConvertFrom-Json | Measure-Object | Select-Object -ExpandProperty Count) items"

# Get worker profile
$r = Invoke-WebRequest -Uri "$baseUrl/api/workers/me" -Headers $h
Write-Host "Worker Profile: $(($r.Content | ConvertFrom-Json).email)"

# Create booking (if applicable)
$body = @{
    service_id = 1
    worker_id = 1
    scheduled_date = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
} | ConvertTo-Json

$r = Invoke-WebRequest -Uri "$baseUrl/api/bookings" -Method POST -Headers $h -Body $body -ContentType "application/json"
Write-Host "Booking Created: $(($r.Content | ConvertFrom-Json).id)"
```

---

## Phase 4: Performance Baseline (5 mins)

**Goal:** Record baseline metrics for future comparison

```powershell
$endpoints = @(
    "https://tzzlrpbuxjpsazrqjxob.supabase.co/functions/v1/health",
    "https://urbanpro-api.onrender.com/health",
    "https://urbanpro-api.onrender.com/api/services"
)

Write-Host "Response Time Analysis:"
Write-Host "========================"

foreach ($url in $endpoints) {
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        Invoke-WebRequest -Uri $url -TimeoutSec 10 | Out-Null
    } catch {}
    $sw.Stop()
    
    $time = $sw.Elapsed.TotalMilliseconds
    $status = if ($time -lt 300) { "✅" } elseif ($time -lt 500) { "⚠️" } else { "❌" }
    Write-Host "$status $url : ${time}ms"
}
```

---

## Phase 5: Error Handling (5 mins)

**Test error scenarios:**

### 5.1 Invalid Token
```powershell
$h = @{"Authorization"="Bearer invalid_token"}
$r = Invoke-WebRequest -Uri "https://urbanpro-api.onrender.com/api/customers/me" -Headers $h -ErrorAction SilentlyContinue
# Expected: 401 Unauthorized
```

### 5.2 Network Interruption
**Steps:**
1. Disconnect internet temporarily
2. Attempt action (search, create booking)
3. Reconnect
4. **Verify:**
   - ✅ Error message shown
   - ✅ Retry button available
   - ✅ No data corruption

### 5.3 Missing Required Field
```powershell
$body = @{
    service_id = 1
    # Missing required fields
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://urbanpro-api.onrender.com/api/bookings" -Method POST `
    -Body $body -ContentType "application/json" -ErrorAction SilentlyContinue
# Expected: 400 Bad Request with validation error
```

---

## Testing Checklist

| Phase | Test | Status | Notes |
|-------|------|--------|-------|
| 1 | Infrastructure health | ⬜ | |
| 2.1 | Customer registration | ⬜ | |
| 2.2 | Worker registration | ⬜ | |
| 2.3 | Service cache + relay | ⬜ | |
| 2.4 | Real-time notifications | ⬜ | |
| 3 | API endpoints | ⬜ | |
| 4 | Performance baseline | ⬜ | |
| 5.1 | Invalid auth | ⬜ | |
| 5.2 | Network resilience | ⬜ | |
| 5.3 | Validation errors | ⬜ | |

---

## Success Criteria ✅

Production is ready when:
- [ ] All health checks return 200 OK
- [ ] Users can register and login
- [ ] Cache relay works end-to-end
- [ ] Real-time features work (WebSockets, notifications)
- [ ] API response times < 500ms
- [ ] No unhandled errors in Sentry
- [ ] Error scenarios handled gracefully

---

## Monitoring After Go-Live

### Daily Checks
- [ ] Check Sentry dashboard for errors
- [ ] Review Supabase function logs
- [ ] Monitor Render uptime
- [ ] Check database query performance

### Weekly Reviews
- [ ] Aggregate error rates
- [ ] Performance trends
- [ ] User feedback logs
- [ ] Cache hit rates

---

## Rollback Plan

If critical issues found:
1. Revert to previous version: `git revert <commit-hash>`
2. Redeploy Supabase functions: `npx supabase functions deploy ...`
3. Restart Render service
4. Notify users of temporary downtime

---

## Next Steps

1. **Click Start** on Phase 1 → Run the health check command
2. **Move to Phase 2** → Open app and register test accounts
3. **Document everything** → Note any issues found
4. **Report results** → Share test summary when complete

**Estimated Time:** 1-2 hours for full UAT  
**Ready?** Let's test! 🚀

---

**Contact for Issues:**
- Supabase: https://supabase.com/dashboard
- Render: https://render.com/dashboard
- GitHub: https://github.com/kartiknagose/UrbanProV2
