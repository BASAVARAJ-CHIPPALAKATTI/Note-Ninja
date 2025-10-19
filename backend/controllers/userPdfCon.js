const pdfParse = require('pdf-parse');
const axios = require('axios');

const OLLAMA_HOST =  'http://127.0.0.1:11434';
const MODEL = 'mistral';

// Add this function to handle temporary PDF processing
// In userPdfCon.js
exports.askTemporaryPdfQuestion = async (req, res) => {
  console.log('📨 Request received at:', new Date().toISOString());
  console.log('📄 PDF name:', req.body.pdfName);
  console.log('❓ Question:', req.body.question);
  console.log('📊 PDF content length:', req.body.pdfContent?.length);
  
  try {
    const { pdfContent, pdfName, question } = req.body;

    if (!pdfContent || !question) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ message: 'PDF content and question are required' });
    }

    console.log('🔍 Converting base64 to buffer...');
    const pdfBuffer = Buffer.from(pdfContent, 'base64');
    console.log('📦 Buffer size:', pdfBuffer.length, 'bytes');

    console.log('📖 Extracting text from PDF...');
    const pdfData = await pdfParse(pdfBuffer);
    const pdfText = pdfData.text;
    console.log('📝 Extracted text length:', pdfText.length, 'characters');

    if (!pdfText || pdfText.trim().length === 0) {
      console.log('❌ No text extracted from PDF');
      return res.status(400).json({ message: 'Could not extract text from PDF' });
    }

    console.log('🤖 Preparing prompt for LLM...');
    const prompt = `
    PDF Document: ${pdfName}
    PDF Content: ${pdfText.substring(0, 4000)}... [truncated]
    
    Question: ${question}
    
    Please answer the question based on the PDF content above. If the answer cannot be found in the PDF, say "I couldn't find this information in the document."
    `;

    console.log('🚀 Calling Ollama API...');
    console.log('🌐 Ollama URL:', process.env.OLLAMA_URL || 'http://127.0.0.1:11434');
    console.log('🤖 Model:', process.env.OLLAMA_MODEL || 'llama2');

    const response = await axios.post(`${process.env.OLLAMA_URL || 'http://127.0.0.1:11434'}/api/generate`, {
      model: process.env.OLLAMA_MODEL || 'llama2',
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.1,
        top_p: 0.9,
      }
    });

    console.log('✅ AI response received');
    console.log('📋 Response length:', response.data.response.length, 'characters');

    res.json({
      answer: response.data.response,
      context: 'temporary-pdf',
      pdfName: pdfName
    });

  } catch (error) {
    console.error('💥 Error details:');
    console.error('📛 Error name:', error.name);
    console.error('📜 Error message:', error.message);
    console.error('🔗 Error code:', error.code);
    console.error('📡 Is network error?', error.isAxiosError);
    
    if (error.response) {
      console.error('📊 Response status:', error.response.status);
      console.error('📄 Response data:', error.response.data);
    }
    
    res.status(500).json({ 
      message: 'Error processing your question',
      error: error.message 
    });
  }
};

// --- Add these helper functions (reuse from your existing code) ---

// Context Extraction (paragraph-based)
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