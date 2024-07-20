const mongoose = require('mongoose');

// Define the invoice schema
const DocumentSchema = new mongoose.Schema({
  companyID: { type: Number, required: true },
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
  registrationDate: { type: Date, default: Date.now }
});

// Export the invoice schema
module.exports = DocumentSchema;