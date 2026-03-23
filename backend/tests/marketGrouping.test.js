/**
 * Regression tests for market-level grouping in updateResultOfBets
 *
 * ROOT CAUSE: Bets were grouped by gameId only, so different markets
 * (Match Odds, Tied Match, Bookmaker) on the same game shared one API call.
 * If that API call returned "void", ALL markets got voided incorrectly.
 *
 * FIX: Group by gameId + marketName so each market gets its own API call.
 */
import { describe, expect, it } from 'vitest';

// ─── helpers ────────────────────────────────────────────────────────
const makeBet = (overrides = {}) => ({
  _id: `bet_${Math.random().toString(36).slice(2, 8)}`,
  userId: 'user_001',
  gameId: '764536612',
  eventName: 'Ma Dhamne v Ri Noguchi',
  marketName: 'Match Odds',
  gameType: 'Match Odds',
  gameName: 'Tennis Game',
  teamName: 'Rio Noguchi',
  market_id: '67135137',
  otype: 'back',
  price: 100,
  betAmount: 50,
  status: 0,
  sid: '2',
  ...overrides,
});

/**
 * Replicates the grouping logic from updateResultOfBets in betController.js
 * This is the FIXED version that groups by gameId + marketName
 */
function groupBetsByMarket(gameBets) {
  return gameBets.reduce((acc, bet) => {
    if (!bet?.gameId) return acc;
    const groupKey = `${bet.gameId}_${bet.marketName || 'unknown'}`;
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(bet);
    return acc;
  }, {});
}

/**
 * The OLD buggy grouping (for comparison in tests)
 */
function groupBetsByGameIdOnly(gameBets) {
  return gameBets.reduce((acc, bet) => {
    if (!bet?.gameId) return acc;
    if (!acc[bet.gameId]) acc[bet.gameId] = [];
    acc[bet.gameId].push(bet);
    return acc;
  }, {});
}

// ═══════════════════════════════════════════════════════════════════
// 1. Same gameId, different marketNames → separate groups
// ═══════════════════════════════════════════════════════════════════
describe('Market Grouping: same gameId, different markets', () => {
  const bets = [
    makeBet({ gameId: '123', marketName: 'Match Odds', market_id: 'MO_001' }),
    makeBet({ gameId: '123', marketName: 'Tied Match', market_id: 'TM_001' }),
    makeBet({
      gameId: '123',
      marketName: 'Match Odds',
      market_id: 'MO_001',
      otype: 'lay',
    }),
    makeBet({ gameId: '123', marketName: 'Bookmaker', market_id: 'BM_001' }),
  ];

  it('produces separate groups for each marketName', () => {
    const groups = groupBetsByMarket(bets);
    const keys = Object.keys(groups);

    expect(keys).toHaveLength(3); // Match Odds, Tied Match, Bookmaker
    expect(keys).toContain('123_Match Odds');
    expect(keys).toContain('123_Tied Match');
    expect(keys).toContain('123_Bookmaker');
  });

  it('puts Match Odds bets (back + lay) in the same group', () => {
    const groups = groupBetsByMarket(bets);
    expect(groups['123_Match Odds']).toHaveLength(2);
  });

  it('puts Tied Match bet in its own group', () => {
    const groups = groupBetsByMarket(bets);
    expect(groups['123_Tied Match']).toHaveLength(1);
  });

  it('puts Bookmaker bet in its own group', () => {
    const groups = groupBetsByMarket(bets);
    expect(groups['123_Bookmaker']).toHaveLength(1);
  });

  it('OLD buggy grouping would merge all into one group', () => {
    const groups = groupBetsByGameIdOnly(bets);
    const keys = Object.keys(groups);

    expect(keys).toHaveLength(1); // Bug: all 4 bets in one group
    expect(groups['123']).toHaveLength(4);
  });
});

// ═══════════════════════════════════════════════════════════════════
// 2. Same gameId, same marketName → single group
// ═══════════════════════════════════════════════════════════════════
describe('Market Grouping: same gameId, same market', () => {
  const bets = [
    makeBet({ gameId: '456', marketName: 'Match Odds', otype: 'back' }),
    makeBet({ gameId: '456', marketName: 'Match Odds', otype: 'lay' }),
    makeBet({ gameId: '456', marketName: 'Match Odds', otype: 'back' }),
  ];

  it('produces a single group', () => {
    const groups = groupBetsByMarket(bets);
    const keys = Object.keys(groups);

    expect(keys).toHaveLength(1);
    expect(keys[0]).toBe('456_Match Odds');
  });

  it('all bets are in that single group', () => {
    const groups = groupBetsByMarket(bets);
    expect(groups['456_Match Odds']).toHaveLength(3);
  });
});

// ═══════════════════════════════════════════════════════════════════
// 3. Different gameIds → separate groups regardless of marketName
// ═══════════════════════════════════════════════════════════════════
describe('Market Grouping: different gameIds', () => {
  const bets = [
    makeBet({ gameId: '100', marketName: 'Match Odds' }),
    makeBet({ gameId: '200', marketName: 'Match Odds' }),
    makeBet({ gameId: '100', marketName: 'Bookmaker' }),
    makeBet({ gameId: '200', marketName: 'Bookmaker' }),
  ];

  it('produces 4 groups (2 games x 2 markets)', () => {
    const groups = groupBetsByMarket(bets);
    const keys = Object.keys(groups);

    expect(keys).toHaveLength(4);
    expect(keys).toContain('100_Match Odds');
    expect(keys).toContain('100_Bookmaker');
    expect(keys).toContain('200_Match Odds');
    expect(keys).toContain('200_Bookmaker');
  });

  it('each group has exactly 1 bet', () => {
    const groups = groupBetsByMarket(bets);
    for (const key of Object.keys(groups)) {
      expect(groups[key]).toHaveLength(1);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════
// 4. Each group has correct sampleBet for API call
// ═══════════════════════════════════════════════════════════════════
describe('Market Grouping: sampleBet has correct market params', () => {
  const bets = [
    makeBet({
      gameId: '764536612',
      marketName: 'Match Odds',
      market_id: '67135137',
    }),
    makeBet({
      gameId: '764536612',
      marketName: 'Tied Match',
      market_id: '67135200',
    }),
  ];

  it('Match Odds group sampleBet has correct market_id', () => {
    const groups = groupBetsByMarket(bets);
    const sampleBet = groups['764536612_Match Odds'][0];
    expect(sampleBet.market_id).toBe('67135137');
    expect(sampleBet.marketName).toBe('Match Odds');
  });

  it('Tied Match group sampleBet has correct market_id', () => {
    const groups = groupBetsByMarket(bets);
    const sampleBet = groups['764536612_Tied Match'][0];
    expect(sampleBet.market_id).toBe('67135200');
    expect(sampleBet.marketName).toBe('Tied Match');
  });

  it('OLD buggy grouping would use wrong sampleBet for second market', () => {
    const groups = groupBetsByGameIdOnly(bets);
    // Only 1 group, sampleBet is whichever came first
    const sampleBet = groups['764536612'][0];
    // This sampleBet's market_id/marketName is used for ALL bets
    // If it's "Match Odds", then Tied Match bets get Match Odds API params — BUG
    expect(groups['764536612']).toHaveLength(2);
    // The second bet has different market params but would never get its own API call
    const otherBet = groups['764536612'][1];
    expect(sampleBet.market_id).not.toBe(otherBet.market_id);
  });
});

// ═══════════════════════════════════════════════════════════════════
// 5. Void on one market should NOT affect other market
// ═══════════════════════════════════════════════════════════════════
describe('Market Grouping: independent settlement per market', () => {
  // Simulates the settlement logic: each group processes its own API result
  function simulateSettlement(bets, apiResults) {
    const groups = groupBetsByMarket(bets);
    const results = [];

    for (const groupKey of Object.keys(groups)) {
      const groupBets = groups[groupKey];
      const sampleBet = groupBets[0];
      const marketName = sampleBet.marketName;

      // Look up API result for this market
      const apiResult = apiResults[marketName] || { final_result: null };
      const winner = apiResult.final_result?.trim();

      if (!winner) continue;

      const isVoid = winner.toLowerCase() === 'void';

      for (const bet of groupBets) {
        if (isVoid) {
          results.push({ betId: bet._id, status: 3, market: marketName });
        } else {
          const isWin =
            bet.otype === 'back'
              ? bet.teamName === winner
              : bet.teamName !== winner;
          results.push({
            betId: bet._id,
            status: isWin ? 1 : 2,
            market: marketName,
          });
        }
      }
    }

    return results;
  }

  it('void on Tied Match does NOT void Match Odds bets', () => {
    const bets = [
      makeBet({
        _id: 'bet_MO_1',
        gameId: '123',
        marketName: 'Match Odds',
        teamName: 'Player A',
      }),
      makeBet({
        _id: 'bet_TM_1',
        gameId: '123',
        marketName: 'Tied Match',
        teamName: 'Yes',
      }),
    ];

    const apiResults = {
      'Match Odds': { final_result: 'Player A' },
      'Tied Match': { final_result: 'void' },
    };

    const results = simulateSettlement(bets, apiResults);

    // Match Odds bet should be settled (WIN), not voided
    const moBet = results.find((r) => r.betId === 'bet_MO_1');
    expect(moBet.status).toBe(1); // WIN
    expect(moBet.market).toBe('Match Odds');

    // Tied Match bet should be voided
    const tmBet = results.find((r) => r.betId === 'bet_TM_1');
    expect(tmBet.status).toBe(3); // VOID
    expect(tmBet.market).toBe('Tied Match');
  });

  it('void on Match Odds does NOT void Bookmaker bets', () => {
    const bets = [
      makeBet({
        _id: 'bet_MO_1',
        gameId: '999',
        marketName: 'Match Odds',
        teamName: 'Team X',
      }),
      makeBet({
        _id: 'bet_BM_1',
        gameId: '999',
        marketName: 'Bookmaker',
        teamName: 'Team Y',
      }),
    ];

    const apiResults = {
      'Match Odds': { final_result: 'void' },
      Bookmaker: { final_result: 'Team Y' },
    };

    const results = simulateSettlement(bets, apiResults);

    const moBet = results.find((r) => r.betId === 'bet_MO_1');
    expect(moBet.status).toBe(3); // VOID

    const bmBet = results.find((r) => r.betId === 'bet_BM_1');
    expect(bmBet.status).toBe(1); // WIN
  });

  it('all markets voided when all return void', () => {
    const bets = [
      makeBet({
        _id: 'bet_MO_1',
        gameId: '123',
        marketName: 'Match Odds',
      }),
      makeBet({
        _id: 'bet_TM_1',
        gameId: '123',
        marketName: 'Tied Match',
      }),
    ];

    const apiResults = {
      'Match Odds': { final_result: 'void' },
      'Tied Match': { final_result: 'void' },
    };

    const results = simulateSettlement(bets, apiResults);
    expect(results.every((r) => r.status === 3)).toBe(true);
  });

  it('multiple bets on same market all get same result', () => {
    const bets = [
      makeBet({
        _id: 'bet_1',
        gameId: '123',
        marketName: 'Match Odds',
        teamName: 'Player A',
        otype: 'back',
      }),
      makeBet({
        _id: 'bet_2',
        gameId: '123',
        marketName: 'Match Odds',
        teamName: 'Player B',
        otype: 'back',
      }),
      makeBet({
        _id: 'bet_3',
        gameId: '123',
        marketName: 'Match Odds',
        teamName: 'Player A',
        otype: 'lay',
      }),
    ];

    const apiResults = {
      'Match Odds': { final_result: 'Player A' },
    };

    const results = simulateSettlement(bets, apiResults);

    // bet_1: back on Player A, winner is Player A → WIN
    expect(results.find((r) => r.betId === 'bet_1').status).toBe(1);
    // bet_2: back on Player B, winner is Player A → LOSS
    expect(results.find((r) => r.betId === 'bet_2').status).toBe(2);
    // bet_3: lay on Player A, winner is Player A → LOSS (lay loses when backed team wins)
    expect(results.find((r) => r.betId === 'bet_3').status).toBe(2);
  });
});

// ═══════════════════════════════════════════════════════════════════
// 6. Edge cases
// ═══════════════════════════════════════════════════════════════════
describe('Market Grouping: edge cases', () => {
  it('bet with no marketName gets grouped under "unknown"', () => {
    const bets = [
      makeBet({ gameId: '123', marketName: undefined }),
      makeBet({ gameId: '123', marketName: null }),
    ];

    const groups = groupBetsByMarket(bets);
    const keys = Object.keys(groups);

    // Both should fall into the 'unknown' bucket
    expect(keys).toContain('123_unknown');
  });

  it('bet with no gameId is excluded', () => {
    const bets = [
      makeBet({ gameId: undefined }),
      makeBet({ gameId: '123', marketName: 'Match Odds' }),
    ];

    const groups = groupBetsByMarket(bets);
    const keys = Object.keys(groups);

    expect(keys).toHaveLength(1);
    expect(keys[0]).toBe('123_Match Odds');
  });

  it('gameId can be extracted from groupKey', () => {
    const groupKey = '764536612_Match Odds';
    const gameId = groupKey.split('_')[0];
    expect(gameId).toBe('764536612');
  });

  it('gameId extraction works even if marketName contains underscores', () => {
    // OVER_UNDER_05 has underscores — gameId extraction uses split('_')[0]
    const groupKey = '123_OVER_UNDER_05';
    const gameId = groupKey.split('_')[0];
    expect(gameId).toBe('123');
  });

  it('all betTypes produce valid group keys', () => {
    const betTypes = [
      'Toss',
      '1st 6 over',
      'Match Odds',
      'Tied Match',
      'Bookmaker',
      'Bookmaker IPL CUP',
      'OVER_UNDER_05',
      'OVER_UNDER_15',
      'OVER_UNDER_25',
    ];

    for (const marketName of betTypes) {
      const bets = [makeBet({ gameId: '999', marketName })];
      const groups = groupBetsByMarket(bets);
      const keys = Object.keys(groups);

      expect(keys).toHaveLength(1);
      // gameId should be extractable from every key
      const gameId = keys[0].split('_')[0];
      expect(gameId).toBe('999');
    }
  });
});

// ═══════════════════════════════════════════════════════════════════
// 7. Real-world scenario: EXACT bug that caused Tennis bet to be voided
// ═══════════════════════════════════════════════════════════════════
describe('Market Grouping: real-world Tennis void bug reproduction', () => {
  // This reproduces the EXACT scenario from gameId 764536612
  const bets = [
    makeBet({
      _id: 'bet_tennis_MO',
      gameId: '764536612',
      eventName: 'Ma Dhamne v Ri Noguchi',
      marketName: 'Match Odds',
      gameType: 'Match Odds',
      market_id: '67135137',
      teamName: 'Rio Noguchi',
      otype: 'lay',
      price: 320,
      sid: '2',
    }),
    makeBet({
      _id: 'bet_tennis_TM',
      gameId: '764536612',
      eventName: 'Ma Dhamne v Ri Noguchi',
      marketName: 'Tied Match',
      gameType: 'Tied Match',
      market_id: '67135200',
      teamName: 'Yes',
      otype: 'back',
      price: 100,
      sid: '2',
    }),
  ];

  it('OLD grouping: both bets in single group — causes wrong API call', () => {
    const groups = groupBetsByGameIdOnly(bets);
    expect(Object.keys(groups)).toHaveLength(1);
    const sampleBet = groups['764536612'][0];
    const otherBet = groups['764536612'][1];
    expect(sampleBet.marketName).not.toBe(otherBet.marketName);
    expect(sampleBet.market_id).not.toBe(otherBet.market_id);
  });

  it('NEW grouping: each market in its own group — correct API calls', () => {
    const groups = groupBetsByMarket(bets);
    expect(Object.keys(groups)).toHaveLength(2);

    const moGroup = groups['764536612_Match Odds'];
    expect(moGroup).toHaveLength(1);
    expect(moGroup[0].market_id).toBe('67135137');
    expect(moGroup[0].marketName).toBe('Match Odds');

    const tmGroup = groups['764536612_Tied Match'];
    expect(tmGroup).toHaveLength(1);
    expect(tmGroup[0].market_id).toBe('67135200');
    expect(tmGroup[0].marketName).toBe('Tied Match');
  });

  it('Tied Match void does NOT void Match Odds (the exact bug)', () => {
    const groups = groupBetsByMarket(bets);
    const results = [];

    const apiResponses = {
      'Match Odds': 'Rio Noguchi',
      'Tied Match': 'void',
    };

    for (const groupKey of Object.keys(groups)) {
      const groupBets = groups[groupKey];
      const sampleBet = groupBets[0];
      const winner = apiResponses[sampleBet.marketName];
      const isVoid = winner.toLowerCase() === 'void';

      for (const bet of groupBets) {
        if (isVoid) {
          results.push({ betId: bet._id, status: 3, market: bet.marketName });
        } else {
          const backWins = bet.teamName === winner;
          const isWin = bet.otype === 'back' ? backWins : !backWins;
          results.push({
            betId: bet._id,
            status: isWin ? 1 : 2,
            market: bet.marketName,
          });
        }
      }
    }

    // Match Odds lay bet on "Rio Noguchi", winner is "Rio Noguchi"
    // Lay LOSES when their team wins → status 2
    const moBet = results.find((r) => r.betId === 'bet_tennis_MO');
    expect(moBet.status).toBe(2); // LOSS (not void!)
    expect(moBet.market).toBe('Match Odds');

    // Tied Match bet should be voided
    const tmBet = results.find((r) => r.betId === 'bet_tennis_TM');
    expect(tmBet.status).toBe(3); // VOID
    expect(tmBet.market).toBe('Tied Match');
  });
});

// ═══════════════════════════════════════════════════════════════════
// 8. API payload verification — each group sends correct params
// ═══════════════════════════════════════════════════════════════════
describe('Market Grouping: API payload per group', () => {
  const MARKET_NAME_TO_API = {
    'Match Odds': 'MATCH_ODDS',
    'Tied Match': 'TIED_MATCH',
  };
  const toApiMarketName = (name) => MARKET_NAME_TO_API[name] || name;

  function buildPayloads(bets) {
    const groups = groupBetsByMarket(bets);
    const payloads = [];

    for (const groupKey of Object.keys(groups)) {
      const sampleBet = groups[groupKey][0];
      payloads.push({
        event_id: Number(sampleBet.gameId),
        event_name: sampleBet.eventName,
        market_id: sampleBet.market_id,
        market_name: toApiMarketName(sampleBet.marketName),
        sport_id: sampleBet.sid,
      });
    }
    return payloads;
  }

  it('Match Odds + Tied Match → 2 different API payloads', () => {
    const bets = [
      makeBet({
        gameId: '123',
        marketName: 'Match Odds',
        market_id: 'MO_001',
        eventName: 'Team A v Team B',
        sid: '4',
      }),
      makeBet({
        gameId: '123',
        marketName: 'Tied Match',
        market_id: 'TM_001',
        eventName: 'Team A v Team B',
        sid: '4',
      }),
    ];

    const payloads = buildPayloads(bets);
    expect(payloads).toHaveLength(2);

    const moPayload = payloads.find((p) => p.market_name === 'MATCH_ODDS');
    expect(moPayload.market_id).toBe('MO_001');
    expect(moPayload.event_id).toBe(123);

    const tmPayload = payloads.find((p) => p.market_name === 'TIED_MATCH');
    expect(tmPayload.market_id).toBe('TM_001');
    expect(tmPayload.event_id).toBe(123);
  });

  it('Bookmaker passes through as-is (no mapping needed)', () => {
    const bets = [
      makeBet({
        gameId: '456',
        marketName: 'Bookmaker',
        market_id: 'BM_001',
      }),
    ];

    const payloads = buildPayloads(bets);
    expect(payloads[0].market_name).toBe('Bookmaker');
  });

  it('OVER_UNDER types pass through as-is', () => {
    const bets = [
      makeBet({
        gameId: '789',
        marketName: 'OVER_UNDER_05',
        market_id: 'OU05_001',
      }),
      makeBet({
        gameId: '789',
        marketName: 'OVER_UNDER_25',
        market_id: 'OU25_001',
      }),
    ];

    const payloads = buildPayloads(bets);
    expect(payloads).toHaveLength(2);
    expect(
      payloads.find((p) => p.market_name === 'OVER_UNDER_05').market_id
    ).toBe('OU05_001');
    expect(
      payloads.find((p) => p.market_name === 'OVER_UNDER_25').market_id
    ).toBe('OU25_001');
  });

  it('3 markets on same game → 3 separate API payloads', () => {
    const bets = [
      makeBet({ gameId: '100', marketName: 'Match Odds', market_id: 'MO' }),
      makeBet({ gameId: '100', marketName: 'Tied Match', market_id: 'TM' }),
      makeBet({ gameId: '100', marketName: 'Bookmaker', market_id: 'BM' }),
      makeBet({
        gameId: '100',
        marketName: 'Match Odds',
        market_id: 'MO',
        otype: 'lay',
      }),
    ];

    const payloads = buildPayloads(bets);
    expect(payloads).toHaveLength(3);
  });
});

// ═══════════════════════════════════════════════════════════════════
// 9. Full settlement simulation with profitLoss tracking
// ═══════════════════════════════════════════════════════════════════
describe('Market Grouping: full settlement with profitLoss', () => {
  function fullSettlement(bets, apiResults) {
    const groups = groupBetsByMarket(bets);
    const settledBets = [];
    let totalProfitLoss = 0;

    for (const groupKey of Object.keys(groups)) {
      const groupBets = groups[groupKey];
      const sampleBet = groupBets[0];
      const marketName = sampleBet.marketName;

      const apiResult = apiResults[marketName];
      if (!apiResult?.final_result) continue;

      const winner = apiResult.final_result.trim();
      const isVoid = winner.toLowerCase() === 'void';
      const isTied = winner.toLowerCase() === 'tied';

      for (const bet of groupBets) {
        let status, profitLossChange;

        if (isVoid) {
          status = 3;
          profitLossChange = 0;
        } else if (isTied) {
          if (bet.otype === 'back') {
            status = 2;
            profitLossChange = -bet.price;
          } else {
            status = 1;
            profitLossChange = bet.betAmount;
          }
        } else {
          const backWins = bet.teamName === winner;
          const isWin = bet.otype === 'back' ? backWins : !backWins;
          if (isWin) {
            status = 1;
            profitLossChange = bet.betAmount;
          } else {
            status = 2;
            profitLossChange = -bet.price;
          }
        }

        totalProfitLoss += profitLossChange;
        settledBets.push({
          betId: bet._id,
          market: marketName,
          status,
          profitLossChange,
        });
      }
    }

    return { settledBets, totalProfitLoss };
  }

  it('Cricket match: Match Odds settled, Tied Match voided — profitLoss only from Match Odds', () => {
    const bets = [
      makeBet({
        _id: 'cricket_MO_back',
        gameId: '500',
        marketName: 'Match Odds',
        teamName: 'India',
        otype: 'back',
        price: 200,
        betAmount: 100,
      }),
      makeBet({
        _id: 'cricket_TM_back',
        gameId: '500',
        marketName: 'Tied Match',
        teamName: 'Yes',
        otype: 'back',
        price: 500,
        betAmount: 50,
      }),
    ];

    const apiResults = {
      'Match Odds': { final_result: 'India' },
      'Tied Match': { final_result: 'void' },
    };

    const { settledBets, totalProfitLoss } = fullSettlement(bets, apiResults);

    const moBet = settledBets.find((b) => b.betId === 'cricket_MO_back');
    expect(moBet.status).toBe(1);
    expect(moBet.profitLossChange).toBe(100);

    const tmBet = settledBets.find((b) => b.betId === 'cricket_TM_back');
    expect(tmBet.status).toBe(3);
    expect(tmBet.profitLossChange).toBe(0);

    expect(totalProfitLoss).toBe(100);
  });

  it('Soccer match: all 3 markets settled independently', () => {
    const bets = [
      makeBet({
        _id: 'soccer_MO',
        gameId: '600',
        marketName: 'Match Odds',
        teamName: 'Arsenal',
        otype: 'back',
        price: 150,
        betAmount: 75,
        sid: '1',
      }),
      makeBet({
        _id: 'soccer_OU',
        gameId: '600',
        marketName: 'OVER_UNDER_25',
        teamName: 'Over',
        otype: 'back',
        price: 100,
        betAmount: 100,
        sid: '1',
      }),
      makeBet({
        _id: 'soccer_BM',
        gameId: '600',
        marketName: 'Bookmaker',
        teamName: 'Chelsea',
        otype: 'lay',
        price: 200,
        betAmount: 80,
        sid: '1',
      }),
    ];

    const apiResults = {
      'Match Odds': { final_result: 'Arsenal' },
      OVER_UNDER_25: { final_result: 'Under' },
      Bookmaker: { final_result: 'Arsenal' },
    };

    const { settledBets } = fullSettlement(bets, apiResults);

    expect(settledBets.find((b) => b.betId === 'soccer_MO').status).toBe(1);
    expect(settledBets.find((b) => b.betId === 'soccer_OU').status).toBe(2);
    expect(settledBets.find((b) => b.betId === 'soccer_BM').status).toBe(1);
  });

  it('Multiple users on same game, different markets — each settled correctly', () => {
    const bets = [
      makeBet({
        _id: 'user1_MO',
        userId: 'user_001',
        gameId: '700',
        marketName: 'Match Odds',
        teamName: 'Player A',
        otype: 'back',
        price: 100,
        betAmount: 50,
      }),
      makeBet({
        _id: 'user2_TM',
        userId: 'user_002',
        gameId: '700',
        marketName: 'Tied Match',
        teamName: 'Yes',
        otype: 'back',
        price: 300,
        betAmount: 30,
      }),
      makeBet({
        _id: 'user1_BM',
        userId: 'user_001',
        gameId: '700',
        marketName: 'Bookmaker',
        teamName: 'Player A',
        otype: 'lay',
        price: 200,
        betAmount: 80,
      }),
    ];

    const apiResults = {
      'Match Odds': { final_result: 'Player A' },
      'Tied Match': { final_result: 'void' },
      Bookmaker: { final_result: 'Player B' },
    };

    const { settledBets } = fullSettlement(bets, apiResults);

    expect(settledBets.find((b) => b.betId === 'user1_MO').status).toBe(1);
    const tmBet = settledBets.find((b) => b.betId === 'user2_TM');
    expect(tmBet.status).toBe(3);
    expect(tmBet.profitLossChange).toBe(0);
    expect(settledBets.find((b) => b.betId === 'user1_BM').status).toBe(1);
  });

  it('Tied match result only affects its own market group', () => {
    const bets = [
      makeBet({
        _id: 'MO_bet',
        gameId: '800',
        marketName: 'Match Odds',
        teamName: 'Team X',
        otype: 'back',
        price: 100,
        betAmount: 50,
      }),
      makeBet({
        _id: 'TM_bet',
        gameId: '800',
        marketName: 'Tied Match',
        teamName: 'Yes',
        otype: 'back',
        price: 100,
        betAmount: 50,
      }),
    ];

    const apiResults = {
      'Match Odds': { final_result: 'Team X' },
      'Tied Match': { final_result: 'tied' },
    };

    const { settledBets } = fullSettlement(bets, apiResults);

    expect(settledBets.find((b) => b.betId === 'MO_bet').status).toBe(1);
    expect(settledBets.find((b) => b.betId === 'TM_bet').status).toBe(2);
  });

  it('Single market per game (common case) — works exactly as before', () => {
    const bets = [
      makeBet({
        _id: 'only_MO_1',
        gameId: '900',
        marketName: 'Match Odds',
        teamName: 'Player A',
        otype: 'back',
        price: 100,
        betAmount: 50,
      }),
      makeBet({
        _id: 'only_MO_2',
        gameId: '900',
        marketName: 'Match Odds',
        teamName: 'Player B',
        otype: 'lay',
        price: 150,
        betAmount: 60,
      }),
    ];

    const apiResults = {
      'Match Odds': { final_result: 'Player A' },
    };

    const { settledBets } = fullSettlement(bets, apiResults);

    expect(settledBets.find((b) => b.betId === 'only_MO_1').status).toBe(1);
    expect(settledBets.find((b) => b.betId === 'only_MO_2').status).toBe(1);
  });
});

// ═══════════════════════════════════════════════════════════════════
// 10. Stress test: many games, many markets, many users
// ═══════════════════════════════════════════════════════════════════
describe('Market Grouping: stress test — large scale', () => {
  it('90 bets across 10 games x 3 markets → 30 groups, all correctly separated', () => {
    const bets = [];
    const games = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10'];
    const markets = ['Match Odds', 'Tied Match', 'Bookmaker'];

    for (const gameId of games) {
      for (const marketName of markets) {
        for (let i = 0; i < 3; i++) {
          bets.push(
            makeBet({
              gameId,
              marketName,
              userId: `user_${i}`,
              market_id: `${gameId}_${marketName}_mid`,
            })
          );
        }
      }
    }

    expect(bets.length).toBe(90);

    const groups = groupBetsByMarket(bets);
    const keys = Object.keys(groups);

    expect(keys).toHaveLength(30);

    for (const key of keys) {
      expect(groups[key]).toHaveLength(3);
    }

    // Every bet in every group has the SAME marketName and market_id
    for (const key of keys) {
      const groupBets = groups[key];
      const sampleMarket = groupBets[0].marketName;
      const sampleMarketId = groupBets[0].market_id;
      for (const bet of groupBets) {
        expect(bet.marketName).toBe(sampleMarket);
        expect(bet.market_id).toBe(sampleMarketId);
      }
    }
  });
});
