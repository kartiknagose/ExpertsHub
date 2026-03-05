// server/src/index.js
// Entrypoint for the Express API server.
// Responsibilities:
// - Configure global middleware (security, parsing, logging, i18n)
// - Mount API route modules under `/api/*`
// - Serve uploaded files from the `uploads` folder
// - Export the `app` for use by tests or a separate HTTP server bootstrap

// ── External dependencies ──
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// ── Config ──
const { PORT, CORS_ORIGIN } = require('./config/env');
const { corsOptions } = require('./config/cors');
const i18n = require('./config/i18n');

// ── Middleware ──
const notFoundHandler = require('./middleware/notFoundHandler');
const errorHandler = require('./middleware/errorHandler');

// ── Route modules ──
const authRoutes = require('./modules/auth/auth.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const availabilityRoutes = require('./modules/availability/availability.routes');
const bookingRoutes = require('./modules/bookings/booking.routes');
const chatRoutes = require('./modules/chat/chat.routes');
const customerRoutes = require('./modules/customers/customer.routes');
const locationRoutes = require('./modules/location/location.routes');
const notificationRoutes = require('./modules/notifications/notification.routes');
const paymentRoutes = require('./modules/payments/payment.routes');
const reviewRoutes = require('./modules/reviews/review.routes');
const safetyRoutes = require('./modules/safety/safety.routes');
const serviceRoutes = require('./modules/services/service.routes');
const uploadRoutes = require('./modules/uploads/upload.routes');
const verificationRoutes = require('./modules/verification/verification.routes');
const workerRoutes = require('./modules/workers/worker.routes');

// Create Express application instance
const app = express();

// Security & parsing
// Apply middleware in a clear order:
// 1) Security headers (helmet)
// 2) CORS policy (configured in `config/cors.js`)
// 3) Request logging (morgan)
// 4) JSON body parsing with a modest size limit
// 5) Cookie parsing
// 6) Internationalization middleware that sets `req.locale`
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(i18n);

const authenticate = require('./middleware/auth');

// Serve user-uploaded files at the `/uploads` path.
// Files are stored under `server/src/uploads/*` by the upload handlers.
// Split per subdirectory so sensitive files require authentication.

// Profile photos — public (displayed on service pages, profiles, messages)
app.use('/uploads/profile-photos', express.static(path.resolve(__dirname, 'uploads/profile-photos')));

// Verification docs — authenticated (government IDs, personal documents)
app.use('/uploads/verification-docs', authenticate, express.static(path.resolve(__dirname, 'uploads/verification-docs')));

// Booking photos — authenticated (private booking evidence)
app.use('/uploads/booking-photos', authenticate, express.static(path.resolve(__dirname, 'uploads/booking-photos')));

// Health check
// Simple healthcheck used by monitoring or manual smoke tests.
app.get('/health', (req, res) => {
  res.json({ status: 'ok', locale: req.locale });
});

// API routes
// Mount modularized route handlers under `/api/*`.
// Each route module keeps its own validation and controller logic.
app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes); // Mount booking routes at /api/bookings
app.use('/api/customers', customerRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);

// 404 and error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server only if run directly
// When this file is run directly (node src/index.js), start the HTTP server.
// When required (e.g., in tests), we only export the `app` instance so tests can
// mount it on an in-memory server or a test runner.
if (require.main === module) {
  // Create a raw HTTP server so we can attach Socket.IO to the same server.
  const http = require('http');
  const server = http.createServer(app);

  // Initialize Socket.IO (optional - only when running the server directly)
  try {
    const { init } = require('./socket');
    init(server);
    console.log('Socket.IO initialized');
  } catch (_err) {
    console.warn('Socket.IO not initialized:', _err.message);
  }

  server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log(`CORS origin: ${CORS_ORIGIN}`);
  });

  // Graceful shutdown — close HTTP server, disconnect Prisma, close Socket.IO
  const prisma = require('./config/prisma');
  const shutdown = async (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      try {
        await prisma.$disconnect();
        console.log('Prisma disconnected');
      } catch (err) {
        console.error('Error disconnecting Prisma:', err.message);
      }
      process.exit(0);
    });
    // Force exit after 10s if graceful shutdown hangs
    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

module.exports = app;