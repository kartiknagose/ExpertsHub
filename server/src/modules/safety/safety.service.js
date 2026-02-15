const prisma = require('../../config/prisma');

/**
 * TRIGGER SOS ALERT
 * Creates an SOS alert record in the database.
 * In a real-world app, this would also:
 * 1. Send SMS to emergency contacts
 * 2. Push notification to Admin dashboard via WebSockets
 * 3. Send GPS location if available
 */
async function triggerSOS(userId, bookingId, location) {
    // 1. Verify user is part of the booking
    const booking = await prisma.booking.findFirst({
        where: {
            id: bookingId,
            OR: [
                { customerId: userId },
                { workerProfile: { userId: userId } }
            ]
        }
    });

    if (!booking) {
        throw new Error('Booking not found or you are not authorized to trigger SOS for this job.');
    }

    // 2. Create SOS Alert
    const sosAlert = await prisma.sOSAlert.create({
        data: {
            bookingId,
            triggeredBy: userId,
            latitude: location?.latitude,
            longitude: location?.longitude,
            status: 'ACTIVE'
        }
    });

    // 3. Fetch emergency contacts for the user
    const contacts = await prisma.emergencyContact.findMany({
        where: { userId }
    });

    // 4. Return alert details (in reality, background tasks would handle SMS/Nofitications)
    return {
        sosAlert,
        message: `SOS triggered! ${contacts.length} emergency contacts would be notified in production.`,
        contactsNotified: contacts.map(c => ({ name: c.name, phone: c.phone }))
    };
}

/**
 * ADD EMERGENCY CONTACT
 */
async function addEmergencyContact(userId, contactData) {
    return await prisma.emergencyContact.create({
        data: {
            userId,
            name: contactData.name,
            phone: contactData.phone,
            relation: contactData.relation
        }
    });
}

/**
 * GET EMERGENCY CONTACTS
 */
async function getEmergencyContacts(userId) {
    return await prisma.emergencyContact.findMany({
        where: { userId }
    });
}

/**
 * DELETE EMERGENCY CONTACT
 */
async function deleteEmergencyContact(userId, contactId) {
    const contact = await prisma.emergencyContact.findFirst({
        where: { id: contactId, userId }
    });

    if (!contact) {
        throw new Error('Contact not found or authorized.');
    }

    return await prisma.emergencyContact.delete({
        where: { id: contactId }
    });
}

module.exports = {
    triggerSOS,
    addEmergencyContact,
    getEmergencyContacts,
    deleteEmergencyContact
};
