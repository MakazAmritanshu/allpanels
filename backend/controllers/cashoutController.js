import betHistoryModel from '../models/betHistoryModel.js';
import betModel from '../models/betModel.js';
import SubAdmin from '../models/subAdminModel.js';
import {
  cachedData,
  sendBalanceUpdates,
  sendExposureUpdates,
  sendOpenBetsUpdates,
} from '../socket/bettingSocket.js';
import {
  calculateCashoutValue,
  isCashoutEligible,
} from '../utils/cashoutUtils.js';
import { calculateAllExposure } from '../utils/exposureUtils.js';
import { updateAllUplines } from './admin/subAdminController.js';

//Helper function to extract best lay bet
export function getBestOddsForTeam(gameId, gameName, teamName) {
  let apitype = 'cricket';
  const lower = gameName?.toLowerCase() || '';
  if (lower.includes('tennis')) apitype = 'tennis';
  else if (lower.includes('soccer')) apitype = 'soccer';
  else if (lower.includes('horse')) apitype = 'horse-racing';

  const cacheKey = `${gameId}_${apitype}`;
  const cached = cachedData[cacheKey];

  if (!cached || !cached.data) {
    return { bestLay: null, bestBack: null };
  }

  const markets = Array.isArray(cached.data)
    ? cached.data
    : cached.data.data || cached.data;

  if (!Array.isArray(markets)) return { bestLay: null, bestBack: null };

  const teamLower = teamName.trim().toLowerCase();

  for (const market of markets) {
    if (!market.section || !Array.isArray(market.section)) continue;

    for (const runner of market.section) {
      const runnerName = (runner.nat || '').trim().toLowerCase();
      if (runnerName !== teamLower) continue;

      const odds = runner.odds;
      if (!Array.isArray(odds) || odds.length < 4) continue;
      const bestBack = odds[2]?.odds ? parseFloat(odds[2].odds) : null;
      const bestLay = odds[3]?.odds ? parseFloat(odds[3].odds) : null;

      // Only return valid odds (> 0)
      return {
        bestLay: bestLay && bestLay > 0 ? bestLay : null,
        bestBack: bestBack && bestBack > 0 ? bestBack : null,
      };
    }
  }

  return { bestLay: null, bestBack: null };
}

export const getCashoutQuote = async (req, res) => {
  try {
    const { betId } = req.body;
    const userId = req.id;

    if (!betId) {
      return res.status(400).json({ message: 'betId is required' });
    }

    const bet = await betModel.findOne({ _id: betId, userId, status: 0 });
    if (!bet) {
      return res
        .status(404)
        .json({ message: 'Bet not found or already settled' });
    }

    if (!isCashoutEligible(bet)) {
      return res.status(400).json({
        cashoutAvailable: false,
        message: 'Cashout not available for this bet type',
      });
    }

    const { bestLay, bestBack } = getBestOddsForTeam(
      bet.gameId,
      bet.gameName,
      bet.teamName
    );

    if (!bestLay || bestLay < 1.01) {
      return res.json({
        cashoutAvailable: false,
        message: 'No liquidity available',
      });
    }
    const cashoutValue = calculateCashoutValue([bet], bestLay, bestBack);

    if (cashoutValue === null) {
      return res.json({
        cashoutAvailable: false,
        message: 'Cannot calculate cashout',
      });
    }

    return res.json({
      cashoutAvailable: true,
      betId: bet._id.toString(),
      cashoutValue,
      currentOdds: bestLay,
    });
  } catch (error) {
    console.error('Cashout quote error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const executeCashout = async (req, res) => {
  try {
    const { betId } = req.body;
    const userId = req.id;

    if (!betId) {
      return res.status(400).json({ message: 'betId is required' });
    }

    // 1. Load the bet (must be open and not already cashed out)
    const bet = await betModel.findOne({
      _id: betId,
      userId,
      status: 0,
      isCashedOut: { $ne: true },
    });
    if (!bet) {
      return res
        .status(400)
        .json({ message: 'Bet already settled/cashed out or not found' });
    }

    if (!isCashoutEligible(bet)) {
      return res
        .status(400)
        .json({ message: 'Cashout not available for this bet' });
    }

    // 2. Get current live odds
    const { bestLay, bestBack } = getBestOddsForTeam(
      bet.gameId,
      bet.gameName,
      bet.teamName
    );

    // 3. Calculate cashout value (net guaranteed P/L)
    const cashoutValue = calculateCashoutValue([bet], bestLay, bestBack);
    if (cashoutValue === null) {
      return res
        .status(400)
        .json({ message: 'Cannot calculate cashout. No liquidity.' });
    }

    // 4. Mark bet as cashed out — status stays 0 (still pending/open)
    //    Settlement cron will use cashoutValue for P/L instead of match result
    const claimedBet = await betModel.findOneAndUpdate(
      { _id: betId, status: 0, isCashedOut: { $ne: true } },
      {
        $set: {
          isCashedOut: true,
          cashoutValue: cashoutValue,
          settledBy: 'cashout',
          settledAt: new Date(),
        },
      },
      { new: true }
    );

    if (!claimedBet) {
      return res
        .status(400)
        .json({ message: 'Bet already cashed out by another process' });
    }

    // 5. Recalculate exposure — cashed-out bets with negative cashoutValue
    //    contribute |cashoutValue| as exposure; positive cashout = 0 exposure
    //    Balance and bettingProfitLoss are NOT touched here — P/L is applied at settlement
    const allOpenBets = await betModel.find({
      userId,
      status: 0,
    });
    const newExposure = calculateAllExposure(allOpenBets);

    // 6. Update user exposure and avbalance
    const updatedUser = await SubAdmin.findByIdAndUpdate(
      userId,
      [
        {
          $set: {
            exposure: newExposure,
            avbalance: { $subtract: ['$balance', newExposure] },
          },
        },
      ],
      { new: true }
    );

    // 7. Push WebSocket updates
    sendBalanceUpdates(userId, updatedUser.avbalance);
    sendExposureUpdates(userId, newExposure);
    sendOpenBetsUpdates(userId, null);

    // 8. Update upline balances
    await updateAllUplines([userId]);

    console.log(
      `[CASHOUT] Bet ${betId} cashed out: value=${cashoutValue}, newBalance=${updatedUser.avbalance}, newExposure=${newExposure}`
    );

    return res.json({
      success: true,
      cashoutValue,
      newBalance: updatedUser.avbalance,
      newExposure,
      message: `Cashout successful: locked ₹${cashoutValue}`,
    });
  } catch (error) {
    console.error('Cashout execution error:', error);
    return res.status(500).json({ message: 'Server error during cashout' });
  }
};
