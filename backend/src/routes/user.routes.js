const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { createUserValidator, updateUserValidator } = require('../validators/user.validators');
const validate = require('../middleware/validate.middleware');
const { ROLES } = require('../models/User.model');

// All routes require authentication
router.use(authenticate);

// GET /api/users/profile — own profile (all roles)
router.get('/profile', userController.getOwnProfile);

// PUT /api/users/profile — update own profile (all roles)
router.put('/profile', updateUserValidator, validate, userController.updateOwnProfile);

// GET /api/users — list all users (Admin + Manager)
router.get('/', authorize(ROLES.ADMIN, ROLES.MANAGER), userController.getUsers);

// POST /api/users — create user (Admin only)
router.post('/', authorize(ROLES.ADMIN), createUserValidator, validate, userController.createUser);

// GET /api/users/:id — get single user (Admin + Manager)
router.get('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), userController.getUserById);

// PUT /api/users/:id — update user (Admin + Manager, with restrictions)
router.put('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), updateUserValidator, validate, userController.updateUser);

// DELETE /api/users/:id — soft delete/deactivate (Admin only)
router.delete('/:id', authorize(ROLES.ADMIN), userController.deleteUser);

module.exports = router;
