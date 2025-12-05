const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { 
  listServices, 
  getService, 
  upsertService, 
  deleteService,
  getCategories,
  getServiceStats 
} = require('../controllers/serviceController');
const authMiddleware = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/authMiddleware');

// Public routes
router.get('/', listServices);
router.get('/categories', getCategories);
router.get('/stats', getServiceStats);
router.get('/:id', getService);

// Protected routes (Admin only)
router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  [
    body('id').notEmpty().withMessage('Service ID is required'),
    body('title').isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
    body('description').notEmpty().withMessage('Description is required'),
    body('category').notEmpty().withMessage('Category is required')
  ],
  upsertService
);

router.put(
  '/:id',
  authMiddleware,
  adminMiddleware,
  [
    body('title').optional().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
    body('category').optional().notEmpty().withMessage('Category cannot be empty')
  ],
  upsertService
);

router.delete('/:id', authMiddleware, adminMiddleware, deleteService);

module.exports = router;
