import mongoose from 'mongoose';

const creditRefHistorySchema = new mongoose.Schema(
  {
    formName: {
      type: String,
      required: true,
      trim: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    oldamount: {
      type: Number,
      required: true,
    },
    newamount: {
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
    userId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const creditRefHistory = mongoose.model(
  'creditRefHistory',
  creditRefHistorySchema
);

export default creditRefHistory;
