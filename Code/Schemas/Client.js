const mongoose = require('mongoose');
const User = require('./User');

// Define the additional properties for the Client schema
const ClientSchema = new mongoose.Schema({
  company : {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    default: null
  },
  companyOwner : {
    type: Number,
    enum: [0,1],
    required: true,
    default: 0
  }
});

// Merge the Client schema with the User schema
const Client = User.discriminator('client', ClientSchema);

// Export the model for the Client schema
module.exports = Client;
