const { CORS_ORIGIN } = require('./env');

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [CORS_ORIGIN, 'http://localhost:5173', 'http://localhost:5174'];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

module.exports = { corsOptions };