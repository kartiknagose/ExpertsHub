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
const { randomInt } = require('crypto');
const AppError = require('../../common/errors/AppError');

// Helper to generate 4-digit OTP (1000–9999)
// Uses crypto.randomInt() — cryptographically secure, unlike Math.random().
const generateOTP = () => randomInt(1000, 10000).toString();

/**
 * Fetch worker profile by userId. Throws AppError if not found.
 * @param {number} userId
 * @param {string} [errorMessage='Worker profile not found.']
 * @param {number} [statusCode=404]
 * @param {object} [include] - Optional Prisma include clause
 * @returns {Promise<object>} workerProfile
 */
async function requireWorkerProfile(userId, errorMessage = 'Worker profile not found.', statusCode = 404, include) {
  const profile = await prisma.workerProfile.findUnique({
    where: { userId },
    ...(include && { include }),
  });
  if (!profile) throw new AppError(statusCode, errorMessage);
  return profile;
}

/**
 * Check if a userId is the assigned worker for a booking.
 * Returns true/false without throwing.
 */
async function isWorkerForBooking(userId, booking) {
  const profile = await prisma.workerProfile.findUnique({ where: { userId } });
  return !!(profile && booking.workerProfileId === profile.id);
}


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
// HELPER: Check if worker is available for a given time slot.
// Uses estimatedDuration (minutes) from existing bookings and the new booking
// to detect true overlaps instead of a hardcoded 2-hour window.
// Accepts optional `client` param to run inside a transaction (defaults to global prisma).
const DEFAULT_DURATION_MINUTES = 120; // Fallback when estimatedDuration is not set

async function isWorkerAvailable(workerId, date, client = prisma, durationMinutes = DEFAULT_DURATION_MINUTES) {
  const newStart = new Date(date);
  const newEnd = new Date(newStart.getTime() + durationMinutes * 60 * 1000);

  // 1. Check PENDING / CONFIRMED bookings — standard overlap on scheduledAt
  const pendingConfirmed = await client.booking.findMany({
    where: {
      workerProfileId: workerId,
      status: { in: ['PENDING', 'CONFIRMED'] },
      scheduledAt: {
        gte: new Date(newStart.getTime() - 480 * 60 * 1000),
        lt: new Date(newEnd.getTime() + 480 * 60 * 1000),
      },
    },
    select: { scheduledAt: true, estimatedDuration: true },
  });

  const hasPendingConflict = pendingConfirmed.some((b) => {
    const existStart = new Date(b.scheduledAt);
    const existDur = b.estimatedDuration || DEFAULT_DURATION_MINUTES;
    const existEnd = new Date(existStart.getTime() + existDur * 60 * 1000);
    return existStart < newEnd && existEnd > newStart;
  });

  if (hasPendingConflict) return false;

  // 2. Session-aware check for IN_PROGRESS bookings.
  //    Worker is only blocked if:
  //    a) There is a currently-active session (isActive=true), OR
  //    b) There is a scheduled (future) session whose date overlaps the requested slot
  const inProgressBookings = await client.booking.findMany({
    where: {
      workerProfileId: workerId,
      status: 'IN_PROGRESS',
    },
    select: {
      id: true,
      scheduledAt: true,
      estimatedDuration: true,
      sessions: {
        select: { sessionDate: true, isActive: true, endTime: true },
      },
    },
  });

  for (const booking of inProgressBookings) {
    // If booking has no sessions, fall back to original overlap on scheduledAt
    if (!booking.sessions || booking.sessions.length === 0) {
      const existStart = new Date(booking.scheduledAt);
      const existDur = booking.estimatedDuration || DEFAULT_DURATION_MINUTES;
      const existEnd = new Date(existStart.getTime() + existDur * 60 * 1000);
      if (existStart < newEnd && existEnd > newStart) return false;
      continue;
    }

    for (const session of booking.sessions) {
      // Active session = worker is on-site right now → block
      if (session.isActive) return false;

      // Scheduled future session (not yet ended) — check overlap
      if (!session.endTime) {
        const sessStart = new Date(session.sessionDate);
        const sessDur = booking.estimatedDuration || DEFAULT_DURATION_MINUTES;
        const sessEnd = new Date(sessStart.getTime() + sessDur * 60 * 1000);
        if (sessStart < newEnd && sessEnd > newStart) return false;
      }
    }
  }

  return true;
}

// HELPER: Check if address is in worker's service area
function isLocationMatch(workerServiceAreas, address) {
  if (!workerServiceAreas || !Array.isArray(workerServiceAreas) || workerServiceAreas.length === 0) return true;
  if (!address) return false;

  const normalizedAddress = address.toLowerCase();
  // Check if any defined service area is part of the address string
  return workerServiceAreas.some(area => normalizedAddress.includes(area.toLowerCase()));
}

async function createBooking(customerId, bookingData) {
  const { workerProfileId, serviceId, scheduledDate, addressDetails, latitude, longitude, estimatedPrice, notes, estimatedDuration } = bookingData;

  // LOGIC BRANCH: Is this a Direct Booking (worker selected) or Open Booking (no worker)?
  const isDirectBooking = !!workerProfileId;

  // VALIDATE: Scheduled date must be in the future (at least 1 hour from now)
  const scheduledDateObj = new Date(scheduledDate);
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  if (scheduledDateObj <= now) {
    throw new AppError(400, 'Booking date must be in the future.');
  }

  if (scheduledDateObj < oneHourLater) {
    throw new AppError(400, 'Bookings must be scheduled at least 1 hour in advance.');
  }

  // VALIDATE: Customer cannot book themselves as a worker (implicit check - they shouldn't be a worker)
  // Removed restriction: Workers can now book services too.
  /* if (customer.role === 'WORKER') {
    throw new Error('Workers cannot book services (use customer account instead).');
  } */

  // VALIDATE: Address must be valid
  if (!addressDetails || addressDetails.length < 5) {
    throw new AppError(400, 'Please provide a valid address or select one on the map.');
  }

  // VALIDATE: Price must be positive (if provided)
  if (estimatedPrice !== undefined && (isNaN(estimatedPrice) || estimatedPrice < 0)) {
    throw new AppError(400, 'Estimated price must be a positive number.');
  }

  // VALIDATE: Price cannot exceed reasonable limit (e.g., $100,000)
  if (estimatedPrice !== undefined && estimatedPrice > 100000) {
    throw new AppError(400, 'Estimated price seems too high. Please check and try again.');
  }

  // VALIDATE: Worker specific checks (ONLY IF WORKER IS SELECTED)
  // All DB reads + the booking create are wrapped in a transaction to prevent
  // race conditions (two customers booking the same worker/slot simultaneously).
  const newBooking = await prisma.$transaction(async (tx) => {
    if (isDirectBooking) {
      // Verify the worker exists and has a worker profile
      const workerProfile = await tx.workerProfile.findUnique({
        where: { id: workerProfileId },
      });

      if (!workerProfile) {
        throw new AppError(404, 'Worker not found. Please select a valid worker.');
      }

      // CHECK 1: LOCATION
      if (!isLocationMatch(workerProfile.serviceAreas, addressDetails)) {
        throw new AppError(400, `This worker only accepts jobs in: ${workerProfile.serviceAreas?.join(', ') || 'their local area'}. Address provided: ${addressDetails}`);
      }

      // CHECK 2: AVAILABILITY (uses tx to read within the same transaction)
      if (!(await isWorkerAvailable(workerProfileId, scheduledDateObj, tx, estimatedDuration || DEFAULT_DURATION_MINUTES))) {
        throw new AppError(409, 'Worker is already booked for this time slot. Please choose another time.');
      }
    }

    // VALIDATE: Verify the service exists
    const service = await tx.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new AppError(404, 'Service not found. Please select a valid service.');
    }

    // VALIDATE: Verify the worker actually offers this service (ONLY IF WORKER IS SELECTED)
    if (isDirectBooking) {
      const workerOffersService = await tx.workerService.findUnique({
        where: {
          workerId_serviceId: {
            workerId: workerProfileId,
            serviceId: serviceId,
          },
        },
      });

      if (!workerOffersService) {
        throw new AppError(400, 'This worker does not offer the selected service. Please choose another worker or service.');
      }
    }

    // Create the booking
    return await tx.booking.create({
      data: {
        customerId: customerId,
        workerProfileId: isDirectBooking ? workerProfileId : null,
        serviceId: serviceId,
        scheduledAt: scheduledDateObj,
        address: addressDetails,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        totalPrice: estimatedPrice,
        notes: notes,
        estimatedDuration: estimatedDuration || null,
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
            user: { select: { id: true, name: true, email: true, mobile: true, profilePhotoUrl: true, rating: true, totalReviews: true } },
          },
        },
        customer: {
          select: { id: true, name: true, email: true, mobile: true, profilePhotoUrl: true, rating: true, totalReviews: true },
        },
      },
    });
  });

  // 5. If it's an OPEN booking (no worker selected), broadcast to matching workers
  if (!isDirectBooking && latitude && longitude) {
    // INTEGRATED PHASE 2.3: Intelligent Live Matching
    // 1. Find workers who are ONLINE and near the job
    const workersWithLiveLocation = await prisma.workerLocation.findMany({
      where: {
        isOnline: true,
        workerProfile: {
          services: { some: { serviceId } }
        }
      },
      include: {
        workerProfile: {
          include: {
            user: { select: { id: true, name: true } }
          }
        }
      }
    });

    // 2. Identify and Score Eligible Workers
    const eligibleWorkers = workersWithLiveLocation.map(loc => {
      const distance = Math.sqrt(
        Math.pow((loc.latitude - latitude) * 111, 2) +
        Math.pow((loc.longitude - longitude) * 111, 2)
      );

      // Simple Scoring Algorithm
      // Base: Distance (max 50 points, 0 if distance > 10km)
      const distanceScore = Math.max(0, 50 - (distance * 5));
      // Multiplier: Trust/Verification (max 50 points)
      const trustScore = (loc.workerProfile.verificationScore || 0) / 2;
      const levelBonus = loc.workerProfile.verificationLevel === 'PREMIUM' ? 20 :
        loc.workerProfile.verificationLevel === 'VERIFIED' ? 10 : 0;

      const totalScore = distanceScore + trustScore + levelBonus;

      return {
        ...loc.workerProfile,
        distance,
        matchScore: totalScore
      };
    }).filter(w => w.distance <= (w.serviceRadius || 10))
      .sort((a, b) => b.matchScore - a.matchScore);

    // 3. Notify Online Pros via Socket.io
    // Workers with higher scores get notified first or more prominently
    try {
      const { getIo } = require('../../socket');
      const io = getIo();
      if (io) {
        eligibleWorkers.forEach((worker, _index) => {
          // In a high-traffic app, we might delay notification for lower scores
          // For now, we broadcast to all within radius, but could include the score
          io.to(`user:${worker.userId}`).emit('booking:available', {
            bookingId: newBooking.id,
            serviceName: newBooking.service.name,
            address: addressDetails,
            scheduledAt: scheduledDateObj,
            matchScore: Math.round(worker.matchScore),
            distance: worker.distance.toFixed(1)
          });
        });
      }
    } catch (err) {
      console.warn('Socket broadcast failed:', err.message);
    }
  }

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
async function getBookingsByUser(userId, role, { skip = 0, limit = 20 } = {}) {
  let whereClause = {};

  if (role === 'CUSTOMER') {
    whereClause = { customerId: userId };
  } else if (role === 'WORKER') {
    const workerProfile = await prisma.workerProfile.findUnique({ where: { userId } });
    whereClause = { workerProfileId: workerProfile ? workerProfile.id : -1 };
  }

  const [data, total] = await Promise.all([
    prisma.booking.findMany({
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
            user: { select: { id: true, name: true, email: true, mobile: true, profilePhotoUrl: true, rating: true, totalReviews: true } },
          },
        },
        customer: {
          select: { id: true, name: true, email: true, mobile: true, profilePhotoUrl: true, rating: true, totalReviews: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.booking.count({ where: whereClause }),
  ]);

  return { data, total };
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
        select: {
          id: true,
          userId: true,
          location: true,
          user: { select: { id: true, name: true, email: true, mobile: true, profilePhotoUrl: true, rating: true, totalReviews: true } }
        },
      },
      customer: {
        select: { id: true, name: true, email: true, mobile: true, profilePhotoUrl: true, rating: true, totalReviews: true },
      },
    },
  });

  if (!booking) {
    throw new AppError(404, 'Booking not found.');
  }

  const isCustomer = booking.customerId === userId;
  const isWorker = role === 'WORKER' ? await isWorkerForBooking(userId, booking) : false;
  const isAdmin = role === 'ADMIN';

  if (!isCustomer && !isWorker && !isAdmin) {
    throw new AppError(403, 'You do not have permission to view this booking.');
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
    throw new AppError(404, 'Booking not found.');
  }

  const isWorker = role === 'WORKER' ? await isWorkerForBooking(userId, booking) : false;
  const isAdmin = role === 'ADMIN';

  if (!isWorker && !isAdmin) {
    throw new AppError(403, 'Only the assigned worker or admin can update booking status.');
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
      throw new AppError(400, `Cannot transition from ${currentBooking.status} to ${newStatus}`);
    }

    // Update the booking
    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: newStatus,
        updatedAt: new Date(),
        // Generate Start OTP when confirmed
        ...(newStatus === 'CONFIRMED' && !currentBooking.startOtp && {
          startOtp: generateOTP(),
          otpGeneratedAt: new Date()
        }),
        // Generate Completion OTP when started (though workers usually use verifyBookingStart)
        ...(newStatus === 'IN_PROGRESS' && !currentBooking.completionOtp && {
          completionOtp: generateOTP(),
          otpGeneratedAt: new Date()
        })
      },
      include: {
        service: { select: { id: true, name: true, category: true } },
        reviews: true,
        workerProfile: {
          select: {
            id: true,
            userId: true,
            user: { select: { id: true, name: true, email: true, mobile: true, profilePhotoUrl: true, rating: true, totalReviews: true } },
          },
        },
        customer: { select: { id: true, name: true, email: true, mobile: true, profilePhotoUrl: true, rating: true, totalReviews: true } },
      },
    });

    // Record audit trail
    await recordStatusChange(bookingId, currentBooking.status, newStatus, userId, null, tx);

    return updated;
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
    throw new AppError(404, 'Booking not found.');
  }

  if (booking.status === 'CANCELLED') {
    throw new AppError(400, 'This booking is already cancelled.');
  }

  if (booking.status === 'COMPLETED') {
    throw new AppError(400, 'Cannot cancel a completed booking.');
  }

  const isCustomer = booking.customerId === userId;
  const isWorker = role === 'WORKER' ? await isWorkerForBooking(userId, booking) : false;
  const isAdmin = role === 'ADMIN';

  if (!isCustomer && !isWorker && !isAdmin) {
    throw new AppError(403, 'You do not have permission to cancel this booking.');
  }

  // Enforce cancellation policy (admins bypass penalties)
  const policy = getCancellationPolicy(booking);
  if (!policy.allowed) {
    throw new AppError(400, policy.reason);
  }

  const cancelledBooking = await prisma.$transaction(async (tx) => {
    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        cancellationReason: cancellationReason || 'No reason provided',
        cancellationPenaltyPercent: isAdmin ? 0 : policy.penaltyPercent,
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

    await recordStatusChange(bookingId, booking.status, 'CANCELLED', userId, cancellationReason, tx);

    return updated;
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
    throw new AppError(404, 'Booking not found.');
  }

  if (userRole !== 'CUSTOMER' || booking.customerId !== userId) {
    throw new AppError(403, 'Only the booking customer can pay for this booking.');
  }

  if (booking.status === 'CANCELLED') {
    throw new AppError(400, 'Cannot pay for a cancelled booking.');
  }

  if (booking.paymentStatus === 'PAID') {
    throw new AppError(400, 'Booking is already paid.');
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
        workerProfile: { select: { id: true, userId: true, user: { select: { id: true, name: true, profilePhotoUrl: true, rating: true, totalReviews: true } } } },
        customer: { select: { id: true, name: true, email: true, mobile: true, profilePhotoUrl: true, rating: true, totalReviews: true } },
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

/**
 * GET OPEN BOOKINGS FOR A WORKER
 * 
 * Business Logic:
 * - Worker sees jobs matching their SKILLS/SERVICES
 * - Worker sees jobs in their AREA (if we had location filtering)
 * - Only shows PENDING jobs with NO assigned worker
 */
async function getOpenBookingsForWorker(userId, { skip = 0, limit = 20 } = {}) {
  // 1. Get the worker's profile and their services
  const worker = await requireWorkerProfile(userId, 'Worker profile not found.', 404, {
    services: { select: { serviceId: true } }
  });

  const workerServiceIds = worker.services.map(s => s.serviceId);

  const where = {
    status: 'PENDING',
    workerProfileId: null, // Open booking
    serviceId: { in: workerServiceIds } // Matches worker's skills
  };

  // 2. Find PENDING bookings with NO worker assigned, matching their services
  const [openBookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        service: { select: { id: true, name: true, category: true, basePrice: true } },
        customer: {
          select: {
            id: true,
            name: true,
            addresses: {
              take: 1,
              select: { city: true }
            }
          }
        }
      },
      orderBy: {
        scheduledAt: 'asc' // Show urgent jobs first
      },
      skip,
      take: limit,
    }),
    prisma.booking.count({ where }),
  ]);

  // 3. Filter by Location (Service Area)
  // Only show jobs where the job address matches one of the worker's service areas
  const relevantBookings = openBookings.filter(booking => {
    return isLocationMatch(worker.serviceAreas, booking.address);
  });

  // Map to flatten city for frontend convenience
  return {
    data: relevantBookings.map(booking => ({
      ...booking,
      customer: {
        ...booking.customer,
        city: booking.customer.addresses?.[0]?.city || 'Local Area'
      }
    })),
    total,
  };
}

/**
 * ACCEPT AN OPEN BOOKING
 * 
 * Business Logic:
 * - Worker claims a job
 * - Status changes PENDING -> CONFIRMED
 * - Worker ID is assigned to the booking
 */
async function acceptBooking(bookingId, userId) {
  const worker = await requireWorkerProfile(userId, 'Only registered workers can accept bookings.', 403);

  // Transaction to ensure no two workers accept the same job at the exact same millisecond
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) throw new AppError(404, 'Booking not found.');

    // For direct bookings: only the assigned worker can accept
    if (booking.workerProfileId !== null && booking.workerProfileId !== worker.id) {
      throw new AppError(409, 'This booking has already been accepted by another worker.');
    }

    if (booking.status !== 'PENDING') {
      throw new AppError(409, 'Booking is no longer available.');
    }

    // CHECK AVAILABILITY: Prevents double booking (uses booking's estimatedDuration)
    if (!(await isWorkerAvailable(worker.id, booking.scheduledAt, tx, booking.estimatedDuration || DEFAULT_DURATION_MINUTES))) {
      throw new AppError(409, 'You cannot accept this job because you have another booking scheduled near this time.');
    }

    // Assign to worker and confirm, generating Start OTP
    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: {
        workerProfileId: worker.id,
        status: 'CONFIRMED',
        startOtp: generateOTP(),
        otpGeneratedAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        customer: { select: { id: true, name: true, email: true, mobile: true, profilePhotoUrl: true, rating: true, totalReviews: true } },
        workerProfile: { select: { id: true, userId: true, user: { select: { id: true, name: true, profilePhotoUrl: true, rating: true, totalReviews: true } } } },
        service: true
      }
    });

    await recordStatusChange(bookingId, 'PENDING', 'CONFIRMED', userId, 'Worker accepted booking', tx);

    return updated;
  });

}

/**
 * VERIFY OTP TO START JOB
 * Worker enters OTP provided by Customer
 */
async function verifyBookingStart(bookingId, otp, userId) {
  const worker = await requireWorkerProfile(userId, 'Only workers can start jobs.', 403);

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

  if (!booking) throw new AppError(404, 'Booking not found.');
  if (booking.workerProfileId !== worker.id) throw new AppError(403, 'You are not assigned to this job.');
  if (booking.status !== 'CONFIRMED') throw new AppError(400, 'Job must be CONFIRMED before starting.');

  if (booking.startOtp !== otp) {
    throw new AppError(400, 'Invalid Start OTP.');
  }

  // OTP Valid -> Start Job and generate Completion OTP
  return prisma.$transaction(async (tx) => {
    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
        completionOtp: generateOTP(),
        otpGeneratedAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        service: { select: { id: true, name: true, category: true } },
        reviews: true,
        workerProfile: {
          select: {
            id: true,
            userId: true,
            user: { select: { id: true, name: true, email: true, mobile: true, profilePhotoUrl: true, rating: true, totalReviews: true } },
          },
        },
        customer: {
          select: { id: true, name: true, email: true, mobile: true, profilePhotoUrl: true, rating: true, totalReviews: true },
        },
      },
    });

    await recordStatusChange(bookingId, 'CONFIRMED', 'IN_PROGRESS', userId, 'OTP verified — job started', tx);

    return updated;
  });
}

/**
 * VERIFY OTP TO COMPLETE JOB
 * Worker enters OTP provided by Customer
 */
async function verifyBookingCompletion(bookingId, otp, userId) {
  const worker = await requireWorkerProfile(userId, 'Only workers can complete jobs.', 403);

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

  if (!booking) throw new AppError(404, 'Booking not found.');
  if (booking.workerProfileId !== worker.id) throw new AppError(403, 'You are not assigned to this job.');
  if (booking.status !== 'IN_PROGRESS') throw new AppError(400, 'Job must be IN_PROGRESS before completing.');

  if (booking.completionOtp !== otp) {
    throw new AppError(400, 'Invalid Completion OTP.');
  }

  // OTP Valid -> Complete Job
  return prisma.$transaction(async (tx) => {
    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        service: { select: { id: true, name: true, category: true } },
        reviews: true,
        workerProfile: {
          select: {
            id: true,
            userId: true,
            user: { select: { id: true, name: true, email: true, mobile: true, profilePhotoUrl: true, rating: true, totalReviews: true } },
          },
        },
        customer: {
          select: { id: true, name: true, email: true, mobile: true, profilePhotoUrl: true, rating: true, totalReviews: true },
        },
      },
    });

    await recordStatusChange(bookingId, 'IN_PROGRESS', 'COMPLETED', userId, 'OTP verified — job completed', tx);

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
  getOpenBookingsForWorker,
  acceptBooking,
  verifyBookingStart,
  verifyBookingCompletion,
  // Session management (Phase 7)
  getBookingSessions,
  createSession,
  startSession,
  endSession,
  // Audit trail (Phase 7)
  recordStatusChange,
  // Booking lifecycle (Phase 7)
  rescheduleBooking,
  expirePendingBookings,
  // Overrun detection & Cancellation policy (Phase 7)
  detectOverrunSessions,
  getCancellationPolicy,
};

// ─── SESSION MANAGEMENT (Phase 7) ──────────────────────────────────

/**
 * Get all sessions for a booking.
 */
async function getBookingSessions(bookingId, userId, role) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new AppError(404, 'Booking not found.');

  // Auth check: customer, assigned worker, or admin
  const isCustomer = booking.customerId === userId;
  const isWorker = role === 'WORKER' ? await isWorkerForBooking(userId, booking) : false;
  const isAdmin = role === 'ADMIN';
  if (!isCustomer && !isWorker && !isAdmin) {
    throw new AppError(403, 'You do not have permission to view sessions for this booking.');
  }

  return prisma.bookingSession.findMany({
    where: { bookingId },
    orderBy: { sessionDate: 'asc' },
  });
}

/**
 * Create a follow-up session for a multi-day booking.
 * Only the assigned worker can schedule a next visit.
 * Booking must be IN_PROGRESS.
 */
async function createSession(bookingId, userId, { sessionDate, notes }) {
  const worker = await requireWorkerProfile(userId, 'Only workers can schedule sessions.', 403);

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new AppError(404, 'Booking not found.');
  if (booking.workerProfileId !== worker.id) throw new AppError(403, 'You are not assigned to this booking.');
  if (booking.status !== 'IN_PROGRESS') throw new AppError(400, 'Booking must be IN_PROGRESS to schedule a session.');

  const sessionDateObj = new Date(sessionDate);
  if (sessionDateObj <= new Date()) {
    throw new AppError(400, 'Session date must be in the future.');
  }

  // Ensure no overlapping active session
  const activeSession = await prisma.bookingSession.findFirst({
    where: { bookingId, isActive: true },
  });
  if (activeSession) {
    throw new AppError(409, 'There is already an active session. End it before scheduling the next one.');
  }

  // Generate OTP for this session's start verification
  const otp = generateOTP();

  return prisma.bookingSession.create({
    data: {
      bookingId,
      sessionDate: sessionDateObj,
      startOtp: otp,
      notes: notes || null,
    },
  });
}

/**
 * Start a session (worker verifies the session OTP).
 * Sets isActive=true, startTime=now, otpVerified=true.
 */
async function startSession(sessionId, otp, userId) {
  const worker = await requireWorkerProfile(userId, 'Only workers can start sessions.', 403);

  const session = await prisma.bookingSession.findUnique({
    where: { id: sessionId },
    include: { booking: true },
  });

  if (!session) throw new AppError(404, 'Session not found.');
  if (session.booking.workerProfileId !== worker.id) throw new AppError(403, 'You are not assigned to this booking.');
  if (session.isActive) throw new AppError(400, 'Session is already active.');
  if (session.endTime) throw new AppError(400, 'Session has already ended.');

  if (session.startOtp !== otp) {
    throw new AppError(400, 'Invalid session OTP.');
  }

  return prisma.bookingSession.update({
    where: { id: sessionId },
    data: {
      isActive: true,
      startTime: new Date(),
      otpVerified: true,
    },
  });
}

/**
 * End an active session.
 * Sets isActive=false, endTime=now.
 */
async function endSession(sessionId, userId, { notes } = {}) {
  const worker = await requireWorkerProfile(userId, 'Only workers can end sessions.', 403);

  const session = await prisma.bookingSession.findUnique({
    where: { id: sessionId },
    include: { booking: true },
  });

  if (!session) throw new AppError(404, 'Session not found.');
  if (session.booking.workerProfileId !== worker.id) throw new AppError(403, 'You are not assigned to this booking.');
  if (!session.isActive) throw new AppError(400, 'Session is not currently active.');

  return prisma.bookingSession.update({
    where: { id: sessionId },
    data: {
      isActive: false,
      endTime: new Date(),
      ...(notes && { notes }),
    },
  });
}

// ─── AUDIT TRAIL (Phase 7) ─────────────────────────────────────────

/**
 * Record a status change in the audit trail.
 */
async function recordStatusChange(bookingId, fromStatus, toStatus, changedBy, reason, client = prisma) {
  return client.bookingStatusHistory.create({
    data: {
      bookingId,
      fromStatus,
      toStatus,
      changedBy,
      reason: reason || null,
    },
  });
}

// ─── RESCHEDULING (Phase 7) ────────────────────────────────────────

/**
 * Reschedule a booking to a new date/time.
 * Preserves worker assignment. Only PENDING or CONFIRMED bookings can be rescheduled.
 */
async function rescheduleBooking(bookingId, userId, role, { newScheduledDate }) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new AppError(404, 'Booking not found.');

  // Only customer, assigned worker, or admin can reschedule
  const isCustomer = booking.customerId === userId;
  const isWorker = role === 'WORKER' ? await isWorkerForBooking(userId, booking) : false;
  const isAdmin = role === 'ADMIN';
  if (!isCustomer && !isWorker && !isAdmin) {
    throw new AppError(403, 'You do not have permission to reschedule this booking.');
  }

  if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
    throw new AppError(400, 'Only PENDING or CONFIRMED bookings can be rescheduled.');
  }

  const newDate = new Date(newScheduledDate);
  const oneHourLater = new Date(Date.now() + 60 * 60 * 1000);
  if (newDate < oneHourLater) {
    throw new AppError(400, 'New date must be at least 1 hour in the future.');
  }

  // If worker is assigned, check their availability at the new time
  if (booking.workerProfileId) {
    const available = await isWorkerAvailable(
      booking.workerProfileId,
      newDate,
      prisma,
      booking.estimatedDuration || DEFAULT_DURATION_MINUTES
    );
    if (!available) {
      throw new AppError(409, 'Worker is not available at the new time. Please choose another time.');
    }
  }

  const oldDate = booking.scheduledAt;
  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { scheduledAt: newDate },
    include: {
      service: { select: { id: true, name: true, category: true } },
      workerProfile: {
        select: {
          id: true, userId: true,
          user: { select: { id: true, name: true, email: true, mobile: true, profilePhotoUrl: true, rating: true, totalReviews: true } },
        },
      },
      customer: { select: { id: true, name: true, email: true, mobile: true, profilePhotoUrl: true, rating: true, totalReviews: true } },
    },
  });

  await recordStatusChange(bookingId, booking.status, booking.status, userId,
    `Rescheduled from ${oldDate.toISOString()} to ${newDate.toISOString()}`);

  return updated;
}

// ─── BOOKING TIMEOUT / AUTO-EXPIRY (Phase 7) ──────────────────────

/**
 * Expire PENDING bookings older than the given threshold.
 * Called by a scheduled job (cron). Returns count of expired bookings.
 */
async function expirePendingBookings(hoursThreshold = 24) {
  const cutoff = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000);

  const expired = await prisma.booking.findMany({
    where: {
      status: 'PENDING',
      createdAt: { lt: cutoff },
    },
    select: { id: true, status: true },
  });

  if (expired.length === 0) return 0;

  await prisma.$transaction(async (tx) => {
    await tx.booking.updateMany({
      where: { id: { in: expired.map(b => b.id) } },
      data: { status: 'CANCELLED', cancellationReason: 'Auto-expired: no worker accepted within the time limit.' },
    });

    // Record audit trail for each
    for (const b of expired) {
      await tx.bookingStatusHistory.create({
        data: {
          bookingId: b.id,
          fromStatus: b.status,
          toStatus: 'CANCELLED',
          changedBy: null, // System-initiated
          reason: 'Auto-expired: no worker accepted within the time limit.',
        },
      });
    }
  });

  return expired.length;
}

// ─── OVERRUN DETECTION (Phase 7) ──────────────────────────────────

/**
 * Detect active sessions that have exceeded the booking's estimated duration.
 * Returns list of overrun sessions with booking/customer info for notification.
 * Called by a scheduled job (e.g., every 15 minutes).
 */
async function detectOverrunSessions() {
  const activeSessions = await prisma.bookingSession.findMany({
    where: { isActive: true, startTime: { not: null } },
    include: {
      booking: {
        select: {
          id: true,
          estimatedDuration: true,
          customerId: true,
          service: { select: { name: true } },
          workerProfile: {
            select: { user: { select: { name: true } } },
          },
        },
      },
    },
  });

  const now = new Date();
  const overruns = [];

  for (const session of activeSessions) {
    const durationMs = now.getTime() - session.startTime.getTime();
    const expectedMs = (session.booking.estimatedDuration || DEFAULT_DURATION_MINUTES) * 60 * 1000;

    if (durationMs > expectedMs) {
      const overrunMinutes = Math.round((durationMs - expectedMs) / 60000);
      overruns.push({
        sessionId: session.id,
        bookingId: session.booking.id,
        customerId: session.booking.customerId,
        serviceName: session.booking.service?.name,
        workerName: session.booking.workerProfile?.user?.name,
        overrunMinutes,
        startTime: session.startTime,
      });
    }
  }

  return overruns;
}

// ─── CANCELLATION POLICY (Phase 7) ────────────────────────────────

/**
 * Calculate cancellation penalty based on timing.
 * Returns: { allowed, penaltyPercent, reason }
 *
 * Policy:
 * - > 24h before: free cancellation (0%)
 * - 12–24h before: 25% penalty
 * - 2–12h before: 50% penalty
 * - < 2h before: 100% penalty (no refund)
 * - IN_PROGRESS: 100% penalty
 */
function getCancellationPolicy(booking) {
  if (booking.status === 'IN_PROGRESS') {
    return { allowed: true, penaltyPercent: 100, reason: 'Job is already in progress — full charge applies.' };
  }

  if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
    return { allowed: false, penaltyPercent: 0, reason: `Cannot cancel a ${booking.status.toLowerCase()} booking.` };
  }

  const hoursUntil = (new Date(booking.scheduledAt).getTime() - Date.now()) / (1000 * 60 * 60);

  if (hoursUntil > 24) {
    return { allowed: true, penaltyPercent: 0, reason: 'Free cancellation (more than 24 hours before scheduled time).' };
  }
  if (hoursUntil > 12) {
    return { allowed: true, penaltyPercent: 25, reason: '25% cancellation fee (12–24 hours before scheduled time).' };
  }
  if (hoursUntil > 2) {
    return { allowed: true, penaltyPercent: 50, reason: '50% cancellation fee (2–12 hours before scheduled time).' };
  }
  return { allowed: true, penaltyPercent: 100, reason: 'Full charge — cancellation less than 2 hours before scheduled time.' };
}
