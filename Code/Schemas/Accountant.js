// Schemas/Accountant.js

const mongoose = require('mongoose');
const User = require('./User');

// Define the additional properties for the accountant schema
const AccountantSchema = new mongoose.Schema({
  clients: [{
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'rejected', 'canceled'],
      default: 'pending'
    }
  }]
});

// Merge the Accountant schema with the User schema
const Accountant = User.discriminator('accountant', AccountantSchema);

// Export the model for the Accountant schema
module.exports = Accountant;
