const mongoose = require('mongoose');

// Define the review schema
const ReviewSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  senderID: { type: Number, required: true },
  receiverID: { type: Number, required: true },
  text: { type: String, required: true },
  rating: { type: Number, required: true },
  date: { type: Date, required: true }
});

// Export the review schema
module.exports = ReviewSchema;