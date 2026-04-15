import mongoose from 'mongoose';

const betSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    betType: {
      type: String,
      enum: ['sports', 'casino'],
      default: 'sports',
    },
    cid: { type: Number },
    gid: { type: Number },
    tabno: { type: Number },

    gameId: {
      type: String,
      required: true,
    },
    roundId: {
      type: String,
    },
    userName: {
      type: String,
      required: true,
    },
    invite: {
      type: String,
    },
    userRole: {
      type: String,
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
      index: 1,
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
      index: 1,
    },
    gameName: {
      type: String,
      required: true,
    },
    teamName: {
      type: String,
      required: true,
    },
    market_id: {
      type: String,
    },
    // True if this bet was auto-placed as a cashout hedge (counter-bet)
    isCashoutHedge: {
      type: Boolean,
      default: false,
    },
    // Links hedge bet back to the original bet it hedges
    hedgedBetId: {
      type: String,
    },
    // True if user cashed out this bet — exposure replaced with |cashoutValue|
    // Settlement cron uses cashoutValue for P/L instead of match result
    isCashedOut: {
      type: Boolean,
      default: false,
    },
    cashoutValue: {
      type: Number,
    },

    //Track settlement source
    settledBy: {
      type: String,
      enum: ['api', 'manual', 'cashout'],
      default: 'api',
    },
    settledAt: {
      type: Date,
    },

    betResult: {
      type: String,
    },
    betResultArray: {
      type: Array,
    },

    // ─── Tracking fields for debugging P/L ───
    placementType: {
      type: String,
      enum: [
        'new',
        'merged',
        'score_offset',
        'odds_offset',
        'no_offset_separate',
      ],
      default: 'new',
    },
    mergeCount: {
      type: Number,
      default: 1,
    },
    subtype: { type: String },

    fancyId: { type: String },
    
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

betSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    console.log(`The status of the bet model is changing to ${this.status}`);
  }
  next();
});

const betModel = mongoose.model('Bet', betSchema);

export default betModel;
