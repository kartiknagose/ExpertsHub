/**
 * REVIEW SERVICE - TWO-WAY REVIEW SYSTEM
 * 
 * Supports both Customer → Worker AND Worker → Customer reviews.
 * Each user involved in a booking can leave exactly one review.
 */

const prisma = require('../../config/prisma');

/**
 * CREATE A REVIEW (Two-Way)
 * 
 * @param {number} userId - The logged-in user's ID
 * @param {string} userRole - The logged-in user's role (CUSTOMER or WORKER)
 * @param {object} data - { bookingId, rating, comment }
 */
async function createReview(userId, userRole, data) {
  const { bookingId, rating, comment } = data;

  // 1. Fetch booking with worker profile info
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      workerProfile: { select: { id: true, userId: true } },
    },
  });

  if (!booking) {
    throw new Error('Booking not found.');
  }

  if (booking.status !== 'COMPLETED') {
    throw new Error('You can only review completed bookings.');
  }

  // 2. Determine reviewer and reviewee
  let reviewerId;
  let revieweeId;

  if (userRole === 'CUSTOMER' && booking.customerId === userId) {
    // Customer reviewing the worker
    reviewerId = userId;
    revieweeId = booking.workerProfile?.userId;
    if (!revieweeId) {
      throw new Error('Worker profile not found for this booking.');
    }
  } else if (userRole === 'WORKER') {
    // Worker reviewing the customer
    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId },
    });
    if (!workerProfile || booking.workerProfileId !== workerProfile.id) {
      throw new Error('You are not assigned to this booking.');
    }
    reviewerId = userId;
    revieweeId = booking.customerId;
  } else {
    throw new Error('You are not involved in this booking.');
  }

  // 3. Check if this user already reviewed this booking
  const existingReview = await prisma.review.findUnique({
    where: {
      bookingId_reviewerId: {
        bookingId,
        reviewerId,
      },
    },
  });

  if (existingReview) {
    throw new Error('You have already reviewed this booking.');
  }

  // 4. Create the review
  const review = await prisma.review.create({
    data: {
      bookingId,
      reviewerId,
      revieweeId,
      rating,
      comment,
    },
    include: {
      booking: {
        include: { service: { select: { id: true, name: true, category: true } } },
      },
      reviewer: { select: { id: true, name: true, email: true } },
      reviewee: { select: { id: true, name: true, email: true } },
    },
  });

  // 5. Update aggregate rating for the reviewee (can be Customer or Worker)
  const aggregate = await prisma.review.aggregate({
    where: { revieweeId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.user.update({
    where: { id: revieweeId },
    data: {
      rating: aggregate._avg.rating || 0,
      totalReviews: aggregate._count.rating || 0,
    },
  });

  // 6. If reviewee is a worker, also sync to WorkerProfile for legacy compatibility/charts
  const revieweeWorkerProfile = await prisma.workerProfile.findUnique({
    where: { userId: revieweeId },
  });

  if (revieweeWorkerProfile) {
    await prisma.workerProfile.update({
      where: { userId: revieweeId },
      data: {
        rating: aggregate._avg.rating || 0,
        totalReviews: aggregate._count.rating || 0,
      },
    });
  }

  return review;
}

/**
 * GET REVIEWS WRITTEN BY A USER (My Reviews)
 * Shows reviews the logged-in user has written
 */
async function getMyReviews(userId) {
  return prisma.review.findMany({
    where: { reviewerId: userId },
    include: {
      booking: {
        include: { service: { select: { id: true, name: true, category: true } } },
      },
      reviewee: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * GET REVIEWS ABOUT A USER (Reviews Received)
 * Shows reviews others have written about the logged-in user
 */
async function getReviewsAboutMe(userId) {
  return prisma.review.findMany({
    where: { revieweeId: userId },
    include: {
      booking: {
        include: { service: { select: { id: true, name: true, category: true } } },
      },
      reviewer: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * GET BOOKINGS PENDING REVIEW
 * Returns completed bookings where the user has NOT yet left a review
 */
async function getPendingReviews(userId, userRole) {
  let whereClause = { status: 'COMPLETED' };

  if (userRole === 'CUSTOMER') {
    whereClause.customerId = userId;
  } else if (userRole === 'WORKER') {
    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId },
    });
    if (!workerProfile) return [];
    whereClause.workerProfileId = workerProfile.id;
  }

  const completedBookings = await prisma.booking.findMany({
    where: whereClause,
    include: {
      service: { select: { id: true, name: true, category: true } },
      workerProfile: {
        select: {
          id: true,
          userId: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
      customer: { select: { id: true, name: true, email: true } },
      reviews: {
        select: { reviewerId: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  // Filter out bookings where this user already left a review
  return completedBookings.filter(
    (booking) => !booking.reviews.some((r) => r.reviewerId === userId)
  );
}

module.exports = {
  createReview,
  getMyReviews,
  getReviewsAboutMe,
  getPendingReviews,
};
