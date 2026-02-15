import axios from './axios';

/**
 * TRIGGER SOS ALERT
 * @param {Object} data - { bookingId, location: { latitude, longitude } }
 */
export const triggerSOS = async (data) => {
    const response = await axios.post('/safety/sos', data);
    return response.data;
};

/**
 * GET EMERGENCY CONTACTS
 */
export const getEmergencyContacts = async () => {
    const response = await axios.get('/safety/contacts');
    return response.data;
};

/**
 * ADD EMERGENCY CONTACT
 * @param {Object} data - { name, phone, relation }
 */
export const addEmergencyContact = async (data) => {
    const response = await axios.post('/safety/contacts', data);
    return response.data;
};

/**
 * DELETE EMERGENCY CONTACT
 * @param {number} contactId
 */
export const deleteEmergencyContact = async (contactId) => {
    const response = await axios.delete(`/safety/contacts/${contactId}`);
    return response.data;
};
