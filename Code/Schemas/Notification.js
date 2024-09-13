const mongoose = require('mongoose');

// Define the report schema
const NotificationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  relevant_user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  company_id: {type: mongoose.Schema.Types.ObjectId, required: true },
  relevant_company_id: {type: mongoose.Schema.Types.ObjectId, required: true },
  type: { type: String, required: true },
  status: {
    type: String,
    enum: ['unread','canceled','read'],
    required: true,
    default:'other'
  },
  registrationDate: { type: Date, default: Date.now , required: true},
});


module.exports = mongoose.model("Notification", NotificationSchema);