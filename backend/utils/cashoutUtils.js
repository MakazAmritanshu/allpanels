export const CASHOUT_GAME_TYPES = [
  'Match Odds',
  'MATCH_ODDS',
  'Tied Match',
  'Bookmaker',
  'Bookmaker IPL CUP',
  'Toss',
  '1st 6 over',
  'Winner',
  'OVER_UNDER_05',
  'OVER_UNDER_15',
  'OVER_UNDER_25',
];

//bet is eligible for cashout or not
export function isCashoutEligible(bet) {
  return (
    bet.status === 0 &&
    CASHOUT_GAME_TYPES.includes(bet.gameType) &&
    bet.betType !== 'casino' &&
    !bet.isCashoutHedge &&
    !bet.isCashedOut
  );
}

export function calculateCashoutValue(bets, currentBestLay, currentBestBack) {
  if (!Array.isArray(bets) || bets.length === 0) return null;

  let W = 0;
  let L = 0;

  for (const bet of bets) {
    if (bet.otype === 'back') {
      W += bet.betAmount;
      L -= bet.price;
    } else {
      W -= bet.price;
      L += bet.betAmount;
    }
  }
  const diff = W - L;

  if (Math.abs(diff) < 0.001) {
    return Math.round(W);
  }

  let cashout;
  if (diff > 0) {
    if (!currentBestLay || currentBestLay < 1.01) return null;
    const H = diff / currentBestLay;
    cashout = L + H;
  } else {
    if (!currentBestBack || currentBestBack < 1.01) return null;
    const H = Math.abs(diff) / currentBestBack;
    cashout = L - H;
  }
  return Math.round(cashout);
}

export function calculateSingleBackCashout(
  originalOdds,
  stake,
  currentBestLay
) {
  if (!currentBestLay || currentBestLay < 1.01) return null;
  return Math.round(stake * (originalOdds / currentBestLay - 1));
}

export default {
  CASHOUT_GAME_TYPES,
  isCashoutEligible,
  calculateCashoutValue,
  calculateSingleBackCashout,
};
