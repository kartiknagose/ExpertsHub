const prisma = require('../../config/prisma');
const AppError = require('../../common/errors/AppError');
const { getIo } = require('../../socket');
const notificationService = require('../notifications/notification.service');

/**
 * Get or create a conversation for a booking
 */
async function getOrCreateConversation(bookingId, userId, role) {
    const booking = await prisma.booking.findUnique({
        where: { id: Number(bookingId) },
        include: {
            workerProfile: true
        }
    });

    if (!booking) throw new AppError(404, 'Booking not found');
    if (!booking.workerProfileId) throw new AppError(400, 'No worker assigned to this booking yet');

    const workerUserId = booking.workerProfile.userId;
    const customerId = booking.customerId;

    // Check if user is part of this booking
    if (role === 'CUSTOMER' && userId !== customerId) throw new AppError(403, 'Unauthorized');
    if (role === 'WORKER' && userId !== workerUserId) throw new AppError(403, 'Unauthorized');

    let conversation = await prisma.conversation.findUnique({
        where: { bookingId: Number(bookingId) }
    });

    if (!conversation) {
        conversation = await prisma.conversation.create({
            data: {
                bookingId: Number(bookingId),
                customerId,
                workerUserId
            }
        });
    }

    return conversation;
}

/**
 * Send a message
 */
async function sendMessage(conversationId, senderId, { content, type = 'TEXT', mediaUrl, fileName, fileSize }) {
    const conversation = await prisma.conversation.findUnique({
        where: { id: Number(conversationId) }
    });

    if (!conversation) throw new AppError(404, 'Conversation not found');
    if (conversation.customerId !== senderId && conversation.workerUserId !== senderId) {
        throw new AppError(403, 'Unauthorized to send message in this conversation');
    }

    const messageData = {
        conversationId: Number(conversationId),
        senderId,
        type
    };

    if (content) messageData.content = content;
    if (mediaUrl) messageData.mediaUrl = mediaUrl;
    if (fileName) messageData.fileName = fileName;
    if (fileSize) messageData.fileSize = fileSize;

    const message = await prisma.message.create({
        data: messageData,
        include: {
            sender: { select: { id: true, name: true, profilePhotoUrl: true } }
        }
    });

    // Update lastMessageAt
    await prisma.conversation.update({
        where: { id: Number(conversationId) },
        data: { lastMessageAt: new Date() }
    });

    // Emit to socket (non-critical — message is already persisted)
    try {
        const io = getIo();
        io.to(`user:${conversation.customerId}`).emit('chat:message', message);
        io.to(`user:${conversation.workerUserId}`).emit('chat:message', message);
    } catch (_err) {
        console.warn('Socket.IO not available for chat notification');
    }

    // Create persistent notification for the recipient (non-blocking)
    const recipientId = conversation.customerId === senderId ? conversation.workerUserId : conversation.customerId;
    notificationService.createNotification({
        userId: recipientId,
        type: 'CHAT_MESSAGE',
        title: `New message from ${message.sender.name}`,
        message: content.length > 50 ? content.substring(0, 47) + '...' : content,
        data: { conversationId: conversation.id, bookingId: conversation.bookingId }
    }).catch((err) => console.error('Failed to create chat notification:', err.message));

    return message;
}

/**
 * Get messages for a conversation
 */
async function getMessages(conversationId, userId, { skip = 0, limit = 50 } = {}) {
    const conversation = await prisma.conversation.findUnique({
        where: { id: Number(conversationId) }
    });

    if (!conversation) throw new AppError(404, 'Conversation not found');
    if (conversation.customerId !== userId && conversation.workerUserId !== userId) {
        throw new AppError(403, 'Unauthorized');
    }

    const where = { conversationId: Number(conversationId) };
    const [data, total] = await Promise.all([
        prisma.message.findMany({
            where,
            orderBy: { createdAt: 'asc' },
            include: {
                sender: { select: { id: true, name: true, profilePhotoUrl: true } }
            },
            skip,
            take: limit,
        }),
        prisma.message.count({ where }),
    ]);
    return { data, total };
}

/**
 * Get user conversations
 */
async function getUserConversations(userId, { skip = 0, limit = 20 } = {}) {
    const where = {
        OR: [
            { customerId: userId },
            { workerUserId: userId }
        ]
    };
    const [data, total] = await Promise.all([
        prisma.conversation.findMany({
            where,
            include: {
                customer: { select: { id: true, name: true, profilePhotoUrl: true } },
                worker: { select: { id: true, name: true, profilePhotoUrl: true } },
                booking: {
                    include: {
                        service: { select: { name: true } }
                    }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { lastMessageAt: 'desc' },
            skip,
            take: limit,
        }),
        prisma.conversation.count({ where }),
    ]);
    return { data, total };
}

module.exports = {
    getOrCreateConversation,
    sendMessage,
    getMessages,
    getUserConversations
};
