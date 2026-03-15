const cron = require('node-cron');
const prisma = require('../../config/prisma');
const { createNotification } = require('../notifications/notification.service');
const { sendBookingReminderEmail } = require('../../common/utils/mailer');

/**
 * Service Reminders (Sprint 17 - #79)
 * Checks for recurring bookings or bookings that were completed N days ago
 * and reminds the customer to re-book.
 */
function initReminderCron() {
  // Run every day at 10:00 AM
  cron.schedule('0 10 * * *', async () => {
    try {
      console.log('[CRON] Running service reminders check...');
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);

      const twentyNineDaysAgo = new Date(thirtyDaysAgo);
      twentyNineDaysAgo.setDate(twentyNineDaysAgo.getDate() + 1);

      // Find bookings completed exactly 30 days ago that might need a follow-up
      const pastBookings = await prisma.booking.findMany({
        where: {
          status: 'COMPLETED',
          updatedAt: {
            gte: thirtyDaysAgo,
            lt: twentyNineDaysAgo,
          },
        },
        include: {
          customer: true,
          service: true,
        }
      });

      for (const booking of pastBookings) {
        // Send a notification to the customer
        await createNotification({
          userId: booking.customerId,
          type: 'PROMO',
          title: 'Time for a service?',
          message: `It's been 30 days since your last ${booking.service?.name || 'service'}. Book again to keep things running smoothly!`,
          data: { serviceId: booking.serviceId }
        });

        // Optionally send an email (non-blocking for now)
        try {
          await sendBookingReminderEmail(booking);
        } catch (err) {
          console.error('[CRON] Failed to send reminder email:', err);
        }
      }

      console.log(`[CRON] Sent ${pastBookings.length} service reminders.`);
    } catch (error) {
      console.error('[CRON] Service reminder check failed:', error);
    }
  });
}

module.exports = { initReminderCron };
