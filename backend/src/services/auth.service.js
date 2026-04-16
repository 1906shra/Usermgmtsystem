const { User } = require('../models/User.model');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt.utils');

/**
 * Login user with email and password
 */
const login = async (email, password) => {
  // Find user with password field (normally excluded)
  const user = await User.findOne({ email }).select('+password +refreshToken');

  if (!user) {
    throw { statusCode: 401, message: 'Invalid email or password.' };
  }

  if (user.status === 'inactive') {
    throw { statusCode: 403, message: 'Account is deactivated. Please contact an administrator.' };
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw { statusCode: 401, message: 'Invalid email or password.' };
  }

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  // Store refresh token hash in DB
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return {
    accessToken,
    refreshToken,
    user: user.toJSON(),
  };
};

/**
 * Refresh access token using refresh token
 */
const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw { statusCode: 401, message: 'Refresh token required.' };
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw { statusCode: 401, message: 'Invalid or expired refresh token.' };
  }

  const user = await User.findById(decoded.id).select('+refreshToken');

  if (!user || user.refreshToken !== refreshToken) {
    throw { statusCode: 401, message: 'Invalid refresh token.' };
  }

  if (user.status === 'inactive') {
    throw { statusCode: 403, message: 'Account is deactivated.' };
  }

  const newAccessToken = generateAccessToken(user._id, user.role);
  const newRefreshToken = generateRefreshToken(user._id);

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

/**
 * Logout — clear refresh token
 */
const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

module.exports = { login, refreshAccessToken, logout };
