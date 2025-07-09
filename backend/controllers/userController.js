const userService = require('../services/userService');
const { successResponse, errorResponse } = require('../utils/responseUtil');

// User registration controller
exports.registerUser = async (req, res) => {
  const { username, age, mode } = req.body;
  try {
    const user = await userService.registerUser({ username, age, mode });
    return successResponse(res, 201, 'User registered successfully', { user });
  } catch (err) {
    return errorResponse(res, 400, err.message);
  }
};
