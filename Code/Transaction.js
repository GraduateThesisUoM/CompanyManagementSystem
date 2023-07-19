const mongoose = require('mongoose');

// Define the transaction schema
const TransactionSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  clientID: { type: Number, required: true },
  accountantID: { type: Number, required: true },
  date: { type: Date, required: true },
  comment: { type: String, required: true }
});

// Export the transaction schema
module.exports = TransactionSchema;
