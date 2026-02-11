const asyncHandler = require('../../common/utils/asyncHandler');
const { upsertCustomerProfile, getCustomerProfile } = require('./customer.service');

// POST /api/customers/profile
// Create or update customer profile (address + optional profile photo)
exports.saveProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { line1, line2, city, state, postalCode, country, profilePhotoUrl } = req.body;

  const address = await upsertCustomerProfile(userId, {
    line1,
    line2,
    city,
    state,
    postalCode,
    country,
    profilePhotoUrl,
  });

  res.status(201).json({ address });
});

// GET /api/customers/profile
// Get customer profile (user + addresses)
exports.me = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const user = await getCustomerProfile(userId);
  res.json({ user });
});
