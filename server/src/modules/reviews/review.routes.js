/**
 * REVIEW ROUTES - TWO-WAY REVIEW SYSTEM
 * 
 * Both customers and workers can:
 * - Create reviews for completed bookings
 * - View reviews they've written
 * - View reviews about them
 * - See which bookings are pending review
 */

const { Router } = require('express');
const auth = require('../../middleware/auth');
const validate = require('../../middleware/validation');
const { createReviewSchema } = require('./review.schemas');
const {
    create,
    listMyReviews,
    listReviewsAboutMe,
    listPendingReviews,
} = require('./review.controller');

const router = Router();

// Create a review (both CUSTOMER and WORKER can review)
router.post('/', auth, createReviewSchema, validate, create);

// Get reviews I've written
router.get('/written', auth, listMyReviews);

// Get reviews about me (received)
router.get('/received', auth, listReviewsAboutMe);

// Get bookings pending my review
router.get('/pending', auth, listPendingReviews);

// Legacy endpoints (backward compatibility)
router.get('/customer', auth, listMyReviews);
router.get('/worker', auth, listReviewsAboutMe);

module.exports = router;
