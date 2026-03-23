import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema(
  {
    admin: {
      type: String,
    },
    gameId: {
      type: String,
    },
    type: {
      type: Number,
      default: 1,
    },

    activeUser: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const adminModel = mongoose.model('admin', adminSchema);

export default adminModel;
