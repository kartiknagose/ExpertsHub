// Custom service worker with push notification support
// This file is used in injectManifest mode — Workbox injects its precache manifest here.

import { precacheAndRoute, cleanupOutdatedCaches, matchPrecache } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { clientsClaim } from 'workbox-core';

// ── Workbox Precaching ──
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// ── Skip waiting + claim immediately when prompted ──
self.skipWaiting();
clientsClaim();

// ── Runtime caching: API calls (network-first) ──
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 5 * 60 }),
    ],
    networkTimeoutSeconds: 5,
  })
);

// ── Runtime caching: images (cache-first) ──
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
);

// ── Runtime caching: Google Fonts (cache-first) ──
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 }),
    ],
  })
);

// ── Navigate fallback for SPA ──
const navigationRoute = new NavigationRoute(
  async ({ request }) => {
    try {
      // Try to get index.html from precache
      const cached = await matchPrecache('/index.html');
      if (cached) return cached;
      return await fetch(request);
    } catch {
      return await matchPrecache('/index.html') || Response.error();
    }
  },
  { denylist: [/^\/api\//, /^\/uploads\//] }
);
registerRoute(navigationRoute);

// ── Push Notification Handler ──
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: 'ExpertsHub', body: event.data.text() };
  }

  const { title = 'ExpertsHub', body, icon, badge, url, tag } = data;

  const options = {
    body,
    icon: icon || '/pwa-192x192.png',
    badge: badge || '/pwa-64x64.png',
    tag: tag || 'ExpertsHub-notification',
    renotify: true,
    data: { url: url || '/' },
    vibrate: [100, 50, 100],
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ── Notification Click Handler ──
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Open new window otherwise
      return self.clients.openWindow(targetUrl);
    })
  );
});
