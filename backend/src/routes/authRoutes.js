const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  login,
  register,
  getProfile,
  updateProfile,
  changePassword,
  loginValidation,
  registerValidation,
  updateProfileValidation,
  changePasswordValidation
} = require('../controllers/authController');

// Public routes
router.post('/login', loginValidation, login);
router.post('/register', registerValidation, register);

// Protected routes (require authentication)
router.use(authMiddleware); // Apply auth middleware to all routes below

router.get('/profile', getProfile);
router.put('/profile', updateProfileValidation, updateProfile);
router.put('/password', changePasswordValidation, changePassword);

module.exports = router;
