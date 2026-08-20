const mongoose = require('mongoose');

const actionSchema = new mongoose.Schema({
    detectedIssue: {
        type: String,
        required: true
    },
    reasoningSummary: {
        type: String,
        required: true
    },
    aiConfidenceScore: {
        type: Number,
        default: 0.95
    },
    recommendedAction: {
        fromAccountId: {
            type: mongoose.Schema.Types.Mixed, // Allows both MongoDB ObjectId and custom string flags like 'EXTERNAL_CREDIT'
            ref: 'Account',
            required: true
        },
        toAccountId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: true
        },
        amountToTransfer: {
            type: Number,
            required: true
        }
    },
    status: {
        type: String,
        enum: ['Pending_Approval', 'Executed', 'Dismissed'],
        default: 'Pending_Approval'
    },
    executedAt: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('Action', actionSchema);