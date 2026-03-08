const Razorpay = require('razorpay');
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_xxxxxxxx';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'xxxxxxxxxxxxxx';
const razorpay = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });

// Create Razorpay order for booking
async function createRazorpayOrder(bookingId, amount, currency = 'INR') {
  const options = {
    amount: Math.round(amount * 100), // Razorpay expects paise
    currency,
    receipt: `booking_${bookingId}`,
    notes: { bookingId },
    payment_capture: 1,
  };
  const order = await razorpay.orders.create(options);
  return order;
}
const prisma = require('../../config/prisma');

async function listMyPayments(userId, role, { skip = 0, limit = 20 } = {}) {
  const where =
    role === 'WORKER'
      ? { booking: { workerProfile: { userId } } }
      : { customerId: userId };

  const [data, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        booking: {
          include: { service: { select: { id: true, name: true, category: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.payment.count({ where }),
  ]);
  return { data, total };
}

async function listAllPayments({ skip = 0, limit = 20 } = {}) {
  const [data, total] = await Promise.all([
    prisma.payment.findMany({
      include: {
        booking: {
          include: { service: { select: { id: true, name: true, category: true } } },
        },
        customer: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.payment.count(),
  ]);
  return { data, total };
}

module.exports = {
  listMyPayments,
  listAllPayments,
  createRazorpayOrder,
};
