const prisma = require('../../config/prisma');
const AppError = require('../../common/errors/AppError');

const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const ensureWorkerProfile = async (userId) => {
  const profile = await prisma.workerProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new AppError(404, 'Worker profile not found.');
  }
  return profile;
};

async function listAvailability(userId) {
  const profile = await ensureWorkerProfile(userId);

  return prisma.availability.findMany({
    where: { workerId: profile.id },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
  });
}

async function createAvailability(userId, data) {
  const profile = await ensureWorkerProfile(userId);
  const { dayOfWeek, startTime, endTime } = data;

  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  if (startMinutes >= endMinutes) {
    throw new AppError(400, 'Start time must be before end time.');
  }

  const existing = await prisma.availability.findMany({
    where: { workerId: profile.id, dayOfWeek },
  });

  const hasOverlap = existing.some((slot) => {
    const slotStart = timeToMinutes(slot.startTime);
    const slotEnd = timeToMinutes(slot.endTime);
    return startMinutes < slotEnd && endMinutes > slotStart;
  });

  if (hasOverlap) {
    throw new AppError(409, 'Availability overlaps with an existing slot.');
  }

  return prisma.availability.create({
    data: {
      workerId: profile.id,
      dayOfWeek,
      startTime,
      endTime,
    },
  });
}

async function removeAvailability(userId, availabilityId) {
  const profile = await ensureWorkerProfile(userId);

  const slot = await prisma.availability.findUnique({ where: { id: availabilityId } });
  if (!slot || slot.workerId !== profile.id) {
    throw new AppError(404, 'Availability slot not found.');
  }

  await prisma.availability.delete({ where: { id: availabilityId } });
}

module.exports = {
  listAvailability,
  createAvailability,
  removeAvailability,
};
