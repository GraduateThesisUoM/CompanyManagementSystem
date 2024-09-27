const mongoose = require('mongoose');

// Define the report schema
const NodeShema = new mongoose.Schema({
  company_id: { type: mongoose.Schema.Types.ObjectId, required: true  },
  sender_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  receiver_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  type: {
    type: String,
    enum: ['relationship','response','request','node'],
    required: true,
    default:'node'
  },
  type2: {
    type: String,
    enum: ['hiring','firing','response','request1','request2','general'],
    required: true,
    default:'general'
  },
  text: { type: String},
  title: { type: String},
  due_date: { type: Date},
  next:{ type: mongoose.Schema.Types.ObjectId,required: false},
  status: {
    type: String,
    enum: ['viewed', 'executed', 'pending', 'rejected','canceled'],
    required: true,
    default: 'pending',
  },
  registrationDate: { type: Date, default: Date.now , required: true}
});


module.exports = mongoose.model("Node", NodeShema)