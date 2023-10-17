const mongoose = require('mongoose');

// Define the report schema
const ReportSchema = new mongoose.Schema({
  sender_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  receiver_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  type: {
    type: String,
    enum: ['something_1','something_2','something_3', 'other'],
    required: true
  },
  title: { type: String},
  text: { type: String},
  status: {
    type: String,
    enum: ['viewed', 'executed', 'pending', 'rejected'],
    required: true
  },
  due_date: { type: String},
  registrationDate: { type: Date, default: Date.now , required: true}
});


module.exports = mongoose.model("Report", ReportSchema)