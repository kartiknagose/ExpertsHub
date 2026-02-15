const prisma = require('../../config/prisma');

// Create or update a worker profile for the current user (idempotent)
async function upsertWorkerProfile(userId, { bio, hourlyRate, skills, serviceAreas, profilePhotoUrl }) {
  // Store skills and serviceAreas as JSON arrays for flexibility
  const data = {
    bio: bio ?? null,
    hourlyRate: hourlyRate ?? null, // allow null; validate number in controller before
    skills: skills ?? null,
    serviceAreas: serviceAreas ?? null,
    user: { connect: { id: userId } },
  };

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId }, select: { role: true } });
    // If profile exists -> update, else -> create
    const existing = await tx.workerProfile.findUnique({ where: { userId } });
    let profile;

    if (existing) {
      profile = await tx.workerProfile.update({ where: { userId }, data });
    } else {
      profile = await tx.workerProfile.create({ data });
    }

    const nextRole = user?.role === 'ADMIN' ? 'ADMIN' : 'WORKER';
    await tx.user.update({
      where: { id: userId },
      data: {
        role: nextRole,
        profilePhotoUrl: profilePhotoUrl || undefined,
        isProfileComplete: true,
      },
    });

    return profile;
  });
}

// Get the current user's worker profile (if any)
async function getMyWorkerProfile(userId) {
  return prisma.workerProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          profilePhotoUrl: true,
          emailVerified: true,
          isProfileComplete: true,
        },
      },
    },
  });
}

// Add a service to the worker's offered services
async function addWorkerService(userId, serviceId) {
  // 1. Get worker profile
  const workerProfile = await prisma.workerProfile.findUnique({
    where: { userId },
  });

  if (!workerProfile) {
    throw new Error('Worker profile not found. Please create your profile first.');
  }

  // 2. Check if service exists
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service) {
    throw new Error('Service not found');
  }

  // 3. Check if association already exists
  const existing = await prisma.workerService.findUnique({
    where: {
      workerId_serviceId: {
        workerId: workerProfile.id,
        serviceId: serviceId,
      },
    },
  });

  if (existing) {
    throw new Error('You are already offering this service');
  }

  // 4. Create the association
  return prisma.workerService.create({
    data: {
      workerId: workerProfile.id,
      serviceId: serviceId,
    },
    include: {
      service: true, // Include service details in response
    },
  });
}

// Get all services a worker offers (my services)
async function getMyWorkerServices(userId) {
  const workerProfile = await prisma.workerProfile.findUnique({
    where: { userId },
  });

  if (!workerProfile) {
    throw new Error('Worker profile not found');
  }

  return prisma.workerService.findMany({
    where: { workerId: workerProfile.id },
    include: {
      service: true,
    },
  });
}

// Get all services offered by a specific worker (public endpoint)
async function getWorkerServicesById(workerId) {
  // workerId here is the profile ID, not user ID
  return prisma.workerService.findMany({
    where: { workerId },
    include: {
      service: true,
    },
  });
}

// Remove a service from worker's offered services
async function removeWorkerService(userId, serviceId) {
  // 1. Get worker profile
  const workerProfile = await prisma.workerProfile.findUnique({
    where: { userId },
  });

  if (!workerProfile) {
    throw new Error('Worker profile not found');
  }

  // 2. Check if association exists
  const existing = await prisma.workerService.findUnique({
    where: {
      workerId_serviceId: {
        workerId: workerProfile.id,
        serviceId: serviceId,
      },
    },
  });

  if (!existing) {
    throw new Error('You are not offering this service');
  }

  // 3. Delete the association
  return prisma.workerService.delete({
    where: {
      workerId_serviceId: {
        workerId: workerProfile.id,
        serviceId: serviceId,
      },
    },
  });
}

module.exports = {
  upsertWorkerProfile,
  getMyWorkerProfile,
  addWorkerService,
  getMyWorkerServices,
  getWorkerServicesById,
  removeWorkerService,
};