const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { loginValidator, refreshTokenValidator } = require('../validators/auth.validators');
const { createUserValidator } = require('../validators/user.validators');
const validate = require('../middleware/validate.middleware');
const { ROLES } = require('../models/User.model');

// POST /api/auth/login — public
router.post('/login', loginValidator, validate, authController.login);

// POST /api/auth/register — public self-registration (always creates 'user' role)
router.post('/register', createUserValidator, validate, authController.register);

// POST /api/auth/admin-register — admin/manager creates account with any role (requires auth)
router.post('/admin-register', authenticate, authorize(ROLES.ADMIN, ROLES.MANAGER), createUserValidator, validate, authController.adminRegister);

// POST /api/auth/refresh — public
router.post('/refresh', refreshTokenValidator, validate, authController.refreshToken);

// POST /api/auth/logout — protected
router.post('/logout', authenticate, authController.logout);

// GET /api/auth/me — protected
router.get('/me', authenticate, authController.getMe);

module.exports = router;
