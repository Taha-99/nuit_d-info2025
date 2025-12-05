const Feedback = require('../models/feedbackModel');

const syncPayloads = async (req, res) => {
  try {
    const { payloads } = req.body;
    if (!Array.isArray(payloads)) {
      return res.status(400).json({ message: 'payloads must be an array' });
    }
    
    let synced = 0;
    let errors = 0;
    
    for (const payload of payloads) {
      try {
        if (payload.type === 'feedback') {
          const feedback = new Feedback(payload.payload);
          await feedback.save();
          synced += 1;
        }
      } catch (error) {
        console.error('Error syncing payload:', error);
        errors += 1;
      }
    }
    
    res.json({ 
      synced, 
      errors, 
      total: payloads.length,
      message: `Successfully synced ${synced} items${errors > 0 ? `, ${errors} errors` : ''}` 
    });
  } catch (error) {
    console.error('Sync controller error:', error);
    res.status(500).json({ error: 'Failed to sync payloads' });
  }
};

module.exports = { syncPayloads };
