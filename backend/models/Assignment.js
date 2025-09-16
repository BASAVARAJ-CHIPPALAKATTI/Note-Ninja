const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pdf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pdf',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate assignments
assignmentSchema.index({ student: 1, pdf: 1 }, { unique: true });

module.exports = mongoose.model('Assignment', assignmentSchema);