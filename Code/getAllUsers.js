// getAllUsers.js
const User = require('./Schemas/User');


const getAllUsers = async () => {
  try {
    const users = await User.find();
    return users;
  } catch (error) {
    console.error('Error retrieving users:', error.message);
    throw error;
  }
};

module.exports = getAllUsers;