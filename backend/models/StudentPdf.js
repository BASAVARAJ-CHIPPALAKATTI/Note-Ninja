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

const Assignment = mongoose.model('Assignment', assignmentSchema);

// Static methods
Assignment.assign = async function(studentId, pdfId, teacherId) {
  try {
    const assignment = await this.create({
      student: studentId,
      pdf: pdfId,
      assignedBy: teacherId
    });
    return assignment;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('PDF already assigned to this student');
    }
    throw error;
  }
};

Assignment.hasAccess = async function(studentId, pdfId) {
  const assignment = await this.findOne({
    student: studentId,
    pdf: pdfId
  });
  return assignment !== null;
};

module.exports = Assignment;