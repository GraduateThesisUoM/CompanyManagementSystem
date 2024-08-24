const mongoose = require('mongoose');

// Define the transaction schema
const WarehouseSchema = new mongoose.Schema({
    registrationDate: { type: Date, default: Date.now , required: true},
    companyID: { type: String, required: true },
    title: { type: String, required: true },
    location: { type: String, required: true },
    active: {
      type: Number,
      enum: [0, 1, 2],
      //1 active
      //0 disabled
      //2 delete
      //3 baned
      default: 1
    },
    full: {
      type: Number,
      enum: [0, 1],
      default: 1
    }
});


// Export the transaction schema
module.exports = mongoose.model("warehouses", WarehouseSchema)
