const mongoose = require('mongoose');

// Define the report schema
const NodeShema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, required: true  },
  user: { type: mongoose.Schema.Types.ObjectId, required: true },
  amount: {
    type: Number,
    required: true
  },
  next:{ type: String,required: true, default:"-"},
  registrationDate: { type: Date, default: Date.now , required: true}
});


module.exports = mongoose.model("Salary", NodeShema)