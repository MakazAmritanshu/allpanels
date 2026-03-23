import mongoose from 'mongoose';

const betHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    gameId: {
      type: String,
      required: true,
    },
    roundId: {
      type: String,
    },
    betId: {
      type: String,
    },
    cid: {
      type: Number,
    },
    gid: {
      type: Number,
    },
    betType: {
      type: String,
    },

    tabno: {
      type: Number,
    },
    market_id: {
      type: String,
    },

    userName: {
      type: String,
      required: true,
    },
    sid: {
      type: String,
    },
    otype: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    xValue: {
      type: Number,
      required: true,
    },
    resultAmount: {
      type: Number,
      default: 0,
    },
    profitLossChange: {
      type: Number,
      default: 0,
    },
    betAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: Number,
      required: true,
      default: 0,
    },
    eventName: {
      type: String,
      required: true,
    },
    marketName: {
      type: String,
      required: true,
    },
    fancyScore: {
      type: String,
      default: 0,
    },
    gameType: {
      type: String,
      required: true,
    },
    gameName: {
      type: String,
      required: true,
    },
    teamName: {
      type: String,
      required: true,
    },
    recordType: {
      type: String,
      enum: ['individual', 'net_position'],
      default: 'individual',
    },
    relatedBets: {
      type: [String],
      default: [],
    },

    betResult: {
      type: String,
    },

    isCashoutHedge: {
      type: Boolean,
      default: false,
    },
    hedgedBetId: {
      type: String,
    },

    settledBy: {
      type: String,
      enum: ['api', 'manual', 'cashout'],
    },
    settledAt: {
      type: Date,
    },

    placementType: {
      type: String,
      enum: [
        'new',
        'merge',
        'score_offset',
        'odds_offset',
        'no_offset_separate',
      ],
      default: 'new',
    },
    parentBetSnapshot: {
      price: { type: Number },
      betAmount: { type: Number },
      xValue: { type: Number },
      otype: { type: String },
      fancyScore: { type: String },
    },
    userBalanceBefore: {
      type: Number,
    },
    userExposureBefore: {
      type: Number,
    },

    date: {
      type: Date,
      default: Date.now,
    },
    subtype: { type: String },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries during settlement and reporting
betHistorySchema.index({ betId: 1 }); // Primary lookup for settlement
betHistorySchema.index({ status: 1 }); // Settlement filtering
betHistorySchema.index({ userId: 1 }); // User-specific queries
betHistorySchema.index({ gameId: 1 }); // Game settlement lookups
betHistorySchema.index({ userName: 1, gameName: 1, status: 1 }); // Report queries

//FOR CHANGING THE STATUS OF BET HISTORY
betHistorySchema.pre('save', function (next) {
  if (this.isModified('status')) {
    console.log(
      `The status of the bet history model is changing to ${this.status}`
    );
  }
  next();
});

const betHistoryModel = mongoose.model('BetHistory', betHistorySchema);

export default betHistoryModel;
