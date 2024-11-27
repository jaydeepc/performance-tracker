const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    evaluatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    scores: {
        discoveryScore: {
            type: String,
            required: true
        },
        specificationScore: {
            type: String,
            required: true
        },
        roadmapScore: {
            type: String,
            required: true
        },
        deliveryScore: {
            type: String,
            required: true
        },
        analyticsScore: {
            type: String,
            required: true
        },
        communicationScore: {
            type: String,
            required: true
        }
    },
    overallScore: {
        type: String,
        required: true
    },
    period: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Evaluation = mongoose.model('Evaluation', evaluationSchema);
module.exports = Evaluation;
