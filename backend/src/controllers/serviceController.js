const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Service = require('../models/serviceModel');

// Helper to check if a string is a valid MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) && (String(new mongoose.Types.ObjectId(id)) === id);
};

// Get all services
const listServices = async (req, res) => {
  try {
    const { 
      category, 
      search, 
      language, 
      page = 1, 
      limit = 10,
      sortBy = 'title',
      sortOrder = 'asc'
    } = req.query;

    // Build query
    let query = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (language) {
      query.$or = [
        { language: language },
        { language: 'both' }
      ];
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const services = await Service.find(query)
      .select('id title description category priority tags language stats metadata')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count for pagination
    const total = await Service.countDocuments(query);

    res.json({
      services,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
};

// Get single service by ID
const getService = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Build query based on whether id is a valid ObjectId or a custom string id
    let query = { isActive: true };
    if (isValidObjectId(id)) {
      query.$or = [{ _id: id }, { id: id }];
    } else {
      query.id = id;
    }
    
    const service = await Service.findOne(query);
    
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Increment view count
    await service.incrementViews();
    
    res.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ error: 'Failed to fetch service' });
  }
};

// Create or update service (Admin only)
const upsertService = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { id } = req.body;
    
    // Check if service exists
    const existingService = await Service.findOne({ id });
    
    let service;
    if (existingService) {
      // Update existing service
      Object.assign(existingService, req.body);
      existingService.stats.lastUpdated = new Date();
      service = await existingService.save();
    } else {
      // Create new service
      service = new Service(req.body);
      await service.save();
    }

    res.json({
      message: existingService ? 'Service updated successfully' : 'Service created successfully',
      service
    });
  } catch (error) {
    console.error('Error upserting service:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.message 
      });
    }
    
    res.status(500).json({ error: 'Failed to save service' });
  }
};

// Delete service (Admin only)
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    
    const service = await Service.findOne({ 
      $or: [{ _id: id }, { id: id }]
    });
    
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Soft delete by setting isActive to false
    service.isActive = false;
    await service.save();

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
};

// Get service categories
const getCategories = async (req, res) => {
  try {
    const categories = await Service.distinct('category', { isActive: true });
    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// Get service statistics
const getServiceStats = async (req, res) => {
  try {
    const stats = await Service.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalViews: { $sum: '$stats.views' },
          avgRating: { $avg: '$stats.averageRating' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const totalServices = await Service.countDocuments({ isActive: true });
    const totalViews = await Service.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$stats.views' } } }
    ]);

    res.json({
      totalServices,
      totalViews: totalViews[0]?.total || 0,
      categoriesStats: stats
    });
  } catch (error) {
    console.error('Error fetching service stats:', error);
    res.status(500).json({ error: 'Failed to fetch service statistics' });
  }
};

module.exports = { 
  listServices, 
  getService, 
  upsertService, 
  deleteService,
  getCategories,
  getServiceStats 
};
