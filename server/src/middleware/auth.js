// Authentication middleware — Clerk edition
// Verifies a Clerk session token (from Authorization header or Clerk cookie)
// as the primary strategy, with fallback to the legacy HTTP-only JWT cookie
// during the transition period. Once all clients use Clerk, the legacy path
// can be removed.
//
// Attaches `req.user = { id, role, clerkId }` so all downstream controllers
// continue to work without changes.
const { clerkMiddleware, requireAuth } = require('@clerk/express');
const { verifyJwt } = require('../common/utils/jwt');

/**
 * requireClerkSession — verifies a Clerk session is present and valid but does
 * NOT require the user to have a DB record. Use this for routes like /sync that
 * are called BEFORE the DB user is created.
 */
const requireClerkSession = [
  clerkMiddleware(),
  requireAuth(),
];

/**
 * requireClerkAuth — standalone array middleware for routes that MUST use Clerk.
 * Includes clerkMiddleware() to populate req.auth before requireAuth() validates it.
 * Also resolves the DB user and attaches it to req.user.
 * Exported as a named export so specific routes can opt in.
 */
const requireClerkAuth = [
  clerkMiddleware(),
  requireAuth(),
  async (req, res, next) => {
    try {
      const prisma = require('../config/prisma');
      const { userId: clerkId } = req.auth;

      if (!clerkId) {
        return res.status(401).json({ error: 'Authentication required', statusCode: 401 });
      }

      const user = await prisma.user.findUnique({ where: { clerkId } });

      if (!user) {
        return res.status(401).json({
          error: 'User profile not found. Please complete onboarding.',
          code: 'ONBOARDING_REQUIRED',
          statusCode: 401,
        });
      }

      if (!user.isActive) {
        return res.status(403).json({ error: 'Account suspended. Please contact support.', statusCode: 403 });
      }

      req.user = { id: user.id, role: user.role, clerkId };
      return next();
    } catch (err) {
      return next(err);
    }
  },
];

/**
 * Default export — dual-mode auth middleware (array).
 *
 * 1. Clerk session (Authorization: Bearer or Clerk cookie) — primary path.
 * 2. Legacy HTTP-only JWT cookie — backward-compat path for existing sessions.
 *
 * Express accepts arrays in route definitions so callers using:
 *   `router.get('/me', auth, handler)`
 * continue to work unchanged.
 */
const auth = [
  clerkMiddleware(),
  async (req, res, next) => {
    // ── Primary: Clerk session ──
    if (req.auth?.userId) {
      try {
        const prisma = require('../config/prisma');
        const user = await prisma.user.findUnique({ where: { clerkId: req.auth.userId } });

        if (user) {
          if (!user.isActive) {
            return res.status(403).json({ error: 'Account suspended. Please contact support.', statusCode: 403 });
          }
          req.user = { id: user.id, role: user.role, clerkId: req.auth.userId };
          return next();
        }

        // Signed in with Clerk but no DB profile yet → onboarding required
        return res.status(401).json({
          error: 'User profile not found. Please complete onboarding.',
          code: 'ONBOARDING_REQUIRED',
          statusCode: 401,
        });
      } catch (err) {
        return next(err);
      }
    }

    // ── Fallback: legacy JWT cookie ──
    const token = req.cookies?.token;
    if (token) {
      const payload = verifyJwt(token);
      if (payload) {
        req.user = payload;
        return next();
      }
    }

    return res.status(401).json({ error: 'Authentication required', statusCode: 401 });
  },
];

module.exports = auth;
module.exports.requireClerkAuth = requireClerkAuth;
module.exports.requireClerkSession = requireClerkSession;