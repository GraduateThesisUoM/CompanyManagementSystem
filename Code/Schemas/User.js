const mongoose = require('mongoose');

// Define the user schema
const UserSchema = new mongoose.Schema({
  registrationDate: { type: Date, default: Date.now , required: true},
  //last_log_out: { type: Date, default: Date.now , required: true},
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  status: {
    type: Number,
    enum: [0, 1, 2, 3],
    //1 active
    //0 disabled
    //2 deleted
    //3 banned
    default: 1
  },


  afm: { type: String, required: false },
  mydatakey: { type: String, required: false },

  resetPasswordToken: { type: String, required: false},
  resetPasswordExpires: { type: Date, required: false}, 

  type: {
    type: String,
    enum: ['user', 'accountant', 'admin'],
    required: true,
  }

});



module.exports = mongoose.model("User", UserSchema)

