const express = require('express');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const { PORT, CORS_ORIGIN } = require('./config/env');
const { corsOptions } = require('./config/cors');
const i18n = require('./config/i18n');
const notFoundHandler = require('./middleware/notFoundHandler');
const errorHandler = require('./middleware/errorHandler');
const workerRoutes = require('./modules/workers/worker.routes');
const serviceRoutes = require('./modules/services/service.routes');
const customerRoutes = require('./modules/customers/customer.routes');
const uploadRoutes = require('./modules/uploads/upload.routes');
const availabilityRoutes = require('./modules/availability/availability.routes');
const reviewRoutes = require('./modules/reviews/review.routes');
const verificationRoutes = require('./modules/verification/verification.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const paymentRoutes = require('./modules/payments/payment.routes');
const safetyRoutes = require('./modules/safety/safety.routes');

// Routes
const authRoutes = require('./modules/auth/auth.routes');
const bookingRoutes = require('./modules/bookings/booking.routes');

const app = express();

// Security & parsing
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

// Static uploads - Make sure we serve from the correct absolute path
// We use path.resolve to match the actual location of uploads seen in directory listing (src/uploads)
app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', locale: req.locale });
});

// API routes
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

// 404 and error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server only if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log(`CORS origin: ${CORS_ORIGIN}`);
  });
}

module.exports = app;