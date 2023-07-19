const mongoose = require('mongoose');

// Define the admin schema
const AdminSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  registrationDate: { type: Date, required: true }
});

// Create the admin model
const Admin = mongoose.model('Admin', AdminSchema);