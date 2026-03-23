/**
 * Sports Bet Settlement Service
 * Complete settlement with WebSocket updates, upline updates, and history tracking
 * Handles: Match Odds, Bookmaker, Toss, 1st 6 over, OVER_UNDER
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

async function settleSportsBet(bet, user, winner) {
  try {
    const betTeam = (bet.teamName || '').trim().toLowerCase();
    const winnerNorm = (winner || '').trim().toLowerCase();
    const isWin = betTeam === winnerNorm;

    let balanceChange = 0;
    let avBalanceChange = 0;
    let profitLossChange = 0;
    let resultAmount = 0;
    let status = 0;

    // Same logic for all sports bet types
    if (bet.otype === 'back') {
      if (isWin) {
        // Back bet WINS
        if (bet.betAmount < 0) {
          // Offset back: net loss despite winning
          balanceChange = bet.betAmount;
          avBalanceChange = 0;
          profitLossChange = bet.betAmount;
          resultAmount = Math.abs(bet.betAmount);
          status = 2; // LOSS (user loses money)
        } else {
          // Normal back: profit
          const winAmount = bet.betAmount + bet.price;
          balanceChange = bet.betAmount;
          avBalanceChange = winAmount;
          profitLossChange = bet.betAmount;
          resultAmount = Math.abs(bet.betAmount);
          status = 1; // WIN
        }
      } else {
        // Back bet LOSES
        if (bet.betAmount < 0) {
          // Offset back: break even
          balanceChange = 0;
          avBalanceChange = -bet.betAmount;
          profitLossChange = 0;
          resultAmount = 0;
          status = 1; // WIN (break even)
        } else {
          // Normal back: loss
          balanceChange = -bet.price;
          avBalanceChange = -bet.price;
          profitLossChange = -bet.price;
          resultAmount = Math.abs(bet.price);
          status = 2; // LOSS
        }
      }
    } else {
      // LAY BET
      if (isWin) {
        // Lay LOSES (selection won, layer loses)
        balanceChange = -bet.price;
        avBalanceChange = -bet.price;
        profitLossChange = -bet.price;
        resultAmount = Math.abs(bet.price);
        status = 2; // LOSS
      } else {
        // Lay WINS (selection lost, layer wins)
        const winAmount = bet.betAmount + bet.price;
        balanceChange = bet.betAmount;
        avBalanceChange = winAmount;
        profitLossChange = bet.betAmount;
        resultAmount = Math.abs(bet.betAmount);
        status = 1; // WIN
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
        betResult: winner,
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
    console.error(`Error settling sports bet ${bet._id}:`, error);
    return {
      success: false,
      message: error.message,
    };
  }
}

/**
 * Void a sports bet (match cancelled/no result)
 * Returns stake to user via exposure recalculation - no direct balance changes
 * @param {Object} bet - Bet document
 * @returns {Object} { success, betUpdates }
 */
async function voidSportsBet(bet) {
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
    console.error(`Error voiding sports bet ${bet._id}:`, error);
    return {
      success: false,
      message: error.message,
    };
  }
}

async function tiedSportsBet(bet, user) {
  try {
    let balanceChange = 0;
    let avBalanceChange = 0;
    let profitLossChange = 0;
    let resultAmount = 0;
    let status = 0;

    if (bet.otype === 'back') {
      // Back bet LOSES in tied match (no winner means backers lose)
      balanceChange = -bet.price;
      avBalanceChange = -bet.price;
      profitLossChange = -bet.price;
      resultAmount = Math.abs(bet.price);
      status = 2; // LOSS
    } else {
      // Lay bet WINS in tied match (no selection won, so layers win)
      const winAmount = bet.betAmount + bet.price;
      balanceChange = bet.betAmount;
      avBalanceChange = winAmount;
      profitLossChange = bet.betAmount;
      resultAmount = Math.abs(bet.betAmount);
      status = 1; // WIN
    }

    // NOTE: User updates are applied via atomic $inc in the controller, not here
    // This prevents lost updates from concurrent cron jobs

    return {
      success: true,
      betUpdates: {
        status,
        resultAmount,
        profitLossChange,
        betResult: 'TIED',
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
    console.error(`Error settling tied bet ${bet._id}:`, error);
    return {
      success: false,
      message: error.message,
    };
  }
}

/**
 * Calculate exposure from pending bets
 * Handles all edge cases:
 * - Normal bets (betAmount >= 0): exposure = price
 * - Offset bets (betAmount < 0): exposure = MAX(|betAmount|, price)
 * - Guaranteed profit (price < 0): exposure = 0
 *
 * @param {Array} pendingBets - Unsettled bets
 * @returns {Number} Total exposure
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
async function sendSettlementUpdates(userId, user, newExposure) {
  try {
    // Recalculate avbalance based on new exposure
    recalculateAvbalance(user, newExposure);

    // Send WebSocket updates to user
    sendBalanceUpdates(userId, user.avbalance);
    sendExposureUpdates(userId, newExposure);
    sendOpenBetsUpdates(userId, null);

    console.log(
      `[SPORTS] WebSocket updates sent: balance=${user.avbalance}, exposure=${newExposure}`
    );
  } catch (error) {
    console.error(
      ` Error sending settlement updates for user ${userId}:`,
      error.message
    );
  }
}

/**
 * Update uplines after sport settlement
 * @param {Array} userIds - User IDs to update uplines for
 */
async function propagateUplineUpdates(userIds) {
  try {
    await updateAllUplines(userIds);
    console.log(` [SPORTS] Updated uplines for ${userIds.length} users`);
  } catch (error) {
    console.error(` Error updating uplines:`, error.message);
  }
}

/**
 * Create history record for settled bets
 * @param {String} gameId - Game ID
 * @param {String} winner - Winner/result
 * @param {Object} gameData - Game details (eventName, marketName, gameType, etc)
 * @param {Number} betsCount - Number of bets settled
 * @param {Object} stats - Settlement stats { totalPaidOut, totalCollected }
 */
async function recordBetHistory(gameId, winner, gameData, betsCount, stats) {
  try {
    await betHistoryModel.create({
      gameId,
      final_result: winner,
      eventName: gameData.eventName,
      marketName: gameData.marketName,
      gameType: gameData.gameType,
      gameName: gameData.gameName,
      sport_id: gameData.sport_id,
      betsSettled: betsCount,
      totalAmount: (stats?.totalPaidOut || 0) + (stats?.totalCollected || 0),
      settledBy: 'api',
      settlementDate: new Date(),
    });

    console.log(` [SPORTS] Bet history recorded for game ${gameId}`);
  } catch (error) {
    console.error(` Error recording bet history:`, error.message);
  }
}

export {
  calculateExposure,
  propagateUplineUpdates,
  recalculateAvbalance,
  recordBetHistory,
  sendSettlementUpdates,
  settleSportsBet,
  tiedSportsBet,
  voidSportsBet,
};
