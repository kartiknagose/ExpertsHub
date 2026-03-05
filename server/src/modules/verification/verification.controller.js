const asyncHandler = require('../../common/utils/asyncHandler');
const parseId = require('../../common/utils/parseId');
const parsePagination = require('../../common/utils/parsePagination');
const { getMyApplication, applyForVerification, listApplications, reviewApplication } = require('./verification.service');

let getIo;
try {
  ({ getIo } = require('../../socket'));
} catch (_e) {
  getIo = null;
}

function emitVerificationEvent(eventName, application) {
  if (!getIo || !application) return;

  try {
    const io = getIo();
    io.to('admin').emit(eventName, application);

    const applicantUserId = application.user?.id || application.userId;
    if (applicantUserId) {
      io.to(`user:${applicantUserId}`).emit(eventName, application);
    }
  } catch (err) {
    console.warn(`Socket emit failed (${eventName}):`, err.message);
  }
}

exports.getMine = asyncHandler(async (req, res) => {
  const application = await getMyApplication(req.user.id);
  res.json({ application });
});

exports.apply = asyncHandler(async (req, res) => {
  const application = await applyForVerification(req.user.id, req.body);
  res.status(201).json({
    message: 'Verification request submitted successfully.',
    application,
  });

  emitVerificationEvent('verification:created', application);
});

exports.listAll = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { data: applications, total } = await listApplications({ skip, limit });
  res.json({ applications, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

exports.review = asyncHandler(async (req, res) => {
  const applicationId = parseId(req.params.id, 'Application ID');
  const application = await reviewApplication(applicationId, req.body);
  res.json({
    message: 'Verification application updated.',
    application,
  });

  emitVerificationEvent('verification:updated', application);
});
