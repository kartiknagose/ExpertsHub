/**
 * BOOKING SERVICE - BUSINESS LOGIC LAYER
 * 
 * What is a "service" file?
 * This file contains the CORE BUSINESS LOGIC for bookings.
 * It talks directly to the database using Prisma ORM.
 * 
 * Think of it like a manager in a company:
 * - Controller (boss) tells the Service (manager) what to do
 * - Service (manager) does the actual work with the database (employees)
 * - Service returns results back to Controller
 * 
 * Why separate service from controller?
 * - Cleaner code organization
 * - Easier to test business logic
 * - Can reuse service functions in multiple places
 */

const prisma = require('../../config/prisma'); // Our database connection

/**
 * CREATE A NEW BOOKING
 * 
 * Business Logic Flow:
 * 1. Check if the worker exists (can't book a non-existent worker)
 * 2. Check if the service exists (can't book a non-existent service)
 * 3. Check if the worker actually offers that service (plumber can't do electrical work)
 * 4. Create the booking in the database
 * 5. Return the new booking details
 * 
 * @param {number} customerId - The ID of the customer making the booking (from JWT token)
 * @param {object} bookingData - The booking details (workerId, serviceId, date, address, etc.)
 * @returns {Promise<object>} - The newly created booking
 * @throws {Error} - If validation fails (worker not found, service not offered, etc.)
 */
async function createBooking(customerId, bookingData) {
  const { workerProfileId, serviceId, scheduledDate, addressDetails, estimatedPrice, notes } = bookingData;

  // VALIDATE: Scheduled date must be in the future (at least 1 hour from now)
  const scheduledDateObj = new Date(scheduledDate);
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  if (scheduledDateObj <= now) {
    throw new Error('Booking date must be in the future.');
  }

  if (scheduledDateObj < oneHourLater) {
    throw new Error('Bookings must be scheduled at least 1 hour in advance.');
  }

  // VALIDATE: Customer cannot book themselves as a worker (implicit check - they shouldn't be a worker)
  const customer = await prisma.user.findUnique({ where: { id: customerId } });
  if (customer.role === 'WORKER') {
    throw new Error('Workers cannot book services (use customer account instead).');
  }

  // VALIDATE: Verify the worker exists and has a worker profile
  const workerProfile = await prisma.workerProfile.findUnique({
    where: { id: workerProfileId },
  });

  if (!workerProfile) {
    throw new Error('Worker not found. Please select a valid worker.');
  }

  // VALIDATE: Verify the service exists
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service) {
    throw new Error('Service not found. Please select a valid service.');
  }

  // VALIDATE: Verify the worker actually offers this service
  const workerOffersService = await prisma.workerService.findUnique({
    where: {
      workerId_serviceId: {
        workerId: workerProfileId,
        serviceId: serviceId,
      },
    },
  });

  if (!workerOffersService) {
    throw new Error('This worker does not offer the selected service. Please choose another worker or service.');
  }

  // VALIDATE: Address must be at least 10 characters
  if (!addressDetails || addressDetails.length < 10) {
    throw new Error('Address must be at least 10 characters long.');
  }

  // VALIDATE: Price must be positive (if provided)
  if (estimatedPrice !== undefined && (isNaN(estimatedPrice) || estimatedPrice < 0)) {
    throw new Error('Estimated price must be a positive number.');
  }

  // VALIDATE: Price cannot exceed reasonable limit (e.g., $100,000)
  if (estimatedPrice !== undefined && estimatedPrice > 100000) {
    throw new Error('Estimated price seems too high. Please check and try again.');
  }

  // Create booking with transaction to ensure atomicity
  const newBooking = await prisma.booking.create({
    data: {
      customerId: customerId,
      workerProfileId: workerProfileId,
      serviceId: serviceId,
      scheduledAt: scheduledDateObj,
      address: addressDetails,
      totalPrice: estimatedPrice,
      notes: notes,
      status: 'PENDING',
    },
    include: {
      service: {
        select: { id: true, name: true, category: true },
      },
      reviews: true,
      workerProfile: {
        select: {
          id: true,
          userId: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
      customer: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return newBooking;
}

/**
 * GET ALL BOOKINGS FOR A USER
 * 
 * Business Logic:
 * - If user is a CUSTOMER, show bookings they created
 * - If user is a WORKER, show bookings assigned to them
 * - If user is an ADMIN, show all bookings
 * 
 * Why filter by role?
 * - Customers shouldn't see other customers' bookings (privacy)
 * - Workers only need to see their own jobs
 * - Admins need full visibility for management
 * 
 * @param {number} userId - The ID of the user requesting bookings
 * @param {string} role - The user's role (CUSTOMER, WORKER, or ADMIN)
 * @returns {Promise<array>} - List of bookings for this user
 */
async function getBookingsByUser(userId, role) {
  let whereClause = {};

  if (role === 'CUSTOMER') {
    whereClause = { customerId: userId };
  } else if (role === 'WORKER') {
    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId },
    });
    if (workerProfile) {
      whereClause = { workerProfileId: workerProfile.id };
    } else {
      whereClause = { workerProfileId: -1 };
    }
  }

  const bookings = await prisma.booking.findMany({
    where: whereClause,
    include: {
      service: {
        select: { id: true, name: true, category: true },
      },
      reviews: {
        select: { id: true, reviewerId: true, rating: true },
      },
      workerProfile: {
        select: {
          id: true,
          userId: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
      customer: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return bookings;
}

/**
 * GET A SINGLE BOOKING BY ID
 * 
 * Business Logic:
 * - Anyone can view a booking IF they're involved in it
 * - Customers can view their own bookings
 * - Workers can view bookings assigned to them
 * - Admins can view any booking
 * 
 * @param {number} bookingId - The ID of the booking to retrieve
 * @param {number} userId - The ID of the user requesting the booking
 * @param {string} role - The user's role
 * @returns {Promise<object>} - The booking details
 * @throws {Error} - If booking not found or user doesn't have permission
 */
async function getBookingById(bookingId, userId, role) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: {
        select: { id: true, name: true, category: true, basePrice: true },
      },
      reviews: true,
      workerProfile: {
        select: { id: true, userId: true },
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      customer: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!booking) {
    throw new Error('Booking not found.');
  }

  const isCustomer = booking.customerId === userId;
  let isWorker = false;
  if (role === 'WORKER') {
    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId },
    });
    isWorker = workerProfile && booking.workerProfileId === workerProfile.id;
  }
  const isAdmin = role === 'ADMIN';

  if (!isCustomer && !isWorker && !isAdmin) {
    throw new Error('You do not have permission to view this booking.');
  }

  return booking;
}

/**
 * UPDATE BOOKING STATUS
 * 
 * Business Logic:
 * - Only the WORKER assigned to the booking can change its status
 * - Admins can also change status (for management purposes)
 * - Customers cannot change status (they can only cancel)
 * 
 * Status Flow:
 * PENDING → CONFIRMED → IN_PROGRESS → COMPLETED
 *    ↓
 * CANCELLED (can happen at any stage)
 * 
 * @param {number} bookingId - The ID of the booking to update
 * @param {string} newStatus - The new status (CONFIRMED, IN_PROGRESS, COMPLETED, etc.)
 * @param {number} userId - The ID of the user making the request
 * @param {string} role - The user's role
 * @returns {Promise<object>} - The updated booking
 * @throws {Error} - If booking not found or user doesn't have permission
 */
async function updateBookingStatus(bookingId, newStatus, userId, role) {
  // Fetch booking with transaction for atomicity
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new Error('Booking not found.');
  }

  let isWorker = false;
  if (role === 'WORKER') {
    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId },
    });
    isWorker = workerProfile && booking.workerProfileId === workerProfile.id;
  }
  const isAdmin = role === 'ADMIN';

  if (!isWorker && !isAdmin) {
    throw new Error('Only the assigned worker or admin can update booking status.');
  }

  // Use transaction to prevent race conditions where two workers update simultaneously
  const updatedBooking = await prisma.$transaction(async (tx) => {
    // Re-fetch within transaction to get fresh data
    const currentBooking = await tx.booking.findUnique({
      where: { id: bookingId },
    });

    // Validate status transition
    const validTransitions = {
      'PENDING': ['CONFIRMED', 'CANCELLED'],
      'CONFIRMED': ['IN_PROGRESS', 'CANCELLED'],
      'IN_PROGRESS': ['COMPLETED', 'CANCELLED'],
      'COMPLETED': [],
      'CANCELLED': [],
    };

    if (!validTransitions[currentBooking.status].includes(newStatus)) {
      throw new Error(`Cannot transition from ${currentBooking.status} to ${newStatus}`);
    }

    // Update the booking
    return await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: newStatus,
        updatedAt: new Date(),
      },
      include: {
        service: { select: { id: true, name: true, category: true } },
        reviews: true,
        workerProfile: {
          select: {
            id: true,
            userId: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
        customer: { select: { id: true, name: true, email: true } },
      },
    });
  });

  return updatedBooking;
}

/**
 * CANCEL A BOOKING
 * 
 * Business Logic:
 * - Customers can cancel their own bookings
 * - Workers can cancel bookings assigned to them
 * - Admins can cancel any booking
 * - Cancellation reason is optional but recommended for transparency
 * 
 * @param {number} bookingId - The ID of the booking to cancel
 * @param {number} userId - The ID of the user cancelling
 * @param {string} role - The user's role
 * @param {string} cancellationReason - Why the booking is being cancelled (optional)
 * @returns {Promise<object>} - The cancelled booking
 * @throws {Error} - If booking not found or user doesn't have permission
 */
async function cancelBooking(bookingId, userId, role, cancellationReason) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new Error('Booking not found.');
  }

  if (booking.status === 'CANCELLED') {
    throw new Error('This booking is already cancelled.');
  }

  if (booking.status === 'COMPLETED') {
    throw new Error('Cannot cancel a completed booking.');
  }

  const isCustomer = booking.customerId === userId;
  let isWorker = false;
  if (role === 'WORKER') {
    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId },
    });
    isWorker = workerProfile && booking.workerProfileId === workerProfile.id;
  }
  const isAdmin = role === 'ADMIN';

  if (!isCustomer && !isWorker && !isAdmin) {
    throw new Error('You do not have permission to cancel this booking.');
  }

  const cancelledBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'CANCELLED',
      cancellationReason: cancellationReason || 'No reason provided',
      updatedAt: new Date(),
    },
    include: {
      service: { select: { id: true, name: true, category: true } },
      reviews: true,
      workerProfile: {
        select: {
          id: true,
          userId: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
      customer: { select: { id: true, name: true, email: true } },
    },
  });

  return cancelledBooking;
}

/**
 * PAY FOR A BOOKING
 *
 * Business Logic:
 * - Only the booking customer can pay
 * - Cannot pay cancelled booking
 * - Marks paymentStatus as PAID and sets paidAt
 */
async function payBooking(bookingId, userId, userRole, paymentReference) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { customer: { select: { id: true } } },
  });

  if (!booking) {
    throw new Error('Booking not found.');
  }

  if (userRole !== 'CUSTOMER' || booking.customerId !== userId) {
    throw new Error('Only the booking customer can pay for this booking.');
  }

  if (booking.status === 'CANCELLED') {
    throw new Error('Cannot pay for a cancelled booking.');
  }

  if (booking.paymentStatus === 'PAID') {
    throw new Error('Booking is already paid.');
  }

  const reference = paymentReference || `manual-${Date.now()}`;

  return prisma.$transaction(async (tx) => {
    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'PAID',
        paymentReference: reference,
        paidAt: new Date(),
      },
      include: {
        service: { select: { id: true, name: true, category: true } },
        workerProfile: { select: { id: true, userId: true, user: { select: { id: true, name: true } } } },
        customer: { select: { id: true, name: true, email: true } },
      },
    });

    await tx.payment.create({
      data: {
        bookingId: bookingId,
        customerId: userId,
        amount: updated.totalPrice || null,
        status: 'PAID',
        reference,
      },
    });

    return updated;
  });
}

// Export all service functions so controllers can use them
module.exports = {
  createBooking,
  getBookingsByUser,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  payBooking,
};
