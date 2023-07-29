// getUserByEmail.js
const User = require('./User');


const getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email });
    return user;
  } catch (error) {
    console.error('Error retrieving user:', error.message);
    throw error;
  }
};

module.exports = getUserByEmail;


