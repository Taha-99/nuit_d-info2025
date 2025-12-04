const express = require('express');
const router = express.Router();
const { syncPayloads } = require('../controllers/syncController');

router.post('/', syncPayloads);

module.exports = router;
