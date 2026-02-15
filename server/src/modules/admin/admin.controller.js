const asyncHandler = require('../../common/utils/asyncHandler');
const { getDashboardStats, listUsers, listWorkers, updateUserStatus, deleteUser } = require('./admin.service');

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
exports.updateUser = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { isActive } = req.body;
  if (typeof isActive !== 'boolean') return res.status(400).json({ error: 'isActive must be a boolean' });
  const user = await updateUserStatus(id, isActive);
  res.json({ user });
});

exports.removeUser = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  await deleteUser(id);
  res.json({ message: 'User deleted successfully' });
});
