/*const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  registrationDate: { type: Date, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  companyName: { type: String, required: true },
  companyLogo: { type: String, required: true },
  mydataId: { type: Number, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  banned: { type: Boolean, default: false }
});

module.exports = mongoose.model("users", userSchema)*/

const mongoose = require('mongoose');

// Define the user schema
const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true }
});

// Create the user model
const User = mongoose.model('User', UserSchema);

module.exports = User;
