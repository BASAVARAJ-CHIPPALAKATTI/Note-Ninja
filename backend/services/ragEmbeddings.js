const axios = require('axios');

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
const EMBEDDING_MODEL = process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text';

async function embedTexts(texts) {
  // Batch embed via Ollama /api/embeddings (one-by-one loop for stability)
  const vectors = [];
  for (const text of texts) {
    const payload = {
      model: EMBEDDING_MODEL,
      prompt: text
    };
    const { data } = await axios.post(`${OLLAMA_HOST}/api/embeddings`, payload, { timeout: 60000 });
    if (!data || !data.embedding) {
      throw new Error('Embedding API returned invalid response');
    }
    vectors.push(data.embedding);
  }
  return vectors;
}

module.exports = {
  embedTexts
};


