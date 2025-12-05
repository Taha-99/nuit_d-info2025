const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const fetchFn = (...args) => {
  if (typeof fetch === 'function') {
    return fetch(...args);
  }
  return import('node-fetch').then(({ default: nodeFetch }) => nodeFetch(...args));
};

const fetchWithTimeout = async (url, options = {}, timeout = 5000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetchFn(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
};

class QwenService {
  constructor() {
    const configuredUrl = (process.env.RAFIQ_API_URL || process.env.QWEN_API_URL || '').trim();
    const legacyEndpoint = 'http://37.59.116.54:7000';
    const sessionEndpoint = 'http://37.59.116.54:8000';
    this.baseUrl = configuredUrl || legacyEndpoint;
    this.fallbackBaseUrls = [
      this.baseUrl,
      legacyEndpoint,
      sessionEndpoint
    ].filter((value, index, self) => value && self.indexOf(value) === index);

    const configuredStyle = (process.env.RAFIQ_API_STYLE || process.env.AI_API_MODE || '').toLowerCase();
    if (configuredStyle === 'legacy' || configuredStyle === 'analyze') {
      this.apiStyle = 'legacy';
    } else if (configuredStyle === 'rafiq' || configuredStyle === 'session') {
      this.apiStyle = 'rafiq';
    } else if (this.baseUrl.includes(':8000')) {
      this.apiStyle = 'rafiq';
    } else {
      this.apiStyle = 'legacy';
    }
    this.usesSessionApi = this.apiStyle === 'rafiq';
    this.usesLegacyApi = !this.usesSessionApi;
    const payloadPref = (process.env.RAFIQ_ANALYZE_PAYLOAD || 'text').toLowerCase();
    const validPayloads = new Set(['auto', 'file', 'json', 'text']);
    this.legacyPayloadMode = validPayloads.has(payloadPref) ? payloadPref : 'text';
    this.apiKey = (process.env.RAFIQ_API_KEY || process.env.QWEN_API_KEY || '').trim();
    this.defaultKnowledge = process.env.RAFIQ_DEFAULT_KNOWLEDGE ||
      "Rafiq-AI est un assistant virtuel développé pour la Nuit de l'Info 2025. Il aide les citoyens à comprendre les services publics algériens et le projet NIRD.";
    this.timeoutMs = Number(process.env.RAFIQ_TIMEOUT_MS || process.env.QWEN_TIMEOUT_MS || 5000);
    this.sessions = new Map(); // conversationId -> { id, knowledgeLoaded }
    this.isEnabled = Boolean(this.baseUrl);
    this.tempDir = path.join(__dirname, '../../temp');

    if (this.usesLegacyApi && !fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }

    if (this.isEnabled) {
      console.log(`✅ QwenService initialized (endpoint: ${this.baseUrl}, mode: ${this.apiStyle})`);
    } else {
      console.warn('⚠️  QwenService running in fallback mode (no AI endpoint configured)');
    }
  }

  sanitizeBaseUrl(url) {
    if (!url) return '';
    return url.endsWith('/') ? url.slice(0, -1) : url;
  }

  buildHeaders(isJson = true) {
    const headers = {};
    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }
    if (isJson) {
      headers['Content-Type'] = 'application/json';
      headers.Accept = 'application/json';
    }
    return headers;
  }

  async request(path, options = {}) {
    if (!this.isEnabled) {
      throw new Error('AI service not configured');
    }

    let lastError;
    const candidates = this.usesSessionApi ? this.fallbackBaseUrls : [this.baseUrl];
    for (const candidate of candidates) {
      const url = `${this.sanitizeBaseUrl(candidate)}${path}`;
      try {
        const response = await fetchWithTimeout(url, options, this.timeoutMs);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`AI API error ${response.status}: ${errorText}`);
        }
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          return response.json();
        }
        return response.text();
      } catch (error) {
        lastError = error;
        console.warn(`AI request failed for ${url}: ${error.message}`);
      }
    }

    throw lastError || new Error('AI request failed for all endpoints');
  }

  async createSession(conversationKey = 'default') {
    if (!this.usesSessionApi) {
      throw new Error('Session API not enabled');
    }

    const sessionResponse = await this.request('/session/new', {
      method: 'GET',
      headers: this.buildHeaders(false)
    });

    if (!sessionResponse?.session_id) {
      throw new Error('AI session creation failed');
    }

    const sessionRecord = {
      id: sessionResponse.session_id,
      knowledgeLoaded: false,
      createdAt: Date.now()
    };

    this.sessions.set(conversationKey, sessionRecord);
    await this.ensureDefaultKnowledge(sessionRecord);

    return sessionRecord;
  }

  async ensureSession(conversationKey = 'default') {
    if (!this.usesSessionApi) {
      return null;
    }

    if (!conversationKey) {
      conversationKey = 'default';
    }

    const existing = this.sessions.get(conversationKey);
    if (existing) {
      return existing;
    }

    try {
      return await this.createSession(conversationKey);
    } catch (error) {
      console.warn('Failed to create AI session:', error.message);
      return null;
    }
  }

  async ensureDefaultKnowledge(sessionRecord) {
    if (!this.usesSessionApi) {
      return;
    }

    if (!sessionRecord || sessionRecord.knowledgeLoaded || !this.defaultKnowledge) {
      return;
    }

    try {
      await this.request('/add-knowledge', {
        method: 'POST',
        headers: this.buildHeaders(true),
        body: JSON.stringify({
          session_id: sessionRecord.id,
          text: this.defaultKnowledge
        })
      });
      sessionRecord.knowledgeLoaded = true;
    } catch (error) {
      console.warn('Failed to add default knowledge:', error.message);
    }
  }

  async analyzeText(text) {
    const fallback = this.buildFallbackResponse(text);

    if (!this.isEnabled || !this.usesLegacyApi) {
      return fallback;
    }

    try {
      const response = await this.performLegacyAnalyze(text);
      const normalized = this.normalizeLegacyResponse(response);
      return normalized || fallback;
    } catch (error) {
      console.warn('Legacy analyze failed:', error.message);
      return fallback;
    }
  }

  async performLegacyAnalyze(text) {
    const mode = this.legacyPayloadMode;

    if (mode === 'json') {
      return this.analyzeJsonPayload(text);
    }

    if (mode === 'file') {
      return this.analyzeTextViaFile(text);
    }

    // auto: try file upload then JSON as fallback
    try {
      return await this.analyzeTextViaFile(text);
    } catch (error) {
      if (this.shouldRetryLegacyAsJson(error)) {
        console.warn('Legacy analyze falling back to JSON payload:', error.message);
        return this.analyzeJsonPayload(text);
      }
      throw error;
    }
  }

  shouldRetryLegacyAsJson(error) {
    if (!error) return false;
    const message = String(error.message || '').toLowerCase();
    return message.includes('parse') || message.includes('parsing') || message.includes('400');
  }

  normalizeLegacyResponse(response) {
    if (!response) {
      return null;
    }

    if (typeof response === 'string') {
      return response;
    }

    if (response.response || response.answer || response.analysis) {
      return response.response || response.answer || response.analysis;
    }

    return null;
  }

  async analyzeTextViaFile(text) {
    const tempFile = path.join(this.tempDir, `query_${Date.now()}.txt`);
    await fs.promises.writeFile(tempFile, text, 'utf8');

    try {
      return await this.analyzeFile(tempFile);
    } finally {
      fs.promises.unlink(tempFile).catch(() => {});
    }
  }

  async analyzeJsonPayload(text) {
    const url = `${this.sanitizeBaseUrl(this.baseUrl)}/analyze`;
    const payload = {
      text,
      prompt: text,
      message: text
    };

    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        ...this.buildHeaders(true)
      },
      body: JSON.stringify(payload)
    }, this.timeoutMs);

    if (!response.ok) {
      const textBody = await response.text();
      throw new Error(`Legacy AI error ${response.status}: ${textBody}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return response.json();
    }
    return response.text();
  }

  async analyzeFile(filePath) {
    if (!this.isEnabled || !this.usesLegacyApi) {
      throw new Error('Analyze API not available');
    }

    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    const url = `${this.sanitizeBaseUrl(this.baseUrl)}/analyze`;

    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'X-API-Key': this.apiKey,
        Accept: 'application/json',
        ...form.getHeaders()
      },
      body: form
    }, this.timeoutMs);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Legacy AI error ${response.status}: ${text}`);
    }

    return response.json();
  }

  extractLastUserMessage(messages) {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].role === 'user' && messages[i].content) {
        return messages[i].content;
      }
    }
    return '';
  }

  buildConversationPrompt(messages, systemPrompt) {
    const history = messages
      .slice(-10)
      .map(msg => `${msg.role === 'user' ? 'Utilisateur' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    return `${systemPrompt}\n\nHistorique récent:\n${history}`;
  }

  buildFallbackResponse(userMessage = '') {
    const politeDefault = `Je ne peux pas contacter le service IA pour le moment. Voici quand même quelques conseils :\n- Vérifiez vos pièces d'identité et justificatifs récents\n- Consultez la FAQ hors-ligne intégrée à l'application\n- Si besoin, rendez-vous à l'administration la plus proche.\n\nشكرا لتفهمك. في حال استمرار المشكلة، يرجى الاتصال بالخدمة المعنية مباشرة.`;

    if (!userMessage) {
      return politeDefault;
    }

    const normalized = userMessage.toLowerCase();

    if (normalized.includes('carte') && normalized.includes("identit")) {
      return `Pour la carte d'identité biométrique :\n1. Extrait de naissance S12\n2. Certificat de résidence récent\n3. Photo biométrique 35x45mm\n4. Ancienne carte (si renouvellement).\nDéposez le dossier à l'APC ou la daïra la plus proche.`;
    }

    if (normalized.includes('passeport')) {
      return `Pour obtenir un passeport biométrique :\n- Extrait de naissance S12\n- Carte d'identité biométrique\n- 2 photos biométriques récentes\n- Timbre fiscal selon l'âge\nPrenez rendez-vous auprès des services de la daïra.`;
    }

    if (normalized.includes('permis') || normalized.includes('conduire')) {
      return `Permis de conduire :\n- Visite médicale agréée\n- Certificat d'aptitude à la conduite\n- 4 photos\n- Dossier administratif (extrait de naissance, résidence).`;
    }

    return politeDefault;
  }

  async generateChatResponse(messages, options = {}) {
    const systemPrompt = options.systemPrompt || 'Tu es un assistant administratif algérien qui répond de manière claire et concise.';
    const fallback = this.buildFallbackResponse(this.extractLastUserMessage(messages));

    if (!this.isEnabled) {
      return fallback;
    }

    if (this.usesLegacyApi) {
      return this.analyzeText(this.buildConversationPrompt(messages, systemPrompt));
    }

    const conversationKey = options.conversationId || options.sessionKey || options.userId || 'default';

    try {
      const session = await this.ensureSession(conversationKey);
      if (!session) {
        return fallback;
      }

      await this.ensureDefaultKnowledge(session);
      const composedPrompt = this.buildConversationPrompt(messages, systemPrompt);
      const result = await this.request('/chat', {
        method: 'POST',
        headers: this.buildHeaders(true),
        body: JSON.stringify({
          session_id: session.id,
          message: composedPrompt
        })
      });

      if (typeof result === 'string') {
        return result;
      }

      if (result?.answer || result?.response || result?.analysis) {
        return result.answer || result.response || result.analysis;
      }

      return fallback;
    } catch (error) {
      console.warn('AI chat generation failed:', error.message);
      this.sessions.delete(conversationKey);
      return fallback;
    }
  }

  async generateEmbeddings(texts) {
    if (Array.isArray(texts)) {
      return texts.map(() => null);
    }
    return null;
  }

  cosineSimilarity(embedding1, embedding2) {
    if (!embedding1 || !embedding2) {
      return 0;
    }

    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same length');
    }

    let dot = 0;
    let mag1 = 0;
    let mag2 = 0;

    for (let i = 0; i < embedding1.length; i += 1) {
      dot += embedding1[i] * embedding2[i];
      mag1 += embedding1[i] ** 2;
      mag2 += embedding2[i] ** 2;
    }

    const denom = Math.sqrt(mag1) * Math.sqrt(mag2);
    return denom === 0 ? 0 : dot / denom;
  }

  async findSimilar(queryText, documents, topK = 5) {
    const queryWords = queryText.toLowerCase().split(/\s+/).filter(Boolean);

    const scored = documents.map((doc, index) => {
      const text = `${doc.title || ''} ${doc.content || ''} ${doc.description || ''}`.toLowerCase();
      const matchCount = queryWords.filter(word => text.includes(word)).length;
      const score = queryWords.length ? matchCount / queryWords.length : 0;
      return { document: doc, score, index };
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  async batchGenerateEmbeddings(texts) {
    return texts.map(() => null);
  }

  async testConnection() {
    if (!this.isEnabled) {
      throw new Error('AI endpoint not configured');
    }

    if (this.usesLegacyApi) {
      const response = await this.analyzeText('Test rapide de connectivité');
      if (!response) {
        throw new Error('No response from legacy AI service');
      }
      return true;
    }

    const session = await this.createSession(`health-check-${Date.now()}`);
    const result = await this.request('/chat', {
      method: 'POST',
      headers: this.buildHeaders(true),
      body: JSON.stringify({
        session_id: session.id,
        message: 'Test rapide de connectivité. Réponds simplement "pong".'
      })
    });

    if (!result) {
      throw new Error('No response from AI service');
    }

    return true;
  }

  async askQuestion(question) {
    return this.generateChatResponse([{ role: 'user', content: question }]);
  }
}

module.exports = new QwenService();
