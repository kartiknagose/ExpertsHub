const asyncHandler = require('../../common/utils/asyncHandler');
const analyticsService = require('./analytics.service');

/**
 * GET admin/analytics/summary
 * returns KPIs and chart data in one go
 */
const getAdminSummary = asyncHandler(async (req, res) => {
    const [kpis, monthly, categories, workers] = await Promise.all([
        analyticsService.getAdminKPIs(),
        analyticsService.getMonthlyPerformance(),
        analyticsService.getCategoryBreakdown(),
        analyticsService.getWorkerMetrics()
    ]);

    res.json({
        kpis,
        charts: {
            monthly,
            categories,
            workers
        }
    });
});

module.exports = {
    getAdminSummary
};
