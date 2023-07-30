const mongoose = require('mongoose');

// Define the user schema
const UserSchema = new mongoose.Schema({
  registrationDate: { type: Date, default: Date.now },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  afm: { type: String, required: true },
  mydatakey: { type: String, required: true },
  companyName: { type: String, required: true },
  companyLogo: { type: String, required: true },
  banned: { type: Boolean, default: false },

  resetPasswordToken: { type: String},
  resetPasswordExpires: { type: Date},
});

module.exports = mongoose.model("users", UserSchema)

