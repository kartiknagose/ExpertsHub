const { Router } = require('express');
const auth = require('../../middleware/auth');
const { saveProfile, me } = require('./worker.controller');

const router = Router();

// Create/update worker profile (requires login)
router.post('/profile', auth, saveProfile);

// Get my worker profile (requires login)
router.get('/me', auth, me);

module.exports = router;