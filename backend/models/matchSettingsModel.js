import mongoose from 'mongoose';

import subAdmin from './subAdminModel.js';

//This Model stores only the  deactivated matches
//if a match is not in this collection,it means it is active
const deactivateMatchSchema = new mongoose.Schema(
  {
    matchId: {
      type: String,
      unique: true,
      required: true,
    },
    sport: {
      type: String,
      enum: ['cricket', 'tennis', 'soccer', 'horse-racing'],
      required: true,
    },
    matchName: {
      type: String,
    },
    deactivateBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: subAdmin,
    },
  },
  { timestamps: true }
);

const DeactivatedMatch = mongoose.model(
  'DeactivatedMatch',
  deactivateMatchSchema
);
export default DeactivatedMatch;
