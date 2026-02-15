const asyncHandler = require('../../common/utils/asyncHandler');
const safetyService = require('./safety.service');

const triggerSOS = asyncHandler(async (req, res) => {
    const { bookingId, location } = req.body;
    const userId = req.user.id;

    if (!bookingId) {
        res.status(400);
        throw new Error('Booking ID is required to trigger SOS.');
    }

    const result = await safetyService.triggerSOS(userId, parseInt(bookingId), location);

    res.status(201).json(result);
});

const getContacts = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const contacts = await safetyService.getEmergencyContacts(userId);
    res.status(200).json({ contacts });
});

const addContact = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const contact = await safetyService.addEmergencyContact(userId, req.body);
    res.status(201).json({ message: 'Emergency contact added', contact });
});

const deleteContact = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const contactId = parseInt(req.params.id);
    await safetyService.deleteEmergencyContact(userId, contactId);
    res.status(200).json({ message: 'Emergency contact removed' });
});

module.exports = {
    triggerSOS,
    getContacts,
    addContact,
    deleteContact
};
