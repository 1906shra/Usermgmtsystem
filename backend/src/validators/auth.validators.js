const { body } = require('express-validator');

const loginValidator = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required.'),
];

const refreshTokenValidator = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required.'),
];

module.exports = { loginValidator, refreshTokenValidator };
