const mongoose = require('mongoose');

// Define the transaction schema
const SeriesSchema = new mongoose.Schema({
    registrationDate: { type: Date, default: Date.now , required: true},
    companyID: { type: String, required: true },
    title: { type: String, required: true },
    acronym: { type: String, required: true },
    count: { type: Number, required: true ,default:0},
    sealed : {
      type: Number,
      enum: [0, 1],
      default: 0},
      effects_warehouse :{
      type: Number,
      enum: [0, 1],
      default: 0},
    type : { type: Number, required: true },
    //buy = 1,sale=2
    status: {
      type: Number,
      enum: [0, 1, 2],
      //1 active
      //0 disabled
      //2 deleted
      default: 1
    }
});

// Export the transaction schema
module.exports = mongoose.model("Series", SeriesSchema)
