
const mongoose = require('mongoose');

// Define the report schema
const TransactorSchema = new mongoose.Schema({
    code:{type: String, required: true},
    name: { type: String, required: true },
    occupation: { type: String, default: " "},
    address: { type: String, default: " "},
    district: { type: String, default: " "},
    city: { type: String, default: " "},
    country: { type: String, default: " "},
    zip: { type: String, default: " "},
    phone1: { type: String, default: " "},
    phone2: { type: String, default: " "},
    afm: {type: String, required: true},
    type: { type: String, default: " "},
    shipping_address: { type: String, default: " "},
    shipping_district: { type: String, default: " "},
    shipping_city: { type: String, default: " "},
    shipping_country: { type: String, default: " "},
    shipping_zip: { type: String, default: " "}
  });


  module.exports = mongoose.model("Transactor", TransactorSchema)