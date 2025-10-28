const PdfChunk = require('../models/PdfChunk');
const { chunkText } = require('./ragChunking');
const { embedTexts } = require('./ragEmbeddings');

async function reindexPdf(pdfDoc, options = {}) {
  const { maxChars, minChars, overlapRatio } = options;

  // Remove old chunks
  await PdfChunk.deleteMany({ pdf: pdfDoc._id });

  // Chunk
  const chunks = chunkText(pdfDoc.content, { maxChars, minChars, overlapRatio });

  if (chunks.length === 0) return 0;

  // Embed
  const texts = chunks.map(c => c.text);
  const vectors = await embedTexts(texts);

  // Save
  const docs = chunks.map((c, i) => ({
    pdf: pdfDoc._id,
    chunkIndex: i,
    text: c.text,
    tokensApprox: c.tokensApprox,
    embedding: vectors[i]
  }));

  await PdfChunk.insertMany(docs);

  return docs.length;
}

module.exports = {
  reindexPdf
};


