const { validationResult } = require('express-validator');
const Feedback = require('../models/feedbackModel');

// Submit new feedback
const submitFeedback = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { 
      serviceId, 
      conversationId, 
      rating, 
      comment, 
      suggestion, 
      category = 'other',
      isAnonymous = false 
    } = req.body;

    const feedbackData = {
      rating,
      comment: comment?.trim(),
      suggestion: suggestion?.trim(),
      category,
      isAnonymous
    };

    // Add user ID if not anonymous and user is authenticated
    if (!isAnonymous && req.user) {
      feedbackData.userId = req.user.id;
    }

    // Add service ID if provided
    if (serviceId) {
      feedbackData.serviceId = serviceId;
    }

    // Add conversation ID if provided
    if (conversationId) {
      feedbackData.conversationId = conversationId;
    }

    // Add metadata
    feedbackData.metadata = {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.connection.remoteAddress,
      language: req.user?.preferences?.language || 'fr'
    };

    const feedback = new Feedback(feedbackData);
    await feedback.save();

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: {
        id: feedback._id,
        rating: feedback.rating,
        category: feedback.category,
        createdAt: feedback.createdAt
      }
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};

// Get all feedback (Admin only)
const getFeedback = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      category, 
      serviceId,
      minRating,
      maxRating,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    let query = {};
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (serviceId) query.serviceId = serviceId;
    if (minRating) query.rating = { ...query.rating, $gte: parseInt(minRating) };
    if (maxRating) query.rating = { ...query.rating, $lte: parseInt(maxRating) };

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const feedback = await Feedback.find(query)
      .populate('userId', 'name email')
      .populate('serviceId', 'title')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Feedback.countDocuments(query);

    res.json({
      feedback,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
};

// Get feedback statistics
const getFeedbackStats = async (req, res) => {
  try {
    const stats = await Feedback.getStats();
    
    const totalFeedback = await Feedback.countDocuments();
    const averageRating = await Feedback.aggregate([
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]);

    const categoryStats = await Feedback.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const statusStats = await Feedback.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totalFeedback,
      averageRating: averageRating[0]?.avg || 0,
      ratingDistribution: stats,
      categoryStats,
      statusStats
    });
  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    res.status(500).json({ error: 'Failed to fetch feedback statistics' });
  }
};

// Update feedback status (Admin only)
const updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    feedback.status = status;
    
    if (adminResponse) {
      feedback.adminResponse = {
        message: adminResponse,
        respondedBy: req.user.id,
        respondedAt: new Date()
      };
    }

    await feedback.save();

    res.json({
      message: 'Feedback status updated successfully',
      feedback
    });
  } catch (error) {
    console.error('Error updating feedback status:', error);
    res.status(500).json({ error: 'Failed to update feedback status' });
  }
};

// Delete feedback (Admin only)
const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findByIdAndDelete(id);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
};

module.exports = { 
  submitFeedback, 
  getFeedback, 
  getFeedbackStats,
  updateFeedbackStatus,
  deleteFeedback 
};
