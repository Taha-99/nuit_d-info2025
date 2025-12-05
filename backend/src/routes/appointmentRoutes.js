const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/authMiddleware');
const {
  getUserAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  confirmAppointment,
  getAppointmentStats,
  getAvailableSlots,
  getServiceTypes,
  getLocations,
} = require('../controllers/appointmentController');

// Public routes
router.get('/services', getServiceTypes);
router.get('/locations', getLocations);

// Protected routes
router.get('/', authMiddleware, getUserAppointments);
router.get('/stats', authMiddleware, getAppointmentStats);
router.get('/slots', authMiddleware, getAvailableSlots);
router.get('/:id', authMiddleware, getAppointment);
router.post('/', authMiddleware, createAppointment);
router.put('/:id', authMiddleware, updateAppointment);
router.delete('/:id', authMiddleware, cancelAppointment);

// Admin routes
router.put('/:id/confirm', authMiddleware, adminMiddleware, confirmAppointment);

module.exports = router;
