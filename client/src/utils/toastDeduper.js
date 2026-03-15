import { toast } from 'sonner';

let isInstalled = false;
const recentToasts = new Map();

function getToastKey(type, message, options) {
  if (options?.id) return `id:${String(options.id)}`;
  if (typeof message === 'string' && message.trim()) {
    return `${type}:${message.trim()}`;
  }
  if (typeof options?.description === 'string' && options.description.trim()) {
    return `${type}:desc:${options.description.trim()}`;
  }
  return null;
}

function isDuplicate(type, message, options) {
  if (options?.dedupe === false) return false;

  const key = getToastKey(type, message, options);
  if (!key) return false;

  const now = Date.now();
  const dedupeWindowMs = Number(options?.dedupeWindowMs) || 2500;
  const previous = recentToasts.get(key) || 0;

  recentToasts.set(key, now);

  if (recentToasts.size > 200) {
    for (const [entryKey, timestamp] of recentToasts.entries()) {
      if (now - timestamp > 15000) {
        recentToasts.delete(entryKey);
      }
    }
  }

  return now - previous < dedupeWindowMs;
}

function patchToastMethod(type) {
  const original = toast[type];
  if (typeof original !== 'function') return;

  toast[type] = (message, options = {}) => {
    if (isDuplicate(type, message, options)) {
      return options?.id;
    }
    return original(message, options);
  };
}

export function installToastDeduper() {
  if (isInstalled) return;
  isInstalled = true;

  patchToastMethod('success');
  patchToastMethod('error');
  patchToastMethod('info');
  patchToastMethod('warning');
  patchToastMethod('message');
}
