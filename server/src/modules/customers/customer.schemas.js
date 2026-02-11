const { body } = require('express-validator');

// Validate customer profile setup (address + optional profile photo URL)
const customerProfileSchema = [
  body('line1')
    .notEmpty().withMessage('Address line 1 is required')
    .isLength({ min: 3, max: 200 }).withMessage('Address line 1 must be between 3 and 200 characters'),
  body('line2')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 200 }).withMessage('Address line 2 must be under 200 characters'),
  body('city')
    .notEmpty().withMessage('City is required')
    .isLength({ min: 2, max: 100 }).withMessage('City must be between 2 and 100 characters'),
  body('state')
    .notEmpty().withMessage('State is required')
    .isLength({ min: 2, max: 100 }).withMessage('State must be between 2 and 100 characters'),
  body('postalCode')
    .notEmpty().withMessage('Postal code is required')
    .isLength({ min: 3, max: 20 }).withMessage('Postal code must be between 3 and 20 characters'),
  body('country')
    .notEmpty().withMessage('Country is required')
    .isLength({ min: 2, max: 100 }).withMessage('Country must be between 2 and 100 characters'),
  body('profilePhotoUrl')
    .optional({ nullable: true, checkFalsy: true })
    .isURL().withMessage('Profile photo must be a valid URL'),
];

module.exports = { customerProfileSchema };
