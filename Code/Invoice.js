const mongoose = require('mongoose');

// Define the invoice schema
const InvoiceSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  senderID: { type: Number, required: true },
  receiverID: { type: Number, required: true },
  invoiceData: {
    type: Object,
    required: true,
    properties: {
      type: { type: String, required: true },
      paymentMethod: { type: String, required: true }
    }
  },
  date: { type: Date, required: true }
});

// Export the invoice schema
module.exports = InvoiceSchema;