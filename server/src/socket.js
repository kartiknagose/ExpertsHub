// server/src/socket.js
// Simple Socket.IO initializer and accessor for the app.
// Usage:
//  const { init } = require('./socket');
//  const io = init(httpServer);
//  // In controllers: const { getIo } = require('./socket'); getIo().emit(...)

const { CORS_ORIGIN } = require('./config/env');
const { verifyJwt } = require('./common/utils/jwt');
let ioInstance = null;

function init(server) {
  // Lazy-require to avoid adding heavy deps when not needed in tests
  const { Server } = require('socket.io');
  const isDev = process.env.NODE_ENV !== 'production';

  // Allow `CORS_ORIGIN` to be a single origin or a comma-separated list
  // (eg. "http://localhost:5173,http://localhost:5174"). Socket.IO accepts
  // either a string or an array for the `origin` option; normalize here.
  const originValue = CORS_ORIGIN || '*';
  const origin = typeof originValue === 'string' && originValue.includes(',')
    ? originValue.split(',').map(s => s.trim())
    : originValue;

  ioInstance = new Server(server, {
    cors: {
      origin,
      credentials: true,
    },
    // In development, accept all origins to prevent browser WS 400s caused
    // by mismatched `Origin` values across Vite ports.
    allowRequest: isDev ? (_req, callback) => callback(null, true) : undefined,
  });

  // ─── SECURITY: Authenticate ALL socket connections ───
  // Parse the JWT from the cookie header. If the token is missing or invalid,
  // REJECT the connection entirely. This prevents unauthenticated users from
  // eavesdropping on any real-time events (SOS alerts, bookings, admin data).
  ioInstance.use((socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers?.cookie || '';
      const match = cookieHeader.match(/(?:^|; )token=([^;]+)/);
      const token = match ? decodeURIComponent(match[1]) : null;

      if (!token) {
        return next(new Error('Authentication required — no token provided.'));
      }

      const payload = verifyJwt(token);
      if (!payload || !payload.id) {
        return next(new Error('Authentication required — invalid or expired token.'));
      }

      socket.user = payload; // { id, role }
      return next();
    } catch (_err) {
      return next(new Error('Authentication failed.'));
    }
  });

  ioInstance.on('connection', (socket) => {
    console.log('Socket connected:', socket.id, 'userId=', socket.user.id, 'role=', socket.user.role);

    // ─── Auto-join user-specific rooms based on verified identity ───
    socket.join(`user:${socket.user.id}`);
    if (socket.user.role === 'WORKER') socket.join(`worker:${socket.user.id}`);
    if (socket.user.role === 'CUSTOMER') socket.join(`customer:${socket.user.id}`);
    if (socket.user.role === 'ADMIN') socket.join('admin');

    // ─── SECURITY: Validate room join requests ───
    // Users can only join rooms they are authorized for:
    //   - Their own user/worker/customer room (already auto-joined above)
    //   - 'admin' room only if role is ADMIN
    //   - 'booking:X' rooms (for live booking updates) — allowed for any authenticated user
    // All other room join attempts are silently rejected.
    socket.on('joinRoom', (room) => {
      if (typeof room !== 'string' || room.length === 0 || room.length > 100) return;

      // Allow booking-specific rooms (e.g. "booking:42") for live tracking
      if (room.startsWith('booking:')) {
        socket.join(room);
        return;
      }

      // Allow conversation rooms (e.g. "conversation:7") for live chat
      if (room.startsWith('conversation:')) {
        socket.join(room);
        return;
      }

      // Allow worker_tracking rooms (e.g. "worker_tracking:5") for customers
      // to receive real-time worker location updates during active bookings
      if (room.startsWith('worker_tracking:')) {
        socket.join(room);
        return;
      }

      // Block all other room joins — users already have their role rooms
      // This prevents non-admins from joining 'admin', and users from
      // joining other users' private rooms.
      console.warn(`Socket ${socket.id} (user:${socket.user.id}) denied join to room: ${room}`);
    });

    socket.on('disconnect', () => {
      // noop for now
    });
  });

  return ioInstance;
}

function getIo() {
  if (!ioInstance) throw new Error('Socket.IO not initialized. Call init(server) first.');
  return ioInstance;
}

module.exports = { init, getIo };
