const axios = require('axios');
const { io } = require('socket.io-client');
const { executeTool } = require('../src/modules/ai/toolExecutor');

const BASE = 'http://127.0.0.1:3000';
const API = `${BASE}/api`;

const results = {
  passed: 0,
  failed: 0,
  checks: [],
};

function record(ok, name, details = '') {
  results.checks.push({ ok, name, details });
  if (ok) {
    results.passed += 1;
    console.log(`✅ ${name}${details ? ` -> ${details}` : ''}`);
  } else {
    results.failed += 1;
    console.log(`❌ ${name}${details ? ` -> ${details}` : ''}`);
  }
}

function parseCookie(setCookie = []) {
  const arr = Array.isArray(setCookie) ? setCookie : [setCookie];
  return arr
    .map((v) => String(v || '').split(';')[0])
    .filter(Boolean)
    .join('; ');
}

function extractToken(cookieHeader = '') {
  const m = String(cookieHeader).match(/(?:^|;\s*)token=([^;]+)/i);
  return m ? decodeURIComponent(m[1]) : '';
}

async function apiRequest({ method, path, cookie, bearer, data, validateStatus }) {
  return axios({
    method,
    url: `${API}${path}`,
    data,
    headers: {
      ...(cookie ? { Cookie: cookie } : {}),
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
      'Content-Type': 'application/json',
    },
    validateStatus: validateStatus || (() => true),
  });
}

async function waitForEvent(events, key, timeoutMs = 7000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (events[key] && events[key].length > 0) return events[key][0];
    await new Promise((r) => setTimeout(r, 120));
  }
  return null;
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async function run() {
  let adminCookie = '';
  let adminToken = '';
  let adminId = null;
  let tempCustomer = null;
  let tempWorker = null;
  let tempCouponId = null;
  let verificationApplicationId = null;
  let adminSocket;
  let customerSocket;

  const socketEvents = {
    'admin:users_updated': [],
    'admin:workers_updated': [],
    'admin:coupons_updated': [],
    'verification:created': [],
    'verification:updated': [],
    'user:status_changed': [],
  };

  try {
    const health = await axios.get(`${BASE}/health`, { validateStatus: () => true });
    record(health.status === 200, 'Server health check', `status=${health.status}`);
    if (health.status !== 200) {
      throw new Error('Server is not reachable on port 3000');
    }

    const login = await axios.post(`${API}/auth/login`, {
      email: 'admin@expertshub.tech',
      password: 'password123',
    }, { validateStatus: () => true });

    record(login.status === 200, 'Admin login', `status=${login.status}`);
    if (login.status !== 200) throw new Error(`Admin login failed: ${JSON.stringify(login.data)}`);

    adminCookie = parseCookie(login.headers['set-cookie']);
    adminToken = extractToken(adminCookie);
    adminId = login.data?.user?.id;
    record(Boolean(adminToken), 'Admin auth token extracted');

    // Create temporary users for non-destructive admin management checks
    const now = Date.now();
    const tempCustomerEmail = `admin-test-customer-${now}@example.com`;
    const tempWorkerEmail = `admin-test-worker-${now}@example.com`;
    const tempPassword = 'Test@1234';

    const custReg = await apiRequest({
      method: 'POST',
      path: '/auth/register-customer',
      data: {
        name: 'Admin Test Customer',
        email: tempCustomerEmail,
        mobile: `913${String(Math.floor(Math.random() * 10000000)).padStart(7, '0')}`,
        password: tempPassword,
      },
    });
    record(custReg.status === 201, 'Create temporary customer', `status=${custReg.status}`);

    const workerReg = await apiRequest({
      method: 'POST',
      path: '/auth/register-worker',
      data: {
        name: 'Admin Test Worker',
        email: tempWorkerEmail,
        mobile: `914${String(Math.floor(Math.random() * 10000000)).padStart(7, '0')}`,
        password: tempPassword,
      },
    });
    record(workerReg.status === 201, 'Create temporary worker', `status=${workerReg.status}`);

    const customerLogin = await axios.post(`${API}/auth/login`, {
      email: tempCustomerEmail,
      password: tempPassword,
    }, { validateStatus: () => true });
    record(customerLogin.status === 200, 'Temporary customer login', `status=${customerLogin.status}`);

    const workerLogin = await axios.post(`${API}/auth/login`, {
      email: tempWorkerEmail,
      password: tempPassword,
    }, { validateStatus: () => true });
    record(workerLogin.status === 200, 'Temporary worker login', `status=${workerLogin.status}`);

    tempCustomer = {
      id: custReg.data?.user?.id,
      token: extractToken(parseCookie(customerLogin.headers['set-cookie'])),
      cookie: parseCookie(customerLogin.headers['set-cookie']),
    };
    tempWorker = {
      id: workerReg.data?.user?.id,
      token: extractToken(parseCookie(workerLogin.headers['set-cookie'])),
      cookie: parseCookie(workerLogin.headers['set-cookie']),
    };

    const workerProfile = await apiRequest({
      method: 'POST',
      path: '/workers/profile',
      bearer: tempWorker.token,
      data: {
        bio: 'Admin layer test worker profile',
        hourlyRate: 450,
        skills: ['plumbing'],
        serviceAreas: ['Mumbai'],
      },
    });
    record(workerProfile.status === 200 || workerProfile.status === 201, 'Temporary worker profile setup', `status=${workerProfile.status}`);

    // Connect sockets first to capture realtime events
    adminSocket = io(BASE, {
      transports: ['websocket'],
      extraHeaders: { Cookie: adminCookie },
      timeout: 9000,
    });

    customerSocket = io(BASE, {
      transports: ['websocket'],
      extraHeaders: { Cookie: tempCustomer.cookie },
      timeout: 9000,
    });

    await Promise.all([
      new Promise((resolve, reject) => {
        adminSocket.on('connect', resolve);
        adminSocket.on('connect_error', reject);
        setTimeout(() => reject(new Error('Admin socket connect timeout')), 10000);
      }),
      new Promise((resolve, reject) => {
        customerSocket.on('connect', resolve);
        customerSocket.on('connect_error', reject);
        setTimeout(() => reject(new Error('Customer socket connect timeout')), 10000);
      }),
    ]);
    record(true, 'Socket connections established (admin + customer)');

    ['admin:users_updated', 'admin:workers_updated', 'admin:coupons_updated', 'verification:created', 'verification:updated'].forEach((evt) => {
      adminSocket.on(evt, (payload) => socketEvents[evt].push(payload));
    });
    customerSocket.on('user:status_changed', (payload) => socketEvents['user:status_changed'].push(payload));

    // 1) DASHBOARD & MONITORING
    const dashboard = await apiRequest({ method: 'GET', path: '/admin/dashboard', cookie: adminCookie });
    record(dashboard.status === 200 && dashboard.data?.stats, 'Admin dashboard API', `status=${dashboard.status}`);

    const fraud = await apiRequest({ method: 'GET', path: '/admin/fraud-alerts', cookie: adminCookie });
    record(fraud.status === 200 && Array.isArray(fraud.data?.highCancellers) && Array.isArray(fraud.data?.badWorkers), 'Admin fraud alerts API', `status=${fraud.status}`);

    const aiSummary = await apiRequest({ method: 'GET', path: '/admin/ai-audits/summary', cookie: adminCookie });
    record(aiSummary.status === 200 && aiSummary.data?.summary, 'Admin AI audit summary API', `status=${aiSummary.status}`);

    const aiList = await apiRequest({ method: 'GET', path: '/admin/ai-audits?page=1&limit=5', cookie: adminCookie });
    record(aiList.status === 200 && Array.isArray(aiList.data?.audits), 'Admin AI audits list API', `status=${aiList.status}`);

    // 2) USER MANAGEMENT
    const users = await apiRequest({ method: 'GET', path: '/admin/users?page=1&limit=10', cookie: adminCookie });
    record(users.status === 200 && Array.isArray(users.data?.users), 'Admin users listing API', `count=${users.data?.users?.length || 0}`);

    const workersByRole = await apiRequest({ method: 'GET', path: '/admin/users?role=WORKER&page=1&limit=10', cookie: adminCookie });
    record(workersByRole.status === 200 && Array.isArray(workersByRole.data?.users), 'Admin users role filter API (WORKER)', `count=${workersByRole.data?.users?.length || 0}`);

    // Update temp customer status and verify events
    const deactivate = await apiRequest({
      method: 'PATCH',
      path: `/admin/users/${tempCustomer.id}/status`,
      cookie: adminCookie,
      data: { isActive: false },
    });
    record(deactivate.status === 200, 'Admin deactivate user API', `status=${deactivate.status}`);

    const usersEvent = await waitForEvent(socketEvents, 'admin:users_updated');
    record(Boolean(usersEvent), 'Realtime admin:users_updated event emitted');

    const privateUserEvent = await waitForEvent(socketEvents, 'user:status_changed');
    record(Boolean(privateUserEvent) && privateUserEvent?.isActive === false, 'Realtime user:status_changed event emitted to target user');

    const reactivate = await apiRequest({
      method: 'PATCH',
      path: `/admin/users/${tempCustomer.id}/status`,
      cookie: adminCookie,
      data: { isActive: true },
    });
    record(reactivate.status === 200, 'Admin reactivate user API', `status=${reactivate.status}`);

    // Self protection checks
    const selfDeactivate = await apiRequest({
      method: 'PATCH',
      path: `/admin/users/${adminId}/status`,
      cookie: adminCookie,
      data: { isActive: false },
    });
    record(selfDeactivate.status === 400, 'Prevent admin self-deactivation guard', `status=${selfDeactivate.status}`);

    const selfDelete = await apiRequest({ method: 'DELETE', path: `/admin/users/${adminId}`, cookie: adminCookie });
    record(selfDelete.status === 400, 'Prevent admin self-deletion guard', `status=${selfDelete.status}`);

    // 3) WORKER MANAGEMENT
    const workers = await apiRequest({ method: 'GET', path: '/admin/workers?page=1&limit=10', cookie: adminCookie });
    record(workers.status === 200 && Array.isArray(workers.data?.workers), 'Admin workers listing API', `count=${workers.data?.workers?.length || 0}`);

    // 4) VERIFICATION MANAGEMENT + ALERT EVENTS
    const applyVerification = await apiRequest({
      method: 'POST',
      path: '/verification/apply',
      bearer: tempWorker.token,
      data: { notes: 'Verification app from admin-layer test', documents: [] },
    });
    record(applyVerification.status === 201 || applyVerification.status === 409, 'Worker verification apply API (setup)', `status=${applyVerification.status}`);

    const verifyCreatedEvent = await waitForEvent(socketEvents, 'verification:created');
    record(Boolean(verifyCreatedEvent), 'Realtime verification:created event emitted to admin room');

    const queue = await apiRequest({ method: 'GET', path: '/admin/verification?page=1&limit=20', cookie: adminCookie });
    record(queue.status === 200 && Array.isArray(queue.data?.applications), 'Admin verification queue API', `count=${queue.data?.applications?.length || 0}`);

    // Find temp worker application if available, else pick first row
    const appRow = (queue.data?.applications || []).find((a) => a.userId === tempWorker.id) || (queue.data?.applications || [])[0];
    verificationApplicationId = appRow?.id || null;
    record(Boolean(verificationApplicationId), 'Verification application available for admin review');

    if (verificationApplicationId) {
      const review = await apiRequest({
        method: 'PATCH',
        path: `/admin/verification/${verificationApplicationId}`,
        cookie: adminCookie,
        data: {
          status: 'RESUBMIT',
          notes: 'Need clearer documents',
          level: 'BASIC',
        },
      });
      record(review.status === 200, 'Admin review verification API', `status=${review.status}`);
      record(review.data?.application?.status === 'MORE_INFO', 'Verification status normalization (RESUBMIT -> MORE_INFO)');

      const verifyUpdatedEvent = await waitForEvent(socketEvents, 'verification:updated');
      record(Boolean(verifyUpdatedEvent), 'Realtime verification:updated event emitted to admin room');
    }

    // Verify worker got verification notification
    const workerNotifications = await apiRequest({ method: 'GET', path: '/notifications', bearer: tempWorker.token });
    const hasVerificationNotif = Array.isArray(workerNotifications.data)
      ? workerNotifications.data.some((n) => n.type === 'VERIFICATION_STATUS')
      : Array.isArray(workerNotifications.data?.notifications)
        ? workerNotifications.data.notifications.some((n) => n.type === 'VERIFICATION_STATUS')
        : false;
    record(workerNotifications.status === 200, 'Worker notifications API (post-review)', `status=${workerNotifications.status}`);
    record(hasVerificationNotif, 'Verification status notification delivered to worker');

    // 5) COUPON MANAGEMENT + REALTIME
    const code = `ADM${Math.floor(Math.random() * 90000 + 10000)}`;
    const createCoupon = await apiRequest({
      method: 'POST',
      path: '/admin/coupons',
      cookie: adminCookie,
      data: {
        code,
        discountType: 'PERCENTAGE',
        discountValue: 12,
        minOrderValue: 100,
        usageLimit: 7,
        applicableTo: 'ALL',
        firstTimeOnly: false,
        isActive: true,
      },
    });
    record(createCoupon.status === 201, 'Admin create coupon API', `status=${createCoupon.status}`);

    tempCouponId = createCoupon.data?.coupon?.id || null;
    record(Boolean(tempCouponId), 'Coupon ID generated');

    const couponEvent = await waitForEvent(socketEvents, 'admin:coupons_updated');
    record(Boolean(couponEvent), 'Realtime admin:coupons_updated event emitted');

    const coupons = await apiRequest({ method: 'GET', path: '/admin/coupons', cookie: adminCookie });
    record(coupons.status === 200 && Array.isArray(coupons.data?.coupons), 'Admin list coupons API', `count=${coupons.data?.coupons?.length || 0}`);

    if (tempCouponId) {
      const toggle = await apiRequest({
        method: 'PATCH',
        path: `/admin/coupons/${tempCouponId}/status`,
        cookie: adminCookie,
        data: { isActive: false },
      });
      record(toggle.status === 200 && toggle.data?.coupon?.isActive === false, 'Admin disable coupon API', `status=${toggle.status}`);

      const removeCoupon = await apiRequest({ method: 'DELETE', path: `/admin/coupons/${tempCouponId}`, cookie: adminCookie });
      record(removeCoupon.status === 200, 'Admin delete coupon API', `status=${removeCoupon.status}`);
    }

    // 6) PLATFORM CONTROL VIA AI TOOLS
    const adminContext = { userId: adminId, role: 'ADMIN', token: adminToken };

    const adminTools = [
      'getVerificationQueue',
      'getAdminDashboard',
      'getAdminFraudAlerts',
      'getAdminAiAuditSummary',
      'getAdminAiAudits',
      'getAdminUsers',
      'getAdminWorkers',
      'getAdminCoupons',
    ];

    for (const toolName of adminTools) {
      const tr = await executeTool({ toolName, params: {}, userContext: adminContext });
      record(Boolean(tr.success), `Tool executor: ${toolName}`);
    }

    if (verificationApplicationId) {
      const trReview = await executeTool({
        toolName: 'reviewVerificationApplication',
        params: { id: verificationApplicationId, status: 'MORE_INFO', notes: 'Tool executor review check' },
        userContext: adminContext,
      });
      record(Boolean(trReview.success), 'Tool executor: reviewVerificationApplication');
    }

    // Authenticated tools for admin
    const authTools = ['listServices', 'getTopWorkers', 'searchWorkers', 'getBookings', 'getNotifications'];
    for (const toolName of authTools) {
      const tr = await executeTool({ toolName, params: {}, userContext: adminContext });
      record(Boolean(tr.success), `Tool executor (AUTHENTICATED): ${toolName}`);
    }

    // 7) ADMIN AI CHAT ROUTING
    const chatMessages = [
      { q: 'show dashboard', expectedTitle: 'Admin Dashboard' },
      { q: 'show users', expectedTitle: 'User Management' },
      { q: 'show workers', expectedTitle: 'Worker Management' },
      { q: 'show verification queue', expectedTitle: 'Verification Queue' },
      { q: 'show fraud alerts', expectedTitle: 'Fraud Alerts' },
      { q: 'show ai audits', expectedTitle: 'AI Audits' },
      { q: 'show coupons', expectedTitle: 'Coupons' },
    ];

    for (const msg of chatMessages) {
      let chat = await apiRequest({ method: 'POST', path: '/ai/chat', cookie: adminCookie, data: { message: msg.q } });
      if (chat.data?.message && String(chat.data.message).toLowerCase().includes('too many requests')) {
        await sleep(2200);
        chat = await apiRequest({ method: 'POST', path: '/ai/chat', cookie: adminCookie, data: { message: msg.q } });
      }
      const ok = chat.status === 200 && chat.data?.type === 'data' && chat.data?.title === msg.expectedTitle;
      record(ok, `AI chat route: "${msg.q}"`, `title=${chat.data?.title || 'N/A'}`);
      await sleep(1400);
    }

    // 8) AI AUDIT FILTERING / REPORTING JSON
    const auditsByUser = await apiRequest({ method: 'GET', path: `/admin/ai-audits?userId=${adminId}&page=1&limit=5`, cookie: adminCookie });
    record(auditsByUser.status === 200 && Array.isArray(auditsByUser.data?.audits), 'AI audits filter by userId');

    const auditsByStatus = await apiRequest({ method: 'GET', path: '/admin/ai-audits?status=SUCCESS&page=1&limit=5', cookie: adminCookie });
    record(auditsByStatus.status === 200 && Array.isArray(auditsByStatus.data?.audits), 'AI audits filter by status');

    const auditsByChannel = await apiRequest({ method: 'GET', path: '/admin/ai-audits?channel=CHAT&page=1&limit=5', cookie: adminCookie });
    record(auditsByChannel.status === 200 && Array.isArray(auditsByChannel.data?.audits), 'AI audits filter by channel');

    const auditsByIntent = await apiRequest({ method: 'GET', path: '/admin/ai-audits?intent=bookings&page=1&limit=5', cookie: adminCookie });
    record(auditsByIntent.status === 200 && Array.isArray(auditsByIntent.data?.audits), 'AI audits filter by intent');

    // JSON export capability check (structured JSON response)
    const isJsonStructured = Boolean(users.data?.users) && Boolean(users.data?.pagination);
    record(isJsonStructured, 'Structured JSON response shape (users + pagination)');

  } catch (err) {
    record(false, 'Unhandled test runner exception', err.message || String(err));
  } finally {
    // Cleanup
    try {
      if (tempCustomer?.id && adminCookie) {
        await apiRequest({ method: 'DELETE', path: `/admin/users/${tempCustomer.id}`, cookie: adminCookie });
      }
    } catch (_e) {}

    try {
      if (tempWorker?.id && adminCookie) {
        await apiRequest({ method: 'DELETE', path: `/admin/users/${tempWorker.id}`, cookie: adminCookie });
      }
    } catch (_e) {}

    try {
      if (adminSocket) adminSocket.disconnect();
      if (customerSocket) customerSocket.disconnect();
    } catch (_e) {}

    console.log('\n================ ADMIN LAYER TEST SUMMARY ================');
    console.log(`Passed: ${results.passed}`);
    console.log(`Failed: ${results.failed}`);
    console.log(`Total : ${results.passed + results.failed}`);
    console.log('==========================================================');

    if (results.failed > 0) {
      process.exitCode = 1;
    }
  }
})();
