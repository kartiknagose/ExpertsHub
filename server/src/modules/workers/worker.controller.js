const asyncHandler = require('../../common/utils/asyncHandler');
const { upsertWorkerProfile, getMyWorkerProfile } = require('./worker.service');

// POST /api/workers/profile
// Create or update the authenticated user's worker profile (lets any user become a worker)
exports.saveProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id; // from auth middleware
  const { bio, hourlyRate, skills, serviceAreas } = req.body;

  const profile = await upsertWorkerProfile(userId, {
    bio,
    hourlyRate: typeof hourlyRate === 'number' ? hourlyRate : undefined, // avoid storing non-numeric values
    skills, // array like ["plumbing", "cleaning"]
    serviceAreas, // array like ["Mumbai", "Pune"]
  });

  res.status(201).json({ profile });
});

// GET /api/workers/me
// Return the authenticated user's worker profile
exports.me = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const profile = await getMyWorkerProfile(userId);
  if (!profile) return res.status(404).json({ error: 'No worker profile found' });
  res.json({ profile });
});