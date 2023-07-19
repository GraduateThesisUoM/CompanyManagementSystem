const mongoose = require('mongoose');

// Define the self accountant schema
const SelfAccountantSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  registrationDate: { type: Date, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  companyName: { type: String, required: true },
  companyLogo: { type: String, required: true },
  mydataId: { type: Number, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  banned: { type: Boolean, default: false },
  invoices: [{
    id: { type: Number, required: true },
    date: { type: Date, required: true },
    customerName: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, required: true }
  }]
});

// Create the self accountant model
const SelfAccountant = mongoose.model('SelfAccountant', SelfAccountantSchema);