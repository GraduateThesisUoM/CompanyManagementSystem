const mongoose = require('mongoose');

// Define the transaction schema
const SeriesSchema = new mongoose.Schema({
    registrationDate: { type: Date, default: Date.now , required: true},
    companyID: { type: String, required: true },
    title: { type: String, required: true },
    acronym: { type: String, required: true },
    type : { type: String, required: true },
    count: { type: Number, required: true ,default:0},
    sealed : {
      type: Number,
      enum: [0, 1],
      default: 0},
    active: {
      type: Number,
      enum: [0, 1, 2],
      //1 active
      //0 disabled
      //2 delete
      default: 1
    }
});

// Export the transaction schema
module.exports = mongoose.model("series", SeriesSchema)
