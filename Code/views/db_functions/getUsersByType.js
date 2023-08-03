// getUserByEmail.js
const User = require('./Schemas/User');


const getUsersByType = async (type) => {
  try {
    const type = {type};
    const all = await User.find(type)
  } catch (error) {
    console.error('Error retrieving users:', error.message);
    throw error;
  }
};

module.exports = getUsersByType;