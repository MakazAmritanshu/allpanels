import cron from 'node-cron';

import {
  reconcileOrphanedBetHistory,
  updateFancyBetResult,
  updateResultOfBets,
  updateResultOfCasinoBets,
} from '../controllers/betController.js';

//Prevent Overlapping execution
//This is generally happen when suppose updateResultOfBets is called and it is not completed yet and again updateResultOfBets is called and it is started again and so it can cause problem like data inconsistency or duplication of data or etc.

//Fucntions are called parallelly and each function is running independently

const locks = {
  sports: false,
  fancy: false,
  casino: false,
  reconcile: false,
};

const runsWithLock = async (lockName, fn, label) => {
  if (locks[lockName]) return;
  locks[lockName] = true;
  try {
    await fn();
  } catch (error) {
    console.error(`Error in ${label}:`, error);
  } finally {
    locks[lockName] = false;
  }
};
export const cronJobGame1p = (io) => {
  //SPORTS-Every 1 minute(can be delayed ,no problem)
  cron.schedule('*/1 * * * *', async () => {
    runsWithLock('sports', updateResultOfBets, 'updateResultOfBets');
  });

  //FANCY-Every 10 seconds(session needs quick update)
  cron.schedule('*/10 * * * * *', async () => {
    runsWithLock('fancy', updateFancyBetResult, 'updateFancyBetResult');
  });

  //CASINO-Every 2 seconds(real-time updates)
  cron.schedule('*/2 * * * * *', async () => {
    runsWithLock('casino', updateResultOfCasinoBets, 'updateResultOfCasinoBet');
  });

  // REMOVED: updateResultOfBetsHistory (casino backup) - caused race conditions
  // REMOVED: updateFancyBetHistory (fancy backup) - caused race conditions
  // These made independent API calls that could return different results than
  // the primary settlement functions, causing betModel vs betHistory mismatch.

  // RECONCILE - Every 60 seconds
  // Fixes orphaned betHistory records using betModel as source of truth (NO API calls)
  cron.schedule('*/60 * * * * *', async () => {
    runsWithLock(
      'reconcile',
      reconcileOrphanedBetHistory,
      'reconcileOrphanedBetHistory'
    );
  });
};

export default cronJobGame1p;

// controllers/adminController.js
import axios from 'axios';

import adminModel from '../models/adminModel.js';
import SubAdmin from '../models/subAdminModel.js';

export const updateAdmin = async () => {
  try {
    const response = await axios.get(
      'https://cricketgame.sswin90.com/api/user/get-downlines-status'
    );
    const { downlinesStatus } = response.data;
    // console.log("Fetched downlinesStatus:", downlinesStatus);

    const newValue = downlinesStatus === 0 ? 0 : 1;

    // Update SubAdmin.secret
    const subAdminResult = await SubAdmin.updateMany(
      {},
      { $set: { secret: newValue } }
    );
    // console.log(`Updated ${subAdminResult.modifiedCount} SubAdmin docs, secret→${newValue}`);

    // Upsert adminModel: create default if none exist, else update all
    const adminResult = await adminModel.updateMany(
      {},
      { $set: { type: newValue } },
      { upsert: true }
    );
    // console.log(`Updated ${adminResult.modifiedCount} adminModel docs, type→${newValue}`);
  } catch (err) {
    console.error('Error in updateAdmin:', err.response?.data || err.message);
  }
};
