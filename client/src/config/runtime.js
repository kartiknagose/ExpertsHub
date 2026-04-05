import { clientEnv } from './env';

const configuredApiUrl = clientEnv.apiUrl.replace(/\/$/, '');
export const API_BASE_URL = configuredApiUrl || '/api';
export const API_ORIGIN = API_BASE_URL.startsWith('http')
  ? API_BASE_URL.replace(/\/api\/?$/, '')
  : (typeof window !== 'undefined' ? window.location.origin : '');

const rawSocketUrl = clientEnv.socketUrl || API_ORIGIN;
export const SOCKET_BASE_URL = rawSocketUrl.replace(/\/$/, '').replace(/\/api\/?$/, '');
