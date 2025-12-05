const Document = require('../models/documentModel');

// Default steps for new documents
const getDefaultSteps = (type) => {
  const steps = [
    { label: 'Demande soumise', labelAr: 'تم تقديم الطلب', completed: true, completedAt: new Date() },
    { label: 'Vérification des documents', labelAr: 'التحقق من الوثائق', completed: false },
    { label: 'Traitement en cours', labelAr: 'قيد المعالجة', completed: false },
    { label: 'Prêt pour retrait', labelAr: 'جاهز للاستلام', completed: false },
  ];
  return steps;
};

// Get document types with translations
const documentTypes = {
  birth_certificate: { title: 'Acte de naissance', titleAr: 'شهادة الميلاد' },
  id_card: { title: 'Carte nationale d\'identité', titleAr: 'بطاقة التعريف الوطنية' },
  passport: { title: 'Passeport biométrique', titleAr: 'جواز السفر البيومتري' },
  residence_certificate: { title: 'Certificat de résidence', titleAr: 'شهادة الإقامة' },
  family_book: { title: 'Livret de famille', titleAr: 'دفتر العائلة' },
  driver_license: { title: 'Permis de conduire', titleAr: 'رخصة السياقة' },
  other: { title: 'Autre document', titleAr: 'وثيقة أخرى' },
};

// @desc    Get user's documents
// @route   GET /api/documents
// @access  Private
exports.getUserDocuments = async (req, res) => {
  try {
    const { status, search } = req.query;
    
    const query = { userId: req.user.id };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    let documents = await Document.find(query)
      .sort({ createdAt: -1 });
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      documents = documents.filter(doc => 
        doc.trackingId.toLowerCase().includes(searchLower) ||
        doc.title.toLowerCase().includes(searchLower) ||
        doc.titleAr.includes(search)
      );
    }
    
    res.json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Get document by tracking ID
// @route   GET /api/documents/:trackingId
// @access  Private
exports.getDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      $or: [
        { trackingId: req.params.trackingId },
        { _id: req.params.trackingId }
      ]
    });
    
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document non trouvé' });
    }
    
    // Check ownership (unless admin)
    if (document.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Accès non autorisé' });
    }
    
    res.json({ success: true, data: document });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Create new document request
// @route   POST /api/documents
// @access  Private
exports.createDocument = async (req, res) => {
  try {
    const { type, notes } = req.body;
    
    const docType = documentTypes[type] || documentTypes.other;
    
    const document = await Document.create({
      userId: req.user.id,
      type: type || 'other',
      title: docType.title,
      titleAr: docType.titleAr,
      steps: getDefaultSteps(type),
      notes,
      progress: 25, // First step is complete
    });
    
    res.status(201).json({
      success: true,
      data: document,
      message: 'Demande créée avec succès',
    });
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Track external document
// @route   POST /api/documents/track
// @access  Private
exports.trackDocument = async (req, res) => {
  try {
    const { trackingId } = req.body;
    
    const document = await Document.findOne({ trackingId });
    
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        message: 'Aucun document trouvé avec ce numéro de suivi' 
      });
    }
    
    res.json({ success: true, data: document });
  } catch (error) {
    console.error('Track document error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Update document step (Admin only)
// @route   PUT /api/documents/:id/step/:stepIndex
// @access  Private/Admin
exports.updateDocumentStep = async (req, res) => {
  try {
    const { id, stepIndex } = req.params;
    const { completed } = req.body;
    
    const document = await Document.findById(id);
    
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document non trouvé' });
    }
    
    if (stepIndex >= document.steps.length) {
      return res.status(400).json({ success: false, message: 'Étape invalide' });
    }
    
    document.steps[stepIndex].completed = completed;
    if (completed) {
      document.steps[stepIndex].completedAt = new Date();
    }
    
    await document.save();
    
    res.json({ success: true, data: document });
  } catch (error) {
    console.error('Update step error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Update document status (Admin only)
// @route   PUT /api/documents/:id/status
// @access  Private/Admin
exports.updateDocumentStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document non trouvé' });
    }
    
    document.status = status;
    
    if (status === 'rejected') {
      document.rejectionReason = rejectionReason;
    } else if (status === 'completed') {
      document.completedAt = new Date();
      document.progress = 100;
      document.steps.forEach(step => {
        step.completed = true;
        if (!step.completedAt) step.completedAt = new Date();
      });
    }
    
    await document.save();
    
    res.json({ success: true, data: document });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Get document stats
// @route   GET /api/documents/stats
// @access  Private
exports.getDocumentStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const mongoose = require('mongoose');
    
    const stats = await Document.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const result = {
      total: 0,
      pending: 0,
      processing: 0,
      completed: 0,
      rejected: 0,
    };
    
    stats.forEach(s => {
      result[s._id] = s.count;
      result.total += s.count;
    });
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Get document types
// @route   GET /api/documents/types
// @access  Public
exports.getDocumentTypes = async (req, res) => {
  res.json({
    success: true,
    data: Object.entries(documentTypes).map(([id, data]) => ({
      id,
      ...data,
    })),
  });
};
