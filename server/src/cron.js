const cron = require('node-cron');
const { processDailyCronPayouts } = require('./modules/payouts/payout.service');

// Initialize all background crons
function initCronJobs() {
    console.log('[CRON] Initializing background jobs...');

    // 11:00 PM IST is evaluated using the Asia/Kolkata timezone
    // '0 23 * * *' runs every day at 23:00 (11:00 PM)
    cron.schedule('0 23 * * *', async () => {
        try {
            await processDailyCronPayouts();
        } catch (err) {
            console.error('[CRON] Error in daily payouts:', err);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });

    console.log('[CRON] Jobs scheduled successfully.');
}

module.exports = { initCronJobs };
