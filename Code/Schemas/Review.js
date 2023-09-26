const mongoose = require('mongoose');

// Define the review schema
const ReviewSchema = new mongoose.Schema({
  reviewer_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  reviewed_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  text: { type: String, required: false },
  rating: { type: Number, required: true },
  type: {
    type: String,
    enum: ['client', 'accountant'],
    required: true
  },
  registrationDate: { type: Date, default: Date.now , required: true}
});


module.exports = mongoose.model("Reviews", ReviewSchema)