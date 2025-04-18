const mongoose = require('mongoose');

// Define the review schema
const ReviewSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, required: true  },
  reviewer_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  reviewed_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  text: { type: String, required: false },
  rating: { type: Number, required: true },
  type: {
    type: Number,
    enum: [1, 2],
    //1 = client 2 = accountant(not maid)
    required: true
  },
  registrationDate: { type: Date, default: Date.now , required: true}
});


module.exports = mongoose.model("Review", ReviewSchema)