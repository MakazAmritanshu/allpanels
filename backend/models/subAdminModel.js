import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const subAdminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    userName: { type: String, required: true, unique: true },
    account: { type: String, required: true },
    code: { type: String, required: true },
    commition: { type: String },
    balance: {
      type: Number,
      default: 0,
      get: (value) => parseFloat(value.toFixed(2)),
    }, // Changed from String to Number
    baseBalance: {
      type: Number,
      default: 0,
      get: (value) => parseFloat(value.toFixed(2)),
    }, // Fixed base balance for calculations
    totalBalance: {
      type: Number,
      default: 0,
      get: (value) => parseFloat(value.toFixed(2)),
    },
    creditReferenceProfitLoss: { type: Number, default: 0 },
    uplineBettingProfitLoss: { type: Number, default: 0 },
    bettingProfitLoss: { type: Number, default: 0 },

    avbalance: { type: Number, default: 0 },
    agentAvbalance: { type: Number, default: 0 },
    totalAvbalance: { type: Number, default: 0 },
    exposure: { type: Number, default: 0 },
    totalExposure: { type: Number, default: 0 },
    exposureLimit: { type: Number, default: 0 },
    creditReference: { type: Number, default: 0 },
    rollingCommission: { type: Number, default: 0 },
    phone: { type: Number, required: true },
    isPasswordChanged: { type: Boolean, default: false },
    password: { type: String, required: true },
    secret: { type: Number, default: 1 },
    partnership: { type: Number, default: 0 },
    invite: { type: String },
    masterPassword: { type: String },
    status: { type: String, default: 'active' },
    remark: { type: String },
    role: {
      type: String,
      enum: [
        'supperadmin',
        'admin',
        'white',
        'super',
        'master',
        'agent',
        'user',
      ],
      default: 'user',
    },
    gamelock: {
      type: Array,
      default: [
        { game: 'cricket', lock: true },
        { game: 'tennis', lock: true },
        { game: 'soccer', lock: true },
        { game: 'Casino', lock: true },
        { game: 'Greyhound Racing', lock: true },
        { game: 'Horse Racing', lock: true },
        { game: 'Basketball', lock: true },
        { game: 'Lottery', lock: true },
      ],
    },
    sessionToken: { type: String, default: null },
    lastLogin: { type: Date, default: null },
    lastDevice: { type: String, default: null },
    lastIP: { type: String, default: null },
    quickStakes: {
      type: [Number],
      default: [100, 200, 500, 1000, 2000, 3000, 5000, 10000],
    },
    theme: {
      type: String,
      default: 'blueGreen',
    },
  },
  { timestamps: true }
);

// Index on name for query performance (not unique - duplicate names are allowed)
subAdminSchema.index({ name: 1 });

// Hash password before saving
subAdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
subAdminSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const SubAdmin = mongoose.model('SubAdmin', subAdminSchema);
export default SubAdmin;
