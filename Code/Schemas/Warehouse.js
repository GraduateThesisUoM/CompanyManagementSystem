const mongoose = require('mongoose');

// Define the transaction schema
const WarehouseSchema = new mongoose.Schema({
    registrationDate: { type: Date, default: Date.now , required: true},
    id: { type: Number, required: true },
    companyID: { type: Number, required: true },
    title: { type: String, required: true },
    location: { type: String, required: true },
    active: {
        type: Number,
        enum: [0, 1],
        default: 1
      },
      full: {
        type: Number,
        enum: [0, 1],
        default: 1
      }
});


// Export the transaction schema
module.exports = mongoose.model("warehouse", WarehouseSchema)
