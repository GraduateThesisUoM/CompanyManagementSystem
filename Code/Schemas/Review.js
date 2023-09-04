const mongoose = require('mongoose');

// Define the review schema
const ReviewSchema = new mongoose.Schema({
  senderID: { type: mongoose.Schema.Types.ObjectId, required: true },
  receiverID: { type: mongoose.Schema.Types.ObjectId, required: true },
  text: { type: String, required: false },
  rating: { type: Number, required: true },
  registrationDate: { type: Date, default: Date.now , required: true}
});


module.exports = mongoose.model("Reviews", ReviewSchema)