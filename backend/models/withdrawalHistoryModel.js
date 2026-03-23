import mongoose from 'mongoose';

const withdrawalHistorySchema = new mongoose.Schema(
  {
    userName: {
      type: String,
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
  },
  {
    timestamps: true,
  }
);

const WithdrawalHistory = mongoose.model(
  'WithdrawalHistory',
  withdrawalHistorySchema
);

export default WithdrawalHistory;
