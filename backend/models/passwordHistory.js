import mongoose from 'mongoose';

const passwordHistorySchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
    },

    remark: {
      type: String,
      trim: true,
    },

    userId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const passwordHistory = mongoose.model(
  'passwordHistory',
  passwordHistorySchema
);

export default passwordHistory;
