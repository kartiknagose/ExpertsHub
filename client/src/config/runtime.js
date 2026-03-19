// Shared runtime URL helpers for API and Socket.IO endpoints.

import { clientEnv } from './env';

const configuredApiUrl = clientEnv.apiUrl.replace(/\/$/, '');
const isVercelHostname = typeof window !== 'undefined'
	&& /(?:^|\.)vercel\.app$/i.test(window.location.hostname);
const isRenderApiUrl = /^https?:\/\/[^/]*onrender\.com(?:\/api)?$/i.test(configuredApiUrl);

// Prefer same-origin /api on Vercel so requests are proxied and avoid CORS/cookie cross-site failures.
export const API_BASE_URL = isVercelHostname && isRenderApiUrl ? '/api' : configuredApiUrl;
export const API_ORIGIN = API_BASE_URL.startsWith('/api')
	? (typeof window !== 'undefined' ? window.location.origin : '')
	: API_BASE_URL.replace(/\/api\/?$/, '');

const rawSocketUrl = clientEnv.socketUrl || API_ORIGIN;
export const SOCKET_BASE_URL = rawSocketUrl.replace(/\/$/, '').replace(/\/api\/?$/, '');
