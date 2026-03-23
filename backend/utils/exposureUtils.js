import {
  calculateMarketExposure,
  calculateOutcomeScenarios,
  groupBetsByMarket,
} from './marketCalculationUtils.js';

export const FANCY_GAME_TYPES = ['Normal', 'meter', 'line', 'ball', 'khado'];

export function isFancyBet(bet) {
  return FANCY_GAME_TYPES.includes(bet.gameType);
}
export function calculateFancyExposure(fancyBets) {
  if (!Array.isArray(fancyBets) || fancyBets.length === 0) return 0;

  const marketMap = {};
  for (const bet of fancyBets) {
    if (!bet.teamName) continue;
    const key = `${bet.gameId}_${bet.teamName}`;
    if (!marketMap[key]) marketMap[key] = [];
    marketMap[key].push(bet);
  }

  let exposure = 0;
  for (const bets of Object.values(marketMap)) {
    // Collect unique fancyScore thresholds, sorted ascending
    const thresholds = [
      ...new Set(
        bets.map((b) => {
          const s = parseFloat(b.fancyScore);
          return isNaN(s) ? 0 : s;
        })
      ),
    ].sort((a, b) => a - b);

    const idxMap = new Map(thresholds.map((t, i) => [t, i]));

    let worstNet = Infinity;

    for (let k = 0; k <= thresholds.length; k++) {
      let zoneNet = 0;

      for (const bet of bets) {
        const s = parseFloat(bet.fancyScore);
        const j = idxMap.get(isNaN(s) ? 0 : s);
        const hits = k > j;

        if (bet.otype === 'back') {
          zoneNet += hits ? bet.betAmount : -bet.price;
        } else {
          zoneNet += hits ? -bet.price : bet.betAmount;
        }
      }

      if (zoneNet < worstNet) worstNet = zoneNet;
    }

    exposure += Math.abs(Math.min(0, worstNet));
  }

  return exposure;
}

export function calculateNonFancyMarketExposure(nonFancyBets) {
  if (!Array.isArray(nonFancyBets) || nonFancyBets.length === 0) return 0;

  const markets = groupBetsByMarket(nonFancyBets);
  let totalExposure = 0;

  for (const [, marketBets] of Object.entries(markets)) {
    const scenarios = calculateOutcomeScenarios(marketBets);
    totalExposure += calculateMarketExposure(scenarios);
  }

  return totalExposure;
}

export function calculateAllExposure(pendingBets) {
  if (!Array.isArray(pendingBets) || pendingBets.length === 0) return 0;

  // Separate cashed-out bets from active bets
  const activeBets = pendingBets.filter((b) => !b.isCashedOut);
  const cashedOutBets = pendingBets.filter((b) => b.isCashedOut);

  const fancyBets = activeBets.filter((b) => isFancyBet(b));
  const nonFancyBets = activeBets.filter((b) => !isFancyBet(b));

  const activeExposure =
    calculateFancyExposure(fancyBets) +
    calculateNonFancyMarketExposure(nonFancyBets);

  // Cashed-out bets with negative cashoutValue contribute their locked-in loss as exposure
  const cashoutExposure = cashedOutBets.reduce((sum, b) => {
    return sum + (b.cashoutValue < 0 ? Math.abs(b.cashoutValue) : 0);
  }, 0);

  return activeExposure + cashoutExposure;
}

export function validateFancyBetBalance(
  avbalance,
  balance,
  currentMarketBets,
  newBet
) {
  const safeAvbalance = Math.min(avbalance, balance);
  avbalance = Math.max(0, safeAvbalance);

  const currentMarketExposure =
    Array.isArray(currentMarketBets) && currentMarketBets.length > 0
      ? calculateFancyExposure(currentMarketBets)
      : 0;
  const combinedBets = [...(currentMarketBets || []), newBet];
  const newMarketExposure = calculateFancyExposure(combinedBets);

  const totalCurrentExposure = balance - avbalance;
  const otherMarketsExposure = Math.max(
    0,
    totalCurrentExposure - currentMarketExposure
  );
  const newTotalExposure = otherMarketsExposure + newMarketExposure;
  const newAvbalance = parseFloat((balance - newTotalExposure).toFixed(2));

  const allowed = newAvbalance >= 0;

  return {
    allowed,
    reason: allowed
      ? 'Sufficient balance: post-bet exposure within limits'
      : `Insufficient balance: post-bet avbalance would be ${newAvbalance.toFixed(2)}`,
    newAvbalance,
    currentMarketExposure,
    newMarketExposure,
    otherMarketsExposure,
    newTotalExposure,
  };
}

export function calculateBetExposure(bet) {
  if (!bet) return 0;

  const price = bet.price || 0;
  const betAmount = bet.betAmount || 0;

  if (price < 0) {
    return 0;
  }
  if (betAmount < 0) {
    return Math.max(Math.abs(betAmount), price);
  }

  return price;
}

export function calculateTotalExposure(pendingBets) {
  if (!Array.isArray(pendingBets) || pendingBets.length === 0) return 0;

  return pendingBets.reduce((sum, bet) => {
    return sum + calculateBetExposure(bet);
  }, 0);
}

export default {
  calculateBetExposure,
  calculateTotalExposure,
  FANCY_GAME_TYPES,
  isFancyBet,
  calculateFancyExposure,
  calculateNonFancyMarketExposure,
  calculateAllExposure,
  validateFancyBetBalance,
};
