const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: { type: String, required: true },
  role: { type: String, required: true },
  status: { type: String, enum: ['Applied', 'Interview', 'Offer', 'Rejected'], default: 'Applied' },
  date: { type: Date, default: Date.now },
  deadline: { type: Date },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
