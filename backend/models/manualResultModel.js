import mongoose from 'mongoose';

import SubAdmin from './subAdminModel.js';

const manualResultSchema = new mongoose.Schema(
  {
    gameId: {
      type: String,
      required: true,
      index: true,
    },
    eventName: {
      type: String,
      required: true,
    },
    marketName: {
      type: String,
    },
    gameType: {
      type: String,
    },
    gameName: {
      type: String,
    },
    sport_id: {
      type: Number,
    },

    //Result data
    final_result: {
      type: String,
      required: true,
    }, //will match event name

    //Admin who set this
    setBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubAdmin',
      required: true,
    },

    //Status Tracking
    isActive: {
      type: Boolean,
      default: true,
    },

    //Count of bets affected by this result
    appliedToBets: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const manualResult = mongoose.model('manualResult', manualResultSchema);

export default manualResult;
