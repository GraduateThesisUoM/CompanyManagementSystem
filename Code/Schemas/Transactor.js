
const mongoose = require('mongoose');

// Define the report schema
const TransactorSchema = new mongoose.Schema({
    code:{type: String, required: true, unique: true},
    name: { type: String, required: true },
    occupation: { type: String, required: true },
    address: { type: String, required: true },
    district: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    zip: { type: String, required: true },
    phone1: { type: String, required: true },
    phone2: { type: String, required: true },
    afm: {type: String, required: true, unique: true},
    type: { type: String, required: true },
    shipping_address: { type: String, required: true },
    shipping_district: { type: String, required: true },
    shipping_city: { type: String, required: true },
    shipping_country: { type: String, required: true },
    shipping_zip: { type: String, required: true }
  });


  module.exports = mongoose.model("Transactor", TransactorSchema)