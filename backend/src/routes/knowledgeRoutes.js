const express = require('express');
const router = express.Router();
const { getKnowledgeBase, searchKnowledge } = require('../controllers/knowledgeController');

router.get('/', getKnowledgeBase);
router.post('/search', searchKnowledge);

module.exports = router;
