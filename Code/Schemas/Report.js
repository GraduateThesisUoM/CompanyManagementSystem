const mongoose = require('mongoose');

// Define the report schema
const ReportSchema = new mongoose.Schema({
  reporter_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  reported_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  reason: { type: String, required: true },
  text: { type: String, required: true },
  status: {type: String, required: true},
  registrationDate: { type: Date, default: Date.now , required: true}
});


module.exports = mongoose.model("Report", ReportSchema)