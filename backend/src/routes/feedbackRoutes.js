const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { 
  submitFeedback, 
  getFeedback, 
  getFeedbackStats,
  updateFeedbackStatus,
  deleteFeedback 
} = require('../controllers/feedbackController');
const authMiddleware = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/authMiddleware');

// Public routes
router.post('/', [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 1000 }).withMessage('Comment must be less than 1000 characters'),
  body('suggestion').optional().isLength({ max: 1000 }).withMessage('Suggestion must be less than 1000 characters')
], submitFeedback);

// Protected routes (Admin only)
router.get('/', authMiddleware, adminMiddleware, getFeedback);
router.get('/stats', authMiddleware, adminMiddleware, getFeedbackStats);
router.put('/:id/status', authMiddleware, adminMiddleware, updateFeedbackStatus);
router.delete('/:id', authMiddleware, adminMiddleware, deleteFeedback);

module.exports = router;
