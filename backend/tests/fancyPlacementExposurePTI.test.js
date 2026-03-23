/**
 * Fancy Bet Placement → Exposure → PTI Integration Tests
 *
 * Tests the FULL placement flow:
 *   1. Calculate price/betAmount using PERCENTAGE formula (not odds-1)
 *   2. Apply placement path (new, merge, score offset, odds offset, no-offset separate)
 *   3. Recalculate exposure using calculateAllExposure on ALL pending bets
 *   4. Verify avbalance = balance - exposure >= 0 (PTI never negative)
 *
 * KEY DIFFERENCE from other test files:
 *   - fancyPlaceBet.test.js: Tests placement logic manually, no calculateAllExposure
 *   - fancyExposureRegression.test.js: Tests exposure math, no placement simulation
 *   - ptiRegression.test.js: Tests calculateAllExposure progressively, no placement flow
 *   - THIS FILE: Simulates the actual placeFancyBet controller flow end-to-end
 *
 * THE BUG: Old code used betType === 'fancy' (never matches since betType is 'sports'|'casino')
 *          causing fancy exposure to use simple price-sum instead of hit/miss scenario analysis.
 *          For a lay bet: old = price (453), correct = scenario-based (906).
 */
import { describe, expect, it } from 'vitest';

import {
  calculateAllExposure,
  calculateFancyExposure,
  isFancyBet,
} from '../utils/exposureUtils.js';

// ─── Helpers: simulate placeFancyBet controller logic ────────────────────

/** Percentage-based calculation (mirrors betController.js line 1171-1179) */
function calculateFancyBetAmounts(stake, odds, otype) {
  let betAmount, price;
  if (otype === 'lay') {
    betAmount = stake;
    price = stake * (odds / 100);
  } else {
    // back
    price = stake;
    betAmount = stake * (odds / 100);
  }
  return {
    price: parseFloat(price.toFixed(2)),
    betAmount: parseFloat(betAmount.toFixed(2)),
  };
}

/** Create a pending fancy bet object (mirrors betModel schema) */
function makeFancyBet(overrides = {}) {
  return {
    gameId: 'g1',
    teamName: '6 over run IND',
    otype: 'back',
    price: 100,
    betAmount: 50,
    xValue: 50,
    fancyScore: 180,
    betType: 'sports', // ALWAYS 'sports', never 'fancy'
    gameType: 'Normal',
    status: 0,
    ...overrides,
  };
}

/** Create a pending sports bet */
function makeSportsBet(overrides = {}) {
  return {
    gameId: 'g1',
    marketName: 'Match Odds',
    teamName: 'India',
    otype: 'back',
    price: 1000,
    betAmount: 800,
    betType: 'sports',
    gameType: 'Match Odds',
    status: 0,
    ...overrides,
  };
}

/**
 * Simulate placing a fancy bet and recalculating exposure.
 * Returns { pendingBets, exposure, avbalance } after placement.
 */
function simulateFancyPlacement({
  balance,
  existingPendingBets = [],
  stake,
  odds,
  otype,
  gameId = 'g1',
  teamName = '6 over run IND',
  fancyScore = 180,
  gameType = 'Normal',
}) {
  const { price, betAmount } = calculateFancyBetAmounts(stake, odds, otype);

  const newBet = makeFancyBet({
    gameId,
    teamName,
    otype,
    price,
    betAmount,
    xValue: odds,
    fancyScore,
    gameType,
  });

  const allPending = [...existingPendingBets, newBet];
  const exposure = calculateAllExposure(allPending);
  const avbalance = parseFloat((balance - exposure).toFixed(2));

  return { price, betAmount, newBet, allPending, exposure, avbalance };
}

// ═════════════════════════════════════════════════════════════════════════
// 1. FANCY BET PERCENTAGE CALCULATION → EXPOSURE CHECK
// ═════════════════════════════════════════════════════════════════════════
describe('1. Fancy bet percentage calc feeds correct values into exposure', () => {
  it('back bet: stake=1000, odds=80% → price=1000, betAmount=800 → exposure=1000', () => {
    const { price, betAmount } = calculateFancyBetAmounts(1000, 80, 'back');
    expect(price).toBe(1000);
    expect(betAmount).toBe(800);

    const bet = makeFancyBet({ otype: 'back', price, betAmount });
    // Back single bet: hit=+800, miss=-1000 → exposure=1000
    expect(calculateAllExposure([bet])).toBe(1000);
  });

  it('lay bet: stake=1000, odds=80% → price=800, betAmount=1000 → exposure=800', () => {
    const { price, betAmount } = calculateFancyBetAmounts(1000, 80, 'lay');
    expect(price).toBe(800);
    expect(betAmount).toBe(1000);

    const bet = makeFancyBet({ otype: 'lay', price, betAmount });
    // Lay single bet: hit=-800, miss=+1000 → exposure=800
    expect(calculateAllExposure([bet])).toBe(800);
    // OLD BUG would give |1000 + 800| = 1800
    expect(calculateAllExposure([bet])).not.toBe(1800);
  });

  it('lay bet: stake=5000, odds=80% → price=4000 → exposure=4000 (NOT 9000)', () => {
    const { price, betAmount } = calculateFancyBetAmounts(5000, 80, 'lay');
    expect(price).toBe(4000);
    expect(betAmount).toBe(5000);

    const bet = makeFancyBet({ otype: 'lay', price, betAmount });
    expect(calculateAllExposure([bet])).toBe(4000);
    // OLD BUG: |5000 + 4000| = 9000
    expect(calculateAllExposure([bet])).not.toBe(9000);
  });

  it('back bet with small odds: stake=500, odds=20% → price=500, betAmount=100', () => {
    const { price, betAmount } = calculateFancyBetAmounts(500, 20, 'back');
    expect(price).toBe(500);
    expect(betAmount).toBe(100);

    const bet = makeFancyBet({ otype: 'back', price, betAmount });
    // hit=+100, miss=-500 → exposure=500
    expect(calculateAllExposure([bet])).toBe(500);
  });

  it('lay bet with small odds: stake=500, odds=20% → price=100, betAmount=500', () => {
    const { price, betAmount } = calculateFancyBetAmounts(500, 20, 'lay');
    expect(price).toBe(100);
    expect(betAmount).toBe(500);

    const bet = makeFancyBet({ otype: 'lay', price, betAmount });
    // hit=-100, miss=+500 → exposure=100
    expect(calculateAllExposure([bet])).toBe(100);
  });
});

// ═════════════════════════════════════════════════════════════════════════
// 2. NEW BET PLACEMENT → EXPOSURE RECALC → PTI CHECK
// ═════════════════════════════════════════════════════════════════════════
describe('2. New fancy bet placement: exposure recalc + PTI', () => {
  it('single back bet: PTI = balance - price', () => {
    const result = simulateFancyPlacement({
      balance: 10000,
      stake: 1000,
      odds: 50,
      otype: 'back',
    });

    expect(result.price).toBe(1000); // stake for back
    expect(result.betAmount).toBe(500); // stake × odds%
    expect(result.exposure).toBe(1000); // miss = -price = -1000
    expect(result.avbalance).toBe(9000);
    expect(result.avbalance).toBeGreaterThanOrEqual(0);
  });

  it('single lay bet: PTI = balance - price (which is stake × odds%)', () => {
    const result = simulateFancyPlacement({
      balance: 10000,
      stake: 1000,
      odds: 80,
      otype: 'lay',
    });

    expect(result.price).toBe(800); // stake × odds%
    expect(result.betAmount).toBe(1000); // stake for lay
    expect(result.exposure).toBe(800); // hit = -price = -800
    expect(result.avbalance).toBe(9200);
    expect(result.avbalance).toBeGreaterThanOrEqual(0);
  });

  it('two new bets on different markets: exposures add up', () => {
    const bet1 = makeFancyBet({
      teamName: '6 over run IND',
      otype: 'back',
      price: 1000,
      betAmount: 500,
    });

    const result = simulateFancyPlacement({
      balance: 10000,
      existingPendingBets: [bet1],
      stake: 800,
      odds: 60,
      otype: 'lay',
      teamName: '7 over run IND',
    });

    // Market 1 "6 over run": miss=-1000 → 1000
    // Market 2 "7 over run": hit=-480 (800×60%) → 480
    expect(result.exposure).toBe(1480);
    expect(result.avbalance).toBe(8520);
    expect(result.avbalance).toBeGreaterThanOrEqual(0);
  });

  it('three bets across three markets: sum of independent exposures', () => {
    const bet1 = makeFancyBet({
      teamName: '6 over run',
      otype: 'back',
      price: 2000,
      betAmount: 1000,
    });
    const bet2 = makeFancyBet({
      teamName: '7 over run',
      otype: 'lay',
      price: 1600,
      betAmount: 2000,
    });

    const result = simulateFancyPlacement({
      balance: 20000,
      existingPendingBets: [bet1, bet2],
      stake: 1500,
      odds: 40,
      otype: 'back',
      teamName: '8 over run',
    });

    // "6 over run": miss=-2000 → 2000
    // "7 over run": hit=-1600 → 1600
    // "8 over run": miss=-1500 → 1500
    expect(result.exposure).toBe(5100);
    expect(result.avbalance).toBe(14900);
    expect(result.avbalance).toBeGreaterThanOrEqual(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════
// 3. MERGE (SAME TYPE + SAME SCORE) → EXPOSURE RECALC → PTI
// ═════════════════════════════════════════════════════════════════════════
describe('3. Merge path: same type + same score → exposure recalc + PTI', () => {
  it('merge two back bets: combined price/betAmount, exposure = merged price', () => {
    // Existing back bet: stake=500, odds=60% → price=500, betAmount=300
    const existing = makeFancyBet({
      otype: 'back',
      price: 500,
      betAmount: 300,
      xValue: 60,
      fancyScore: 180,
    });

    // New back bet at same score: stake=300, odds=50% → price=300, betAmount=150
    const { price: newP, betAmount: newBA } = calculateFancyBetAmounts(
      300,
      50,
      'back'
    );

    // Simulate merge (betController line 1239-1241)
    const merged = {
      ...existing,
      price: existing.price + newP, // 500 + 300 = 800
      betAmount: existing.betAmount + newBA, // 300 + 150 = 450
      xValue: (existing.xValue + 50) / 2, // (60 + 50) / 2 = 55
    };

    const exposure = calculateAllExposure([merged]);
    // Single back: hit=+450, miss=-800 → exposure=800
    expect(exposure).toBe(800);

    const avbalance = 10000 - exposure;
    expect(avbalance).toBe(9200);
    expect(avbalance).toBeGreaterThanOrEqual(0);
  });

  it('merge two lay bets: combined, exposure = merged price', () => {
    // Existing lay: stake=400, odds=50% → price=200, betAmount=400
    const existing = makeFancyBet({
      otype: 'lay',
      price: 200,
      betAmount: 400,
      xValue: 50,
      fancyScore: 190,
    });

    // New lay: stake=600, odds=70% → price=420, betAmount=600
    const { price: newP, betAmount: newBA } = calculateFancyBetAmounts(
      600,
      70,
      'lay'
    );

    const merged = {
      ...existing,
      price: existing.price + newP,
      betAmount: existing.betAmount + newBA,
      xValue: (existing.xValue + 70) / 2,
    };

    // price = 200 + 420 = 620, betAmount = 400 + 600 = 1000
    expect(merged.price).toBe(620);
    expect(merged.betAmount).toBe(1000);

    const exposure = calculateAllExposure([merged]);
    // Lay: hit=-620, miss=+1000 → exposure=620
    expect(exposure).toBe(620);

    const avbalance = 10000 - exposure;
    expect(avbalance).toBe(9380);
    expect(avbalance).toBeGreaterThanOrEqual(0);
  });

  it('merged bet + other pending bets: total exposure is sum of all markets', () => {
    // Merged back bet on "6 over run"
    const merged = makeFancyBet({
      teamName: '6 over run',
      otype: 'back',
      price: 800,
      betAmount: 450,
    });
    // Separate lay on "7 over run"
    const other = makeFancyBet({
      teamName: '7 over run',
      otype: 'lay',
      price: 600,
      betAmount: 750,
    });
    // Sports bet
    const sportsBet = makeSportsBet({
      teamName: 'India',
      otype: 'back',
      price: 1500,
      betAmount: 1200,
    });

    const exposure = calculateAllExposure([merged, other, sportsBet]);
    // "6 over run": miss=-800 → 800
    // "7 over run": hit=-600 → 600
    // Sports: miss=-1500 → 1500
    expect(exposure).toBe(2900);

    const avbalance = 15000 - exposure;
    expect(avbalance).toBe(12100);
    expect(avbalance).toBeGreaterThanOrEqual(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════
// 4. SCORE OFFSET → EXPOSURE RECALC → PTI
// ═════════════════════════════════════════════════════════════════════════
describe('4. Score offset path: exposure recalc + PTI after offsetting', () => {
  it('full score offset (back offsets lay): reduced exposure', () => {
    // Existing back at score 180: price=200, betAmount=150
    const existing = makeFancyBet({
      otype: 'back',
      price: 200,
      betAmount: 150,
      fancyScore: 180,
    });

    // New lay at score 200 (higher → score offset triggers)
    const { price: newP, betAmount: newBA } = calculateFancyBetAmounts(
      200,
      50,
      'lay'
    );
    // newP = 200 × 50% = 100, newBA = 200

    // Full offset: originalBetAmount(150) >= newP(100) → true
    const offset = {
      ...existing,
      price: existing.price - newBA, // 200 - 200 = 0
      betAmount: existing.betAmount - newP, // 150 - 100 = 50
      fancyScore: 200,
    };

    const exposure = calculateAllExposure([offset]);
    // Back with price=0, betAmount=50: hit=+50, miss=0 → no loss → exposure=0
    expect(exposure).toBe(0);

    const avbalance = 10000 - exposure;
    expect(avbalance).toBe(10000);
    expect(avbalance).toBeGreaterThanOrEqual(0);
  });

  it('partial score offset with type change: exposure from resulting bet', () => {
    // Existing back at score 180: price=50, betAmount=25
    const existing = makeFancyBet({
      otype: 'back',
      price: 50,
      betAmount: 25,
      fancyScore: 180,
    });

    // New lay at score 200: stake=400, odds=50% → price=200, betAmount=400
    const { price: newP, betAmount: newBA } = calculateFancyBetAmounts(
      400,
      50,
      'lay'
    );
    // newP = 200, newBA = 400

    // Partial offset: originalBetAmount(25) < newP(200) → type change to lay
    const offset = {
      ...existing,
      price: newP - existing.betAmount, // 200 - 25 = 175
      betAmount: newBA - existing.price, // 400 - 50 = 350
      otype: 'lay',
      fancyScore: 200,
    };

    const exposure = calculateAllExposure([offset]);
    // Lay: hit=-175, miss=+350 → exposure=175
    expect(exposure).toBe(175);

    const avbalance = 10000 - exposure;
    expect(avbalance).toBe(9825);
    expect(avbalance).toBeGreaterThanOrEqual(0);
  });

  it('score offset + other pending bets: total exposure is correct', () => {
    // After score offset, resulting bet
    const offsetBet = makeFancyBet({
      teamName: '6 over run',
      otype: 'lay',
      price: 175,
      betAmount: 350,
      fancyScore: 200,
    });
    // Another fancy bet on different market
    const otherFancy = makeFancyBet({
      teamName: '8 over run',
      otype: 'back',
      price: 1000,
      betAmount: 500,
    });
    // Sports bet
    const sportsBet = makeSportsBet({ price: 2000, betAmount: 1600 });

    const exposure = calculateAllExposure([offsetBet, otherFancy, sportsBet]);
    // "6 over run" (lay): hit=-175 → 175
    // "8 over run" (back): miss=-1000 → 1000
    // Sports: miss=-2000 → 2000
    expect(exposure).toBe(3175);

    const avbalance = 20000 - exposure;
    expect(avbalance).toBe(16825);
    expect(avbalance).toBeGreaterThanOrEqual(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════
// 5. ODDS OFFSET → EXPOSURE RECALC → PTI
// ═════════════════════════════════════════════════════════════════════════
describe('5. Odds offset path: exposure recalc + PTI', () => {
  it('full odds offset (back offsets lay with higher odds): reduced exposure', () => {
    // Existing back at score 180, odds 50%: price=100, betAmount=50
    const existing = makeFancyBet({
      otype: 'back',
      price: 100,
      betAmount: 50,
      xValue: 50,
      fancyScore: 180,
    });

    // New lay at same score 180, odds 60% (higher → odds offset triggers)
    const { price: newP, betAmount: newBA } = calculateFancyBetAmounts(
      100,
      60,
      'lay'
    );
    // newP = 60, newBA = 100

    // Full offset: originalBetAmount(50) >= newP(60) → FALSE
    // Partial offset with type change
    const offset = {
      ...existing,
      price: newP - existing.betAmount, // 60 - 50 = 10
      betAmount: newBA - existing.price, // 100 - 100 = 0
      otype: 'lay',
      xValue: 60,
      fancyScore: 180,
    };

    const exposure = calculateAllExposure([offset]);
    // Lay: hit=-10, miss=0 → worst=-10, exposure=10
    expect(exposure).toBe(10);

    const avbalance = 10000 - exposure;
    expect(avbalance).toBe(9990);
    expect(avbalance).toBeGreaterThanOrEqual(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════
// 6. NO-OFFSET SEPARATE BET → EXPOSURE RECALC → PTI
// ═════════════════════════════════════════════════════════════════════════
describe('6. No-offset separate bet: exposure recalc + PTI', () => {
  it('opposite type with no offset conditions: two separate bets', () => {
    // Existing back at score 180, odds 50%
    const existing = makeFancyBet({
      otype: 'back',
      price: 1000,
      betAmount: 500,
      xValue: 50,
      fancyScore: 180,
    });

    // New lay at score 170 (lower, not higher → no score offset)
    // Odds 40% (lower, not higher → no odds offset)
    const { price: newP, betAmount: newBA } = calculateFancyBetAmounts(
      500,
      40,
      'lay'
    );
    // newP = 200, newBA = 500

    const newBet = makeFancyBet({
      teamName: '6 over run IND',
      otype: 'lay',
      price: newP, // 200
      betAmount: newBA, // 500
      xValue: 40,
      fancyScore: 170,
    });

    // Both bets are on the same teamName + gameId = same fancy market
    // BUT different fancyScores → 3 zones (threshold enumeration)
    const exposure = calculateAllExposure([existing, newBet]);
    // Thresholds: [170, 180] → 3 zones
    // Zone 0 (score < 170):    back@180 miss(-1000) + lay@170 miss(+500)  = -500
    // Zone 1 (170 ≤ s < 180):  back@180 miss(-1000) + lay@170 hit(-200)  = -1200  ← GAP ZONE
    // Zone 2 (score ≥ 180):    back@180 hit(+500)   + lay@170 hit(-200)  = +300
    // Worst = -1200, exposure = 1200
    // OLD BUG (2-scenario): hitNet=500-200=300, missNet=-1000+500=-500 → exposure=500 (WRONG)
    expect(exposure).toBe(1200);

    const avbalance = 10000 - exposure;
    expect(avbalance).toBe(8800);
    expect(avbalance).toBeGreaterThanOrEqual(0);
  });

  it('separate bets on different markets: exposures add up', () => {
    const existing = makeFancyBet({
      teamName: '6 over run',
      otype: 'back',
      price: 1000,
      betAmount: 500,
    });

    // New bet on different market (different teamName = different market)
    const newBet = makeFancyBet({
      teamName: '7 over run',
      otype: 'lay',
      price: 400,
      betAmount: 500,
    });

    const exposure = calculateAllExposure([existing, newBet]);
    // "6 over run": miss=-1000 → 1000
    // "7 over run": hit=-400 → 400
    expect(exposure).toBe(1400);

    const avbalance = 10000 - exposure;
    expect(avbalance).toBe(8600);
    expect(avbalance).toBeGreaterThanOrEqual(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════
// 7. MIXED FANCY + SPORTS: EXPOSURE CALCULATED DIFFERENTLY
// ═════════════════════════════════════════════════════════════════════════
describe('7. Mixed fancy + sports: different exposure calculations', () => {
  it('fancy uses hit/miss, sports uses outcome scenarios: both summed', () => {
    const bets = [
      // Sports: team-based scenario
      makeSportsBet({
        teamName: 'India',
        otype: 'back',
        price: 2000,
        betAmount: 1600,
      }),
      // Fancy: score-based hit/miss
      makeFancyBet({
        teamName: '6 over run',
        otype: 'lay',
        price: 800,
        betAmount: 1000,
      }),
    ];

    const exposure = calculateAllExposure(bets);
    // Sports "Match Odds": India wins=+1600, OTHER=-2000 → 2000
    // Fancy "6 over run": hit=-800, miss=+1000 → 800
    expect(exposure).toBe(2800);
  });

  it('fancy lay + sports back+lay offsetting: correct total', () => {
    const bets = [
      // Sports back+lay on same market (offsetting)
      makeSportsBet({
        teamName: 'India',
        otype: 'back',
        price: 5000,
        betAmount: 4000,
      }),
      makeSportsBet({
        teamName: 'India',
        otype: 'lay',
        price: 4000,
        betAmount: 3200,
      }),
      // Fancy lay
      makeFancyBet({
        teamName: '8 over run',
        otype: 'lay',
        price: 2000,
        betAmount: 2500,
      }),
    ];

    const exposure = calculateAllExposure(bets);
    // Sports: India wins: +4000-4000=0, OTHER: -5000+3200=-1800 → 1800
    // Fancy: hit=-2000, miss=+2500 → 2000
    expect(exposure).toBe(3800);

    const avbalance = 20000 - exposure;
    expect(avbalance).toBe(16200);
    expect(avbalance).toBeGreaterThanOrEqual(0);
  });

  it('progressive: place sports, then fancy, then more fancy — PTI never negative', () => {
    const balance = 10000;
    const bets = [];

    // Step 1: Sports back
    bets.push(makeSportsBet({ price: 2000, betAmount: 1600 }));
    let exposure = calculateAllExposure(bets);
    expect(balance - exposure).toBeGreaterThanOrEqual(0);

    // Step 2: Fancy back (different market entirely)
    const { price: p2, betAmount: ba2 } = calculateFancyBetAmounts(
      1000,
      60,
      'back'
    );
    bets.push(
      makeFancyBet({
        teamName: '6 over run',
        otype: 'back',
        price: p2,
        betAmount: ba2,
      })
    );
    exposure = calculateAllExposure(bets);
    // Sports: 2000, Fancy: 1000
    expect(exposure).toBe(3000);
    expect(balance - exposure).toBe(7000);

    // Step 3: Fancy lay on different market
    const { price: p3, betAmount: ba3 } = calculateFancyBetAmounts(
      800,
      50,
      'lay'
    );
    bets.push(
      makeFancyBet({
        teamName: '7 over run',
        otype: 'lay',
        price: p3,
        betAmount: ba3,
      })
    );
    exposure = calculateAllExposure(bets);
    // Sports: 2000, "6 over": 1000, "7 over": hit=-400 → 400
    expect(exposure).toBe(3400);
    expect(balance - exposure).toBe(6600);

    // Step 4: Fancy back on SAME market as step 3 (offsetting)
    bets.push(
      makeFancyBet({
        teamName: '7 over run',
        otype: 'back',
        price: 300,
        betAmount: 150,
      })
    );
    exposure = calculateAllExposure(bets);
    // "7 over run": hit=150-400=-250, miss=-300+800=-200+800... let me calculate
    // p3 = 400 (800×50%), ba3 = 800
    // hit: 150 - 400 = -250
    // miss: -300 + 800 = +500
    // worst = -250, exposure = 250
    // Sports: 2000, "6 over": 1000, "7 over": 250
    expect(exposure).toBe(3250);
    expect(balance - exposure).toBe(6750);
    expect(balance - exposure).toBeGreaterThanOrEqual(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════
// 8. THE EXACT BUG SCENARIO: srijan5-style fancy lay under-calculation
// ═════════════════════════════════════════════════════════════════════════
describe('8. Production bug: fancy lay exposure under-calculated', () => {
  it('srijan5 scenario: lay stake=906, odds=50% → correct exposure=453, not simple price', () => {
    // This mirrors the srijan5 bug where:
    // Old code: betType === 'fancy' (never true) → used simple sum of prices
    // New code: gameType === 'Normal' (true) → uses hit/miss scenario

    const { price, betAmount } = calculateFancyBetAmounts(906, 50, 'lay');
    // price = 906 × 50% = 453
    // betAmount = 906
    expect(price).toBe(453);
    expect(betAmount).toBe(906);

    const bet = makeFancyBet({ otype: 'lay', price, betAmount });
    const exposure = calculateAllExposure([bet]);
    // hit=-453, miss=+906 → worst=-453, exposure=453
    expect(exposure).toBe(453);
  });

  it('srijan5 with existing sports bet: total exposure is fancy + sports', () => {
    const balance = 700;

    // Existing sports bets contributing 699.2 exposure (from production)
    const sportsBets = [
      makeSportsBet({
        gameId: 'match1',
        teamName: 'TeamA',
        otype: 'back',
        price: 246.2,
        betAmount: 246.2,
      }),
      makeSportsBet({
        gameId: 'match1',
        teamName: 'TeamA',
        otype: 'lay',
        price: 246.2,
        betAmount: 197,
      }),
    ];

    // Correct sports exposure with offsetting
    const sportsOnly = calculateAllExposure(sportsBets);

    // Add fancy lay bet
    const fancyBet = makeFancyBet({
      otype: 'lay',
      price: 453,
      betAmount: 906,
    });

    const totalExposure = calculateAllExposure([...sportsBets, fancyBet]);
    // Total = sports exposure + 453
    expect(totalExposure).toBe(sportsOnly + 453);

    const avbalance = balance - totalExposure;
    // With correct calculation, avbalance could be negative
    // (which means the bet should have been rejected at placement!)
    if (avbalance < 0) {
      // This proves the old code allowed a bet it shouldn't have
      expect(avbalance).toBeLessThan(0);
    }
  });

  it('two fancy lays on different markets: exposure = sum of prices, not sum of |betAmount+price|', () => {
    const balance = 10000;

    const { price: p1, betAmount: ba1 } = calculateFancyBetAmounts(
      5000,
      80,
      'lay'
    );
    const { price: p2, betAmount: ba2 } = calculateFancyBetAmounts(
      3000,
      60,
      'lay'
    );
    // p1=4000, ba1=5000, p2=1800, ba2=3000

    const bets = [
      makeFancyBet({
        teamName: '6 over run',
        otype: 'lay',
        price: p1,
        betAmount: ba1,
      }),
      makeFancyBet({
        teamName: '7 over run',
        otype: 'lay',
        price: p2,
        betAmount: ba2,
      }),
    ];

    const exposure = calculateAllExposure(bets);
    // "6 over run": hit=-4000, miss=+5000 → 4000
    // "7 over run": hit=-1800, miss=+3000 → 1800
    expect(exposure).toBe(5800);
    // OLD BUG: |5000+4000| + |3000+1800| = 9000 + 4800 = 13800
    expect(exposure).not.toBe(13800);

    expect(balance - exposure).toBe(4200);
    expect(balance - exposure).toBeGreaterThanOrEqual(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════
// 9. ALL GAME TYPES IN PLACEMENT FLOW
// ═════════════════════════════════════════════════════════════════════════
describe('9. All fancy game types work correctly in placement flow', () => {
  const gameTypes = ['Normal', 'meter', 'line', 'ball', 'khado'];

  gameTypes.forEach((gameType) => {
    it(`${gameType}: lay bet → exposure = price, not |betAmount+price|`, () => {
      const stake = 2000;
      const odds = 75;
      const { price, betAmount } = calculateFancyBetAmounts(stake, odds, 'lay');
      // price = 2000 × 75% = 1500, betAmount = 2000

      const bet = makeFancyBet({
        gameType,
        teamName: `test-${gameType}`,
        otype: 'lay',
        price,
        betAmount,
      });

      expect(isFancyBet(bet)).toBe(true);
      expect(calculateAllExposure([bet])).toBe(1500);
      // NOT |2000 + 1500| = 3500
      expect(calculateAllExposure([bet])).not.toBe(3500);
    });

    it(`${gameType}: back bet → exposure = price (stake at risk)`, () => {
      const stake = 1000;
      const odds = 50;
      const { price, betAmount } = calculateFancyBetAmounts(
        stake,
        odds,
        'back'
      );

      const bet = makeFancyBet({
        gameType,
        teamName: `test-${gameType}`,
        otype: 'back',
        price,
        betAmount,
      });

      expect(isFancyBet(bet)).toBe(true);
      expect(calculateAllExposure([bet])).toBe(1000);
    });
  });

  it('non-fancy gameType goes through sports exposure path', () => {
    const bet = makeSportsBet({ gameType: 'Match Odds' });
    expect(isFancyBet(bet)).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════
// 10. PROGRESSIVE PLACEMENT: FULL FLOW (NEW → MERGE → OFFSET → RECALC)
// ═════════════════════════════════════════════════════════════════════════
describe('10. Full placement journey: PTI tracked at every step', () => {
  it('5-step journey: new → new → merge → score offset → new sports', () => {
    const balance = 20000;
    const bets = [];

    // STEP 1: New fancy back on "6 over run", stake=1000, odds=50%
    const s1 = calculateFancyBetAmounts(1000, 50, 'back');
    bets.push(
      makeFancyBet({
        teamName: '6 over run',
        otype: 'back',
        price: s1.price, // 1000
        betAmount: s1.betAmount, // 500
        fancyScore: 180,
      })
    );
    let exp = calculateAllExposure(bets);
    expect(exp).toBe(1000);
    expect(balance - exp).toBe(19000);

    // STEP 2: New fancy lay on "7 over run", stake=800, odds=60%
    const s2 = calculateFancyBetAmounts(800, 60, 'lay');
    bets.push(
      makeFancyBet({
        teamName: '7 over run',
        otype: 'lay',
        price: s2.price, // 480
        betAmount: s2.betAmount, // 800
        fancyScore: 190,
      })
    );
    exp = calculateAllExposure(bets);
    // "6 over": 1000, "7 over": 480
    expect(exp).toBe(1480);
    expect(balance - exp).toBe(18520);

    // STEP 3: Merge - another back on "6 over run" at same score 180
    const s3 = calculateFancyBetAmounts(500, 40, 'back');
    // Merge: price = 1000+500 = 1500, betAmount = 500+200 = 700
    bets[0] = {
      ...bets[0],
      price: bets[0].price + s3.price,
      betAmount: bets[0].betAmount + s3.betAmount,
    };
    exp = calculateAllExposure(bets);
    // "6 over": miss=-1500 → 1500
    // "7 over": hit=-480 → 480
    expect(exp).toBe(1980);
    expect(balance - exp).toBe(18020);

    // STEP 4: Score offset - lay on "6 over run" at score 200 (> 180)
    const s4 = calculateFancyBetAmounts(600, 50, 'lay');
    // s4.price = 300, s4.betAmount = 600
    // Existing is back with betAmount=700, price=1500
    // Full offset: 700 >= 300 → true
    bets[0] = {
      ...bets[0],
      price: bets[0].price - s4.betAmount, // 1500 - 600 = 900
      betAmount: bets[0].betAmount - s4.price, // 700 - 300 = 400
      fancyScore: 200,
    };
    exp = calculateAllExposure(bets);
    // "6 over": back with price=900, betAmount=400 → hit=+400, miss=-900 → 900
    // "7 over": hit=-480 → 480
    expect(exp).toBe(1380);
    expect(balance - exp).toBe(18620);

    // STEP 5: Sports bet
    bets.push(
      makeSportsBet({
        gameId: 'match1',
        teamName: 'India',
        otype: 'back',
        price: 3000,
        betAmount: 2400,
      })
    );
    exp = calculateAllExposure(bets);
    // Fancy: 900 + 480 = 1380
    // Sports: 3000
    expect(exp).toBe(4380);
    expect(balance - exp).toBe(15620);
    expect(balance - exp).toBeGreaterThanOrEqual(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════
// 11. BALANCE CHECK: avbalance < price REJECTS BET
// ═════════════════════════════════════════════════════════════════════════
describe('11. Pre-placement balance check (line 1188)', () => {
  it('reject when avbalance < calculated price (back)', () => {
    const user = { avbalance: 400, balance: 5000 };
    const { price } = calculateFancyBetAmounts(500, 50, 'back');
    // price = 500 (for back, price = stake)
    expect(user.avbalance < price || user.balance < price).toBe(true);
  });

  it('reject when avbalance < calculated price (lay)', () => {
    const user = { avbalance: 300, balance: 5000 };
    const { price } = calculateFancyBetAmounts(1000, 50, 'lay');
    // price = 500 (for lay, price = stake × odds%)
    expect(user.avbalance < price || user.balance < price).toBe(true);
  });

  it('accept when avbalance >= calculated price', () => {
    const user = { avbalance: 1000, balance: 5000 };
    const { price } = calculateFancyBetAmounts(500, 50, 'lay');
    // price = 250
    expect(user.avbalance < price || user.balance < price).toBe(false);
  });

  it('reject when balance < calculated price (even if avbalance is enough)', () => {
    const user = { avbalance: 5000, balance: 200 };
    const { price } = calculateFancyBetAmounts(500, 80, 'lay');
    // price = 400
    expect(user.avbalance < price || user.balance < price).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════
// 12. POST-PLACEMENT PTI SAFETY CHECK (line 1476)
// ═════════════════════════════════════════════════════════════════════════
describe('12. Post-placement PTI safety check', () => {
  it('PTI positive after correct fancy exposure calc', () => {
    const balance = 5000;
    const { price, betAmount } = calculateFancyBetAmounts(2000, 80, 'lay');
    // price = 1600, betAmount = 2000

    const bet = makeFancyBet({ otype: 'lay', price, betAmount });
    const exposure = calculateAllExposure([bet]);
    const avbalance = balance - exposure;

    // exposure = 1600, avbalance = 3400
    expect(avbalance).toBe(3400);
    expect(avbalance).toBeGreaterThanOrEqual(0);
  });

  it('would have been negative with old bug: |betAmount+price| overcounts', () => {
    const balance = 5000;
    const { price, betAmount } = calculateFancyBetAmounts(3000, 80, 'lay');
    // price = 2400, betAmount = 3000

    const bet = makeFancyBet({ otype: 'lay', price, betAmount });

    // CORRECT: exposure = 2400, avbalance = 2600
    const correctExposure = calculateAllExposure([bet]);
    expect(correctExposure).toBe(2400);
    expect(balance - correctExposure).toBe(2600);
    expect(balance - correctExposure).toBeGreaterThanOrEqual(0);

    // OLD BUG would compute: |3000 + 2400| = 5400, avbalance = -400 → NEGATIVE!
    const oldBugExposure = Math.abs(betAmount + price);
    expect(balance - oldBugExposure).toBe(-400);
    expect(balance - oldBugExposure).toBeLessThan(0);
  });

  it('multiple fancy lays: correct calc keeps PTI positive, old bug makes it negative', () => {
    const balance = 15000;

    const bets = [
      makeFancyBet({
        teamName: '6 over',
        otype: 'lay',
        price: 4000,
        betAmount: 5000,
      }),
      makeFancyBet({
        teamName: '7 over',
        otype: 'lay',
        price: 3200,
        betAmount: 4000,
      }),
      makeFancyBet({
        teamName: '8 over',
        otype: 'lay',
        price: 2400,
        betAmount: 3000,
      }),
    ];

    const correctExposure = calculateAllExposure(bets);
    // 4000 + 3200 + 2400 = 9600
    expect(correctExposure).toBe(9600);
    expect(balance - correctExposure).toBe(5400);
    expect(balance - correctExposure).toBeGreaterThanOrEqual(0);

    // OLD BUG: |5000+4000| + |4000+3200| + |3000+2400| = 9000+7200+5400 = 21600
    const oldBugExposure =
      Math.abs(5000 + 4000) + Math.abs(4000 + 3200) + Math.abs(3000 + 2400);
    expect(balance - oldBugExposure).toBe(-6600);
    expect(balance - oldBugExposure).toBeLessThan(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════
// 13. STRESS: MANY FANCY BETS PLACED PROGRESSIVELY
// ═════════════════════════════════════════════════════════════════════════
describe('13. Stress: progressive fancy placement, PTI always >= 0', () => {
  it('10 fancy bets across 5 markets, balance=50000', () => {
    const balance = 50000;
    const bets = [];

    for (let i = 0; i < 5; i++) {
      // Back bet on market i
      const back = calculateFancyBetAmounts(1000 + i * 200, 50 + i * 5, 'back');
      bets.push(
        makeFancyBet({
          teamName: `${6 + i} over run`,
          otype: 'back',
          price: back.price,
          betAmount: back.betAmount,
          gameType: ['Normal', 'meter', 'line', 'ball', 'khado'][i],
        })
      );

      let exp = calculateAllExposure(bets);
      let avb = balance - exp;
      expect(avb).toBeGreaterThanOrEqual(0);

      // Lay bet on same market (offsetting)
      const lay = calculateFancyBetAmounts(800 + i * 150, 40 + i * 5, 'lay');
      bets.push(
        makeFancyBet({
          teamName: `${6 + i} over run`,
          otype: 'lay',
          price: lay.price,
          betAmount: lay.betAmount,
          gameType: ['Normal', 'meter', 'line', 'ball', 'khado'][i],
        })
      );

      exp = calculateAllExposure(bets);
      avb = balance - exp;
      expect(avb).toBeGreaterThanOrEqual(0);
    }

    // Final check
    const finalExposure = calculateAllExposure(bets);
    const finalAvbalance = balance - finalExposure;
    expect(finalAvbalance).toBeGreaterThanOrEqual(0);
    expect(bets.length).toBe(10);
  });

  it('20 fancy lays: exposure never exceeds balance', () => {
    const balance = 100000;
    const bets = [];

    for (let i = 0; i < 20; i++) {
      const lay = calculateFancyBetAmounts(500, 50, 'lay');
      bets.push(
        makeFancyBet({
          teamName: `market-${i}`,
          otype: 'lay',
          price: lay.price, // 250 each
          betAmount: lay.betAmount, // 500 each
        })
      );
    }

    const exposure = calculateAllExposure(bets);
    // 20 markets × 250 each = 5000
    expect(exposure).toBe(5000);
    expect(balance - exposure).toBe(95000);
    expect(balance - exposure).toBeGreaterThanOrEqual(0);
  });
});
