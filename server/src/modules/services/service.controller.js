const asyncHandler = require('../../common/utils/asyncHandler');
const { listServices, getServiceById } = require('./service.service');

// GET /api/services
// List services (optionally filter by category)
exports.list = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const services = await listServices({ category });
  res.json({ services });
});

// GET /api/services/:id
// Get service details
exports.getOne = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid service id' });

  const service = await getServiceById(id);
  if (!service) return res.status(404).json({ error: 'Service not found' });
  res.json({ service });
});