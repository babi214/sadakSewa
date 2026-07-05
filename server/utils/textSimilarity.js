const tokenize = (s) =>
  String(s)
    .toLowerCase()
    .split(/[^\w\u0900-\u097F]+/)
    .filter(Boolean);

const termFreq = (tokens) => {
  const freq = {};
  for (const t of tokens) freq[t] = (freq[t] || 0) + 1;
  return freq;
};

const cosineSimilarity = (a, b) => {
  const freqA = termFreq(tokenize(a));
  const freqB = termFreq(tokenize(b));
  const vocab = new Set([...Object.keys(freqA), ...Object.keys(freqB)]);

  let dot = 0, magA = 0, magB = 0;
  for (const w of vocab) {
    const fa = freqA[w] || 0;
    const fb = freqB[w] || 0;
    dot += fa * fb;
    magA += fa * fa;
    magB += fb * fb;
  }

  return magA && magB ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
};

module.exports = { cosineSimilarity };
