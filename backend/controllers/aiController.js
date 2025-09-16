const Pdf = require('../models/Pdf');
const Assignment = require('../models/Assignment');
const axios = require('axios');

const OLLAMA_HOST = 'http://127.0.0.1:11434';
const MODEL = 'mistral';

// 🚀 Warm up Ollama once at server start
(async () => {
  try {
    console.log("🔄 Warming up Ollama model...");
    await axios.post(`${OLLAMA_HOST}/api/generate`, {
      model: MODEL,
      prompt: "Hello",
      stream: false,
      options: { num_predict: 5 }
    }, { timeout: 60000 });
    console.log("✅ Ollama model ready!");
  } catch (err) {
    console.warn("⚠️ Ollama warm-up failed:", err.message);
  }
})();

exports.askPdfQuestion = async (req, res) => {
  try {
    const { pdfId, question } = req.body;
    console.log('🤖 AI processing question:', question);

    // --- PDF Lookup ---
    const pdf = await Pdf.findById(pdfId);
    if (!pdf) return res.status(404).json({ error: 'PDF not found' });

    // --- Access control ---
    if (req.user.role === 'student') {
      const assignment = await Assignment.findOne({
        student: req.user.userId,
        pdf: pdfId
      });
      if (!assignment) {
        return res.status(403).json({ error: 'Access to PDF denied' });
      }
    }
    if (req.user.role === 'teacher' && pdf.teacher.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Access to PDF denied' });
    }

    // --- Context Extraction ---
    const relevantContent = extractRelevantContent(pdf.content, question);
    console.log('📄 Using content length:', relevantContent.length, 'characters');

    const prompt = `You are a teaching assistant. 
Use ONLY the following document content to answer the question.
If the answer is not present, reply exactly: "I cannot find the answer in the provided document."

Content:
${relevantContent}

Question: ${question}

Answer in clear and simple terms:`;

    console.log('🤖 Sending to AI...');

    // --- Timeout with AbortController ---
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 40000); // 40s max

    let response;
    try {
      response = await axios.post(`${OLLAMA_HOST}/api/generate`, {
        model: MODEL,
        prompt,
        stream: false,
        options: {
          temperature: 0,
          num_predict: 100, // concise but informative
          top_k: 20,
          top_p: 0.8
        }
      }, { signal: controller.signal });

      clearTimeout(timeout);
    } catch (error) {
      clearTimeout(timeout);

      if (error.name === 'CanceledError') {
        console.error("⚠️ Ollama request timed out, using fallback...");
        const keywordAnswer = keywordSearchFallback(pdf.content, question);
        return res.json({
          answer: keywordAnswer,
          method: 'keyword-fallback',
          note: 'AI was too slow, fallback used'
        });
      }

      if (error.code === 'ECONNREFUSED') {
        return res.status(503).json({
          error: 'AI service is not running',
          solution: 'Start Ollama with: ollama serve'
        });
      }

      throw error;
    }

    console.log('✅ AI response received');
    res.json({
      answer: response.data.response.trim(),
      model: MODEL,
      method: 'ai-search'
    });

  } catch (error) {
    console.error('AI Error:', error.message);
    res.status(500).json({
      error: 'Failed to process your question',
      details: error.message
    });
  }
};

// --- Context Extraction (paragraph-based) ---
function extractRelevantContent(fullContent, question) {
  // Split by paragraph instead of sentence
  const paragraphs = fullContent.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);

  const keywords = question.toLowerCase().split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['what', 'mean', 'by', 'the', 'this', 'that', 'which'].includes(word));

  // Score paragraphs by keyword presence
  let scored = [];
  for (const para of paragraphs) {
    let score = 0;
    const lower = para.toLowerCase();
    for (const k of keywords) {
      if (lower.includes(k)) score += 2;
    }
    if (score > 0) scored.push({ para, score });
  }

  const topParas = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(x => x.para);

  let result = topParas.join("\n\n");
  if (result.length > 1500) result = result.substring(0, 1500) + "...";
  return result;
}

// --- Fallback (stricter) ---
function keywordSearchFallback(content, question) {
  const paragraphs = content.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);
  const keywords = question.toLowerCase().split(/\s+/).filter(w => w.length > 3);

  let matches = [];
  for (const para of paragraphs) {
    const lower = para.toLowerCase();
    if (keywords.some(k => lower.includes(k))) {
      matches.push(para);
    }
  }

  if (matches.length === 0) {
    return "I couldn't find specific information about this in the document.";
  }

  return "Based on the document: " + matches.slice(0, 1).join(" ");
}
