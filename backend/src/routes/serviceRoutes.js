const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { listServices, getService, upsertService } = require('../controllers/serviceController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', listServices);
router.get('/:id', getService);
router.post(
  '/',
  protect,
  [
    body('id').notEmpty(),
    body('title').isLength({ min: 3 }),
  ],
  upsertService
);

module.exports = router;
