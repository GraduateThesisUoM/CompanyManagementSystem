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
        type: Number,
        enum: [1,2],
        //1=sale,2=buy
        required: true
      },
      registrationDate: { type: Date, default: Date.now , required: true},
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      phone2: { type: String, default: " "},
      afm: { type: String, required: false },
      address: { type: String, default: " "},
      district: { type: String, default: " "},
      city: { type: String, default: " "},
      country: { type: String, default: " "},
      zip: { type: String, default: " "},
      shipping_address: { type: String, default: " "},
      shipping_district: { type: String, default: " "},
      shipping_city: { type: String, default: " "},
      shipping_country: { type: String, default: " "},
      shipping_zip: { type: String, default: " "},
      status: {
        type: Number,
        enum: [0, 1, 2],
        //1 active
        //0 disabled
        //2 deleted
        default: 1
      }
    });

module.exports = mongoose.model("Person", PersonSchema)