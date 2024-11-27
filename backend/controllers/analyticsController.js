const User = require('../models/User');
const Evaluation = require('../models/Evaluation');

const getTeamAnalytics = async (req, res) => {
    try {
        const { managerId } = req.params;
        
        // Get all evaluations for the team
        const teamMembers = await User.find({ managerId });
        const memberIds = teamMembers.map(member => member._id);
        
        const evaluations = await Evaluation.find({
            userId: { $in: memberIds }
        }).sort({ createdAt: -1 });

        // Calculate average scores
        const averageScores = {
            discovery: calculateAverage(evaluations, 'discovery'),
            specification: calculateAverage(evaluations, 'specification'),
            roadmap: calculateAverage(evaluations, 'roadmap'),
            delivery: calculateAverage(evaluations, 'delivery'),
            analytics: calculateAverage(evaluations, 'analytics'),
            communication: calculateAverage(evaluations, 'communication'),
        };

        // Calculate overall average
        averageScores.overall = Object.values(averageScores).reduce((a, b) => a + b, 0) / 6;

        // Calculate trend data (last 6 months)
        const trendData = await calculateTrendData(memberIds);

        res.json({
            averageScores,
            trendData,
            teamSize: teamMembers.length,
            evaluationsCompleted: evaluations.length
        });
    } catch (error) {
        res.status(500).json({
            error: {
                code: 'SERVER_ERROR',
                message: 'Error fetching team analytics',
                details: [error.message]
            }
        });
    }
};

// Helper function to calculate average score for a category
const calculateAverage = (evaluations, category) => {
    if (evaluations.length === 0) return 0;
    const sum = evaluations.reduce((acc, eval) => acc + (eval[category] || 0), 0);
    return sum / evaluations.length;
};

// Helper function to calculate trend data
const calculateTrendData = async (memberIds) => {
    const months = 6;
    const trendData = [];

    for (let i = 0; i < months; i++) {
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() - i);
        const startDate = new Date(endDate);
        startDate.setDate(1);
        endDate.setDate(31);

        const monthEvaluations = await Evaluation.find({
            userId: { $in: memberIds },
            createdAt: { $gte: startDate, $lte: endDate }
        });

        const averageScore = monthEvaluations.length > 0
            ? monthEvaluations.reduce((acc, eval) => {
                const scores = [
                    eval.discovery || 0,
                    eval.specification || 0,
                    eval.roadmap || 0,
                    eval.delivery || 0,
                    eval.analytics || 0,
                    eval.communication || 0
                ];
                return acc + (scores.reduce((a, b) => a + b, 0) / 6);
            }, 0) / monthEvaluations.length
            : 0;

        trendData.unshift({
            period: startDate.toLocaleString('default', { month: 'short' }),
            averageScore
        });
    }

    return trendData;
};

module.exports = {
    getTeamAnalytics
};
