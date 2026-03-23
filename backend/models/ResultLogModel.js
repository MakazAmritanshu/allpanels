import mongoose from 'mongoose';

const resultLogSchema = new mongoose.Schema({
  gameId: { type: String, required: true, index: true },
  result: { type: String },
  fetchedAt: { type: Date, default: Date.now },
  processedBets: { type: Number, default: 0 },
});

const ResultLog = mongoose.model('ResultLog', resultLogSchema);
export default ResultLog;
