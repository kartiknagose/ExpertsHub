const asyncHandler = require('../../common/utils/asyncHandler');
const { listMyPayments, listAllPayments } = require('./payment.service');

exports.listMine = asyncHandler(async (req, res) => {
  const payments = await listMyPayments(req.user.id);
  res.json({ payments });
});

exports.listAll = asyncHandler(async (_req, res) => {
  const payments = await listAllPayments();
  res.json({ payments });
});
