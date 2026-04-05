/**
 * Worker Real-Time Stats Service
 * Manages worker dashboard statistics and broadcasts them via Socket.IO
 */

const prisma = require('../../config/prisma');
const { getIo } = require('../../socket');

/**
 * Get real-time stats for a worker
 * @param {number} userId - Worker's user ID
 * @returns {Promise<object>} Worker stats object
 */
async function getWorkerStats(userId) {
  try {
    const profile = await prisma.workerProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { name: true, profilePhotoUrl: true } },
        availability: true
      }
    });

    if (!profile) {
      throw new Error('Worker profile not found');
    }

    // Get active bookings (CONFIRMED, IN_PROGRESS)
    const activeBookings = await prisma.booking.findMany({
      where: {
        workerProfileId: profile.id,
        status: { in: ['CONFIRMED', 'IN_PROGRESS'] }
      },
      select: { id: true, status: true, scheduledStartTime: true }
    });

    // Get today's earnings (completed bookings today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysEarnings = await prisma.booking.aggregate({
      where: {
        workerProfileId: profile.id,
        status: 'COMPLETED',
        updatedAt: { gte: today, lt: tomorrow }
      },
      _sum: { workerPayoutAmount: true }
    });

    const todayEarnings = Number(todaysEarnings._sum.workerPayoutAmount || 0).toFixed(2);

    // Get this week's earnings
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    
    const weekEarnings = await prisma.booking.aggregate({
      where: {
        workerProfileId: profile.id,
        status: 'COMPLETED',
        updatedAt: { gte: weekStart, lt: new Date() }
      },
      _sum: { workerPayoutAmount: true }
    });

    const thisWeekEarnings = Number(weekEarnings._sum.workerPayoutAmount || 0).toFixed(2);

    // Check if availability is set for this week
    const dayOfWeek = new Date().getDay();
    const availabilityToday = profile.availability?.some(a => a.dayOfWeek === dayOfWeek);

    // Get completion rate
    const totalBookings = await prisma.booking.count({
      where: { workerProfileId: profile.id }
    });

    const completedBookings = await prisma.booking.count({
      where: {
        workerProfileId: profile.id,
        status: 'COMPLETED'
      }
    });

    const completionRate = totalBookings > 0 ? ((completedBookings / totalBookings) * 100).toFixed(1) : 0;

    // Get wallet balance
    const walletBalance = Number(profile.walletBalance || 0).toFixed(2);

    // Build stats object
    const stats = {
      userId,
      workerName: profile.user?.name || 'Worker',
      profilePhotoUrl: profile.user?.profilePhotoUrl,
      activeBookingsCount: activeBookings.length,
      activeBookings: activeBookings.map(b => ({
        id: b.id,
        status: b.status,
        scheduledStartTime: b.scheduledStartTime
      })),
      todayEarnings: parseFloat(todayEarnings),
      thisWeekEarnings: parseFloat(thisWeekEarnings),
      walletBalance: parseFloat(walletBalance),
      completionRate: parseFloat(completionRate),
      availabilitySetToday: availabilityToday,
      totalJobsCompleted: completedBookings,
      rating: profile.rating || 0,
      totalReviews: totalBookings,
      isVerified: profile.isVerified || false,
      verificationLevel: profile.verificationLevel || 'BASIC'
    };

    return stats;
  } catch (error) {
    console.error('Error getting worker stats:', error.message);
    return null;
  }
}

/**
 * Broadcast worker stats via Socket.IO
 * @param {number} userId - Worker's user ID
 */
async function broadcastWorkerStats(userId) {
  try {
    const stats = await getWorkerStats(userId);
    if (!stats) return;

    const io = getIo();
    
    // Send to worker's personal room
    io.to(`worker:${userId}`).emit('worker:stats_updated', stats);
    
    // Also send to their tracking room (for customers tracking them)
    const profile = await prisma.workerProfile.findUnique({ where: { userId } });
    if (profile) {
      io.to(`worker_tracking:${profile.id}`).emit('worker:stats_updated', stats);
    }
  } catch (error) {
    console.error('Error broadcasting worker stats:', error.message);
  }
}

/**
 * Broadcast stats for all active workers
 */
async function broadcastAllWorkerStats() {
  try {
    const workers = await prisma.workerProfile.findMany({
      select: { userId: true }
    });

    for (const worker of workers) {
      await broadcastWorkerStats(worker.userId);
    }
  } catch (error) {
    console.error('Error broadcasting all worker stats:', error.message);
  }
}

/**
 * Listen for booking status changes and update worker stats
 */
function initializeWorkerStatsListeners() {
  const io = getIo();

  io.on('connection', (socket) => {
    // When a worker connects, send their initial stats
    if (socket.user?.role === 'WORKER') {
      getWorkerStats(socket.user.id).then(stats => {
        if (stats) {
          socket.emit('worker:stats_updated', stats);
        }
      });
    }
  });
}

module.exports = {
  getWorkerStats,
  broadcastWorkerStats,
  broadcastAllWorkerStats,
  initializeWorkerStatsListeners
};
