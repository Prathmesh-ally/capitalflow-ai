const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    payeeName: {
      type: String,
      required: [true, 'Payee name is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    category: {
      type: String,
      enum: ['Payroll', 'Vendor', 'Tax', 'Utility', 'Subscription'],
      required: true,
    },
    targetAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Processed', 'Cancelled'],
      default: 'Pending',
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);