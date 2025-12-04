import * as ort from 'onnxruntime-web';
import offlineFaq from '../data/offlineFaq';

let sessionPromise;

const ensureModel = () => {
  if (!sessionPromise) {
    sessionPromise = ort.InferenceSession.create('/models/mobilebert-qa.onnx', {
      executionProviders: ['wasm'],
    });
  }
  return sessionPromise;
};

const normalize = (text) => text.toLowerCase().normalize('NFKD').replace(/[^\w\s]/g, '');

const fallbackAnswer = (question, language = 'fr') => {
  const cleaned = normalize(question);
  let best = offlineFaq[0];
  let score = 0;
  offlineFaq.forEach((faq) => {
    const tokens = normalize(faq.question).split(' ');
    const matched = tokens.filter((token) => cleaned.includes(token)).length;
    if (matched > score) {
      best = faq;
      score = matched;
    }
  });

  const text = language === 'ar' ? best.answerAr : best.answerFr;
  return {
    message: text,
    recommendations: [{ id: best.serviceId, title: best.question }],
    source: score > 0 ? 'knowledge-base' : 'default',
  };
};

export const getAIResponse = async (question, { language = 'fr', offline = false } = {}) => {
  if (!question) {
    return { message: '', recommendations: [] };
  }

  if (offline) {
    return fallbackAnswer(question, language);
  }

  try {
    // Attempt to run the lightweight ONNX model.
    // NOTE: Tokenization is simplified here for demo purposes.
    const session = await ensureModel();
    const inputIds = new Int32Array([101, 102]);
    const attentionMask = new Int32Array([1, 1]);
    const feeds = {
      input_ids: new ort.Tensor('int32', inputIds, [1, 2]),
      attention_mask: new ort.Tensor('int32', attentionMask, [1, 2]),
    };
    await session.run(feeds);
    // Replace the placeholder logic with a full tokenizer + post-processing when deploying a real model.
    return fallbackAnswer(question, language);
  } catch (error) {
    console.warn('ONNX session failed, falling back to cached KB', error);
    return fallbackAnswer(question, language);
  }
};
