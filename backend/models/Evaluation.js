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
        discovery: {
            value: {
                type: Number,
                required: true
            },
            qualitative: {
                type: String,
                required: true
            }
        },
        specification: {
            value: {
                type: Number,
                required: true
            },
            qualitative: {
                type: String,
                required: true
            }
        },
        roadmap: {
            value: {
                type: Number,
                required: true
            },
            qualitative: {
                type: String,
                required: true
            }
        },
        delivery: {
            value: {
                type: Number,
                required: true
            },
            qualitative: {
                type: String,
                required: true
            }
        },
        analytics: {
            value: {
                type: Number,
                required: true
            },
            qualitative: {
                type: String,
                required: true
            }
        },
        communication: {
            value: {
                type: Number,
                required: true
            },
            qualitative: {
                type: String,
                required: true
            }
        }
    },
    overallScore: {
        type: Number,
        required: true
    },
    comments: {
        type: String,
        required: true
    },
    period: {
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        }
    }
}, {
    timestamps: true
});

const Evaluation = mongoose.model('Evaluation', evaluationSchema);
module.exports = Evaluation;
