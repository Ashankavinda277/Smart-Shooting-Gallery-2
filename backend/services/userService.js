// User service - contains business logic for user operations
const User = require('../models/User');

/**
 * Register a new user
 * @param {Object} userData - User data (username, age, mode)
 * @returns {Object} The created user
 */
const registerUser = async (userData) => {
  try {
    const user = new User(userData);
    await user.save();
    return user;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  registerUser
};
