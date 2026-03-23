import mongoose from 'mongoose';

const transactionHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      // trim: true
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    deposite: {
      type: Number,
      required: true,
    },
    withdrawl: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    remark: {
      type: String,
      trim: true,
    },
    invite: {
      type: String,
      trim: true,
    },
    from: {
      type: String,
      trim: true,
    },
    to: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const TransactionHistory = mongoose.model(
  'TransactionHistory',
  transactionHistorySchema
);

export default TransactionHistory;
