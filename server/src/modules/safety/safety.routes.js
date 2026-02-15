const { Router } = require('express');
const auth = require('../../middleware/auth');
const safetyController = require('./safety.controller');

const router = Router();

// Trigger SOS Alert (Active Job)
router.post('/sos', auth, safetyController.triggerSOS);

// Emergency Contacts Management
router.get('/contacts', auth, safetyController.getContacts);
router.post('/contacts', auth, safetyController.addContact);
router.delete('/contacts/:id', auth, safetyController.deleteContact);

module.exports = router;
