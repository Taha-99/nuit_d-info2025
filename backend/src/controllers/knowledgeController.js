const Service = require('../models/serviceModel');

// Get knowledge base from services and FAQs
const getKnowledgeBase = async (req, res) => {
  try {
    const { search, category, language = 'fr' } = req.query;
    
    let query = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (language) {
      query.$or = [
        { language: language },
        { language: 'both' }
      ];
    }

    const services = await Service.find(query)
      .select('id title description category faq steps')
      .lean();

    // Extract knowledge items from services and FAQs
    let knowledgeItems = [];
    
    services.forEach(service => {
      // Add service description as knowledge
      knowledgeItems.push({
        id: service.id,
        type: 'service',
        question: `Comment obtenir ${service.title.toLowerCase()}?`,
        answer: service.description,
        category: service.category,
        serviceId: service.id
      });
      
      // Add FAQ items
      if (service.faq && service.faq.length > 0) {
        service.faq.forEach(faqItem => {
          knowledgeItems.push({
            id: `${service.id}_faq_${faqItem.id}`,
            type: 'faq',
            question: faqItem.question,
            answer: faqItem.answer,
            category: service.category,
            serviceId: service.id,
            keywords: faqItem.keywords || []
          });
        });
      }
      
      // Add steps as knowledge
      if (service.steps && service.steps.length > 0) {
        knowledgeItems.push({
          id: `${service.id}_steps`,
          type: 'steps',
          question: `Quelles sont les étapes pour ${service.title.toLowerCase()}?`,
          answer: service.steps.map(step => `${step.order}. ${step.title}: ${step.description}`).join(' '),
          category: service.category,
          serviceId: service.id
        });
      }
    });

    // Filter by search if provided
    if (search) {
      const searchLower = search.toLowerCase();
      knowledgeItems = knowledgeItems.filter(item => 
        item.question.toLowerCase().includes(searchLower) ||
        item.answer.toLowerCase().includes(searchLower) ||
        (item.keywords && item.keywords.some(keyword => 
          keyword.toLowerCase().includes(searchLower)
        ))
      );
    }

    res.json({
      knowledge: knowledgeItems,
      total: knowledgeItems.length,
      categories: [...new Set(knowledgeItems.map(item => item.category))],
      types: [...new Set(knowledgeItems.map(item => item.type))]
    });
  } catch (error) {
    console.error('Error fetching knowledge base:', error);
    res.status(500).json({ error: 'Failed to fetch knowledge base' });
  }
};

// Search knowledge base using text search
const searchKnowledge = async (req, res) => {
  try {
    const { query, limit = 10 } = req.body;
    
    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Search in services using text search
    const services = await Service.find({
      $text: { $search: query },
      isActive: true
    })
    .select('id title description category faq steps')
    .limit(limit)
    .lean();

    const results = services.map(service => ({
      id: service.id,
      title: service.title,
      description: service.description,
      category: service.category,
      type: 'service',
      relevance: 'high' // In a real implementation, this would be calculated
    }));

    res.json({
      results,
      query,
      total: results.length
    });
  } catch (error) {
    console.error('Error searching knowledge:', error);
    res.status(500).json({ error: 'Failed to search knowledge base' });
  }
};

module.exports = { getKnowledgeBase, searchKnowledge };
