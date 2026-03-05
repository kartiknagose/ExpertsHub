const asyncHandler = require('../../common/utils/asyncHandler');
const AppError = require('../../common/errors/AppError');
const { isValidUploadUrl } = require('../../common/utils/validateUploadUrl');
const {
  upsertWorkerProfile,
  getMyWorkerProfile,
  addWorkerService,
  getMyWorkerServices,
  getWorkerServicesById,
  getWorkerProfileById,
  removeWorkerService,
} = require('./worker.service');

// POST /api/workers/profile
// Create or update the authenticated user's worker profile (lets any user become a worker)
exports.saveProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id; // from auth middleware
  const { bio, hourlyRate, skills, serviceAreas, profilePhotoUrl, baseLatitude, baseLongitude, serviceRadius } = req.body;

  // Validate profilePhotoUrl if provided — only accept URLs from our upload endpoint
  if (profilePhotoUrl && !isValidUploadUrl(profilePhotoUrl, ['/uploads/profile-photos/'])) {
    throw new AppError(400, 'Invalid profile photo URL. Please use the upload endpoint.');
  }

  const profile = await upsertWorkerProfile(userId, {
    bio,
    hourlyRate: typeof hourlyRate === 'number' ? hourlyRate : undefined,
    skills,
    serviceAreas,
    profilePhotoUrl,
    baseLatitude,
    baseLongitude,
    serviceRadius: serviceRadius ? Number(serviceRadius) : undefined,
  });

  res.status(201).json({ profile });
});

// GET /api/workers/me
// Return the authenticated user's worker profile
exports.me = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const profile = await getMyWorkerProfile(userId);
  if (!profile) throw new AppError(404, 'No worker profile found');
  res.json({ profile });
});

// POST /api/workers/services
// Add a service to the worker's offered services
exports.addService = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { serviceId } = req.body;

  const workerService = await addWorkerService(userId, serviceId);

  res.status(201).json({
    message: 'Service added successfully',
    workerService,
  });
});

// GET /api/workers/services
// Get all services the authenticated worker offers (my services)
exports.getServices = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const services = await getMyWorkerServices(userId);

  res.json({ services });
});

// GET /api/workers/:workerId/services
// Get all services offered by a specific worker (public endpoint - any user can view)
exports.getWorkerServices = asyncHandler(async (req, res) => {
  const { workerId } = req.params;
  const services = await getWorkerServicesById(parseInt(workerId));

  res.json({ services });
});

// GET /api/workers/:workerId
// Get worker public profile (name, rating, bio, etc)
exports.getProfile = asyncHandler(async (req, res) => {
  const { workerId } = req.params;
  const profile = await getWorkerProfileById(parseInt(workerId));

  if (!profile) throw new AppError(404, 'Worker not found');

  // Also fetch services to make it a complete profile view
  const services = await getWorkerServicesById(parseInt(workerId));

  res.json({ profile, services });
});

// DELETE /api/workers/services/:serviceId
// Remove a service from the authenticated worker's offered services
exports.removeService = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { serviceId } = req.params;

  await removeWorkerService(userId, parseInt(serviceId));

  res.json({
    message: 'Service removed successfully',
  });
});