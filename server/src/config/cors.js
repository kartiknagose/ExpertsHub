const { CORS_ORIGIN, NODE_ENV, FRONTEND_URL } = require('./env');

const corsOptions = {
  origin: function (origin, callback) {
    // Split comma-separated CORS_ORIGIN into individual origins.
    // e.g. "https://app.vercel.app,http://localhost:5173" → ["https://app.vercel.app", "http://localhost:5173"]
    const allowedOrigins = CORS_ORIGIN
      ? CORS_ORIGIN.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    // Also allow the explicit FRONTEND_URL if configured
    if (FRONTEND_URL && !allowedOrigins.includes(FRONTEND_URL)) {
      allowedOrigins.push(FRONTEND_URL);
    }

    // Only allow localhost origins in development
    if (NODE_ENV !== 'production') {
      if (!allowedOrigins.includes('http://localhost:5173')) allowedOrigins.push('http://localhost:5173');
      if (!allowedOrigins.includes('http://localhost:5174')) allowedOrigins.push('http://localhost:5174');
    }

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked origin: ${origin}. Allowed: ${allowedOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

module.exports = { corsOptions };