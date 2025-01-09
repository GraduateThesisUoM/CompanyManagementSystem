const mongoose = require('mongoose');

// Define the additional properties for the Client schema
const AttendanceSchema = new mongoose.Schema({
  company : {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  user : {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  registrationDate: { type: Date, default: Date.now , required: true},
  clock_out: {
    type: Date,
    required: false
  }
});


module.exports = mongoose.model("Attendance", AttendanceSchema)
