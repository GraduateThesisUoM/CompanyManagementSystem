const mongoose = require('mongoose');

// Define the report schema
const RequestSchema = new mongoose.Schema({
  company_id: { type: String, required: true },
  sender_id: { type: String, required: true },
  receiver_id: { type: String, required: true },
  type: {
    type: String,
    enum: ['hiring','firing','something_1','something_2','something_2','something_3', 'other'],
    required: true,
    default:'other'
  },
  title: { type: String},
  text: { type: String},
  canseled:{ type: String},
  due_date: { type: String},
  response: { type: String},
  response_date: { type: Date },
  status: {
    type: String,
    enum: ['viewed', 'executed', 'pending', 'rejected','canceled'],
    required: true,
    default: 'pending',
  },
  registrationDate: { type: Date, default: Date.now , required: true}
});


module.exports = mongoose.model("Request", RequestSchema)