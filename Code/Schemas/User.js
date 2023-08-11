const mongoose = require('mongoose');

// Define the user schema
const UserSchema = new mongoose.Schema({
  registrationDate: { type: Date, default: Date.now , required: true},
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  banned: { type: Boolean, required: true, default: false },


  afm: { type: String, required: false },
  mydatakey: { type: String, required: false },
  companyName: { type: String, required: false },
  companyLogo: { type: String, required: false },

  resetPasswordToken: { type: String, required: false},
  resetPasswordExpires: { type: Date, required: false}, 

  type: {
    type: String,
    enum: ['user', 'accountant', 'self-accountant', 'admin'],
    required: true,
  }

});



module.exports = mongoose.model("users", UserSchema)

