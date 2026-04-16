const { body } = require('express-validator');

const createUserValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters.'),
  body('email')
    .isEmail().withMessage('Please provide a valid email.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'user']).withMessage('Role must be admin, manager, or user.'),
  body('status')
    .optional()
    .isIn(['active', 'inactive']).withMessage('Status must be active or inactive.'),
];

const updateUserValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters.'),
  body('email')
    .optional()
    .isEmail().withMessage('Please provide a valid email.')
    .normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'user']).withMessage('Role must be admin, manager, or user.'),
  body('status')
    .optional()
    .isIn(['active', 'inactive']).withMessage('Status must be active or inactive.'),
];

module.exports = { createUserValidator, updateUserValidator };
