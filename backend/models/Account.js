const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    accountName: {
      type: String,
      required: [true, 'Account name is required'],
      trim: true,
    },
    accountNumber: {
      type: String,
      required: [true, 'Account number is required'],
      unique: true,
      trim: true,
    },
    balance: {
      type: Number,
      required: [true, 'Current balance is required'],
      default: 0,
    },
    minThreshold: {
      type: Number,
      default: 50000, 
    },
    currency: {
      type: String,
      default: 'INR',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Account', accountSchema);