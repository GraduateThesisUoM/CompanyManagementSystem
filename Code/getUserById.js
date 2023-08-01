const mongoose = require('mongoose');
const User = require('./Schemas/User');

const getUserById = async (id) => {
  try {
    // Check if the provided id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid user ID format');
    }

    // Use findById with the ObjectId to search for the user
    const user = await User.findById(id);
    return user;
  } catch (error) {
    console.error('Error retrieving user:', error.message);
    throw error;
  }
};

module.exports = getUserById;