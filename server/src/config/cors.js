const { CORS_ORIGIN, NODE_ENV } = require('./env');

const corsOptions = {
  origin: function (origin, callback) {
    // Always allow the configured origin (env CORS_ORIGIN)
    const allowedOrigins = [CORS_ORIGIN];

    // Only allow localhost origins in development
    if (NODE_ENV !== 'production') {
      allowedOrigins.push('http://localhost:5173', 'http://localhost:5174');
    }

    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

module.exports = { corsOptions };