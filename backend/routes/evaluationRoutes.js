const express = require('express');
const router = express.Router();
const {
    createEvaluation,
    getEvaluationsByUserId,
    getEvaluationById,
    updateEvaluation,
    getEvaluationStatus
} = require('../controllers/evaluationController');
const { protect, authorize } = require('../middleware/auth');

// Protected routes
router.use(protect);

// Routes accessible by all authenticated users
router.get('/user/:userId', getEvaluationsByUserId);
router.get('/status/:userId', getEvaluationStatus);
router.get('/:id', getEvaluationById);

// Routes restricted to managers and admins
router.post('/', authorize('manager', 'admin'), createEvaluation);
router.put('/:id', authorize('manager', 'admin'), updateEvaluation);

module.exports = router;
