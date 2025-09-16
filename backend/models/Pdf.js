const mongoose = require('mongoose');

const pdfSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileSize: {
    type: Number,
    default: 0
  },
  pageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
pdfSchema.index({ teacher: 1, createdAt: -1 });
pdfSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Pdf', pdfSchema);