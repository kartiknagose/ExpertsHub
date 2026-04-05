const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const fsp = fs.promises;
const pendingConfirmations = new Map();
const userRequestTracker = new Map();
const userContextStore = new Map();
const userPreferenceStore = new Map();
const userJourneyStore = new Map();
const apiResponseCache = new Map();
const bookingAttemptTracker = new Map();
const bookingIdempotencyStore = new Map();
const destructiveActionStore = new Map();
const SESSION_STATE_PATH = path.resolve(__dirname, '../../../tmp/ai-session-state.json');
const MAX_MAP_ENTRIES = 10_000;
let sessionSnapshotTimer = null;
let sessionSnapshotInFlight = false;

function nowIso() {
  return new Date().toISOString();
}

function getSnapshotEncryptionSecret() {
  const secret = String(process.env.AI_SESSION_STATE_KEY || '').trim();
  return secret || null;
}

function getSnapshotCipherKey(secret) {
  return crypto.createHash('sha256').update(secret, 'utf8').digest();
}

function encryptSnapshotPayload(plainText) {
  const secret = getSnapshotEncryptionSecret();
  if (!secret) {
    return { encrypted: false, data: plainText };
  }

  const iv = crypto.randomBytes(12);
  const key = getSnapshotCipherKey(secret);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(String(plainText), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    encrypted: true,
    data: JSON.stringify({
      v: 1,
      alg: 'aes-256-gcm',
      iv: iv.toString('base64'),
      tag: authTag.toString('base64'),
      content: encrypted.toString('base64'),
    }),
  };
}

function decryptSnapshotPayload(rawText) {
  const text = String(rawText || '').trim();
  if (!text) return '';

  try {
    const parsed = JSON.parse(text);
    if (parsed?.alg !== 'aes-256-gcm' || !parsed?.iv || !parsed?.tag || !parsed?.content) {
      return text;
    }

    const secret = getSnapshotEncryptionSecret();
    if (!secret) {
      throw new Error('Encrypted snapshot found but AI_SESSION_STATE_KEY is not configured.');
    }

    const key = getSnapshotCipherKey(secret);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(parsed.iv, 'base64'));
    decipher.setAuthTag(Buffer.from(parsed.tag, 'base64'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(parsed.content, 'base64')),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  } catch (error) {
    // Legacy plaintext snapshots should continue to load without encryption.
    if (text.startsWith('{') && text.endsWith('}')) return text;
    throw error;
  }
}

function mapToSerializableArray(store) {
  return Array.from(store.entries());
}

function restoreMap(store, entries) {
  store.clear();
  if (!Array.isArray(entries)) return;
  for (const entry of entries) {
    if (!Array.isArray(entry) || entry.length !== 2) continue;
    store.set(entry[0], entry[1]);
  }
}

function pruneArrayStoreByWindow(store, windowMs, now = Date.now()) {
  for (const [key, value] of store.entries()) {
    const recent = Array.isArray(value)
      ? value.filter((timestamp) => now - Number(timestamp || 0) <= windowMs)
      : [];
    if (recent.length > 0) {
      store.set(key, recent);
    } else {
      store.delete(key);
    }
  }
}

function pruneExpiryStore(store, now = Date.now()) {
  for (const [key, value] of store.entries()) {
    const expiry = Number(value?.expiryTimestamp || 0);
    if (!expiry || now > expiry) {
      store.delete(key);
    }
  }
}

function capMapSize(store, maxEntries = MAX_MAP_ENTRIES) {
  if (!store || typeof store.size !== 'number') return;
  while (store.size > maxEntries) {
    const oldestKey = store.keys().next().value;
    if (oldestKey === undefined) break;
    store.delete(oldestKey);
  }
}

function pruneSessionState() {
  const now = Date.now();
  pruneArrayStoreByWindow(userRequestTracker, 10_000, now);
  pruneArrayStoreByWindow(bookingAttemptTracker, 60_000, now);
  pruneExpiryStore(apiResponseCache, now);
  pruneExpiryStore(bookingIdempotencyStore, now);
  pruneExpiryStore(destructiveActionStore, now);
  capMapSize(pendingConfirmations);
  capMapSize(userRequestTracker);
  capMapSize(userContextStore);
  capMapSize(userPreferenceStore);
  capMapSize(userJourneyStore);
  capMapSize(apiResponseCache);
  capMapSize(bookingAttemptTracker);
  capMapSize(bookingIdempotencyStore);
  capMapSize(destructiveActionStore);
}

function readSessionSnapshot() {
  try {
    if (!fs.existsSync(SESSION_STATE_PATH)) return;
    const raw = fs.readFileSync(SESSION_STATE_PATH, 'utf8');
    if (!raw.trim()) return;
    const parsed = JSON.parse(decryptSnapshotPayload(raw));
    restoreMap(pendingConfirmations, parsed?.pendingConfirmations);
    restoreMap(userContextStore, parsed?.userContextStore);
    restoreMap(userPreferenceStore, parsed?.userPreferenceStore);
    restoreMap(userJourneyStore, parsed?.userJourneyStore);
    restoreMap(bookingAttemptTracker, parsed?.bookingAttemptTracker);
    restoreMap(bookingIdempotencyStore, parsed?.bookingIdempotencyStore);
    restoreMap(apiResponseCache, parsed?.apiResponseCache);
    restoreMap(destructiveActionStore, parsed?.destructiveActionStore);
    pruneSessionState();
  } catch (error) {
    console.log(`[ai-session] snapshot_load_failed message=${error?.message || error}`);
  }
}

async function writeSessionSnapshot() {
  if (sessionSnapshotInFlight) return;
  sessionSnapshotInFlight = true;
  try {
    pruneSessionState();
    await fsp.mkdir(path.dirname(SESSION_STATE_PATH), { recursive: true });
    const payload = {
      pendingConfirmations: mapToSerializableArray(pendingConfirmations),
      userContextStore: mapToSerializableArray(userContextStore),
      userPreferenceStore: mapToSerializableArray(userPreferenceStore),
      userJourneyStore: mapToSerializableArray(userJourneyStore),
      bookingAttemptTracker: mapToSerializableArray(bookingAttemptTracker),
      bookingIdempotencyStore: mapToSerializableArray(bookingIdempotencyStore),
      apiResponseCache: mapToSerializableArray(apiResponseCache),
      destructiveActionStore: mapToSerializableArray(destructiveActionStore),
    };
    const snapshot = encryptSnapshotPayload(JSON.stringify(payload));
    await fsp.writeFile(SESSION_STATE_PATH, snapshot.data, 'utf8');
  } catch (error) {
    console.log(`[ai-session] snapshot_save_failed message=${error?.message || error}`);
  } finally {
    sessionSnapshotInFlight = false;
  }
}

function scheduleSessionSnapshot() {
  if (sessionSnapshotTimer) return;
  sessionSnapshotTimer = setInterval(writeSessionSnapshot, 15000);
  sessionSnapshotTimer.unref?.();
}

function getUserContext(userId) {
  const key = String(userId);
  if (!userContextStore.has(key)) {
    userContextStore.set(key, {
      lastIntent: null,
      lastBookingId: null,
      pendingBooking: null,
      availableWorkers: [],
      lastWorkerOptions: [],
      bestWorkerId: null,
      cheapestWorkerId: null,
      workerMetadata: null,
    });
  }
  return userContextStore.get(key);
}

function getUserJourney(userId) {
  const key = String(userId);
  if (!userJourneyStore.has(key)) {
    userJourneyStore.set(key, {
      bookingStarted: false,
      bookingCompleted: false,
      lastStep: 'idle',
    });
  }
  return userJourneyStore.get(key);
}

function updateUserJourney(userId, updates = {}) {
  const journey = getUserJourney(userId);
  Object.assign(journey, updates || {});
  console.log(`[AI_AGENT_LOG] ${JSON.stringify({
    userId: String(userId),
    event: 'journey_transition',
    bookingStarted: Boolean(journey.bookingStarted),
    bookingCompleted: Boolean(journey.bookingCompleted),
    lastStep: journey.lastStep || 'idle',
    timestamp: nowIso(),
  })}`);
}

function getUserPreference(userId) {
  const key = String(userId);
  if (!userPreferenceStore.has(key)) {
    userPreferenceStore.set(key, { preference: null });
  }
  return userPreferenceStore.get(key);
}

function setUserPreference(userId, preference) {
  const pref = getUserPreference(userId);
  if (preference === 'best' || preference === 'cheap') {
    pref.preference = preference;
  } else {
    pref.preference = null;
  }
}

function getCacheTtlMsForEndpoint(method, endpoint) {
  if (String(method || '').toUpperCase() !== 'GET') return 0;
  if (endpoint === '/api/services') return 5 * 60 * 1000;
  if (/^\/api\/services\/[^/]+\/workers$/i.test(String(endpoint || ''))) return 2 * 60 * 1000;
  return 0;
}

function getCacheKey(method, endpoint) {
  return `${String(method || '').toUpperCase()}:${String(endpoint || '')}`;
}

function getCachedResponse(method, endpoint) {
  const ttl = getCacheTtlMsForEndpoint(method, endpoint);
  if (!ttl) return null;
  const key = getCacheKey(method, endpoint);
  const entry = apiResponseCache.get(key);
  if (!entry) return null;
  if (Date.now() > Number(entry.expiryTimestamp || 0)) {
    apiResponseCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCachedResponse(method, endpoint, data) {
  const ttl = getCacheTtlMsForEndpoint(method, endpoint);
  if (!ttl) return;
  const key = getCacheKey(method, endpoint);
  apiResponseCache.set(key, {
    data,
    expiryTimestamp: Date.now() + ttl,
  });
}

function isUserRateLimited(userId) {
  const now = Date.now();
  const userKey = String(userId);
  const existing = userRequestTracker.get(userKey) || [];
  const recent = existing.filter((timestamp) => now - timestamp <= 10_000);

  if (recent.length >= 12) {
    userRequestTracker.set(userKey, recent);
    return true;
  }

  recent.push(now);
  userRequestTracker.set(userKey, recent);
  return false;
}

function isBookingAttemptRateLimited(userId) {
  const key = String(userId);
  const now = Date.now();
  const existing = bookingAttemptTracker.get(key) || [];
  const recent = existing.filter((ts) => now - ts <= 60_000);
  if (recent.length >= 3) {
    if (recent.length > 0) {
      bookingAttemptTracker.set(key, recent);
    } else {
      bookingAttemptTracker.delete(key);
    }
    return true;
  }
  recent.push(now);
  bookingAttemptTracker.set(key, recent);
  return false;
}

function createBookingIdempotencyKey(userId, booking = {}) {
  const serviceId = booking?.serviceId || 'na';
  const scheduledAt = booking?.scheduledAt || 'na';
  const workerId = booking?.workerId || 'na';
  return `${String(userId)}:${serviceId}:${scheduledAt}:${workerId}`;
}

function canStartBookingExecution(idempotencyKey) {
  if (!idempotencyKey) return true;
  const now = Date.now();
  const existing = bookingIdempotencyStore.get(idempotencyKey);
  if (existing && now <= Number(existing.expiryTimestamp || 0) && existing.status === 'in_progress') {
    return false;
  }
  bookingIdempotencyStore.set(idempotencyKey, {
    status: 'in_progress',
    expiryTimestamp: now + (2 * 60 * 1000),
  });
  return true;
}

function completeBookingExecution(idempotencyKey, success) {
  if (!idempotencyKey) return;
  bookingIdempotencyStore.set(idempotencyKey, {
    status: success ? 'completed' : 'failed',
    expiryTimestamp: Date.now() + (2 * 60 * 1000),
  });
}

function createActionExecutionKey({ userId, method, endpoint, body = null }) {
  const normalizedMethod = String(method || '').toUpperCase();
  const normalizedEndpoint = String(endpoint || '').trim();
  const normalizedBody = body && typeof body === 'object' ? body : {};
  const serialized = JSON.stringify({
    userId: String(userId || ''),
    method: normalizedMethod,
    endpoint: normalizedEndpoint,
    body: normalizedBody,
  });
  return crypto.createHash('sha256').update(serialized).digest('hex');
}

function canStartActionExecution(actionKey) {
  if (!actionKey) return true;
  const now = Date.now();
  const existing = destructiveActionStore.get(actionKey);
  if (existing && now <= Number(existing.expiryTimestamp || 0) && existing.status === 'in_progress') {
    return false;
  }

  destructiveActionStore.set(actionKey, {
    status: 'in_progress',
    expiryTimestamp: now + (15 * 1000),
  });
  return true;
}

function completeActionExecution(actionKey, success) {
  if (!actionKey) return;
  destructiveActionStore.set(actionKey, {
    status: success ? 'completed' : 'failed',
    expiryTimestamp: Date.now() + (success ? 8_000 : 4_000),
  });
}

function clearPendingBooking(userId) {
  const context = getUserContext(userId);
  context.pendingBooking = null;
  context.pendingBookingSessionId = null;
  context.pendingBookingCreatedAt = null;
}

function deleteScopedMapEntries(store, userId) {
  const prefix = `${String(userId)}:`;
  for (const key of store.keys()) {
    if (String(key).startsWith(prefix)) {
      store.delete(key);
    }
  }
}

function resetSessionState() {
  pendingConfirmations.clear();
  userRequestTracker.clear();
  userContextStore.clear();
  userPreferenceStore.clear();
  userJourneyStore.clear();
  apiResponseCache.clear();
  bookingAttemptTracker.clear();
  bookingIdempotencyStore.clear();
  destructiveActionStore.clear();
}

readSessionSnapshot();
scheduleSessionSnapshot();

process.once('beforeExit', () => {
  void writeSessionSnapshot();
});
process.once('SIGINT', () => {
  void writeSessionSnapshot().finally(() => process.exit(0));
});

module.exports = {
  pendingConfirmations,
  userRequestTracker,
  userContextStore,
  userPreferenceStore,
  userJourneyStore,
  apiResponseCache,
  bookingAttemptTracker,
  bookingIdempotencyStore,
  destructiveActionStore,
  capMapSize,
  readSessionSnapshot,
  writeSessionSnapshot,
  scheduleSessionSnapshot,
  pruneSessionState,
  getUserContext,
  getUserJourney,
  updateUserJourney,
  getUserPreference,
  setUserPreference,
  getCachedResponse,
  setCachedResponse,
  isUserRateLimited,
  isBookingAttemptRateLimited,
  createBookingIdempotencyKey,
  canStartBookingExecution,
  completeBookingExecution,
  createActionExecutionKey,
  canStartActionExecution,
  completeActionExecution,
  clearPendingBooking,
  deleteScopedMapEntries,
  resetSessionState,
};
