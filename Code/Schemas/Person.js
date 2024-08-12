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
      active: {
        type: Number,
        enum: [0, 1, 2],
        //1 active
        //0 disabled
        //2 delete
        default: 1
      }
    });

module.exports = mongoose.model("persons", PersonSchema)