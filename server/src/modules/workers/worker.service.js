const prisma = require('../../config/prisma');

// Create or update a worker profile for the current user (idempotent)
async function upsertWorkerProfile(userId, { bio, hourlyRate, skills, serviceAreas }) {
  // Store skills and serviceAreas as JSON arrays for flexibility
  const data = {
    bio: bio ?? null,
    hourlyRate: hourlyRate ?? null, // allow null; validate number in controller before
    skills: skills ? JSON.stringify(skills) : null,
    serviceAreas: serviceAreas ? JSON.stringify(serviceAreas) : null,
    user: { connect: { id: userId } },
  };

  // If profile exists -> update, else -> create
  const existing = await prisma.workerProfile.findUnique({ where: { userId } });
  if (existing) {
    return prisma.workerProfile.update({ where: { userId }, data });
  }
  return prisma.workerProfile.create({ data });
}

// Get the current user's worker profile (if any)
async function getMyWorkerProfile(userId) {
  return prisma.workerProfile.findUnique({ where: { userId } });
}

module.exports = { upsertWorkerProfile, getMyWorkerProfile };