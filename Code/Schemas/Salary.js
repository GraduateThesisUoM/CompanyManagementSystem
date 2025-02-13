const mongoose = require('mongoose');

// Define the report schema
const NodeShema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, required: true  },
  user: { type: mongoose.Schema.Types.ObjectId, required: true },
  amount: {
    type: Number,
    required: true,
    default : 0
  },
  deductions : {
    type : Number,
    required : false,
    default : 0
  },
  next:{ type: String,required: true, default:"-"},
  registrationDate: { type: Date, default: Date.now , required: true}
});


module.exports = mongoose.model("Salary", NodeShema)