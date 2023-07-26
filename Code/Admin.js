const mongoose = require('mongoose');

// Define the admin schema
const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  registrationDate: { type: Date, default: Date.now }
});

// Create the admin model
const Admin = mongoose.model('Admin', AdminSchema);