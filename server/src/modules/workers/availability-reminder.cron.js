/**
 * Availability Reminder Cron Job
 * Sends daily reminders to workers who haven't set their availability for the week
 */

const prisma = require('../../config/prisma');
const { createNotification } = require('../notifications/notification.service');

/**
 * Send availability reminders to workers who haven't set their hours for today
 */
async function sendAvailabilityReminders() {
  try {
    console.log('[CRON] Starting availability reminder checks...');

    // Get all workers
    const workers = await prisma.workerProfile.findMany({
      where: {
        user: { role: 'WORKER' }
      },
      include: {
        user: { select: { id: true, name: true } },
        availability: true
      }
    });

    const today = new Date().getDay();
    let remindersCount = 0;

    for (const worker of workers) {
      // Check if worker has availability set for today
      const hasAvailabilityToday = worker.availability?.some(a => a.dayOfWeek === today);

      // Only send reminder if:
      // 1. No availability set for today
      // 2. Worker has completed at least 1 booking (active worker)
      if (!hasAvailabilityToday) {
        const jobsCompleted = await prisma.booking.count({
          where: {
            workerProfileId: worker.id,
            status: 'COMPLETED'
          }
        });

        // Only send to active workers who have done work before
        if (jobsCompleted > 0) {
          try {
            await createNotification({
              userId: worker.user.id,
              type: 'AVAILABILITY_REMINDER',
              title: 'Set your availability',
              message: `Hi ${worker.user.name || 'there'}! Set your working hours for today to get more booking requests.`,
              data: { 
                actionUrl: '/worker/availability',
                actionType: 'SET_AVAILABILITY',
                dayOfWeek: today
              }
            });
            remindersCount++;
          } catch (notifyErr) {
            console.warn(`Failed to send availability reminder to worker ${worker.user.id}:`, notifyErr.message);
          }
        }
      }
    }

    console.log(`[CRON] Sent ${remindersCount} availability reminders.`);
  } catch (error) {
    console.error('[CRON] Error in availability reminder check:', error.message);
  }
}

/**
 * Send weekly summary to workers about their activity
 */
async function sendWeeklySummary() {
  try {
    console.log('[CRON] Starting weekly summary notifications...');

    const workers = await prisma.workerProfile.findMany({
      where: {
        user: { role: 'WORKER' }
      },
      include: {
        user: { select: { id: true, name: true } }
      }
    });

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    let summariesCount = 0;

    for (const worker of workers) {
      // Get week's stats
      const weekBookings = await prisma.booking.findMany({
        where: {
          workerProfileId: worker.id,
          status: 'COMPLETED',
          updatedAt: { gte: weekStart }
        },
        select: { workerPayoutAmount: true }
      });

      if (weekBookings.length > 0) {
        const weekEarnings = weekBookings.reduce((sum, b) => sum + (Number(b.workerPayoutAmount) || 0), 0);

        try {
          await createNotification({
            userId: worker.user.id,
            type: 'WEEKLY_SUMMARY',
            title: 'Weekly summary',
            message: `Great work! You earned ₹${weekEarnings.toFixed(2)} from ${weekBookings.length} booking${weekBookings.length > 1 ? 's' : ''} this week.`,
            data: {
              weekEarnings,
              bookingsCount: weekBookings.length,
              actionUrl: '/worker/earnings'
            }
          });
          summariesCount++;
        } catch (notifyErr) {
          console.warn(`Failed to send weekly summary to worker ${worker.user.id}:`, notifyErr.message);
        }
      }
    }

    console.log(`[CRON] Sent ${summariesCount} weekly summaries.`);
  } catch (error) {
    console.error('[CRON] Error in weekly summary:', error.message);
  }
}

module.exports = {
  sendAvailabilityReminders,
  sendWeeklySummary
};
