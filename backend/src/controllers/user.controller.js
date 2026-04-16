const userService = require('../services/user.service');

const getUsers = async (req, res, next) => {
  try {
    const { page, limit, search, role, status } = req.query;
    const result = await userService.getUsers({
      page,
      limit,
      search,
      role,
      status,
      requestingUser: req.user,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id, req.user);

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body, req.user);

    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body, req.user);

    res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id, req.user);

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

const getOwnProfile = async (req, res, next) => {
  try {
    const user = await userService.getOwnProfile(req.user._id);

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

const updateOwnProfile = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.user._id.toString(), req.body, req.user);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser, getOwnProfile, updateOwnProfile };
