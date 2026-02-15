const prisma = require('../../config/prisma');

// Create or update customer profile (address + optional profile photo)
async function upsertCustomerProfile(userId, { line1, line2, city, state, postalCode, country, profilePhotoUrl }) {
  return prisma.$transaction(async (tx) => {
    const existingAddress = await tx.address.findFirst({ where: { userId } });

    const addressData = {
      line1,
      line2: line2 || null,
      city,
      state,
      postalCode,
      country,
      user: { connect: { id: userId } },
    };

    let address;
    if (existingAddress) {
      address = await tx.address.update({ where: { id: existingAddress.id }, data: addressData });
    } else {
      address = await tx.address.create({ data: addressData });
    }

    await tx.user.update({
      where: { id: userId },
      data: {
        profilePhotoUrl: profilePhotoUrl || undefined,
        isProfileComplete: true,
      },
    });

    return address;
  });
}

async function getCustomerProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      profilePhotoUrl: true,
      emailVerified: true,
      isProfileComplete: true,
      addresses: true,
    },
  });

  return user;
}

module.exports = { upsertCustomerProfile, getCustomerProfile };
