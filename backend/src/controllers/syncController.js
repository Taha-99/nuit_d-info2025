const { insertFeedback } = require('../models/feedbackModel');

const syncPayloads = (req, res) => {
  const { payloads } = req.body;
  if (!Array.isArray(payloads)) {
    return res.status(400).json({ message: 'payloads must be an array' });
  }
  let synced = 0;
  payloads.forEach((payload) => {
    if (payload.type === 'feedback') {
      insertFeedback(payload.payload);
      synced += 1;
    }
  });
  res.json({ synced });
};

module.exports = { syncPayloads };
