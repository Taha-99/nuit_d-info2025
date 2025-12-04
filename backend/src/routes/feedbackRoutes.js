const express = require('express');
const router = express.Router();
const { submitFeedback, getFeedback } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getFeedback);
router.post('/', submitFeedback);

module.exports = router;
