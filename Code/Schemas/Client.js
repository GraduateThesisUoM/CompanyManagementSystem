const mongoose = require('mongoose');
const User = require('./User');

// Define the additional properties for the accountant schema
const ClientSchema = new mongoose.Schema({
  myaccountant: {
    id: { type: String, required: false,default: 'not_assigned'},
    status: {
      type: String,
      enum: ['assigned', 'pending', 'not_assigned','self_accountant','rejected'],
      default: 'not_assigned'
    },
  },
  company : {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    default: null
  },
  companyOwned : {
    type: Number,
    enum: [0,1],
    required: true,
    default: 0
  }
});

// Merge the Accountant schema with the User schema
const Client = User.discriminator('client', ClientSchema);

// Export the model for the Accountant schema
module.exports = Client;
