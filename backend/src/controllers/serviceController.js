const { validationResult } = require('express-validator');
const Services = require('../models/serviceModel');

const listServices = (req, res) => {
  const data = Services.getAll();
  res.json(data);
};

const getService = (req, res) => {
  const service = Services.getById(req.params.id);
  if (!service) {
    return res.status(404).json({ message: 'Service not found' });
  }
  res.json(service);
};

const upsertService = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const saved = Services.upsert(req.body);
  res.json(saved);
};

module.exports = { listServices, getService, upsertService };
