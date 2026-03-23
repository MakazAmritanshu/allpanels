/**
 * Fancy Bet Settlement Service
 * Complete settlement with WebSocket updates, upline updates, and history tracking
 * Handles fancy/score-based bets: Normal, meter, line, ball, khado
 *
 * See: BETTING_SETTLEMENT_LOGIC.md for detailed rules
 */

import { updateAllUplines } from '../controllers/admin/subAdminController.js';
import betHistoryModel from '../models/betHistoryModel.js';
import {
  sendBalanceUpdates,
  sendExposureUpdates,
  sendOpenBetsUpdates,
} from '../socket/bettingSocket.js';
import { calculateAllExposure } from '../utils/exposureUtils.js';

/**
 * Settle a single fancy bet (score-based)
 * @param {Object} bet - Bet document
 * @param {Object} user - User document
 * @param {String|Number} actualScore - Actual final score
 * @returns {Object} { success, betUpdates, userUpdates }
 */
async function settleFancyBet(bet, user, actualScore) {
  try {
    const fancyScore = parseFloat(bet.fancyScore);
    const score = parseFloat(actualScore);

    if (isNaN(fancyScore) || isNaN(score)) {
      return {
        success: false,
        message: `Invalid fancy score: fancyScore=${bet.fancyScore}, actualScore=${actualScore}`,
      };
    }

    // Determine win: back wins if score >= fancyScore, lay wins if score < fancyScore
    const isWin =
      bet.otype === 'back' ? score >= fancyScore : score < fancyScore;

    let balanceChange = 0;
    let avBalanceChange = 0;
    let profitLossChange = 0;
    let resultAmount = 0;
    let status = 0;

    // Same offset/normal logic as sports bets
    if (isWin) {
      if (bet.betAmount < 0) {
        // Offset bet wins (loss scenario)
        balanceChange = bet.betAmount;
        avBalanceChange = 0;
        profitLossChange = bet.betAmount;
        resultAmount = Math.abs(bet.betAmount);
        status = 2; // LOSS
      } else {
        // Normal bet wins
        const winAmount = bet.betAmount + bet.price;
        balanceChange = bet.betAmount;
        avBalanceChange = winAmount;
        profitLossChange = bet.betAmount;
        resultAmount = Math.abs(bet.betAmount);
        status = 1; // WIN
      }
    } else {
      if (bet.betAmount < 0) {
        // Offset bet loses (break even)
        balanceChange = 0;
        avBalanceChange = -bet.betAmount;
        profitLossChange = 0;
        resultAmount = 0;
        status = 1; // WIN (break even)
      } else {
        // Normal bet loses
        balanceChange = -bet.price;
        avBalanceChange = -bet.price;
        profitLossChange = -bet.price;
        resultAmount = Math.abs(bet.price);
        status = 2; // LOSS
      }
    }

    // NOTE: User updates are applied via atomic $inc in the controller, not here
    // This prevents lost updates from concurrent cron jobs

    return {
      success: true,
      betUpdates: {
        status,
        resultAmount,
        profitLossChange,
        betResult: score.toString(),
        settledBy: 'api',
        settledAt: new Date(),
      },
      userUpdates: {
        balanceChange,
        avBalanceChange,
        profitLossChange,
      },
    };
  } catch (error) {
    console.error(`Error settling fancy bet ${bet._id}:`, error);
    return {
      success: false,
      message: error.message,
    };
  }
}

/**
 * Void a fancy bet (match cancelled/no result)
 * Returns stake to user via exposure recalculation - no direct balance changes
 * @param {Object} bet - Bet document
 * @returns {Object} { success, betUpdates }
 */
async function voidFancyBet(bet) {
  try {
    return {
      success: true,
      betUpdates: {
        status: 3, // VOID
        resultAmount: Math.abs(bet.price), // Show refunded amount
        profitLossChange: 0,
        betResult: 'VOID',
        settledBy: 'api',
        settledAt: new Date(),
      },
    };
  } catch (error) {
    console.error(`Error voiding fancy bet ${bet._id}:`, error);
    return {
      success: false,
      message: error.message,
    };
  }
}

/**
 * Calculate exposure from pending bets
 * For fancy bets, must analyze market-by-market scenarios
 * Offset bets use absolute betAmount
 * Normal bets use price
 * @param {Array} pendingBets - Unsettled fancy bets
 * @returns {Number} Total exposure (worst-case scenario)
 */
//Calculate exposure from pending bets using market-based scenario analysis
function calculateExposure(pendingBets) {
  return calculateAllExposure(pendingBets);
}

/**
 * Recalculate avbalance: balance - exposure
 * MUST be called after settlement and exposure recalculation
 * @param {Object} user - User document
 * @param {Number} exposure - Current exposure value
 */
function recalculateAvbalance(user, exposure) {
  user.avbalance = user.balance - exposure;
}

/**
 * Complete settlement with WebSocket, upline, and history updates
 * Called from controllers after settlement logic
 * @param {String} userId - User ID who placed bet
 * @param {Object} user - Updated user object
 * @param {Number} newExposure - Recalculated exposure
 * @param {String} gameId - Game ID being settled
 * @param {Object} resultData - API result data
 */
async function sendSettlementUpdates(
  userId,
  user,
  newExposure,
  gameId,
  resultData
) {
  try {
    // Recalculate avbalance based on new exposure
    recalculateAvbalance(user, newExposure);

    // Send WebSocket updates to user
    sendBalanceUpdates(userId, user.avbalance);
    sendExposureUpdates(userId, newExposure);
    sendOpenBetsUpdates(userId, null);

    console.log(
      `✅ [FANCY] WebSocket updates sent: balance=${user.avbalance}, exposure=${newExposure}`
    );
  } catch (error) {
    console.error(
      `❌ Error sending settlement updates for user ${userId}:`,
      error.message
    );
  }
}

/**
 * Update uplines after fancy settlement
 * @param {Array} userIds - User IDs to update uplines for
 */
async function propagateUplineUpdates(userIds) {
  try {
    await updateAllUplines(userIds);
    console.log(`✅ [FANCY] Updated uplines for ${userIds.length} users`);
  } catch (error) {
    console.error(`❌ Error updating uplines:`, error.message);
  }
}

/**
 * Create history record for settled fancy bets
 * @param {String} gameId - Game ID
 * @param {String} finalScore - Final score/result
 * @param {Object} gameData - Game details (eventName, marketName, gameType, etc)
 * @param {Number} betsCount - Number of bets settled
 * @param {Object} stats - Settlement stats { totalPaidOut, totalCollected }
 */
async function recordBetHistory(
  gameId,
  finalScore,
  gameData,
  betsCount,
  stats
) {
  try {
    await betHistoryModel.create({
      gameId,
      final_result: finalScore,
      eventName: gameData.eventName,
      marketName: gameData.marketName,
      gameType: gameData.gameType || 'fancy',
      gameName: gameData.gameName,
      sport_id: gameData.sport_id,
      betsSettled: betsCount,
      totalAmount: (stats?.totalPaidOut || 0) + (stats?.totalCollected || 0),
      settledBy: 'api',
      settlementDate: new Date(),
    });

    console.log(`✅ [FANCY] Bet history recorded for game ${gameId}`);
  } catch (error) {
    console.error(`❌ Error recording bet history:`, error.message);
  }
}

export {
  calculateExposure,
  propagateUplineUpdates,
  recalculateAvbalance,
  recordBetHistory,
  sendSettlementUpdates,
  settleFancyBet,
  voidFancyBet,
};
