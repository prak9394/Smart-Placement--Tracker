const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cgpa: { type: Number, default: null },
  backlogs: { type: Number, default: 0 },
  branch: { type: String, default: '' },
  year: { type: Number, default: null },
  skills: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
