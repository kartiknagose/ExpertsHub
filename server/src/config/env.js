const dotenv = require('dotenv');
dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 3000;

// SECURITY: JWT_SECRET must be set via environment variable.
// A dev-only fallback is provided for local development convenience.
const JWT_SECRET = process.env.JWT_SECRET || (NODE_ENV === 'development' ? 'dev_only_secret_do_not_use_in_production' : undefined);

if (!JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is not set. Server cannot start in production without it.');
    process.exit(1);
}

// CORS_ORIGIN: Validate in production
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

if (NODE_ENV === 'production' && CORS_ORIGIN === 'http://localhost:5173') {
    console.warn('WARNING: CORS_ORIGIN is set to localhost in production. This is likely a misconfiguration.');
}

module.exports = { PORT, JWT_SECRET, CORS_ORIGIN, NODE_ENV };
