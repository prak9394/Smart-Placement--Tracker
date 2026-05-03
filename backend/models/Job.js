const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  role: { type: String, required: true },
  cgpaRequired: { type: Number, default: 0 },
  maxBacklogs: { type: Number, default: 0 },
  allowedBranches: { type: [String], default: [] },
  requiredSkills: { type: [String], default: [] },
  deadline: { type: Date, required: false }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
