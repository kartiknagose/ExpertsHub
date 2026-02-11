const asyncHandler = require('../../common/utils/asyncHandler');
const { getMyApplication, applyForVerification, listApplications, reviewApplication } = require('./verification.service');

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
});

exports.listAll = asyncHandler(async (_req, res) => {
  const applications = await listApplications();
  res.json({ applications });
});

exports.review = asyncHandler(async (req, res) => {
  const applicationId = parseInt(req.params.id);
  const application = await reviewApplication(applicationId, req.body);
  res.json({
    message: 'Verification application updated.',
    application,
  });
});
