const { User, ROLES } = require('../models/User.model');

/**
 * Get paginated, searchable, filterable list of users
 */
const getUsers = async ({ page = 1, limit = 10, search = '', role = '', status = '', requestingUser }) => {
  const query = {};

  // Search by name or email
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  // Filter by role
  if (role) query.role = role;

  // Filter by status
  if (status) query.status = status;

  // Managers cannot see admin users
  if (requestingUser.role === ROLES.MANAGER) {
    query.role = { $ne: ROLES.ADMIN };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    User.find(query)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(query),
  ]);

  return {
    users,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

/**
 * Get single user by ID
 */
const getUserById = async (id, requestingUser) => {
  const user = await User.findById(id)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!user) {
    throw { statusCode: 404, message: 'User not found.' };
  }

  // Managers cannot view admin users
  if (requestingUser.role === ROLES.MANAGER && user.role === ROLES.ADMIN) {
    throw { statusCode: 403, message: 'You do not have permission to view this user.' };
  }

  return user;
};

/**
 * Create a new user (Admin only)
 */
const createUser = async (userData, createdBy) => {
  const { name, email, password, role, status } = userData;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw { statusCode: 409, message: 'Email already exists.' };
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || ROLES.USER,
    status: status || 'active',
    createdBy: createdBy._id,
    updatedBy: createdBy._id,
  });

  return User.findById(user._id)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');
};

/**
 * Update user (Admin: any field; Manager: non-admin users, limited fields; User: own profile)
 */
const updateUser = async (id, updateData, requestingUser) => {
  const user = await User.findById(id);

  if (!user) {
    throw { statusCode: 404, message: 'User not found.' };
  }

  const { role: requestingRole, _id: requestingId } = requestingUser;

  // Regular user can only update their own profile
  if (requestingRole === ROLES.USER) {
    if (id !== requestingId.toString()) {
      throw { statusCode: 403, message: 'You can only update your own profile.' };
    }
    // Users cannot change their own role
    delete updateData.role;
    delete updateData.status;
  }

  // Manager cannot update admin users or change roles
  if (requestingRole === ROLES.MANAGER) {
    if (user.role === ROLES.ADMIN) {
      throw { statusCode: 403, message: 'You cannot update admin users.' };
    }
    // Managers cannot change roles
    delete updateData.role;
  }

  // Apply updates
  const allowedFields = ['name', 'email', 'password', 'role', 'status'];
  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      user[field] = updateData[field];
    }
  });

  user.updatedBy = requestingId;

  await user.save();

  return User.findById(user._id)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');
};

/**
 * Soft delete / deactivate user (Admin only)
 */
const deleteUser = async (id, requestingUser) => {
  if (id === requestingUser._id.toString()) {
    throw { statusCode: 400, message: 'You cannot delete your own account.' };
  }

  const user = await User.findById(id);
  if (!user) {
    throw { statusCode: 404, message: 'User not found.' };
  }

  user.status = 'inactive';
  user.updatedBy = requestingUser._id;
  await user.save();

  return user;
};

/**
 * Get own profile
 */
const getOwnProfile = async (userId) => {
  const user = await User.findById(userId)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!user) {
    throw { statusCode: 404, message: 'User not found.' };
  }

  return user;
};

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser, getOwnProfile };
