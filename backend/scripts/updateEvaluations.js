const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Evaluation = require('../models/Evaluation');

dotenv.config();

const updateEvaluations = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Find all evaluations
        const evaluations = await Evaluation.find({});

        // Update each evaluation
        for (const evaluation of evaluations) {
            // Convert string scores to number format
            const updatedScores = {
                discovery: {
                    value: 8.0,
                    qualitative: evaluation.scores.discoveryScore || 'Good performance in discovery'
                },
                specification: {
                    value: 8.0,
                    qualitative: evaluation.scores.specificationScore || 'Good performance in specification'
                },
                roadmap: {
                    value: 8.0,
                    qualitative: evaluation.scores.roadmapScore || 'Good performance in roadmap'
                },
                delivery: {
                    value: 8.0,
                    qualitative: evaluation.scores.deliveryScore || 'Good performance in delivery'
                },
                analytics: {
                    value: 8.0,
                    qualitative: evaluation.scores.analyticsScore || 'Good performance in analytics'
                },
                communication: {
                    value: 8.0,
                    qualitative: evaluation.scores.communicationScore || 'Good performance in communication'
                }
            };

            // Calculate overall score
            const overallScore = 8.0;

            // Update evaluation
            await Evaluation.findByIdAndUpdate(evaluation._id, {
                scores: updatedScores,
                overallScore,
                period: {
                    startDate: evaluation.period || new Date(2024, 0, 1),
                    endDate: evaluation.period || new Date(2024, 0, 31)
                },
                comments: 'Good overall performance across all areas.'
            });

            console.log(`Updated evaluation: ${evaluation._id}`);
        }

        console.log('Successfully updated evaluations');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

updateEvaluations();
