const mongoose = require('mongoose');

// Define the transaction schema
const SeriesSchema = new mongoose.Schema({
    registrationDate: { type: Date, default: Date.now , required: true},
    company: { type: mongoose.Schema.Types.ObjectId, required: true  },
    title: { type: String, required: true },
    acronym: { type: String, required: true },
    count: { type: Number, required: true ,default:0},
    sealed : {
      type: Number,
      enum: [0, 1],
      default: 0},
    effects_warehouse :{type: Number,enum: [0, 1],default: 0},
    credit : {type: Number,enum: [0,1],default:0},
    debit : {type: Number,enum: [0,1],default:0},
    type : { type: Number, required: true },
    //buy = 2,sale=1
    status: {
      type: Number,
      enum: [0, 1, 2],
      //1 active
      //0 disabled
      //2 deleted
      default: 1
    },
    transforms : {type: Number,enum: [0,1],default:0},
    transforms_to: [{ type: mongoose.Schema.Types.ObjectId }] // Array of Series IDs
});

// Export the transaction schema
module.exports = mongoose.model("Series", SeriesSchema)
