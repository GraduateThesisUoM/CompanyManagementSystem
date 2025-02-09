const mongoose = require('mongoose');

// Define the report schema
const PayRollShema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, required: true  },
  user: { type: mongoose.Schema.Types.ObjectId, required: true },
  accountant_id: { type: mongoose.Schema.Types.ObjectId, required: false },
  month : {
    type : Number,
    required : true,
    default : 1
  },
  year : {
    type : Number,
    required : true,
    default : 1
  },
  salary : { type: mongoose.Schema.Types.ObjectId, required: true  },
  extra : {
    type : Number,
    required : false,
    default : 0
  },
  registrationDate: { type: Date, default: Date.now , required: true}
});


module.exports = mongoose.model("PayRoll", PayRollShema)