const express = require('express');
const router = express.Router();
const { getKnowledgeBase } = require('../controllers/knowledgeController');

router.get('/', getKnowledgeBase);

module.exports = router;
