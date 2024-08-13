// Schemas/Accountant.js

const mongoose = require('mongoose');

// Define the additional properties for the accountant schema
const PersonSchema = new mongoose.Schema({
    company : {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        default: null
      },
      type:{
        type: String,
        enum: ['sale', 'buy'],
        required: true
      },
      registrationDate: { type: Date, default: Date.now , required: true},
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      afm: { type: String, required: false },
      account_status : {
        type: String,
        enum: ['active', 'baned', 'deleted'],
        required: true,
        default: 'active'
      }
    });

module.exports = mongoose.model("persons", PersonSchema)