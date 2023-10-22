const mongoose = require('mongoose');

// Define the report schema
const RequestSchema = new mongoose.Schema({
  sender_id: { type: String, required: true },
  receiver_id: { type: String, required: true },
  type: {
    type: String,
    enum: ['something_1','something_2','something_3', 'other'],
    required: true
  },
  title: { type: String},
  text: { type: String},
  response: { type: String},
  status: {
    type: String,
    enum: ['viewed', 'executed', 'pending', 'rejected'],
    required: true,
    default: 'pending',
  },
  registrationDate: { type: Date, default: Date.now , required: true}
});


module.exports = mongoose.model("Request", RequestSchema)