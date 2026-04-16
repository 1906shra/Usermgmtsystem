const authService = require('../services/auth.service');
const { User, ROLES } = require('../models/User.model');

/* ── Login ── */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json({ success: true, message: 'Login successful.', data: result });
  } catch (error) { next(error); }
};

/* ── Public self-registration — always creates 'user' role ── */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already exists.' });
    }

    await User.create({ name, email, password, role: ROLES.USER, status: 'active' });

    // Auto-login after registration
    const result = await authService.login(email, password);
    res.status(201).json({ success: true, message: 'Account created successfully.', data: result });
  } catch (error) { next(error); }
};

/* ── Admin register — creates account with specified role (requires auth) ── */
const adminRegister = async (req, res, next) => {
  try {
    const { name, email, password, role, status } = req.body;
    const createdBy = req.user._id;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already exists.' });
    }

    // Only admin can create admin accounts; managers can only create user/manager
    const allowedRole = role || ROLES.USER;
    if (req.user.role === ROLES.MANAGER && allowedRole === ROLES.ADMIN) {
      return res.status(403).json({ success: false, message: 'Managers cannot create admin accounts.' });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role: allowedRole,
      status: status || 'active',
      createdBy,
      updatedBy: createdBy,
    });

    // Return the created user (no auto-login — admin stays logged in)
    const userObj = await User.findById(newUser._id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    res.status(201).json({
      success: true,
      message: `Account created for ${name}.`,
      data: { user: userObj },
    });
  } catch (error) { next(error); }
};

/* ── Refresh token ── */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshAccessToken(refreshToken);
    res.status(200).json({ success: true, message: 'Token refreshed.', data: tokens });
  } catch (error) { next(error); }
};

/* ── Logout ── */
const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user._id);
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error) { next(error); }
};

/* ── Get current user ── */
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: { user: req.user } });
  } catch (error) { next(error); }
};

module.exports = { login, register, adminRegister, refreshToken, logout, getMe };
