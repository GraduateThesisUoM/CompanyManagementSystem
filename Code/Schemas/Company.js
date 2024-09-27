// Schemas/Accountant.js

const mongoose = require('mongoose');

// Define the additional properties for the accountant schema
const CompanySchema = new mongoose.Schema({
  registrationDate: { type: Date, default: Date.now , required: true},
  name: { type: String, required: true },
  logo: { type: String, required: false ,default:"https://i.pinimg.com/originals/ec/d9/c2/ecd9c2e8ed0dbbc96ac472a965e4afda.jpg"},
  status: {
    type: Number,
    enum: [0, 1],
    //1 active
    //0 disabled
    default: 1
  },
  accountant: { type: String, required: false,default: 'not_assigned'},
  license: {
    used: { type: Number, default: 1 },
    bought: { type: Number, default: 1 },
    requested: { type: Number, default: 0 }
  },  
  signupcode: { type: String, required: true},
  autochangesignupcode:{type:Number, required: true,default:1}
});

// Export the model for the Accountant schema
module.exports = mongoose.model("Company", CompanySchema);
