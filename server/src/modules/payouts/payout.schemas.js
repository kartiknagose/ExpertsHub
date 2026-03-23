const { body, query } = require('express-validator');

const updateBankDetailsSchema = [
  body('payoutMethod')
    .optional({ nullable: true })
    .isString().withMessage('payoutMethod must be text')
    .trim()
    .toUpperCase()
    .isIn(['BANK', 'UPI', 'LINKED_ACCOUNT'])
    .withMessage('payoutMethod must be BANK, UPI, or LINKED_ACCOUNT'),
  body('bankAccountNumber')
    .optional({ nullable: true })
    .isString().withMessage('Bank account number must be text')
    .trim()
    .custom((value) => {
      if (value === undefined || value === null || value === '') return true;
      const normalized = String(value || '').replace(/\s+/g, '');
      if (!/^\d{9,18}$/.test(normalized)) {
        throw new Error('Bank account number must be 9 to 18 digits.');
      }
      return true;
    }),
  body('bankIfsc')
    .optional({ nullable: true })
    .isString().withMessage('IFSC must be text')
    .trim()
    .toUpperCase()
    .custom((value) => {
      if (value === undefined || value === null || value === '') return true;
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(String(value))) {
        throw new Error('Invalid IFSC format.');
      }
      return true;
    }),
  body('upiId')
    .optional({ nullable: true })
    .isString().withMessage('UPI ID must be text')
    .trim()
    .custom((value) => {
      if (value === undefined || value === null || value === '') return true;
      if (!/^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/.test(String(value))) {
        throw new Error('Invalid UPI ID format.');
      }
      return true;
    }),
  body('razorpayAccountId')
    .optional({ nullable: true })
    .isString().withMessage('Razorpay account id must be text')
    .trim()
    .isLength({ min: 6, max: 64 }).withMessage('Razorpay account id is invalid')
    .matches(/^acc_[A-Za-z0-9]+$/).withMessage('Razorpay account id must start with acc_'),
  body().custom((payload) => {
    const method = String(payload?.payoutMethod || 'BANK').toUpperCase();

    if (method === 'BANK') {
      if (!payload?.bankAccountNumber || !payload?.bankIfsc) {
        throw new Error('bankAccountNumber and bankIfsc are required for BANK payout method.');
      }
    }

    if (method === 'UPI') {
      if (!payload?.upiId) {
        throw new Error('upiId is required for UPI payout method.');
      }
    }

    if (method === 'LINKED_ACCOUNT') {
      if (!payload?.razorpayAccountId) {
        throw new Error('razorpayAccountId is required for LINKED_ACCOUNT payout method.');
      }
    }

    return true;
  }),
];

const payoutHistoryQuerySchema = [
  query('skip')
    .optional()
    .isInt({ min: 0, max: 1000000 }).withMessage('Skip must be a non-negative integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),
];

module.exports = {
  updateBankDetailsSchema,
  payoutHistoryQuerySchema,
};
