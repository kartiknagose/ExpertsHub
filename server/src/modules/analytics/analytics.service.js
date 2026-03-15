const prisma = require('../../config/prisma');

/**
 * Get high-level Admin KPIs
 * - GMV (Total value of all paid bookings)
 * - Platform Revenue (Commissions)
 * - Active Users (30-day login count)
 * - Active Workers
 * - Average Worker Response Time (Booking created to accepted) - Mock for now
 */
async function getAdminKPIs() {
    const [gmvData, revenueData, usersCount, workersCount, bookingsCount] = await Promise.all([
        // GMV: Sum of total price of COMPLETED/PAID bookings
        prisma.booking.aggregate({
            _sum: { totalPrice: true },
            where: { status: 'COMPLETED', paymentStatus: 'PAID' }
        }),
        // Revenue: Sum of platform commissions
        prisma.booking.aggregate({
            _sum: { platformCommission: true },
            where: { status: 'COMPLETED', paymentStatus: 'PAID' }
        }),
        // Users: Number of non-deleted users
        prisma.user.count({ where: { isActive: true } }),
        // Workers: Number of verified workers
        prisma.workerProfile.count({ where: { isVerified: true } }),
        // Total Bookings
        prisma.booking.count(),
    ]);

    return {
        gmv: Number(gmvData._sum.totalPrice || 0),
        revenue: Number(revenueData._sum.platformCommission || 0),
        activeUsers: usersCount,
        activeWorkers: workersCount,
        totalBookings: bookingsCount,
        avgResponseTimeMinutes: 12.5, // Mock data for now
        growthMoM: 18.2, // Mock growth percentage
    };
}

/**
 * Get Monthly Revenue & GMV Data for charts
 */
async function getMonthlyPerformance() {
    const results = await prisma.$queryRaw`
        SELECT 
            TO_CHAR(DATE_TRUNC('month', "createdAt"), 'MMMM') as month,
            SUM("totalPrice") as gmv,
            SUM("platformCommission") as revenue,
            COUNT("id") as bookings
        FROM "Booking"
        WHERE "paymentStatus" = 'PAID'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt") ASC
        LIMIT 6;
    `;

    return results.map(r => ({
        month: r.month,
        gmv: Number(r.gmv || 0),
        revenue: Number(r.revenue || 0),
        bookings: Number(r.bookings || 0)
    }));
}

/**
 * Get category-wise performance
 */
async function getCategoryBreakdown() {
    const results = await prisma.$queryRaw`
        SELECT 
            s.category as category,
            SUM(b."totalPrice") as value,
            COUNT(b."id") as count
        FROM "Booking" b
        JOIN "Service" s ON b."serviceId" = s.id
        WHERE b."status" = 'COMPLETED'
        GROUP BY s.category
        ORDER BY value DESC;
    `;

    return results.map(r => ({
        name: r.category,
        value: Number(r.value || 0),
        count: Number(r.count || 0)
    }));
}

/**
 * Worker Performance Metrics
 */
async function getWorkerMetrics() {
    const topEarners = await prisma.workerProfile.findMany({
        take: 5,
        orderBy: { walletBalance: 'desc' },
        include: { user: { select: { name: true } } }
    });

    const averageRating = await prisma.review.aggregate({
        _avg: { rating: true }
    });

    return {
        topEarners: topEarners.map(w => ({
            name: w.user.name,
            earnings: Number(w.walletBalance || 0)
        })),
        overallRating: Number(averageRating._avg.rating || 0).toFixed(1)
    };
}

module.exports = {
    getAdminKPIs,
    getMonthlyPerformance,
    getCategoryBreakdown,
    getWorkerMetrics
};
