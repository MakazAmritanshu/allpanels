import mongoose from 'mongoose';

const depositHistorySchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
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
  },
  {
    timestamps: true,
  }
);

const DepositHistory = mongoose.model('DepositHistory', depositHistorySchema);

export default DepositHistory;
