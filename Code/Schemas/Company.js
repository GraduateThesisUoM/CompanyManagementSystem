// Schemas/Accountant.js

const mongoose = require('mongoose');

// Define the additional properties for the accountant schema
const CompanySchema = new mongoose.Schema({
  registrationDate: { type: Date, default: Date.now , required: true},
  companyName: { type: String, required: true },
  companyLogo: { type: String, required: false },
  status: {
      type: String,
      enum: ['active', 'disabled'],
      default: 'active'
  },
  userslicense: { type: Number, required: true,default:1 },
  signupcode: { type: String, required: true},
  autochangesignupcode:{type:Number, required: true,default:1}
});

// Export the model for the Accountant schema
module.exports = mongoose.model("Company", CompanySchema);
