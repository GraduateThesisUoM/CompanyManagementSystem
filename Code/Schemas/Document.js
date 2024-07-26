const mongoose = require('mongoose');

// Define the invoice schema
const DocumentSchema = new mongoose.Schema({
  company: { type: String, required: true },
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  type: {
    type: String,
    enum: ['buy', 'sale'],
    required: true
  },
  generalDiscount: { type: Number, required: true },

  invoiceData: {
    type: [{
      item: { type: String, required: true },
      quantity: { type: Number, required: true }
    }],
    required: true
  },
  registrationDate: { type: Date, default: Date.now }
});

// Export the invoice schema
module.exports = mongoose.model("document", DocumentSchema)
