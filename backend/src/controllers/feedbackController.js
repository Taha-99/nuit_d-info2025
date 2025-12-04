const { insertFeedback, listFeedback } = require('../models/feedbackModel');

const submitFeedback = (req, res) => {
  const saved = insertFeedback(req.body);
  res.status(201).json(saved);
};

const getFeedback = (req, res) => {
  res.json(listFeedback());
};

module.exports = { submitFeedback, getFeedback };
