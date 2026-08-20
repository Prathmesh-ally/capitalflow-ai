const mongoose = require('mongoose');

const actionSchema = new mongoose.Schema(
  {
    detectedIssue: {
      type: String,
      required: true,
    },
    projectedShortfallDate: {
      type: Date,
      required: true,
    },
    recommendedAction: {
      fromAccountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true,
      },
      toAccountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true,
      },
      amountToTransfer: {
        type: Number,
        required: true,
      },
    },
    aiConfidenceScore: {
      type: Number,
      default: 0.95,
      min: 0,
      max: 1,
    },
    reasoningSummary: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending_Approval', 'Executed', 'Rejected'],
      default: 'Pending_Approval',
    },
    executedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Action', actionSchema);