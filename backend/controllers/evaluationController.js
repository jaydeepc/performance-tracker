const Evaluation = require('../models/Evaluation');
const User = require('../models/User');

// Helper function to check if evaluation exists for current month
const hasCurrentMonthEvaluation = async (userId) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const evaluation = await Evaluation.findOne({
        userId,
        createdAt: {
            $gte: startOfMonth,
            $lte: endOfMonth
        }
    });

    return evaluation;
};

// Helper function to calculate overall score
const calculateOverallScore = (scores) => {
    const values = Object.values(scores).map(score => score.value);
    return values.reduce((acc, val) => acc + val, 0) / values.length;
};

// @desc    Create new evaluation
// @route   POST /api/evaluations
// @access  Private/Manager
const createEvaluation = async (req, res) => {
    try {
        const { userId, scores, comments, period } = req.body;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                error: {
                    code: 'NOT_FOUND',
                    message: 'User not found',
                    details: ['No user found with this ID']
                }
            });
        }

        // Check if evaluation already exists for current month
        const existingEvaluation = await hasCurrentMonthEvaluation(userId);
        if (existingEvaluation) {
            return res.status(409).json({
                error: {
                    code: 'EVALUATION_EXISTS',
                    message: 'Evaluation already exists for this month',
                    details: ['You can edit the existing evaluation instead']
                }
            });
        }

        // Calculate overall score
        const overallScore = calculateOverallScore(scores);

        // Create evaluation
        const evaluation = await Evaluation.create({
            userId,
            evaluatorId: req.user._id,
            scores,
            overallScore,
            comments,
            period
        });

        const populatedEvaluation = await evaluation.populate('userId', 'name email');
        await populatedEvaluation.populate('evaluatorId', 'name email');

        res.status(201).json(populatedEvaluation);
    } catch (error) {
        res.status(500).json({
            error: {
                code: 'SERVER_ERROR',
                message: 'Error creating evaluation',
                details: [error.message]
            }
        });
    }
};

// @desc    Get evaluations by user ID
// @route   GET /api/evaluations/user/:userId
// @access  Private
const getEvaluationsByUserId = async (req, res) => {
    try {
        const evaluations = await Evaluation.find({ userId: req.params.userId })
            .populate('evaluatorId', 'name email')
            .populate('userId', 'name email')
            .sort('-createdAt');

        res.json(evaluations);
    } catch (error) {
        res.status(500).json({
            error: {
                code: 'SERVER_ERROR',
                message: 'Error fetching evaluations',
                details: [error.message]
            }
        });
    }
};

// @desc    Get evaluation by ID
// @route   GET /api/evaluations/:id
// @access  Private
const getEvaluationById = async (req, res) => {
    try {
        const evaluation = await Evaluation.findById(req.params.id)
            .populate('evaluatorId', 'name email')
            .populate('userId', 'name email');

        if (!evaluation) {
            return res.status(404).json({
                error: {
                    code: 'NOT_FOUND',
                    message: 'Evaluation not found',
                    details: ['No evaluation found with this ID']
                }
            });
        }

        res.json(evaluation);
    } catch (error) {
        res.status(500).json({
            error: {
                code: 'SERVER_ERROR',
                message: 'Error fetching evaluation',
                details: [error.message]
            }
        });
    }
};

// @desc    Update evaluation
// @route   PUT /api/evaluations/:id
// @access  Private/Manager
const updateEvaluation = async (req, res) => {
    try {
        const evaluation = await Evaluation.findById(req.params.id);
        
        if (!evaluation) {
            return res.status(404).json({
                error: {
                    code: 'NOT_FOUND',
                    message: 'Evaluation not found',
                    details: ['No evaluation found with this ID']
                }
            });
        }

        // Verify the evaluator is updating their own evaluation
        if (evaluation.evaluatorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                error: {
                    code: 'FORBIDDEN',
                    message: 'Not authorized to update this evaluation',
                    details: ['Only the original evaluator can update this evaluation']
                }
            });
        }

        const { scores, comments, period } = req.body;
        
        if (scores) {
            evaluation.scores = scores;
            evaluation.overallScore = calculateOverallScore(scores);
        }
        
        if (comments) {
            evaluation.comments = comments;
        }
        
        if (period) {
            evaluation.period = period;
        }

        const updatedEvaluation = await evaluation.save();
        await updatedEvaluation.populate('userId', 'name email');
        await updatedEvaluation.populate('evaluatorId', 'name email');

        res.json(updatedEvaluation);
    } catch (error) {
        res.status(500).json({
            error: {
                code: 'SERVER_ERROR',
                message: 'Error updating evaluation',
                details: [error.message]
            }
        });
    }
};

// @desc    Get evaluation status for user
// @route   GET /api/evaluations/status/:userId
// @access  Private
const getEvaluationStatus = async (req, res) => {
    try {
        const evaluation = await hasCurrentMonthEvaluation(req.params.userId);
        res.json({
            hasEvaluation: !!evaluation,
            evaluationId: evaluation ? evaluation._id : null,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear()
        });
    } catch (error) {
        res.status(500).json({
            error: {
                code: 'SERVER_ERROR',
                message: 'Error checking evaluation status',
                details: [error.message]
            }
        });
    }
};

module.exports = {
    createEvaluation,
    getEvaluationsByUserId,
    getEvaluationById,
    updateEvaluation,
    getEvaluationStatus
};
