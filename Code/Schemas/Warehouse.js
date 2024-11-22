const mongoose = require('mongoose');

// Define the transaction schema
const WarehouseSchema = new mongoose.Schema({
    registrationDate: { type: Date, default: Date.now , required: true},
    company: { type: mongoose.Schema.Types.ObjectId, required: true  },
    title: { type: String, required: true },
    location: { type: String, required: true },
    status: {
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
      default: 0
    }
});


// Export the transaction schema
module.exports = mongoose.model("Warehouse", WarehouseSchema)
