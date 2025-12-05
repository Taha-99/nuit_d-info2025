const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/authMiddleware');
const {
  getUserDocuments,
  getDocument,
  createDocument,
  trackDocument,
  updateDocumentStep,
  updateDocumentStatus,
  getDocumentStats,
  getDocumentTypes,
} = require('../controllers/documentController');

// Public routes
router.get('/types', getDocumentTypes);

// Protected routes
router.get('/', authMiddleware, getUserDocuments);
router.get('/stats', authMiddleware, getDocumentStats);
router.get('/:trackingId', authMiddleware, getDocument);
router.post('/', authMiddleware, createDocument);
router.post('/track', authMiddleware, trackDocument);

// Admin routes
router.put('/:id/step/:stepIndex', authMiddleware, adminMiddleware, updateDocumentStep);
router.put('/:id/status', authMiddleware, adminMiddleware, updateDocumentStatus);

module.exports = router;
