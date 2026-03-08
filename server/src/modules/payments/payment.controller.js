const asyncHandler = require('../../common/utils/asyncHandler');
const parsePagination = require('../../common/utils/parsePagination');
const { listMyPayments, listAllPayments } = require('./payment.service');

exports.listMine = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { data: payments, total } = await listMyPayments(req.user.id, req.user.role, { skip, limit });
  res.json({ payments, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

exports.listAll = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { data: payments, total } = await listAllPayments({ skip, limit });
  res.json({ payments, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

const crypto = require('crypto');
const bookingService = require('../bookings/booking.service');

exports.razorpayWebhook = asyncHandler(async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'xxxxxxxxxxxxxx';
  const signature = req.headers['x-razorpay-signature'];
  const bodyString = JSON.stringify(req.body);
  const expectedSignature = crypto.createHmac('sha256', secret).update(bodyString).digest('hex');

  // To prevent the webhook from crashing if the signature mismatch, we simply log and return 400
  if (expectedSignature !== signature) {
    console.warn('Razorpay Webhook: Invalid signature', { expectedSignature, signature });
    return res.status(400).send('Invalid signature');
  }

  const event = req.body;
  if (event.event === 'order.paid' || event.event === 'payment.captured') {
    const paymentEntity = event.payload.payment.entity;
    const bookingId = paymentEntity.notes?.bookingId;

    if (bookingId) {
      try {
        await bookingService.payBooking(
          Number(bookingId),
          null, // Webhook has no user ID
          'WEBHOOK',
          { paymentReference: paymentEntity.id, isWebhook: true }
        );
      } catch (err) {
        if (!err.message.includes('already paid')) {
          console.error('Razorpay Webhook payBooking error:', err.message);
        }
      }
    }
  }

  res.status(200).send('OK');
});
