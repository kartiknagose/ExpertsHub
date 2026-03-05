/**
 * REVIEW CONTROLLER - TWO-WAY REVIEW SYSTEM
 * 
 * Handles HTTP requests for the review system.
 * Both customers and workers can create and view reviews.
 */

const asyncHandler = require('../../common/utils/asyncHandler');
const parsePagination = require('../../common/utils/parsePagination');
const {
  createReview,
  getMyReviews,
  getReviewsAboutMe,
  getPendingReviews,
} = require('./review.service');

let getIo;
try {
  ({ getIo } = require('../../socket'));
} catch (_e) {
  getIo = null;
}

function emitReviewEvent(eventName, review) {
  if (!getIo || !review) return;

  try {
    const io = getIo();
    // Notify admins
    io.to('admin').emit(eventName, review);

    // Notify the person who was reviewed (reviewee)
    const revieweeId = review.revieweeId;
    if (revieweeId) {
      io.to(`user:${revieweeId}`).emit('review:received', review);
    }
  } catch (err) {
    console.warn(`Socket emit failed (${eventName}):`, err.message);
  }
}

/**
 * CREATE A REVIEW
 * POST /api/reviews
 * Both CUSTOMER and WORKER can create reviews
 */
exports.create = asyncHandler(async (req, res) => {
  const review = await createReview(req.user.id, req.user.role, req.body);
  res.status(201).json({
    message: 'Review submitted successfully.',
    review,
  });

  emitReviewEvent('review:created', review);
});

/**
 * GET REVIEWS I WROTE
 * GET /api/reviews/written
 * Returns all reviews the logged-in user has written
 */
exports.listMyReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { data: reviews, total } = await getMyReviews(req.user.id, { skip, limit });
  res.json({ reviews, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

/**
 * GET REVIEWS ABOUT ME
 * GET /api/reviews/received
 * Returns all reviews others have written about the logged-in user
 */
exports.listReviewsAboutMe = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { data: reviews, total } = await getReviewsAboutMe(req.user.id, { skip, limit });
  res.json({ reviews, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

/**
 * GET BOOKINGS PENDING REVIEW
 * GET /api/reviews/pending
 * Returns completed bookings where user hasn't left a review yet
 */
exports.listPendingReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { data: bookings, total } = await getPendingReviews(req.user.id, req.user.role, { skip, limit });
  res.json({ bookings, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});
