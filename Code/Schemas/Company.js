// Schemas/Accountant.js

const mongoose = require('mongoose');

// Define the additional properties for the accountant schema
const CompanySchema = new mongoose.Schema({
  registrationDate: { type: Date, default: Date.now , required: true},
  name: { type: String, required: true },
  logo: { type: String, required: true ,default:"https://img.icons8.com/dotty/100/FFFFFF/magento.png"},
  status: {
    type: Number,
    enum: [0, 1],
    //1 active
    //0 disabled
    default: 1
  },
  license: {
    used: { type: Number, default: 1 },
    bought: { type: Number, default: 1 },
    requested: { type: Number, default: 0 }
  },  
  signupcode: { type: String, required: true,default:1},
  autochangesignupcode:{type:Number, required: true,default:1}
});

// Export the model for the Accountant schema
module.exports = mongoose.model("Company", CompanySchema);
