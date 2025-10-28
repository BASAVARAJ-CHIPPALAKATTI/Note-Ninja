const axios = require('axios');
const Pdf = require('../models/Pdf');
const PdfChunk = require('../models/PdfChunk');
const Assignment = require('../models/Assignment');
const { reindexPdf } = require('../services/ragIngest');

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
const GENERATION_MODEL = process.env.OLLAMA_MODEL || 'mistral';

function cosineSimilarity(a, b) {
  let dot = 0;
  let aMag = 0;
  let bMag = 0;
  for (let i = 0; i < a.length && i < b.length; i++) {
    dot += a[i] * b[i];
    aMag += a[i] * a[i];
    bMag += b[i] * b[i];
  }
  const denom = Math.sqrt(aMag) * Math.sqrt(bMag) || 1;
  return dot / denom;
}

async function embedQuery(query) {
  const payload = { model: process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text', prompt: query };
  const { data } = await axios.post(`${OLLAMA_HOST}/api/embeddings`, payload, { timeout: 30000 });
  return data.embedding;
}

async function ensureAccess(reqUser, pdfId) {
  const pdf = await Pdf.findById(pdfId);
  if (!pdf) throw new Error('PDF not found');

  if (reqUser.role === 'student') {
      const assignment = await Assignment.findOne({ student: reqUser.userId, pdf: pdfId });
      if (!assignment) throw new Error('Access to PDF denied');
  } else if (reqUser.role === 'teacher') {
      if (pdf.teacher.toString() !== reqUser.userId) throw new Error('Access to PDF denied');
  }
  return pdf;
}

exports.reindex = async (req, res) => {
  try {
    const { pdfId } = req.body;
    const pdf = await ensureAccess(req.user, pdfId);
    const count = await reindexPdf(pdf, {});
    res.json({ message: 'Reindexed', chunks: count });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.ask = async (req, res) => {
  try {
    const { pdfId, question, topK = 4 } = req.body;
    const pdf = await ensureAccess(req.user, pdfId);

    // 1) Embed query
    const qVec = await embedQuery(question);

    // 2) Retrieve candidate chunks (scoped to pdf)
    const candidates = await PdfChunk.find({ pdf: pdf._id }).select('text embedding chunkIndex').lean();
    if (candidates.length === 0) {
      return res.status(404).json({ error: 'No chunks indexed for this PDF' });
    }

    // 3) Rank by cosine similarity
    const scored = candidates.map(c => ({
      ...c,
      score: cosineSimilarity(qVec, c.embedding || [])
    })).sort((a, b) => b.score - a.score).slice(0, Math.max(1, Math.min(8, Number(topK))));

    // 4) Build grounded prompt with citations
    const context = scored.map((c, i) => `[#${i+1} | chunk ${c.chunkIndex}]\n${c.text}`).join('\n\n');
    const guardrail = `You are a helpful teaching assistant. Use ONLY the provided chunks to answer. If the answer is not present, reply exactly: "I cannot find the answer in the provided document." After the answer, list the citations as [#id].`;
    const prompt = `${guardrail}\n\nContext:\n${context}\n\nQuestion: ${question}\n\nAnswer:`;

    // 5) Generate
    const { data } = await axios.post(`${OLLAMA_HOST}/api/generate`, {
      model: GENERATION_MODEL,
      prompt,
      stream: false,
      options: { temperature: 0, num_predict: 200, top_k: 30, top_p: 0.9 }
    }, { timeout: 60000 });

    const answer = (data.response || '').trim();

    res.json({
      answer,
      citations: scored.map((c, i) => ({ id: i+1, chunkIndex: c.chunkIndex, score: c.score })),
      topK: scored.length,
      model: GENERATION_MODEL,
      method: 'rag'
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


