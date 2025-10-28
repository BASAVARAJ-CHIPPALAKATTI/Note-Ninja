function splitIntoParagraphs(text) {
  const paras = text.split(/\n\s*\n+/).map(p => p.trim()).filter(Boolean);
  return paras;
}

function tokenizeRough(text) {
  // Rough token estimate: 1 token ≈ 4 chars, clamp >= 1
  return Math.max(1, Math.ceil(text.length / 4));
}

function chunkParagraphs(paragraphs, opts = {}) {
  const {
    maxChars = 1200,
    minChars = 400,
    overlapRatio = 0.1
  } = opts;

  const chunks = [];
  let current = '';

  const pushCurrent = () => {
    if (!current) return;
    const clean = current.trim();
    if (clean.length === 0) return;
    chunks.push(clean);
    current = '';
  };

  for (const para of paragraphs) {
    if (para.length > maxChars) {
      // Split long paragraph into sentences and pack
      const sents = para.split(/(?<=[.!?])\s+/);
      for (const s of sents) {
        if ((current + ' ' + s).trim().length > maxChars) {
          if (current.length >= minChars) {
            pushCurrent();
          }
          if (s.length > maxChars) {
            // hard split overly long sentence
            for (let i = 0; i < s.length; i += maxChars) {
              const slice = s.slice(i, i + maxChars);
              chunks.push(slice);
            }
          } else {
            current = s;
          }
        } else {
          current = (current ? current + ' ' : '') + s;
        }
      }
      continue;
    }

    if ((current + '\n\n' + para).trim().length > maxChars) {
      if (current.length >= minChars) {
        pushCurrent();
        // overlap tail of previous chunk
        const overlapChars = Math.floor(maxChars * overlapRatio);
        const tail = para.slice(0, overlapChars);
        current = tail;
      } else {
        // if current too small, append anyway up to max
        current = (current ? current + '\n\n' : '') + para;
        pushCurrent();
      }
    } else {
      current = (current ? current + '\n\n' : '') + para;
    }
  }

  pushCurrent();
  return chunks.map(text => ({ text, tokensApprox: tokenizeRough(text) }));
}

function chunkText(text, options = {}) {
  const paragraphs = splitIntoParagraphs(text);
  return chunkParagraphs(paragraphs, options);
}

module.exports = {
  chunkText,
  tokenizeRough
};


