const Appointment = require('../models/appointmentModel');

// Service types with translations
const serviceTypes = {
  id_card: { service: 'Carte nationale d\'identité', serviceAr: 'بطاقة التعريف الوطنية' },
  passport: { service: 'Passeport biométrique', serviceAr: 'جواز السفر البيومتري' },
  birth_cert: { service: 'Acte de naissance', serviceAr: 'شهادة الميلاد' },
  residence: { service: 'Certificat de résidence', serviceAr: 'شهادة الإقامة' },
  family_book: { service: 'Livret de famille', serviceAr: 'دفتر العائلة' },
  driver_license: { service: 'Permis de conduire', serviceAr: 'رخصة السياقة' },
  other: { service: 'Autre service', serviceAr: 'خدمة أخرى' },
};

// Locations with translations
const locations = {
  mairie_alger: { location: 'Mairie d\'Alger', locationAr: 'بلدية الجزائر' },
  daira_sm: { location: 'Daïra de Sidi M\'hamed', locationAr: 'دائرة سيدي محمد' },
  apc_bab: { location: 'APC Bab El Oued', locationAr: 'بلدية باب الواد' },
  mairie_oran: { location: 'Mairie d\'Oran', locationAr: 'بلدية وهران' },
  mairie_constantine: { location: 'Mairie de Constantine', locationAr: 'بلدية قسنطينة' },
};

// @desc    Get user's appointments
// @route   GET /api/appointments
// @access  Private
exports.getUserAppointments = async (req, res) => {
  try {
    const { status, upcoming } = req.query;
    
    const query = { userId: req.user.id };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
      query.status = { $nin: ['cancelled', 'completed'] };
    }
    
    const appointments = await Appointment.find(query)
      .sort({ date: 1, time: 1 });
    
    res.json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Rendez-vous non trouvé' });
    }
    
    // Check ownership (unless admin)
    if (appointment.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Accès non autorisé' });
    }
    
    res.json({ success: true, data: appointment });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private
exports.createAppointment = async (req, res) => {
  try {
    const { serviceType, locationId, date, time, notes } = req.body;
    
    // Validate date is in the future
    const appointmentDate = new Date(date);
    if (appointmentDate < new Date()) {
      return res.status(400).json({ 
        success: false, 
        message: 'La date doit être dans le futur' 
      });
    }
    
    // Check for conflicting appointments
    const existingAppointment = await Appointment.findOne({
      userId: req.user.id,
      date: appointmentDate,
      time,
      status: { $nin: ['cancelled'] },
    });
    
    if (existingAppointment) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vous avez déjà un rendez-vous à cette date et heure' 
      });
    }
    
    const serviceData = serviceTypes[serviceType] || serviceTypes.other;
    const locationData = locations[locationId] || { location: locationId, locationAr: locationId };
    
    const appointment = await Appointment.create({
      userId: req.user.id,
      serviceType: serviceType || 'other',
      service: serviceData.service,
      serviceAr: serviceData.serviceAr,
      location: locationData.location,
      locationAr: locationData.locationAr,
      date: appointmentDate,
      time,
      notes,
    });
    
    res.status(201).json({
      success: true,
      data: appointment,
      message: 'Rendez-vous créé avec succès',
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
exports.updateAppointment = async (req, res) => {
  try {
    const { serviceType, locationId, date, time, notes } = req.body;
    
    let appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Rendez-vous non trouvé' });
    }
    
    // Check ownership
    if (appointment.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Accès non autorisé' });
    }
    
    // Can't update cancelled appointments
    if (appointment.status === 'cancelled') {
      return res.status(400).json({ 
        success: false, 
        message: 'Impossible de modifier un rendez-vous annulé' 
      });
    }
    
    // Update fields
    if (serviceType) {
      const serviceData = serviceTypes[serviceType] || serviceTypes.other;
      appointment.serviceType = serviceType;
      appointment.service = serviceData.service;
      appointment.serviceAr = serviceData.serviceAr;
    }
    
    if (locationId) {
      const locationData = locations[locationId] || { location: locationId, locationAr: locationId };
      appointment.location = locationData.location;
      appointment.locationAr = locationData.locationAr;
    }
    
    if (date) appointment.date = new Date(date);
    if (time) appointment.time = time;
    if (notes !== undefined) appointment.notes = notes;
    
    // Reset status to pending if date/time changed
    if (date || time) {
      appointment.status = 'pending';
    }
    
    await appointment.save();
    
    res.json({
      success: true,
      data: appointment,
      message: 'Rendez-vous mis à jour',
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Cancel appointment
// @route   DELETE /api/appointments/:id
// @access  Private
exports.cancelAppointment = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Rendez-vous non trouvé' });
    }
    
    // Check ownership
    if (appointment.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Accès non autorisé' });
    }
    
    appointment.status = 'cancelled';
    appointment.cancelledAt = new Date();
    appointment.cancellationReason = reason;
    
    await appointment.save();
    
    res.json({
      success: true,
      message: 'Rendez-vous annulé',
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Confirm appointment (Admin only)
// @route   PUT /api/appointments/:id/confirm
// @access  Private/Admin
exports.confirmAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Rendez-vous non trouvé' });
    }
    
    appointment.status = 'confirmed';
    await appointment.save();
    
    res.json({
      success: true,
      data: appointment,
      message: 'Rendez-vous confirmé',
    });
  } catch (error) {
    console.error('Confirm appointment error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Get appointment stats
// @route   GET /api/appointments/stats
// @access  Private
exports.getAppointmentStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    
    const [total, upcoming, pending, confirmed] = await Promise.all([
      Appointment.countDocuments({ userId }),
      Appointment.countDocuments({ userId, date: { $gte: now }, status: { $nin: ['cancelled'] } }),
      Appointment.countDocuments({ userId, status: 'pending' }),
      Appointment.countDocuments({ userId, status: 'confirmed' }),
    ]);
    
    res.json({
      success: true,
      data: { total, upcoming, pending, confirmed },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Get available time slots
// @route   GET /api/appointments/slots
// @access  Private
exports.getAvailableSlots = async (req, res) => {
  try {
    const { date, locationId } = req.query;
    
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date requise' });
    }
    
    // Define time slots (8:00 to 16:00)
    const allSlots = [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
      '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'
    ];
    
    // Find booked slots for that date and location
    const queryDate = new Date(date);
    const nextDay = new Date(queryDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const booked = await Appointment.find({
      date: { $gte: queryDate, $lt: nextDay },
      status: { $nin: ['cancelled'] },
    }).select('time');
    
    const bookedTimes = booked.map(a => a.time);
    
    const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));
    
    res.json({
      success: true,
      data: availableSlots,
    });
  } catch (error) {
    console.error('Get slots error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Get service types
// @route   GET /api/appointments/services
// @access  Public
exports.getServiceTypes = async (req, res) => {
  res.json({
    success: true,
    data: Object.entries(serviceTypes).map(([id, data]) => ({
      id,
      ...data,
    })),
  });
};

// @desc    Get locations
// @route   GET /api/appointments/locations
// @access  Public
exports.getLocations = async (req, res) => {
  res.json({
    success: true,
    data: Object.entries(locations).map(([id, data]) => ({
      id,
      ...data,
    })),
  });
};
