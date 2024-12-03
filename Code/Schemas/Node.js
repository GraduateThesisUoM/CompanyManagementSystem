const mongoose = require('mongoose');

// Define the report schema
const NodeShema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, required: true  },
  sender_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  receiver_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  type: {
    type: Number,
    enum: [1,2,3,4,5,6],
    /*1=relationship,
      2=response,
      3=request,
      4=node,
      5=warehouse,
      6 =time table*/
    required: true,
    default:4
  },
  type2: {
    type: Number,
    enum: [1,2,3,4,5,6,7,8],
    //1=hiring,2=firing,3=response,4=request,6=node,7=shell,8=buy
    required: true,
    default:6
  },
  text: { type: String},
  title: { type: String},
  due_date: { type: Date},
  next:{ type: String,required: true, default:"-"},
  status: {
    type: Number,
    enum: [1,2,3,4,5,6],
    //1='viewed,2 =executed, 3=pending, 4=rejected, 5 =canceled , 6=temp
    required: true,
    default: 3,
  },
  registrationDate: { type: Date, default: Date.now , required: true},
  data:{type: mongoose.Schema.Types.Mixed}
});


module.exports = mongoose.model("Node", NodeShema)