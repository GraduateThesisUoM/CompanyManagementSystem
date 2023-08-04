// Schemas/Accountant.js

const mongoose = require('mongoose');
const User = require('./User');

// Define the additional properties for the accountant schema
const AccountantSchema = new mongoose.Schema({
  clients: [{ type: String}]
});

// Merge the Accountant schema with the User schema
const Accountant = User.discriminator('accountant', AccountantSchema);

// Export the model for the Accountant schema
module.exports = Accountant;