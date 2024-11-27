const mongoose = require('mongoose');

// Define the report schema
const NodeShema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, required: true  },
  sender_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  receiver_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  root:{
    type: Number,
    required: true,
    enum: [0,1],
    default : 1
    //1 = root 0 = not root
  },
  type: {
    type: String,
    enum: ['relationship','response','request',4,5],
    //1=relationship,2=response,3=request,4=node,5=warehouse
    required: true,
    default:'node'
  },
  type2: {
    type: String,
    enum: ['hiring','firing','response','request1','request2','general',7,8],
    //1=hiring,2=firing,3=response,4=request1,5=request2,6=general,7=shell,8=buy
    required: true,
    default:'general'
  },
  text: { type: String},
  title: { type: String},
  due_date: { type: Date},
  next:{ type: String,required: true, default:"-"},
  status: {
    type: String,
    enum: ['viewed', 'executed', 'pending', 'rejected','canceled'],
    required: true,
    default: 'pending',
  },
  registrationDate: { type: Date, default: Date.now , required: true},
  data:{type: mongoose.Schema.Types.Mixed}
});


module.exports = mongoose.model("Node", NodeShema)