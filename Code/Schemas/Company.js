// Schemas/Accountant.js

const mongoose = require('mongoose');

// Define the additional properties for the accountant schema
const CompanySchema = new mongoose.Schema({
  registrationDate: { type: Date, default: Date.now , required: true},
  name: { type: String, required: true },
  logo: { type: String, required: false },
  status: {
      type: String,
      enum: ['active', 'disabled'],
      default: 'active'
  },
  companyaccountant: {
    id: { type: String, required: false,default: 'not_assigned'},
    status: {
      type: String,
      enum: ['assigned', 'pending', 'not_assigned','self_accountant','rejected'],
      default: 'not_assigned'
    },
  },
  users_num: { type: Number, required: true,default:1 },
  license_num: { type: Number, required: true,default:1 },
  signupcode: { type: String, required: true},
  autochangesignupcode:{type:Number, required: true,default:1}
});

// Export the model for the Accountant schema
module.exports = mongoose.model("Company", CompanySchema);
