// Development-only Mock Store to track messages sent via SMS/WhatsApp
// In a production environment with paid services, this may not be needed, 
// but since the user requires a FREE version, we log the messages here 
// so the UI can retrieve and display them like a simulated phone.

const messageMockStore = {
    messages: [],
    add: (type, to, message) => {
        const entry = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            type, // 'SMS' or 'WHATSAPP'
            to,
            message,
            status: 'DELIVERED',
            timestamp: new Date().toISOString()
        };
        messageMockStore.messages.unshift(entry);

        // Keep only the last 100 messages in memory to prevent memory leaks
        if (messageMockStore.messages.length > 100) {
            messageMockStore.messages.pop();
        }
        return entry;
    },
    getAll: () => messageMockStore.messages,
    getByPhone: (phone) => messageMockStore.messages.filter(m => m.to === phone)
};

module.exports = messageMockStore;
