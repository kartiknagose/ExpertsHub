const { Router } = require('express');
const auth = require('../../middleware/auth');
const validate = require('../../middleware/validation');
const { customerProfileSchema } = require('./customer.schemas');
const { saveProfile, me } = require('./customer.controller');

const router = Router();

// Create/update customer profile (requires login)
router.post('/profile', auth, customerProfileSchema, validate, saveProfile);

// Get my customer profile (requires login)
router.get('/profile', auth, me);

module.exports = router;
