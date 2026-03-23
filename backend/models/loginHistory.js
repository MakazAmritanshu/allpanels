// models/loginHistory.js
import mongoose from 'mongoose';

export const loginHistorySchema = mongoose.Schema(
  {
    userName: {
      type: String,
    },
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
    },
    dateTime: {
      type: String,
    },
    ip: {
      type: String,
    },
    isp: {
      type: String,
    },
    city: {
      type: String,
    },
    region: {
      type: String,
    },
    country: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const LoginHistory = mongoose.model('LoginHistory', loginHistorySchema);
export default LoginHistory;
