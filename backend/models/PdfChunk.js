const mongoose = require('mongoose');

const pdfChunkSchema = new mongoose.Schema({
  pdf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pdf',
    required: true
  },
  chunkIndex: {
    type: Number,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  tokensApprox: {
    type: Number,
    default: 0
  },
  embedding: {
    type: [Number],
    default: [],
    index: false
  }
}, {
  timestamps: true
});

pdfChunkSchema.index({ pdf: 1, chunkIndex: 1 }, { unique: true });

module.exports = mongoose.model('PdfChunk', pdfChunkSchema);


