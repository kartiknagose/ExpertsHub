const asyncHandler = require('../../common/utils/asyncHandler');
const parseId = require('../../common/utils/parseId');
const parsePagination = require('../../common/utils/parsePagination');
const {
  getDashboardStats, listUsers, listWorkers, updateUserStatus, deleteUser, getFraudAlerts,
  createCoupon, listCoupons, toggleCoupon, deleteCoupon
} = require('./admin.service');

let getIo;
try {
  ({ getIo } = require('../../socket'));
} catch (_e) {
  getIo = null;
}

function emitAdminDataChanged(eventName, payload) {
  if (!getIo) return;

  try {
    const io = getIo();
    io.to('admin').emit(eventName, payload);
  } catch (err) {
    console.warn(`Socket emit failed (${eventName}):`, err.message);
  }
}

exports.getDashboard = asyncHandler(async (req, res) => {
  const stats = await getDashboardStats();
  res.json({ stats });
});

exports.getUsers = asyncHandler(async (req, res) => {
  const role = req.query.role ? String(req.query.role).toUpperCase() : undefined;
  const { page, limit, skip } = parsePagination(req.query);
  const { data: users, total } = await listUsers(role, { skip, limit });
  res.json({ users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

exports.getWorkers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { data: workers, total } = await listWorkers({ skip, limit });
  res.json({ workers, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});
exports.updateUser = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, 'User ID');
  const { isActive } = req.body;
  const user = await updateUserStatus(id, isActive);
  res.json({ user });

  emitAdminDataChanged('admin:users_updated', { userId: id, action: 'status', isActive });
  emitAdminDataChanged('admin:workers_updated', { userId: id, action: 'status', isActive });

  // Real-time notification to the specific user being updated
  try {
    if (getIo) {
      const io = getIo();
      io.to(`user:${id}`).emit('user:status_changed', { isActive });
    }
  } catch (err) {
    console.warn(`Private socket emit failed for user ${id}:`, err.message);
  }
});

exports.removeUser = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, 'User ID');
  await deleteUser(id);
  res.json({ message: 'User deleted successfully' });

  emitAdminDataChanged('admin:users_updated', { userId: id, action: 'delete' });
  emitAdminDataChanged('admin:workers_updated', { userId: id, action: 'delete' });
});

exports.getFraudAlerts = asyncHandler(async (req, res) => {
  const alerts = await getFraudAlerts();
  res.json(alerts);
});

// Coupon Management
exports.getCoupons = asyncHandler(async (req, res) => {
  const coupons = await listCoupons();
  res.json({ coupons });
});

exports.createCoupon = asyncHandler(async (req, res) => {
  const coupon = await createCoupon(req.body);
  res.status(201).json({ coupon });
  emitAdminDataChanged('admin:coupons_updated', { action: 'create' });
});

exports.updateCouponStatus = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, 'Coupon ID');
  const { isActive } = req.body;
  const coupon = await toggleCoupon(id, isActive);
  res.json({ coupon });
  emitAdminDataChanged('admin:coupons_updated', { action: 'update', couponId: id });
});

exports.removeCoupon = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, 'Coupon ID');
  await deleteCoupon(id);
  res.json({ message: 'Coupon deleted successfully' });
  emitAdminDataChanged('admin:coupons_updated', { action: 'delete', couponId: id });
});
