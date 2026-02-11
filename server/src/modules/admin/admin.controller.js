const asyncHandler = require('../../common/utils/asyncHandler');
const { getDashboardStats, listUsers, listWorkers } = require('./admin.service');

const allowedRoles = new Set(['CUSTOMER', 'WORKER', 'ADMIN']);

exports.getDashboard = asyncHandler(async (req, res) => {
  const stats = await getDashboardStats();
  res.json({ stats });
});

exports.getUsers = asyncHandler(async (req, res) => {
  const role = req.query.role ? String(req.query.role).toUpperCase() : undefined;

  if (role && !allowedRoles.has(role)) {
    return res.status(400).json({ error: 'Invalid role filter.' });
  }

  const users = await listUsers(role);
  res.json({ users });
});

exports.getWorkers = asyncHandler(async (req, res) => {
  const workers = await listWorkers();
  res.json({ workers });
});
