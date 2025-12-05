const { OpenRouter } = require('@openrouter/sdk');

class QwenService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.embeddingModel = process.env.OPENROUTER_MODEL || 'qwen/qwen3-embedding-8b';
    this.chatModel = 'qwen/qwen-2.5-72b-instruct'; // Chat model for text generation
    this.isEnabled = false;
    
    if (!this.apiKey) {
      console.warn('⚠️ OpenRouter API key not provided. AI features will use fallback responses.');
      return;
    }
    
    this.client = new OpenRouter({
      apiKey: this.apiKey
    });
    
    // Auto-enable if API key is present
    this.isEnabled = true;
    console.log('✅ QwenService initialized with API key');
  }

  /**
   * Generate a chat response using Qwen model via OpenRouter
   * @param {Array} messages - Array of message objects {role, content}
   * @param {Object} options - Additional options
   * @returns {Promise<string>} AI response text
   */
  async generateChatResponse(messages, options = {}) {
    if (!this.isEnabled || !this.apiKey || !this.client) {
      console.warn('OpenRouter API not available, using fallback response');
      return null;
    }
    
    try {
      const systemPrompt = options.systemPrompt || `Tu es un assistant gouvernemental intelligent pour les citoyens. 
Tu aides les utilisateurs à comprendre les démarches administratives, les documents nécessaires et les procédures.
Réponds de manière claire, concise et utile. Si tu ne sais pas, dis-le honnêtement.
Réponds dans la même langue que l'utilisateur (français ou arabe).`;

      const chatMessages = [
        { role: 'system', content: systemPrompt },
        ...messages
      ];

      const response = await this.client.chat.completions.create({
        model: this.chatModel,
        messages: chatMessages,
        max_tokens: options.maxTokens || 1024,
        temperature: options.temperature || 0.7,
      });
      
      if (response.choices && response.choices[0] && response.choices[0].message) {
        return response.choices[0].message.content;
      }
      
      return null;
    } catch (error) {
      console.error('OpenRouter chat error:', error.message);
      return null;
    }
  }

  /**
   * Generate embeddings for text using Qwen3 Embedding 8B via OpenRouter
   * @param {string|string[]} texts - Single text or array of texts
   * @param {Object} options - Additional options
   * @returns {Promise<Array>} Array of embeddings
   */
  async generateEmbeddings(texts, options = {}) {
    if (!this.isEnabled || !this.apiKey || !this.client) {
      console.warn('OpenRouter API not available, skipping embedding generation');
      return Array.isArray(texts) ? new Array(texts.length).fill(null) : null;
    }
    
    try {
      const textArray = Array.isArray(texts) ? texts : [texts];
      const embeddings = [];
      
      // Generate embeddings for each text
      for (const text of textArray) {
        const response = await this.client.embeddings.generate({
          model: this.embeddingModel,
          input: text,
          encodingFormat: 'float'
        });
        
        if (response.data && response.data[0] && response.data[0].embedding) {
          embeddings.push(response.data[0].embedding);
        } else {
          embeddings.push(null);
        }
      }
      
      console.log('Generated embeddings for', embeddings.length, 'texts');
      return Array.isArray(texts) ? embeddings : embeddings[0];
      
    } catch (error) {
      console.error('OpenRouter embedding error:', error.message);
      
      if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (error.status === 401) {
        throw new Error('Invalid API key or authentication failed.');
      }
      
      throw new Error(`Failed to generate embeddings: ${error.message}`);
    }
  }

  /**
   * Calculate cosine similarity between two embeddings
   * @param {number[]} embedding1 
   * @param {number[]} embedding2 
   * @returns {number} Similarity score between -1 and 1
   */
  cosineSimilarity(embedding1, embedding2) {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same length');
    }

    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      magnitude1 += embedding1[i] * embedding1[i];
      magnitude2 += embedding2[i] * embedding2[i];
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }

    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * Find most similar texts from a collection
   * @param {string} queryText - Text to search for
   * @param {Array} documents - Array of documents with embeddings
   * @param {number} topK - Number of results to return
   * @returns {Promise<Array>} Sorted array of similar documents with scores
   */
  async findSimilar(queryText, documents, topK = 5) {
    try {
      // Generate embedding for query text
      const queryEmbedding = await this.generateEmbeddings(queryText, { textType: 'query' });
      
      // Calculate similarities
      const similarities = documents.map((doc, index) => {
        if (!doc.embedding) {
          console.warn(`Document at index ${index} has no embedding`);
          return { document: doc, score: 0, index };
        }
        
        const score = this.cosineSimilarity(queryEmbedding, doc.embedding);
        return { document: doc, score, index };
      });

      // Sort by similarity score (descending) and return top K
      return similarities
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);
        
    } catch (error) {
      console.error('Error finding similar documents:', error.message);
      throw error;
    }
  }

  /**
   * Batch process embeddings for multiple texts
   * @param {string[]} texts - Array of texts
   * @param {number} batchSize - Size of each batch
   * @returns {Promise<Array>} Array of embeddings
   */
  async batchGenerateEmbeddings(texts, batchSize = 10) {
    const results = [];
    
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(texts.length / batchSize)}`);
      
      try {
        const embeddings = await this.generateEmbeddings(batch);
        results.push(...embeddings);
        
        // Add small delay between batches to avoid rate limiting
        if (i + batchSize < texts.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Batch ${Math.floor(i / batchSize) + 1} failed:`, error.message);
        // Add null embeddings for failed batch
        results.push(...new Array(batch.length).fill(null));
      }
    }
    
    return results;
  }

  /**
   * Test API connection
   * @returns {Promise<boolean>} True if connection successful
   */
  async testConnection() {
    if (!this.apiKey || !this.client) {
      throw new Error('OpenRouter API key not configured');
    }
    
    try {
      // Temporarily enable for testing
      this.isEnabled = true;
      
      const response = await this.client.embeddings.generate({
        model: this.embeddingModel,
        input: 'Test connection',
        encodingFormat: 'float'
      });
      
      if (response.data && response.data[0] && response.data[0].embedding) {
        console.log('✅ OpenRouter API connection successful');
        console.log('   Embedding dimension:', response.data[0].embedding.length);
        this.isEnabled = true;
        return true;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('OpenRouter API connection failed:', error.message);
      this.isEnabled = false;
      throw error;
    }
  }
}

module.exports = new QwenService();