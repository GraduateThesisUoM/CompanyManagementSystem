const mongoose = require('mongoose');

// Define the invoice schema
const DocumentSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, required: true  },
  sender: { type: String, required: true },
  receiver: { type: String, required: false },
  type:{
    type: Number,
    enum: [1,2,3],
    //1=sale,2=buy,3=warehouse
    required: true
  },
  generalDiscount: { type: Number, required: true },
  series: { type: String, required: true },
  doc_num:{ type: Number, required: true },
  retail_wholesale : {type: Number,enum: [0,1,2,3],default:2},
  //0=nothing 1 = retail 2 = wholesale
  warehouse : { type: String , default:"-"},//warehouse ID
  sealed : {type: Number,enum: [0, 1],default: 0},
  invoiceData: {
    type: mongoose.Schema.Types.Mixed
  },
  status: {
    type: Number,
    enum: [0, 1, 2],
    //1 active
    //0 disabled
    //2 deleted
    default: 1
  },
  registrationDate: { type: Date, default: Date.now },
  next:{ type: String,required: true, default:"-"},
  edited :{type: Number, default:0}
  });

// Export the invoice schema
module.exports = mongoose.model("Document", DocumentSchema)
