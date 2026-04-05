const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE = String(process.env.AI_MATRIX_BASE_URL || 'http://127.0.0.1:3000').trim();
const API = `${BASE}/api`;
const REPORTS_DIR = path.resolve(__dirname, '../reports');

const USERS = {
  CUSTOMER: { email: 'customer@test.com', password: 'password123' },
  WORKER: { email: 'worker@test.com', password: 'password123' },
  ADMIN: { email: 'admin@expertshub.tech', password: 'password123' },
};

const PROMPTS = {
  CUSTOMER: [
    'book plumber tomorrow 10 am in pune',
    'i need electrician this evening in mumbai',
    'show my latest booking',
    'cancel my latest booking',
    'show wallet',
    'show notifications',
    'open my profile',
    'help me understand pending payments'
  ],
  WORKER: [
    'show my worker bookings',
    'show payout history',
    'update payout details',
    'show verification status',
    'add availability monday 10:00 to 13:00',
    'open worker profile',
    'show my notifications',
    'how much can i redeem now'
  ],
  ADMIN: [
    'show dashboard',
    'show users',
    'show workers',
    'show verification queue',
    'show fraud alerts',
    'show ai audits',
    'show coupons',
    'show pending verification applications'
  ],
};

const WEAK_FALLBACK_PATTERNS = [
  /temporarily unavailable/i,
  /something went wrong/i,
  /could not generate a response/i,
  /i can help with bookings, wallet, or notifications/i,
  /i need a bit more detail/i,
  /try again/i,
  /failsafe/i,
];

function ensureReportsDir() {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

function toSafeTimestamp(value = new Date()) {
  return value.toISOString().replace(/[:.]/g, '-');
}

function toMarkdownReport(rows, weak, startedAtIso) {
  const lines = [];
  lines.push('# AI Role Prompt Matrix Report');
  lines.push('');
  lines.push(`- Generated: ${new Date().toISOString()}`);
  lines.push(`- Started At: ${startedAtIso}`);
  lines.push(`- Base URL: ${BASE}`);
  lines.push(`- Total prompts: ${rows.length}`);
  lines.push(`- Weak/failed: ${weak.length}`);
  lines.push('');
  lines.push('| Status | Role | Prompt | HTTP | Type | Action | Target | Reply |');
  lines.push('|---|---|---|---:|---|---|---|---|');

  for (const row of rows) {
    const status = row.weakFallback || row.status !== 200 ? 'FAIL' : 'PASS';
    const reply = String(row.text || '').replace(/\|/g, '\\|').replace(/\n/g, ' ').slice(0, 240);
    const prompt = String(row.prompt || '').replace(/\|/g, '\\|');
    lines.push(`| ${status} | ${row.role} | ${prompt} | ${row.status} | ${row.type || 'n/a'} | ${row.action || 'n/a'} | ${row.target || 'n/a'} | ${reply} |`);
  }

  lines.push('');
  if (weak.length > 0) {
    lines.push('## Weak/Fallback Cases');
    lines.push('');
    for (const row of weak) {
      lines.push(`- [${row.role}] ${row.prompt}`);
      lines.push(`  - Reply: ${row.text}`);
    }
  }

  return lines.join('\n');
}

function parseCookie(setCookie = []) {
  const arr = Array.isArray(setCookie) ? setCookie : [setCookie];
  return arr.map((v) => String(v || '').split(';')[0]).filter(Boolean).join('; ');
}

async function login(user) {
  const response = await axios.post(`${API}/auth/login`, user, { validateStatus: () => true });
  if (response.status !== 200) {
    throw new Error(`Login failed for ${user.email}: status=${response.status}`);
  }
  const cookie = parseCookie(response.headers['set-cookie']);
  return cookie;
}

async function runRole(role) {
  const cookie = await login(USERS[role]);
  const rows = [];

  for (let index = 0; index < PROMPTS[role].length; index += 1) {
    const prompt = PROMPTS[role][index];
    const sessionId = `matrix-${role.toLowerCase()}-${Date.now()}-${index}`;
    const response = await axios.post(
      `${API}/ai/chat`,
      { message: prompt, sessionId },
      {
        headers: { Cookie: cookie, 'Content-Type': 'application/json' },
        validateStatus: () => true,
      }
    );

    const body = response.data || {};
    const text = String(body?.message || body?.reply || body?.error || '').trim();
    const weakFallback = WEAK_FALLBACK_PATTERNS.some((pattern) => pattern.test(text));

    rows.push({
      role,
      prompt,
      status: response.status,
      type: body?.type || null,
      action: body?.action || null,
      target: body?.target || null,
      weakFallback,
      text,
    });

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  return rows;
}

(async () => {
  try {
    ensureReportsDir();
    const startedAtIso = new Date().toISOString();
    const roleFilter = String(process.env.AI_MATRIX_ROLE || 'ALL').trim().toUpperCase();
    const roleKeys = Object.keys(PROMPTS).filter((role) => roleFilter === 'ALL' || role === roleFilter);
    if (roleKeys.length === 0) {
      throw new Error(`Invalid AI_MATRIX_ROLE=${roleFilter}. Use ALL, CUSTOMER, WORKER, or ADMIN.`);
    }

    const all = [];
    for (const role of roleKeys) {
      const rows = await runRole(role);
      all.push(...rows);
    }

    const weak = all.filter((r) => r.weakFallback || r.status !== 200);

    console.log('\n=== AI ROLE PROMPT MATRIX REPORT ===');
    for (const row of all) {
      const mark = row.weakFallback || row.status !== 200 ? '❌' : '✅';
      console.log(`${mark} [${row.role}] ${row.prompt}`);
      console.log(`   status=${row.status} type=${row.type || 'n/a'} action=${row.action || 'n/a'} target=${row.target || 'n/a'}`);
      console.log(`   text=${row.text.slice(0, 200)}`);
    }

    console.log('\n=== SUMMARY ===');
    console.log(`Total prompts: ${all.length}`);
    console.log(`Weak/failed: ${weak.length}`);

    const stamp = toSafeTimestamp();
    const jsonPath = path.join(REPORTS_DIR, `ai-role-prompt-matrix-${stamp}.json`);
    const mdPath = path.join(REPORTS_DIR, `ai-role-prompt-matrix-${stamp}.md`);
    fs.writeFileSync(jsonPath, JSON.stringify({
      generatedAt: new Date().toISOString(),
      startedAt: startedAtIso,
      baseUrl: BASE,
      roleFilter,
      summary: {
        total: all.length,
        weakOrFailed: weak.length,
      },
      rows: all,
      weak,
    }, null, 2), 'utf8');
    fs.writeFileSync(mdPath, toMarkdownReport(all, weak, startedAtIso), 'utf8');
    console.log(`\nSaved JSON report: ${jsonPath}`);
    console.log(`Saved Markdown report: ${mdPath}`);

    if (weak.length > 0) {
      console.log('\n=== WEAK FALLBACKS ===');
      for (const row of weak) {
        console.log(`[${row.role}] ${row.prompt}`);
        console.log(` -> ${row.text}`);
      }
      process.exitCode = 1;
      return;
    }

    process.exitCode = 0;
  } catch (error) {
    console.error('Fatal test error:', error.message);
    process.exitCode = 1;
  }
})();
