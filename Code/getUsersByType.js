// getUsersByType.js
const User = require('./Schemas/User');


const getUsersByType = async () => {
  try {
    const users = await User.find();
    return users;
  } catch (error) {
    console.error('Error retrieving users:', error.message);
    throw error;
  }
};

module.exports = getUsersByType;