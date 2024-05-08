const mongoose = require('mongoose');

// Define the transaction schema
const ItemSchema = new mongoose.Schema({
    registrationDate: { type: Date, default: Date.now , required: true},
    companyID: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    active: {
        type: Number,
        enum: [0, 1],
        default: 1
      },
      price_r: { type: Number, required: true,default: 0 },
      price_w: { type: Number, required: true,default: 0 },
      discount_r: { type: Number, required: true,default: 0 },
      discount_w: { type: Number, required: true,default: 0 },
});


// Export the transaction schema
module.exports = mongoose.model("item", ItemSchema)
