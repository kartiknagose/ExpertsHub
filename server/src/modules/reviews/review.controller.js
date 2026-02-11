/**
 * REVIEW CONTROLLER - TWO-WAY REVIEW SYSTEM
 * 
 * Handles HTTP requests for the review system.
 * Both customers and workers can create and view reviews.
 */

const asyncHandler = require('../../common/utils/asyncHandler');
const {
  createReview,
  getMyReviews,
  getReviewsAboutMe,
  getPendingReviews,
} = require('./review.service');

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
});

/**
 * GET REVIEWS I WROTE
 * GET /api/reviews/written
 * Returns all reviews the logged-in user has written
 */
exports.listMyReviews = asyncHandler(async (req, res) => {
  const reviews = await getMyReviews(req.user.id);
  res.json({ reviews });
});

/**
 * GET REVIEWS ABOUT ME
 * GET /api/reviews/received
 * Returns all reviews others have written about the logged-in user
 */
exports.listReviewsAboutMe = asyncHandler(async (req, res) => {
  const reviews = await getReviewsAboutMe(req.user.id);
  res.json({ reviews });
});

/**
 * GET BOOKINGS PENDING REVIEW
 * GET /api/reviews/pending
 * Returns completed bookings where user hasn't left a review yet
 */
exports.listPendingReviews = asyncHandler(async (req, res) => {
  const bookings = await getPendingReviews(req.user.id, req.user.role);
  res.json({ bookings });
});
