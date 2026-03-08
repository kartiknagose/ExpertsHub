const express = require('express');
const router = express.Router();

const authenticate = require('../../middleware/auth');
const { requireWorker, requireAdmin } = require('../../middleware/requireRole');
const invoiceController = require('./invoice.controller');

// GET /api/invoices/booking/:id - Standard booking invoice for Customers / Workers
router.get('/booking/:id', authenticate, invoiceController.downloadBookingInvoice);

// GET /api/invoices/worker-report - Monthly Revenue & TDS statement for ITR
router.get('/worker-report', authenticate, requireWorker, invoiceController.downloadWorkerReport);

// GET /api/invoices/gstr1 - Export GST compatible sales CSV
router.get('/gstr1', authenticate, requireAdmin, invoiceController.exportGSTR1);

module.exports = router;
