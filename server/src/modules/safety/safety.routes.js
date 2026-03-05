const { Router } = require('express');
const auth = require('../../middleware/auth');
const { requireAdmin } = require('../../middleware/requireRole');
const validate = require('../../middleware/validation');
const { addContactSchema } = require('./safety.schemas');
const safetyController = require('./safety.controller');

const router = Router();

// ─── User endpoints ──────────────────────────────────────────────────────────
// Trigger SOS Alert (authenticated user during active booking)
router.post('/sos', auth, safetyController.triggerSOS);

// Emergency Contacts CRUD
router.get('/contacts', auth, safetyController.getContacts);
router.post('/contacts', auth, addContactSchema, validate, safetyController.addContact);
router.delete('/contacts/:id', auth, safetyController.deleteContact);

// Get current active booking (for global floating SOS button)
router.get('/active-booking', auth, safetyController.getActiveBooking);

// ─── Admin endpoints ─────────────────────────────────────────────────────────
router.get('/sos/alerts', auth, requireAdmin, safetyController.getActiveSosAlerts);
router.patch('/sos/alerts/:id', auth, requireAdmin, safetyController.updateSosAlertStatus);

module.exports = router;
