const express = require('express');
const router = express.Router();
const { getTeamAnalytics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

// Protected routes
router.use(protect);

// Analytics routes
router.get('/team/:managerId', authorize('manager', 'admin'), getTeamAnalytics);

module.exports = router;
