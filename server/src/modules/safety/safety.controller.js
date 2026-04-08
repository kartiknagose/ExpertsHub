const asyncHandler = require('../../common/utils/asyncHandler');
const parseId = require('../../common/utils/parseId');
const parsePagination = require('../../common/utils/parsePagination');
const safetyService = require('./safety.service');

const triggerSOS = asyncHandler(async (req, res) => {
    const { bookingId, location } = req.body;
    const userId = req.user.id;

    const parsedBookingId = parseId(bookingId, 'Booking ID');
    const result = await safetyService.triggerSOS(userId, parsedBookingId, location);
    res.status(201).json(result);
});

const getContacts = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const contacts = await safetyService.getEmergencyContacts(userId);
    res.status(200).json({ contacts });
});

const addContact = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const contact = await safetyService.addEmergencyContact(userId, req.body);
    res.status(201).json({ message: 'Emergency contact added', contact });
});

const deleteContact = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const contactId = parseId(req.params.id, 'Contact ID');
    await safetyService.deleteEmergencyContact(userId, contactId);
    res.status(200).json({ message: 'Emergency contact removed' });
});

// Admin: Get all active SOS alerts
const getActiveSosAlerts = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const { data: alerts, total } = await safetyService.getActiveSosAlerts({ skip, limit });
    res.status(200).json({ alerts, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

// Admin: Acknowledge or resolve an SOS alert
const updateSosAlertStatus = asyncHandler(async (req, res) => {
    const alertId = parseId(req.params.id, 'Alert ID');
    const { status } = req.body; // 'ACKNOWLEDGED' or 'RESOLVED'
    const alert = await safetyService.updateSosAlertStatus(alertId, status);
    res.status(200).json({ alert });
});

// User: Get their current active booking (for global SOS button)
const getActiveBooking = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const booking = await safetyService.getActiveBookingForUser(userId);
    res.status(200).json({ booking });
});

const createBookingReport = asyncHandler(async (req, res) => {
    const { bookingId, category, details, evidenceUrl } = req.body;
    const report = await safetyService.createBookingReport({
        bookingId: parseId(bookingId, 'Booking ID'),
        reporterId: req.user.id,
        reporterRole: req.user.role,
        category,
        details,
        evidenceUrl,
    });

    res.status(201).json({
        message: 'Report submitted successfully',
        report,
    });
});

const getMyBookingReports = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const bookingId = req.query.bookingId ? parseId(req.query.bookingId, 'Booking ID') : undefined;
    const { data: reports, total } = await safetyService.getMyBookingReports(req.user.id, { bookingId, skip, limit });

    res.status(200).json({
        reports,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
});

const getBookingReports = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const filters = {
        status: req.query.status,
        category: req.query.category,
        priority: req.query.priority,
        bookingId: req.query.bookingId,
    };
    const { data: reports, total } = await safetyService.getAdminBookingReports(filters, { skip, limit });

    res.status(200).json({
        reports,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
});

const getBookingReportSummary = asyncHandler(async (_req, res) => {
    const summary = await safetyService.getBookingReportSummary();
    res.status(200).json({ summary });
});

const updateBookingReportStatus = asyncHandler(async (req, res) => {
    const reportId = parseId(req.params.id, 'Report ID');
    const { status, adminNotes } = req.body;
    const report = await safetyService.updateBookingReportStatus({
        reportId,
        adminId: req.user.id,
        status,
        adminNotes,
    });

    res.status(200).json({
        message: 'Report updated successfully',
        report,
    });
});

module.exports = {
    triggerSOS,
    getContacts,
    addContact,
    deleteContact,
    getActiveSosAlerts,
    updateSosAlertStatus,
    getActiveBooking,
    createBookingReport,
    getMyBookingReports,
    getBookingReports,
    getBookingReportSummary,
    updateBookingReportStatus,
};
