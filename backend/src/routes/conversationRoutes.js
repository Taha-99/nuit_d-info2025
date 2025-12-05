const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const conversationController = require('../controllers/conversationController');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// GET /api/conversations/user/:userId - Get all conversations for a user
router.get('/user/:userId', conversationController.getUserConversations);

// GET /api/conversations/:conversationId - Get specific conversation
router.get('/:conversationId', conversationController.getConversation);

// POST /api/conversations - Create new conversation
router.post('/', conversationController.createConversation);

// PUT /api/conversations/:conversationId - Update conversation
router.put('/:conversationId', conversationController.updateConversation);

// DELETE /api/conversations/:conversationId - Delete conversation
router.delete('/:conversationId', conversationController.deleteConversation);

// POST /api/conversations/:conversationId/messages - Add message to conversation
router.post('/:conversationId/messages', conversationController.addMessage);

// POST /api/conversations/:conversationId/generate - Generate AI response
router.post('/:conversationId/generate', conversationController.generateResponse);

// POST /api/conversations/search - Search conversations using embeddings
router.post('/search', conversationController.searchConversations);

module.exports = router;