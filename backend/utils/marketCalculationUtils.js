export function calculateOutcomeScenarios(bets) {
  if (!Array.isArray(bets) || bets.length === 0) {
    return {};
  }

  // Get all unique teams
  const teams = [...new Set(bets.map((b) => b.teamName))];
  const scenarios = {};

  for (const winningTeam of teams) {
    let netResult = 0;

    for (const bet of bets) {
      const isWinner = bet.teamName === winningTeam;

      if (bet.otype === 'back') {
        if (isWinner) {
          // BACK wins: get betAmount (profit)
          netResult += bet.betAmount;
        } else {
          // BACK loses: lose price (stake)
          netResult -= bet.price;
        }
      } else {
        // lay
        if (isWinner) {
          // LAY loses: lose price (liability)
          netResult -= bet.price;
        } else {
          // LAY wins: get betAmount (backer's stake)
          netResult += bet.betAmount;
        }
      }
    }

    scenarios[winningTeam] = netResult;
  }

  // For binary markets, ensure we have both outcomes
  if (teams.length === 1) {
    // Single team means we need to add the "other team wins" scenario
    let otherResult = 0;

    for (const bet of bets) {
      if (bet.otype === 'back') {
        // BACK loses when other team wins
        otherResult -= bet.price;
      } else {
        // LAY wins when other team wins
        otherResult += bet.betAmount;
      }
    }

    scenarios['__OTHER__'] = otherResult;
  }

  return scenarios;
}

export function calculateMarketExposure(scenarios) {
  if (!scenarios || Object.keys(scenarios).length === 0) {
    return 0;
  }

  const outcomes = Object.values(scenarios);
  const worstCase = Math.min(...outcomes);

  // Exposure is absolute value of worst-case loss (only if negative)
  return Math.abs(Math.min(0, worstCase));
}

export function calculateEffectiveBalanceBonus(
  scenarios,
  newTeamName,
  newOtype = 'back'
) {
  if (!scenarios || Object.keys(scenarios).length === 0) {
    return 0;
  }

  // Check if we're betting on an existing team or a new team
  const isExistingTeam = Object.prototype.hasOwnProperty.call(
    scenarios,
    newTeamName
  );

  let profitIfNewBetLoses;

  if (newOtype === 'lay') {
    // LAY loses when the team WINS
    // So we use the profit from the team winning scenario
    if (isExistingTeam) {
      // Profit when this team wins
      profitIfNewBetLoses = scenarios[newTeamName];
    } else {
      // Betting LAY on a new team (not in scenarios)
      // LAY loses when new team wins = existing teams lose
      // Use __OTHER__ scenario (all existing teams lose)
      profitIfNewBetLoses =
        scenarios['__OTHER__'] !== undefined ? scenarios['__OTHER__'] : 0;
    }
  } else {
    // BACK loses when the team LOSES
    // So we use the profit from other team winning scenarios
    if (isExistingTeam) {
      // Betting on existing team - if it loses, get outcomes from other scenarios
      const otherOutcomes = Object.entries(scenarios)
        .filter(([team]) => team !== newTeamName)
        .map(([, profit]) => profit);

      if (otherOutcomes.length === 0) return 0;

      // For binary markets, there's one other outcome
      // For multi-runner, take minimum (worst case among "losing" scenarios)
      profitIfNewBetLoses = Math.min(...otherOutcomes);
    } else {
      // Betting BACK on a NEW team (not in scenarios)
      // BACK loses when new team loses = an existing team wins
      // Use outcomes of existing teams (excluding __OTHER__)
      const existingTeamOutcomes = Object.entries(scenarios)
        .filter(([team]) => team !== '__OTHER__')
        .map(([, profit]) => profit);

      if (existingTeamOutcomes.length === 0) {
        // Edge case: only __OTHER__ exists
        profitIfNewBetLoses = scenarios['__OTHER__'] || 0;
      } else {
        // New team losing = an existing team winning
        // For multi-runner, take the max (best outcome when new bet loses)
        profitIfNewBetLoses = Math.max(...existingTeamOutcomes);
      }
    }
  }

  // Only count positive profit as usable bonus
  return Math.max(0, profitIfNewBetLoses);
}

export function groupBetsByMarket(bets) {
  const markets = {};

  for (const bet of bets) {
    const key = getMarketKey(bet);
    if (!markets[key]) markets[key] = [];
    markets[key].push(bet);
  }

  return markets;
}

export function getMarketKey(bet) {
  if (bet.betType === 'casino' || bet.roundId) {
    // Lucky7: different teamName but same otype → same side (exposure adds, no netting). Per-selection market key.
    const gid = (bet.gameId || '').toString();
    if (gid.includes('lucky7')) {
      return `casino_${bet.roundId}_${bet.gameId}_${(bet.teamName || '').toString().trim()}`;
    }
    return `casino_${bet.roundId}_${bet.gameId}`;
  }
  return `sports_${bet.gameId}_${bet.marketName || 'default'}`;
}

export function calculateTotalMarketExposure(pendingBets) {
  if (!Array.isArray(pendingBets) || pendingBets.length === 0) {
    return 0;
  }

  // FIX: Separate fancy bets from non-fancy bets
  // Fancy bets use score-based win conditions, not team-based
  const fancyBets = pendingBets.filter((b) => b.betType === 'fancy');
  const nonFancyBets = pendingBets.filter((b) => b.betType !== 'fancy');

  // Calculate fancy exposure using score-based logic
  let fancyExposure = 0;
  if (fancyBets.length > 0) {
    const betsByMarket = {};
    fancyBets.forEach((bet) => {
      const marketKey = `${bet.gameId}_${bet.teamName}`;
      if (!betsByMarket[marketKey]) {
        betsByMarket[marketKey] = [];
      }
      betsByMarket[marketKey].push(bet);
    });

    Object.values(betsByMarket).forEach((marketBets) => {
      const backBets = marketBets.filter((b) => b.otype === 'back');
      const layBets = marketBets.filter((b) => b.otype === 'lay');
      let marketExposure = 0;

      if (backBets.length > 0 && layBets.length > 0) {
        // Both back and lay exist - calculate based on fancy score scenarios
        const fancyScores = [...new Set(marketBets.map((b) => b.fancyScore))];
        const scenarioResults = [];

        fancyScores.forEach((score) => {
          const backBetsAtScore = backBets.filter(
            (b) => b.fancyScore === score
          );
          const layBetsAtScore = layBets.filter((b) => b.fancyScore === score);

          // Scenario: score >= fancyScore (Back wins, Lay loses)
          const backWinProfit = backBetsAtScore.reduce(
            (sum, b) => sum + (b.xValue * b.betAmount) / 100,
            0
          );
          const layLossAmount = layBetsAtScore.reduce(
            (sum, b) => sum + (b.xValue * b.betAmount) / 100,
            0
          );
          const scenario1Net = backWinProfit - layLossAmount;

          // Scenario: score < fancyScore (Back loses, Lay wins)
          const backLossAmount = backBetsAtScore.reduce(
            (sum, b) => sum + b.betAmount,
            0
          );
          const layWinProfit = layBetsAtScore.reduce(
            (sum, b) => sum + b.betAmount,
            0
          );
          const scenario2Net = layWinProfit - backLossAmount;

          scenarioResults.push(scenario1Net, scenario2Net);
        });

        const maxLoss = Math.min(...scenarioResults);
        marketExposure = Math.abs(maxLoss);
      } else if (backBets.length > 0) {
        marketExposure = backBets.reduce((sum, b) => sum + b.betAmount, 0);
      } else if (layBets.length > 0) {
        marketExposure = layBets.reduce(
          (sum, b) => sum + (b.xValue * b.betAmount) / 100,
          0
        );
      }

      fancyExposure += marketExposure;
    });
  }

  // Calculate non-fancy exposure using team-based scenario logic
  let nonFancyExposure = 0;
  if (nonFancyBets.length > 0) {
    const markets = groupBetsByMarket(nonFancyBets);

    for (const [, marketBets] of Object.entries(markets)) {
      const scenarios = calculateOutcomeScenarios(marketBets);
      const marketExp = calculateMarketExposure(scenarios);
      nonFancyExposure += marketExp;
    }
  }

  return fancyExposure + nonFancyExposure;
}

export function calculateEffectiveBalance(
  avbalance,
  marketBets,
  newTeamName,
  newOtype = 'back'
) {
  if (!Array.isArray(marketBets) || marketBets.length === 0) {
    return {
      effectiveBalance: avbalance,
      bonus: 0,
      hasExistingPosition: false,
    };
  }

  const scenarios = calculateOutcomeScenarios(marketBets);
  const bonus = calculateEffectiveBalanceBonus(
    scenarios,
    newTeamName,
    newOtype
  );

  return {
    effectiveBalance: avbalance + bonus,
    bonus,
    hasExistingPosition: true,
  };
}

export function calculateEffectiveBalanceWithNewBet(
  avbalance,
  marketBets,
  newTeamName,
  newOtype,
  newStake,
  newLiability,
  newBetAmount
) {
  // Step 1: Calculate existing position bonus (locked-in profits from previous bets)
  // ONLY existing positions can provide bonus - NOT the new bet's potential profit
  // This ensures users can only bet what they can afford to lose
  let existingBonus = 0;
  let hasExistingPosition = false;

  if (Array.isArray(marketBets) && marketBets.length > 0) {
    hasExistingPosition = true;
    const scenarios = calculateOutcomeScenarios(marketBets);
    existingBonus = calculateEffectiveBalanceBonus(
      scenarios,
      newTeamName,
      newOtype
    );
  }

  // IMPORTANT: We do NOT add new bet's potential profit to effective balance
  // Reason: That profit is speculative/not guaranteed. If the bet loses,
  // the user must have enough actual balance to cover the liability.
  // Only existing locked-in positions can provide offset.
  const newBetBonus = 0; // Disabled for platform safety

  const totalBonus = existingBonus + newBetBonus;
  const effectiveBalance = avbalance + totalBonus;

  return {
    effectiveBalance,
    existingBonus,
    newBetBonus,
    totalBonus,
    hasExistingPosition,
    details: {
      avbalance,
      newStake,
      newLiability,
      newBetAmount,
      formula: `${avbalance} + ${existingBonus} (existing) = ${effectiveBalance}`,
    },
  };
}

export function validateBetWithNewBetOffset(
  avbalance,
  balance,
  marketBets,
  newTeamName,
  newOtype,
  newStake,
  newLiability,
  newBetAmount
) {
  // SIMULATION-BASED VALIDATION: Instead of comparing effectiveBalance >= liability,
  // we simulate the combined position and check if balance can cover the new total exposure.
  // This correctly handles cases where adding a bet doesn't increase (or even decreases) exposure.

  // Defensive: ensure balance >= avbalance (invariant)
  const safeAvbalance = Math.min(avbalance, balance);
  avbalance = Math.max(0, safeAvbalance);

  // Step 1: Calculate current market exposure from existing bets
  const currentScenarios =
    Array.isArray(marketBets) && marketBets.length > 0
      ? calculateOutcomeScenarios(marketBets)
      : {};
  const currentMarketExposure = calculateMarketExposure(currentScenarios);

  // Step 2: Simulate adding the new bet to existing bets
  const simulatedNewBet = {
    teamName: newTeamName,
    otype: newOtype,
    price: newLiability,
    betAmount: newBetAmount,
  };
  const combinedBets = [...(marketBets || []), simulatedNewBet];
  const combinedScenarios = calculateOutcomeScenarios(combinedBets);
  const newMarketExposure = calculateMarketExposure(combinedScenarios);

  // Step 3: Calculate post-bet available balance
  // Total current exposure across all markets = balance - avbalance
  // Other markets exposure = total - this market's current exposure
  const totalCurrentExposure = balance - avbalance;
  // Floor at 0 to prevent rounding errors from producing negative other-market exposure
  const otherMarketsExposure = Math.max(
    0,
    totalCurrentExposure - currentMarketExposure
  );
  const newTotalExposure = otherMarketsExposure + newMarketExposure;
  const newAvbalance = parseFloat((balance - newTotalExposure).toFixed(2));

  const allowed = newAvbalance >= 0;

  // Also calculate old effective balance for backward compatibility / debugging
  const effectiveResult = calculateEffectiveBalanceWithNewBet(
    avbalance,
    marketBets,
    newTeamName,
    newOtype,
    newStake,
    newLiability,
    newBetAmount
  );

  return {
    allowed,
    reason: allowed
      ? 'Sufficient balance: post-bet exposure within limits'
      : `Insufficient balance: effective ${effectiveResult.effectiveBalance.toFixed(2)} < required ${newLiability.toFixed(2)}, post-bet avbalance would be ${newAvbalance.toFixed(2)}`,
    effectiveBalance: effectiveResult.effectiveBalance,
    requiredAmount: newLiability,
    surplus: newAvbalance,
    details: {
      ...effectiveResult.details,
      simulationBased: true,
      currentMarketExposure,
      newMarketExposure,
      exposureChange: newMarketExposure - currentMarketExposure,
      otherMarketsExposure,
      newTotalExposure,
      newAvbalance,
    },
    breakdown: {
      currentAvBalance: avbalance,
      currentBalance: balance,
      existingPositionBonus: effectiveResult.existingBonus,
      newBetProfitBonus: effectiveResult.newBetBonus,
      totalEffectiveBalance: effectiveResult.effectiveBalance,
      liabilityToValidate: newLiability,
      currentMarketExposure,
      newMarketExposure,
      exposureChange: newMarketExposure - currentMarketExposure,
      newAvbalance,
    },
  };
}

export default {
  calculateOutcomeScenarios,
  calculateMarketExposure,
  calculateEffectiveBalanceBonus,
  groupBetsByMarket,
  getMarketKey,
  calculateTotalMarketExposure,
  calculateEffectiveBalance,
  calculateEffectiveBalanceWithNewBet,
  validateBetWithNewBetOffset,
};
