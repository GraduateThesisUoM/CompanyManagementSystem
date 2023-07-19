const mongoose = require('mongoose');

// Define the accountant schema
const AccountantSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  registrationDate: { type: Date, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  mydataId: { type: Number, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  banned: { type: Boolean, default: false }
});

// Create the accountant model
const Accountant = mongoose.model('Accountant', AccountantSchema);

module.exports = Accountant;
