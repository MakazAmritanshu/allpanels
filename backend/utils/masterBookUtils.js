export function generateFancyLadder(bets, minScore = null, maxScore = null) {
  if (!Array.isArray(bets) || bets.length === 0) {
    return [];
  }

  const parsedBets = bets.map((bet) => ({
    threshold: parseFloat(bet.fancyScore) || 0,
    otype: bet.otype,
    price: Number(bet.price) || 0,
    betAmount: Number(bet.betAmount) || 0,
  }));

  const allThresholds = parsedBets.map((b) => b.threshold);
  const maxThreshold = Math.max(...allThresholds);
  const minThreshold = Math.min(...allThresholds);

  const effectiveMin =
    minScore != null ? minScore : Math.max(0, minThreshold - 10);
  const effectiveMax = maxScore != null ? maxScore : maxThreshold + 10;

  const ladder = [];

  for (let score = effectiveMin; score <= effectiveMax; score++) {
    let netPnl = 0;

    for (const bet of parsedBets) {
      if (bet.otype === 'back') {
        // Back wins when score >= threshold (settlement rule)
        netPnl += score >= bet.threshold ? bet.betAmount : -bet.price;
      } else {
        // Lay wins when score < threshold (settlement rule)
        netPnl += score < bet.threshold ? bet.betAmount : -bet.price;
      }
    }

    ladder.push({
      score,
      pnl: parseFloat(netPnl.toFixed(2)),
    });
  }

  return ladder;
}

export default { generateFancyLadder };
