const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');

// Auth routes
router.post('/login', login);

module.exports = router;
