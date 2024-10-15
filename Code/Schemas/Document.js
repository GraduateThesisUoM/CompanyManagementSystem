const mongoose = require('mongoose');

// Define the invoice schema
const DocumentSchema = new mongoose.Schema({
  company: { type: String, required: true },
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  type: { type: String, required: true },
  generalDiscount: { type: Number, required: true },
  series: { type: String, required: true },
  doc_num:{ type: Number, required: true },
  sealed : {
    type: Number,
    enum: [0, 1],
    default: 0},
  invoiceData: {
    type: mongoose.Schema.Types.Mixed
  },
  active: {
    type: Number,
    enum: [0, 1, 2],
    //1 active
    //0 disabled
    //2 delete
    //3 baned
    default: 1
  },
  registrationDate: { type: Date, default: Date.now }
});

// Export the invoice schema
module.exports = mongoose.model("document", DocumentSchema)
