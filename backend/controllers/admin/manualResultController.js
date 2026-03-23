import betHistoryModel from '../../models/betHistoryModel.js';
import betModel from '../../models/betModel.js';
import manualResultModel from '../../models/manualResultModel.js';
import SubAdmin from '../../models/subAdminModel.js';
import {
  settleFancyBet,
  voidFancyBet,
} from '../../services/fancyBetSettlementService.js';
import {
  calculateExposure,
  propagateUplineUpdates,
  recalculateAvbalance,
  recordBetHistory,
  sendSettlementUpdates,
  settleSportsBet,
  tiedSportsBet,
  voidSportsBet,
} from '../../services/sportsSettlementService.js';
import {
  sendBalanceUpdates,
  sendExposureUpdates,
  sendOpenBetsUpdates,
} from '../../socket/bettingSocket.js';
import { updateAllUplines } from './subAdminController.js';

// Fancy game types that require score-based settlement
const FANCY_GAME_TYPES = ['Normal', 'meter', 'line', 'ball', 'khado'];

// Helper to determine settlement type
const getSettlementType = (gameType) => {
  if (FANCY_GAME_TYPES.includes(gameType)) return 'score';
  return 'team_name';
};

// Helper to get bet category
const getBetCategory = (gameType) => {
  if (FANCY_GAME_TYPES.includes(gameType)) return 'Fancy';
  return 'Sports';
};

//Get all pending games with unsettled bets
//Returns unique games with bet counts, total stakes, and selections

export const getPendingGamesForManualResult = async (req, res) => {
  try {
    if (req.role !== 'supperadmin') {
      return res.status(403).json({
        success: false,
        message: 'Only SuperAdmin can access pending games',
      });
    }

    // Only fetch Cricket, Soccer, Tennis bets (exclude casino)
    const pendingGames = await betModel.aggregate([
      {
        $match: {
          status: 0,
          betType: { $ne: 'casino' }, // Exclude casino bets
          gameName: {
            $in: [
              'Cricket Game',
              'Soccer Game',
              'Tennis Game',
              'Horse Racing Game',
              'Cricket',
              'Soccer',
              'Tennis',
              'Horse Racing',
            ],
          },
        },
      },

      // Group by gameId + gameType + marketName to separate each market
      // This ensures "25 over run" and "35 over run" are separate entries
      {
        $group: {
          _id: {
            gameId: '$gameId',
            gameType: '$gameType',
            marketName: '$marketName',
          },
          eventName: { $first: '$eventName' },
          gameName: { $first: '$gameName' },
          totalBets: { $sum: 1 },
          totalStake: { $sum: '$price' },
          totalPotentialPayout: { $sum: '$betAmount' },
          selections: { $addToSet: '$teamName' },
          fancyScores: { $addToSet: '$fancyScore' }, // Collect fancy scores for reference
          oldestBet: { $min: '$createdAt' },
          latestBet: { $max: '$createdAt' },
        },
      },

      // Oldest bet first (urgent games on top)
      { $sort: { oldestBet: 1 } },

      {
        $project: {
          _id: 0,
          gameId: '$_id.gameId',
          gameType: '$_id.gameType',
          marketName: '$_id.marketName',
          eventName: 1,
          gameName: 1,
          totalBets: 1,
          totalStake: 1,
          totalPotentialPayout: 1,
          selections: 1,
          fancyScores: 1,
          oldestBet: 1,
          latestBet: 1,
        },
      },
    ]);

    // Add settlementType and betCategory to each game
    const gamesWithSettlementInfo = pendingGames.map((game) => ({
      ...game,
      settlementType: getSettlementType(game.gameType),
      betCategory: getBetCategory(game.gameType),
    }));

    return res.status(200).json({
      success: true,
      message: 'Pending games fetched successfully',
      data: {
        totalPendingGames: gamesWithSettlementInfo.length,
        games: gamesWithSettlementInfo,
      },
    });
  } catch (error) {
    console.error('Error in getPendingGamesForManualResult:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error?.message,
    });
  }
};

// Get unsettled bets for a specific game

export const getUnsettledBetsForManualResult = async (req, res) => {
  try {
    if (req.role !== 'supperadmin') {
      return res.status(403).json({
        success: false,
        message: 'Only SuperAdmin can get unsettled bets',
      });
    }

    const { gameId, gameType, marketName } = req.query;
    if (!gameId) {
      return res.status(400).json({
        success: false,
        message: 'Game ID is required',
      });
    }

    // Build query - filter by gameType and marketName if provided
    const query = { gameId, status: 0 };
    if (gameType) {
      query.gameType = gameType;
    }
    if (marketName) {
      query.marketName = marketName;
    }

    const unsettledBets = await betModel
      .find(query)
      .select(
        'userName teamName otype price betAmount eventName marketName gameType fancyScore createdAt'
      )
      .sort({ createdAt: -1 });

    if (!unsettledBets || unsettledBets.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No unsettled bets found for this gameId',
      });
    }

    // Calculate summary stats
    const summary = {
      totalBets: unsettledBets.length,
      totalStake: unsettledBets.reduce((sum, bet) => sum + bet.price, 0),
      bySelection: {},
    };

    unsettledBets.forEach((bet) => {
      if (!summary.bySelection[bet.teamName]) {
        summary.bySelection[bet.teamName] = { count: 0, stake: 0 };
      }
      summary.bySelection[bet.teamName].count++;
      summary.bySelection[bet.teamName].stake += bet.price;
    });

    return res.status(200).json({
      success: true,
      message: 'Unsettled bets fetched successfully',
      data: {
        summary,
        bets: unsettledBets,
      },
    });
  } catch (error) {
    console.error('Error in getUnsettledBetsForManualResult:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error?.message,
    });
  }
};

//SETTLE MANUAL RESULT - Creates result record AND settles all bets
//This is the main action endpoint that does everything in one call
// Supports both sports bets (team_name) and fancy bets (score)

export const settleManualResult = async (req, res) => {
  try {
    const {
      gameId,
      eventName,
      marketName,
      gameType,
      gameName,
      sport_id,
      final_result,
    } = req.body;
    const adminId = req.userId || req.id;

    // Auth check
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Role check
    if (req.role !== 'supperadmin') {
      return res.status(403).json({
        success: false,
        message: 'Only SuperAdmin can settle manual results',
      });
    }

    // Validate required fields
    if (!gameId || !final_result) {
      return res.status(400).json({
        success: false,
        message: 'gameId and final_result are required',
      });
    }

    // Determine if this is a fancy bet settlement
    const isFancyBet = FANCY_GAME_TYPES.includes(gameType);

    // For fancy bets, validate that final_result is a valid number
    if (isFancyBet && isNaN(parseFloat(final_result))) {
      return res.status(400).json({
        success: false,
        message: 'Fancy bets require a numeric score as final_result',
      });
    }

    // Build query to get unsettled bets - filter by gameType AND marketName
    const query = { gameId, status: 0 };
    if (gameType) {
      query.gameType = gameType;
    }
    if (marketName) {
      query.marketName = marketName; // Filter by marketName to settle only specific market
    }

    // Get all unsettled bets for this game, gameType, and marketName
    const unsettledBets = await betModel.find(query);
    if (!unsettledBets || unsettledBets.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No unsettled bets found for this gameId',
      });
    }

    // Track settlement stats and processed user IDs
    const settlementStats = {
      totalBets: unsettledBets.length,
      winners: 0,
      losers: 0,
      totalPaidOut: 0,
      totalCollected: 0,
    };
    const processedUserIds = new Set();

    // Process each bet
    for (const bet of unsettledBets) {
      try {
        // Freshness check: re-verify bet is still unsettled before processing
        // Prevents race condition with cron jobs that may have settled this bet
        const freshBet = await betModel.findOne({ _id: bet._id, status: 0 });
        if (!freshBet) {
          console.log(
            `[settleManualResult] SKIPPED Bet ${bet._id} - Already settled by cron`
          );
          continue;
        }
        Object.assign(bet, freshBet.toObject());

        const user = await SubAdmin.findById(bet.userId);
        if (!user) {
          console.warn(
            `[settleManualResult] User not found for bet ${bet._id}`
          );
          continue;
        }

        // Handle cashed-out bets: apply stored cashoutValue as P/L
        const resultLower = final_result.toLowerCase();
        const isVoidResult = resultLower === 'void';

        if (bet.isCashedOut) {
          const cashoutValue = bet.cashoutValue || 0;
          const cashoutStatus = cashoutValue >= 0 ? 1 : 2;

          bet.status = isVoidResult ? 3 : cashoutStatus;
          bet.resultAmount = isVoidResult ? 0 : Math.abs(cashoutValue);
          bet.profitLossChange = isVoidResult ? 0 : cashoutValue;
          bet.betResult = isVoidResult ? 'VOID' : 'CASHOUT';
          bet.settledBy = 'manual';
          bet.settledAt = new Date();
          await bet.save();

          if (!isVoidResult) {
            console.log(
              `[MANUAL $inc CASHOUT] betId=${bet._id} userId=${bet.userId} cashoutValue=${cashoutValue}`
            );
            await SubAdmin.findByIdAndUpdate(bet.userId, {
              $inc: {
                balance: cashoutValue,
                bettingProfitLoss: cashoutValue,
              },
            });

            if (cashoutStatus === 1) {
              settlementStats.winners++;
              settlementStats.totalPaidOut += Math.abs(cashoutValue);
            } else {
              settlementStats.losers++;
              settlementStats.totalCollected += Math.abs(cashoutValue);
            }
          }

          // Update bet history for cashed-out bet
          const cashoutHistoryRecords = await betHistoryModel.find({
            betId: bet._id.toString(),
            status: 0,
          });
          for (const historyRecord of cashoutHistoryRecords) {
            await betHistoryModel.updateOne(
              { _id: historyRecord._id },
              {
                $set: {
                  status: isVoidResult ? 3 : cashoutStatus,
                  resultAmount: isVoidResult ? 0 : Math.abs(cashoutValue),
                  profitLossChange: isVoidResult ? 0 : cashoutValue,
                  betResult: isVoidResult ? 'VOID' : 'CASHOUT',
                  settledBy: 'manual',
                  settledAt: new Date(),
                },
              }
            );
          }

          processedUserIds.add(user._id.toString());
          console.log(
            ` [MANUAL] Settled cashed-out bet ${bet._id} for user ${user.userName}: cashoutValue=${cashoutValue}`
          );
          continue;
        }

        // ✅ USE CORRECT SERVICE: Fancy bets use score, Sports bets use team name
        let settlementResult;

        if (resultLower === 'void') {
          // Void - refund all bets
          settlementResult = await voidSportsBet(bet);
          console.log(`[MANUAL-VOID] Voiding bet ${bet._id}`);
        } else if (resultLower === 'tied') {
          // Tied - all backers lose, layers win
          settlementResult = await tiedSportsBet(bet, user);
          console.log(`[MANUAL-TIED] Tied settlement for bet ${bet._id}`);
        } else if (FANCY_GAME_TYPES.includes(bet.gameType)) {
          // Fancy bet - use score-based settlement
          settlementResult = await settleFancyBet(bet, user, final_result);
          console.log(
            `[MANUAL-FANCY] Settling bet ${bet._id}: fancyScore=${bet.fancyScore}, actualScore=${final_result}`
          );
        } else {
          // Sports bet - use team name-based settlement
          settlementResult = await settleSportsBet(bet, user, final_result);
          console.log(
            `[MANUAL-SPORTS] Settling bet ${bet._id}: teamName=${bet.teamName}, winner=${final_result}`
          );
        }

        if (!settlementResult.success) {
          console.error(
            `Failed to settle bet ${bet._id}:`,
            settlementResult.message
          );
          continue;
        }

        // Apply bet updates and override settledBy for manual
        Object.assign(bet, settlementResult.betUpdates);
        bet.settledBy = 'manual';
        bet.settledAt = new Date();

        // Update settlement stats
        if (bet.status === 1) {
          settlementStats.winners++;
          settlementStats.totalPaidOut += bet.resultAmount;
        } else {
          settlementStats.losers++;
          settlementStats.totalCollected += bet.resultAmount;
        }

        // Save bet first
        await bet.save();

        // ✅ UPDATE BETHISTORY FIRST: Settle each individual bet history record
        // Each betHistory record represents an individual bet and must be settled based on its OWN values
        // betHistoryModel is the single source of truth for P/L
        const betHistoryRecords = await betHistoryModel.find({
          betId: bet._id.toString(),
          status: 0,
        });

        console.log(
          `  - Found ${betHistoryRecords.length} betHistory records to settle`
        );

        let totalUpdated = 0;
        let betHistoryTotalPL = 0; // Sum of individual bet P/L from betHistoryModel
        for (const historyRecord of betHistoryRecords) {
          let historyStatus;
          let historyResultAmount;
          let historyProfitLossChange;
          let isWin;

          // Check if this is a fancy bet (score-based) or sports bet (team-based)
          const isFancyHistoryBet = FANCY_GAME_TYPES.includes(
            historyRecord.gameType
          );

          if (isFancyHistoryBet) {
            // Fancy bet: use score-based comparison
            const actualScore = parseFloat(bet.betResult || '0');
            const fancyScore = parseFloat(historyRecord.fancyScore || '0');

            // Back wins if score >= fancyScore, Lay wins if score < fancyScore
            isWin =
              historyRecord.otype === 'back'
                ? actualScore >= fancyScore
                : actualScore < fancyScore;
          } else {
            // Sports bet: use team name comparison
            const historyTeam = (historyRecord.teamName || '').trim();
            const winnerTeam = (bet.betResult || '').trim();
            isWin =
              historyTeam &&
              winnerTeam &&
              historyTeam.toLowerCase() === winnerTeam.toLowerCase();
          }

          if (historyRecord.otype === 'back') {
            if (isWin) {
              historyStatus = 1;
              historyResultAmount = Math.abs(historyRecord.betAmount || 0);
              historyProfitLossChange = historyRecord.betAmount || 0;
            } else {
              historyStatus = 2;
              historyResultAmount = Math.abs(historyRecord.price || 0);
              historyProfitLossChange = -(historyRecord.price || 0);
            }
          } else {
            if (isWin) {
              historyStatus = 1;
              historyResultAmount = Math.abs(historyRecord.betAmount || 0);
              historyProfitLossChange = historyRecord.betAmount || 0;
            } else {
              historyStatus = 2;
              historyResultAmount = Math.abs(historyRecord.price || 0);
              historyProfitLossChange = -(historyRecord.price || 0);
            }
          }

          betHistoryTotalPL += historyProfitLossChange;

          await betHistoryModel.updateOne(
            { _id: historyRecord._id },
            {
              $set: {
                status: historyStatus,
                resultAmount: historyResultAmount,
                profitLossChange: historyProfitLossChange,
                betResult: bet.betResult,
                settledBy: 'manual',
                settledAt: new Date(),
              },
            }
          );
          totalUpdated++;

          console.log(
            ` [MANUAL BETHISTORY] Settled: ${historyRecord._id} IsFancy:${isFancyHistoryBet} Won:${isWin} Status:${historyStatus} P/L:${historyProfitLossChange}`
          );
        }

        if (totalUpdated === 0) {
          console.warn('WARNING: No betHistory records were updated!');
        } else {
          console.log(
            `SUCCESS: ${totalUpdated} betHistory records updated! Total P/L from betHistory: ${betHistoryTotalPL}`
          );
        }

        // Update user balance & P/L atomically
        // balance uses betModel settlement (handles offset exposure correctly)
        // bettingProfitLoss uses betHistoryModel sum (single source of truth for P/L)
        if (settlementResult.userUpdates) {
          const bplChange =
            betHistoryRecords.length > 0
              ? betHistoryTotalPL
              : settlementResult.userUpdates.profitLossChange;
          console.log(
            `[MANUAL $inc] betId=${bet._id} userId=${bet.userId} balanceChange=${settlementResult.userUpdates.balanceChange} bplChange=${bplChange} (betHistory P/L: ${betHistoryTotalPL}, betModel P/L: ${settlementResult.userUpdates.profitLossChange})`
          );
          await SubAdmin.findByIdAndUpdate(bet.userId, {
            $inc: {
              balance: settlementResult.userUpdates.balanceChange,
              bettingProfitLoss: bplChange,
            },
          });
        }

        processedUserIds.add(user._id.toString());

        console.log(
          ` [MANUAL] Settled bet ${bet._id} for user ${user.userName}: status=${bet.status}, result=${bet.resultAmount}`
        );
      } catch (betError) {
        console.error(`Error settling bet ${bet._id}:`, betError);
      }
    }

    //  NEW: Recalculate exposure and send WebSocket updates for each processed user
    for (const userId of processedUserIds) {
      try {
        const user = await SubAdmin.findById(userId);
        if (user) {
          const updatedPendingBets = await betModel.find({
            userId: userId,
            status: 0,
          });

          //  USE SERVICE: Calculate exposure
          const newExposure = calculateExposure(updatedPendingBets);
          user.exposure = newExposure;

          //  USE SERVICE: Recalculate avbalance
          recalculateAvbalance(user, newExposure);

          //  NEW: Send WebSocket updates
          sendBalanceUpdates(userId, user.avbalance);
          sendExposureUpdates(userId, newExposure);
          sendOpenBetsUpdates(userId, null);

          await user.save();

          console.log(
            ` [MANUAL] User ${user.userName}: exposure=${newExposure}, balance=${user.balance}, avbalance=${user.avbalance}`
          );
        }
      } catch (err) {
        console.error(`Error updating user ${userId}:`, err.message);
      }
    }

    //  NEW: Update all uplines
    if (processedUserIds.size > 0) {
      try {
        await updateAllUplines([...processedUserIds]);
        console.log(
          ` [MANUAL] Updated uplines for ${processedUserIds.size} users`
        );
      } catch (err) {
        console.error(`Error updating uplines:`, err.message);
      }
    }

    // Create or update manual result record
    const manualResultData = {
      gameId,
      final_result,
      eventName: eventName || unsettledBets[0]?.eventName,
      marketName: marketName || unsettledBets[0]?.marketName,
      gameType: gameType || unsettledBets[0]?.gameType,
      gameName: gameName || unsettledBets[0]?.gameName,
      sport_id,
      setBy: adminId,
      isActive: false,
      appliedToBets: settlementStats.totalBets,
    };

    await manualResultModel.findOneAndUpdate({ gameId }, manualResultData, {
      upsert: true,
      new: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Manual result settled successfully',
      data: {
        gameId,
        final_result,
        eventName: manualResultData.eventName,
        settlement: settlementStats,
      },
    });
  } catch (error) {
    console.error('Error in settleManualResult:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error?.message,
    });
  }
};

// Get all manual results with pagination

export const getManualResults = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [results, total] = await Promise.all([
      manualResultModel
        .find()
        .populate('setBy', 'userName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      manualResultModel.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Manual results fetched successfully',
      data: {
        results,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Error in getManualResults:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

//Delete manual result
export const deleteManualResult = async (req, res) => {
  try {
    const { manualResultId } = req.params;

    if (!manualResultId) {
      return res.status(400).json({
        success: false,
        message: 'Manual Result ID is required',
      });
    }

    if (req.role !== 'supperadmin') {
      return res.status(403).json({
        success: false,
        message: 'Only SuperAdmin can delete manual Result',
      });
    }

    const manualResult = await manualResultModel.findById(manualResultId);
    if (!manualResult) {
      return res.status(404).json({
        success: false,
        message: 'Manual Result not found',
      });
    }

    await manualResultModel.findByIdAndDelete(manualResultId);

    return res.status(200).json({
      success: true,
      message: 'Manual Result deleted successfully',
      data: {
        deletedId: manualResultId,
        gameId: manualResult.gameId,
        eventName: manualResult.eventName,
      },
    });
  } catch (error) {
    console.error('Error in deleteManualResult:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error?.message,
    });
  }
};

/**
 * VOID MANUAL BETS - Voids all unsettled bets for a game/market
 * Used when match is cancelled and API doesn't return void status
 * Only SuperAdmin can void bets
 */
export const voidManualBets = async (req, res) => {
  try {
    const { gameId, gameType, marketName } = req.body;
    const adminId = req.userId || req.id;

    // Auth check
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Role check
    if (req.role !== 'supperadmin') {
      return res.status(403).json({
        success: false,
        message: 'Only SuperAdmin can void bets',
      });
    }

    // Validate required fields
    if (!gameId) {
      return res.status(400).json({
        success: false,
        message: 'gameId is required',
      });
    }

    // Build query to get unsettled bets
    const query = { gameId, status: 0 };
    if (gameType) {
      query.gameType = gameType;
    }
    if (marketName) {
      query.marketName = marketName;
    }

    // Get all unsettled bets for this game
    const unsettledBets = await betModel.find(query);
    if (!unsettledBets || unsettledBets.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No unsettled bets found for this gameId',
      });
    }

    // Track void stats and processed user IDs
    const voidStats = {
      totalBets: unsettledBets.length,
      totalRefunded: 0,
    };
    const processedUserIds = new Set();

    // Process each bet
    for (const bet of unsettledBets) {
      try {
        // Freshness check: re-verify bet is still unsettled before voiding
        // Prevents race condition with cron jobs that may have settled this bet
        const freshBet = await betModel.findOne({ _id: bet._id, status: 0 });
        if (!freshBet) {
          console.log(
            `[voidManualBets] SKIPPED Bet ${bet._id} - Already settled by cron`
          );
          continue;
        }
        Object.assign(bet, freshBet.toObject());

        const user = await SubAdmin.findById(bet.userId);
        if (!user) {
          console.warn(`[voidManualBets] User not found for bet ${bet._id}`);
          continue;
        }

        // Handle cashed-out bets: void them without applying P/L
        if (bet.isCashedOut) {
          bet.status = 3; // VOID
          bet.resultAmount = 0;
          bet.profitLossChange = 0;
          bet.betResult = 'VOID';
          bet.settledBy = 'manual';
          bet.settledAt = new Date();
          await bet.save();

          // Update bet history for cashed-out void
          const cashoutHistoryRecords = await betHistoryModel.find({
            betId: bet._id.toString(),
            status: 0,
          });
          for (const historyRecord of cashoutHistoryRecords) {
            await betHistoryModel.updateOne(
              { _id: historyRecord._id },
              {
                $set: {
                  status: 3,
                  resultAmount: 0,
                  profitLossChange: 0,
                  betResult: 'VOID',
                  settledBy: 'manual',
                  settledAt: new Date(),
                },
              }
            );
          }

          processedUserIds.add(user._id.toString());
          console.log(
            `[MANUAL VOID] Voided cashed-out bet ${bet._id} for user ${user.userName}`
          );
          continue;
        }

        // Use appropriate void service based on bet type
        let voidResult;
        if (FANCY_GAME_TYPES.includes(bet.gameType)) {
          voidResult = await voidFancyBet(bet);
        } else {
          voidResult = await voidSportsBet(bet);
        }

        if (!voidResult.success) {
          console.error(`Failed to void bet ${bet._id}:`, voidResult.message);
          continue;
        }

        // Apply bet updates and override settledBy for manual
        Object.assign(bet, voidResult.betUpdates);
        bet.settledBy = 'manual';
        bet.settledAt = new Date();

        // Update void stats
        voidStats.totalRefunded += bet.resultAmount;

        // Save bet (no user save needed - void doesn't change balance directly)
        await bet.save();

        // Update betHistory records
        const betHistoryRecords = await betHistoryModel.find({
          betId: bet._id.toString(),
          status: 0,
        });

        for (const historyRecord of betHistoryRecords) {
          await betHistoryModel.updateOne(
            { _id: historyRecord._id },
            {
              $set: {
                status: 3, // VOID
                resultAmount: Math.abs(historyRecord.price || 0),
                profitLossChange: 0,
                betResult: 'VOID',
                settledBy: 'manual',
                settledAt: new Date(),
              },
            }
          );
        }

        processedUserIds.add(user._id.toString());

        console.log(
          `[MANUAL VOID] Voided bet ${bet._id} for user ${user.userName}: refunded=${bet.resultAmount}`
        );
      } catch (betError) {
        console.error(`Error voiding bet ${bet._id}:`, betError);
      }
    }

    // Recalculate exposure and send WebSocket updates for each processed user
    for (const userId of processedUserIds) {
      try {
        const user = await SubAdmin.findById(userId);
        if (user) {
          const updatedPendingBets = await betModel.find({
            userId: userId,
            status: 0,
          });

          // Calculate new exposure (voided bets excluded since status != 0)
          const newExposure = calculateExposure(updatedPendingBets);
          user.exposure = newExposure;

          // Recalculate avbalance
          recalculateAvbalance(user, newExposure);

          // Send WebSocket updates
          sendBalanceUpdates(userId, user.avbalance);
          sendExposureUpdates(userId, newExposure);
          sendOpenBetsUpdates(userId, null);

          await user.save();

          console.log(
            `[MANUAL VOID] User ${user.userName}: exposure=${newExposure}, balance=${user.balance}, avbalance=${user.avbalance}`
          );
        }
      } catch (err) {
        console.error(`Error updating user ${userId}:`, err.message);
      }
    }

    // Update all uplines
    if (processedUserIds.size > 0) {
      try {
        await updateAllUplines([...processedUserIds]);
        console.log(
          `[MANUAL VOID] Updated uplines for ${processedUserIds.size} users`
        );
      } catch (err) {
        console.error(`Error updating uplines:`, err.message);
      }
    }

    // Create manual result record for void
    const manualResultData = {
      gameId,
      final_result: 'VOID',
      eventName: unsettledBets[0]?.eventName,
      marketName: marketName || unsettledBets[0]?.marketName,
      gameType: gameType || unsettledBets[0]?.gameType,
      gameName: unsettledBets[0]?.gameName,
      setBy: adminId,
      isActive: false,
      appliedToBets: voidStats.totalBets,
    };

    await manualResultModel.findOneAndUpdate(
      { gameId, marketName: manualResultData.marketName },
      manualResultData,
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Bets voided successfully',
      data: {
        gameId,
        voidStats,
      },
    });
  } catch (error) {
    console.error('Error in voidManualBets:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error?.message,
    });
  }
};
