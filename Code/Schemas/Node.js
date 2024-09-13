const mongoose = require('mongoose');

// Define the report schema
const NodeShema = new mongoose.Schema({
  company_id: { type: String, required: true },
  sender_id: { type: String, required: true },
  receiver_id: { type: String, required: true },
  type: {
    type: String,
    enum: ['relationship','response','request','node'],
    required: true,
    default:'node'
  },
  type2: {
    type: String,
    enum: ['hiring','firing','response','request1','request2','other'],
    required: true,
    default:'other'
  },
  text: { type: String},
  next:{ type: String,default:'-'},
  due_date: { type: String},
  status: {
    type: String,
    enum: ['viewed', 'executed', 'pending', 'rejected','canceled','temp'],
    required: true,
    default: 'pending',
  },
  registrationDate: { type: Date, default: Date.now , required: true}
});


module.exports = mongoose.model("Node", NodeShema)