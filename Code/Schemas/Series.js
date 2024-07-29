const mongoose = require('mongoose');

// Define the transaction schema
const SeriesSchema = new mongoose.Schema({
    registrationDate: { type: Date, default: Date.now , required: true},
    companyID: { type: String, required: true },
    title: { type: String, required: true },
    active: {
        type: Number,
        enum: [0, 1],
        default: 1
      }
});

// Export the transaction schema
module.exports = mongoose.model("series", SeriesSchema)
