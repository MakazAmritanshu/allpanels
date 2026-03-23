/**
 * Fancy Exposure & PTI Regression Tests
 *
 * GOAL: Guarantee that fancy exposure calculation is correct based on
 *       hit/miss scenario analysis, and PTI (avbalance) NEVER goes negative.
 *
 * FORMULA (from settlement logic in fancyBetSettlementService):
 *   Back bet:  Hit (score >= fancyScore) → win +betAmount,  Miss → lose -price
 *   Lay bet:   Hit (score >= fancyScore) → lose -price,     Miss → win +betAmount
 *
 * Exposure per fancy market = |min(0, min(hitNet, missNet))|
 *
 * OLD BUG: layMaxLoss = |betAmount + price| → overcounted by ~2.25x for lay bets
 *   e.g. stake=5000, odds=80 → price=4000, betAmount=5000
 *   OLD: |5000 + 4000| = 9000   (WRONG)
 *   NEW: hit=-4000, miss=+5000 → worstCase=-4000, exposure=4000   (CORRECT)
 *
 * This file tests:
 *   1. Single fancy back/lay bets
 *   2. Same-market back+lay offsetting
 *   3. Multiple fancy markets summing independently
 *   4. Mixed fancy + sports bets
 *   5. Progressive bet placement (PTI tracked after each bet)
 *   6. Post-settlement exposure recalculation
 *   7. Stress tests with high volume
 *   8. Every scenario: PTI >= 0
 */
import { describe, expect, it } from 'vitest';

import {
  calculateAllExposure,
  calculateFancyExposure,
  isFancyBet,
} from '../utils/exposureUtils.js';

// ─── Helpers ──────────────────────────────────────────────────────────

/** Create a fancy bet with defaults */
const fancy = (overrides = {}) => ({
  gameId: 'g1',
  teamName: '6 over run',
  otype: 'back',
  price: 100,
  betAmount: 50,
  betType: 'sports',
  gameType: 'Normal',
  ...overrides,
});

/** Create a sports (non-fancy) bet with defaults */
const sports = (overrides = {}) => ({
  gameId: 'g1',
  marketName: 'Match Odds',
  teamName: 'India',
  otype: 'back',
  price: 100,
  betAmount: 80,
  betType: 'sports',
  gameType: 'Match Odds',
  ...overrides,
});

/** Assert PTI (avbalance) is never negative */
function assertPTI(balance, pendingBets, label) {
  const exposure = calculateAllExposure(pendingBets);
  const avbalance = balance - exposure;
  if (avbalance < 0) {
    throw new Error(
      `[PTI NEGATIVE] ${label}: balance=${balance}, exposure=${exposure}, avbalance=${avbalance}\n` +
        `  Bets: ${JSON.stringify(
          pendingBets.map((b) => ({
            team: b.teamName,
            otype: b.otype,
            price: b.price,
            betAmount: b.betAmount,
            gameType: b.gameType,
          })),
          null,
          2
        )}`
    );
  }
  return { exposure, avbalance };
}

/**
 * Manually compute fancy exposure for a single market using the hit/miss formula.
 * This is the "reference implementation" we verify against.
 */
function manualFancyMarketExposure(bets) {
  let hitNet = 0;
  let missNet = 0;
  for (const bet of bets) {
    if (bet.otype === 'back') {
      hitNet += bet.betAmount;
      missNet -= bet.price;
    } else {
      hitNet -= bet.price;
      missNet += bet.betAmount;
    }
  }
  const worstCase = Math.min(hitNet, missNet);
  return Math.abs(Math.min(0, worstCase));
}

// ═════════════════════════════════════════════════════════════════════════
// 1. FANCY SINGLE BETS — verify hit/miss formula
// ═════════════════════════════════════════════════════════════════════════
describe('Fancy Single Bet Exposure (hit/miss scenarios)', () => {
  it('back bet: hit wins betAmount, miss loses price → exposure = price', () => {
    const bet = fancy({ otype: 'back', price: 200, betAmount: 100 });
    // Hit: +100, Miss: -200 → worst = -200, exposure = 200
    expect(calculateFancyExposure([bet])).toBe(200);
    expect(manualFancyMarketExposure([bet])).toBe(200);
  });

  it('lay bet: hit loses price, miss wins betAmount → exposure = price', () => {
    const bet = fancy({ otype: 'lay', price: 800, betAmount: 1000 });
    // Hit: -800, Miss: +1000 → worst = -800, exposure = 800
    expect(calculateFancyExposure([bet])).toBe(800);
    expect(manualFancyMarketExposure([bet])).toBe(800);
  });

  it('lay bet with small odds: exposure = price (NOT |betAmount + price|)', () => {
    // This is THE bug scenario. stake=5000, odds=80 → price=4000, betAmount=5000
    const bet = fancy({ otype: 'lay', price: 4000, betAmount: 5000 });
    // Hit: -4000, Miss: +5000 → worst = -4000, exposure = 4000
    // OLD BUG: |5000 + 4000| = 9000 (WRONG!)
    expect(calculateFancyExposure([bet])).toBe(4000);
    expect(calculateFancyExposure([bet])).not.toBe(9000);
  });

  it('lay bet with large odds: exposure = price (NOT |betAmount + price|)', () => {
    // stake=1000, odds=80 → price=800, betAmount=1000
    const bet = fancy({
      otype: 'lay',
      price: 800,
      betAmount: 1000,
      teamName: '7 over run',
    });
    // Hit: -800, Miss: +1000 → worst = -800, exposure = 800
    // OLD BUG: |1000 + 800| = 1800 (WRONG!)
    expect(calculateFancyExposure([bet])).toBe(800);
    expect(calculateFancyExposure([bet])).not.toBe(1800);
  });

  it('back with negative betAmount (offset): both scenarios can be losses', () => {
    const bet = fancy({ otype: 'back', price: 100, betAmount: -50 });
    // Hit: -50, Miss: -100 → worst = -100, exposure = 100
    expect(calculateFancyExposure([bet])).toBe(100);
  });

  it('lay with negative betAmount (offset): both scenarios can be losses', () => {
    const bet = fancy({ otype: 'lay', price: 100, betAmount: -50 });
    // Hit: -100, Miss: -50 → worst = -100, exposure = 100
    expect(calculateFancyExposure([bet])).toBe(100);
  });
});

// ═════════════════════════════════════════════════════════════════════════
// 2. FANCY SAME-MARKET OFFSETTING
// ═════════════════════════════════════════════════════════════════════════
describe('Fancy Same-Market Offsetting (back + lay)', () => {
  it('back+lay on same market reduces exposure', () => {
    const bets = [
      fancy({ otype: 'back', price: 200, betAmount: 100 }),
      fancy({ otype: 'lay', price: 100, betAmount: 50 }),
    ];
    // Hit: +100 - 100 = 0
    // Miss: -200 + 50 = -150
    // worst = -150, exposure = 150
    expect(calculateFancyExposure(bets)).toBe(150);
    expect(manualFancyMarketExposure(bets)).toBe(150);
  });

  it('perfect hedge: guaranteed profit → 0 exposure', () => {
    const bets = [
      fancy({ otype: 'back', price: 100, betAmount: 200 }),
      fancy({ otype: 'lay', price: 50, betAmount: 300 }),
    ];
    // Hit: +200 - 50 = +150
    // Miss: -100 + 300 = +200
    // Both positive → worst = +150, no exposure
    expect(calculateFancyExposure(bets)).toBe(0);
  });

  it('multiple backs + multiple lays on same market', () => {
    const bets = [
      fancy({ otype: 'back', price: 300, betAmount: 150 }),
      fancy({ otype: 'back', price: 200, betAmount: 100 }),
      fancy({ otype: 'lay', price: 250, betAmount: 125 }),
      fancy({ otype: 'lay', price: 100, betAmount: 50 }),
    ];
    // Hit: (150 + 100) - (250 + 100) = 250 - 350 = -100
    // Miss: -(300 + 200) + (125 + 50) = -500 + 175 = -325
    // worst = -325, exposure = 325
    expect(calculateFancyExposure(bets)).toBe(325);
    expect(manualFancyMarketExposure(bets)).toBe(325);
  });

  it('lay-heavy same market: lay exposure does not explode', () => {
    const bets = [
      fancy({ otype: 'back', price: 100, betAmount: 50 }),
      fancy({ otype: 'lay', price: 500, betAmount: 600 }),
      fancy({ otype: 'lay', price: 300, betAmount: 400 }),
    ];
    // Hit: 50 - 500 - 300 = -750
    // Miss: -100 + 600 + 400 = +900
    // worst = -750, exposure = 750
    // OLD BUG would compute: back=100, lay=|600+500|+|400+300|=1100+700=1800, max(100,1800)=1800
    expect(calculateFancyExposure(bets)).toBe(750);
  });
});

// ═════════════════════════════════════════════════════════════════════════
// 3. MULTIPLE FANCY MARKETS — sum independently
// ═════════════════════════════════════════════════════════════════════════
describe('Fancy Multiple Markets (sum independently)', () => {
  it('2 different markets sum their exposures', () => {
    const bets = [
      fancy({
        teamName: '6 over run',
        otype: 'back',
        price: 200,
        betAmount: 100,
      }),
      fancy({
        teamName: '7 over run',
        otype: 'back',
        price: 300,
        betAmount: 150,
      }),
    ];
    // Market 1: miss = -200, exposure = 200
    // Market 2: miss = -300, exposure = 300
    expect(calculateAllExposure(bets)).toBe(500);
  });

  it('3 markets: 2 lay + 1 back, each independent', () => {
    const bets = [
      fancy({
        teamName: '6 over run',
        otype: 'lay',
        price: 4000,
        betAmount: 5000,
      }),
      fancy({
        teamName: '7 over run',
        otype: 'lay',
        price: 800,
        betAmount: 1000,
      }),
      fancy({
        teamName: '8 over run',
        otype: 'back',
        price: 500,
        betAmount: 250,
      }),
    ];
    // "6 over run": hit=-4000, miss=+5000 → exposure=4000
    // "7 over run": hit=-800, miss=+1000 → exposure=800
    // "8 over run": miss=-500 → exposure=500
    // Total = 5300
    // OLD BUG: |5000+4000| + |1000+800| + 500 = 9000+1800+500 = 11300
    expect(calculateAllExposure(bets)).toBe(5300);
  });

  it('same gameId different teamName = different markets', () => {
    const bets = [
      fancy({
        gameId: 'g1',
        teamName: '6 over run',
        otype: 'back',
        price: 100,
        betAmount: 50,
      }),
      fancy({
        gameId: 'g1',
        teamName: '7 over run',
        otype: 'back',
        price: 200,
        betAmount: 100,
      }),
      fancy({
        gameId: 'g1',
        teamName: '8 over run',
        otype: 'back',
        price: 300,
        betAmount: 150,
      }),
    ];
    // 100 + 200 + 300 = 600 (each market has only back, miss = -price)
    expect(calculateAllExposure(bets)).toBe(600);
  });

  it('same teamName different gameId = different markets', () => {
    const bets = [
      fancy({
        gameId: 'g1',
        teamName: '6 over run',
        otype: 'lay',
        price: 400,
        betAmount: 500,
      }),
      fancy({
        gameId: 'g2',
        teamName: '6 over run',
        otype: 'lay',
        price: 200,
        betAmount: 300,
      }),
    ];
    // g1_6over: hit=-400, miss=+500 → 400
    // g2_6over: hit=-200, miss=+300 → 200
    expect(calculateAllExposure(bets)).toBe(600);
  });
});

// ═════════════════════════════════════════════════════════════════════════
// 4. THE ORIGINAL BUG — TWO FANCY LAY BETS CAUSING NEGATIVE PTI
// ═════════════════════════════════════════════════════════════════════════
describe('THE ORIGINAL BUG: Two fancy lay bets PTI negative', () => {
  it('balance=10000, two fancy lays → PTI MUST stay positive', () => {
    const balance = 10000;
    const bets = [
      fancy({
        teamName: '6 over run',
        otype: 'lay',
        price: 4000,
        betAmount: 5000,
      }),
      fancy({
        teamName: '7 over run',
        otype: 'lay',
        price: 800,
        betAmount: 1000,
      }),
    ];

    const exposure = calculateAllExposure(bets);
    const avbalance = balance - exposure;

    // Correct: 4000 + 800 = 4800, avbalance = 5200
    expect(exposure).toBe(4800);
    expect(avbalance).toBe(5200);
    expect(avbalance).toBeGreaterThanOrEqual(0);

    // OLD BUG: |5000+4000| + |1000+800| = 9000 + 1800 = 10800
    //          avbalance = 10000 - 10800 = -800 (NEGATIVE!)
    expect(exposure).not.toBe(10800);
  });

  it('balance=5000, single large fancy lay → PTI stays positive', () => {
    const balance = 5000;
    const bets = [
      fancy({
        teamName: '10 over run',
        otype: 'lay',
        price: 4000,
        betAmount: 5000,
      }),
    ];

    const exposure = calculateAllExposure(bets);
    const avbalance = balance - exposure;

    // Correct: exposure = 4000, avbalance = 1000
    expect(exposure).toBe(4000);
    expect(avbalance).toBe(1000);
    expect(avbalance).toBeGreaterThanOrEqual(0);

    // OLD BUG: |5000 + 4000| = 9000, avbalance = -4000
    expect(exposure).not.toBe(9000);
  });

  it('balance=20000, three fancy lays → PTI stays positive', () => {
    const balance = 20000;
    const bets = [
      fancy({
        teamName: '6 over run',
        otype: 'lay',
        price: 4000,
        betAmount: 5000,
      }),
      fancy({
        teamName: '7 over run',
        otype: 'lay',
        price: 3200,
        betAmount: 4000,
      }),
      fancy({
        teamName: '8 over run',
        otype: 'lay',
        price: 2400,
        betAmount: 3000,
      }),
    ];

    const exposure = calculateAllExposure(bets);
    const avbalance = balance - exposure;

    // Correct: 4000 + 3200 + 2400 = 9600, avbalance = 10400
    expect(exposure).toBe(9600);
    expect(avbalance).toBe(10400);
    expect(avbalance).toBeGreaterThanOrEqual(0);

    // OLD BUG: 9000 + 7200 + 5400 = 21600, avbalance = -1600
  });
});

// ═════════════════════════════════════════════════════════════════════════
// 5. MIXED FANCY + SPORTS — the scenario user reported
// ═════════════════════════════════════════════════════════════════════════
describe('Mixed Fancy + Sports Bets (user reported scenario)', () => {
  it('fancy lays + sports backs → PTI stays positive', () => {
    const balance = 10000;
    const bets = [
      // Sports back bet
      sports({
        gameId: 'g1',
        teamName: 'India',
        otype: 'back',
        price: 1500,
        betAmount: 1200,
      }),
      // Fancy lay bets
      fancy({
        gameId: 'g1',
        teamName: '6 over run',
        otype: 'lay',
        price: 2000,
        betAmount: 2500,
      }),
      fancy({
        gameId: 'g1',
        teamName: '7 over run',
        otype: 'lay',
        price: 1600,
        betAmount: 2000,
      }),
    ];

    const { exposure, avbalance } = assertPTI(
      balance,
      bets,
      'mixed fancy lays + sports backs'
    );

    // Sports: 1500
    // Fancy "6 over run": hit=-2000, miss=+2500 → 2000
    // Fancy "7 over run": hit=-1600, miss=+2000 → 1600
    // Total = 1500 + 2000 + 1600 = 5100
    expect(exposure).toBe(5100);
    expect(avbalance).toBe(4900);
  });

  it('fancy backs + sports lay on same game → independent calculation', () => {
    const balance = 15000;
    const bets = [
      // Sports lay
      sports({
        gameId: 'g1',
        teamName: 'India',
        otype: 'lay',
        price: 2000,
        betAmount: 1600,
      }),
      // Fancy backs on same game
      fancy({
        gameId: 'g1',
        teamName: '6 over run',
        otype: 'back',
        price: 3000,
        betAmount: 1500,
      }),
      fancy({
        gameId: 'g1',
        teamName: '8 over run',
        otype: 'back',
        price: 2000,
        betAmount: 1000,
      }),
    ];

    const { exposure, avbalance } = assertPTI(
      balance,
      bets,
      'fancy backs + sports lay'
    );

    // Sports "Match Odds": India wins → lay loses -2000. OTHER → lay wins +1600. exposure=2000
    // Fancy "6 over": miss=-3000 → exposure=3000
    // Fancy "8 over": miss=-2000 → exposure=2000
    // Total = 2000 + 3000 + 2000 = 7000
    expect(exposure).toBe(7000);
    expect(avbalance).toBe(8000);
  });

  it('mixed: fancy back+lay + sports back+lay → all offsetting works', () => {
    const balance = 10000;
    const bets = [
      // Sports back+lay on same market (offsetting)
      sports({
        gameId: 'g1',
        teamName: 'India',
        otype: 'back',
        price: 3000,
        betAmount: 2400,
      }),
      sports({
        gameId: 'g1',
        teamName: 'India',
        otype: 'lay',
        price: 2500,
        betAmount: 2000,
      }),
      // Fancy back+lay on same market (offsetting)
      fancy({
        gameId: 'g1',
        teamName: '8 over run',
        otype: 'back',
        price: 2000,
        betAmount: 1000,
      }),
      fancy({
        gameId: 'g1',
        teamName: '8 over run',
        otype: 'lay',
        price: 1500,
        betAmount: 750,
      }),
    ];

    const { exposure, avbalance } = assertPTI(
      balance,
      bets,
      'mixed offsetting'
    );

    // Sports "Match Odds":
    //   India wins: +2400 - 2500 = -100
    //   OTHER: -3000 + 2000 = -1000
    //   worst = -1000, exposure = 1000
    // Fancy "8 over run":
    //   hit: +1000 - 1500 = -500
    //   miss: -2000 + 750 = -1250
    //   worst = -1250, exposure = 1250
    // Total = 1000 + 1250 = 2250
    expect(exposure).toBe(2250);
    expect(avbalance).toBe(7750);
  });

  it('sports on multiple games + fancy on multiple markets', () => {
    const balance = 20000;
    const bets = [
      // Game 1 sports
      sports({
        gameId: 'g1',
        teamName: 'India',
        otype: 'back',
        price: 2000,
        betAmount: 1600,
      }),
      // Game 2 sports
      sports({
        gameId: 'g2',
        teamName: 'England',
        otype: 'back',
        price: 1500,
        betAmount: 1200,
      }),
      // Game 1 fancy markets
      fancy({
        gameId: 'g1',
        teamName: '6 over run',
        otype: 'lay',
        price: 2400,
        betAmount: 3000,
      }),
      fancy({
        gameId: 'g1',
        teamName: '7 over run',
        otype: 'back',
        price: 1000,
        betAmount: 500,
      }),
      // Game 2 fancy markets
      fancy({
        gameId: 'g2',
        teamName: '10 over run',
        otype: 'lay',
        price: 1600,
        betAmount: 2000,
      }),
    ];

    const { exposure, avbalance } = assertPTI(
      balance,
      bets,
      'multi-game mixed'
    );

    // Sports g1: 2000, Sports g2: 1500
    // Fancy g1 "6over": hit=-2400, miss=+3000 → 2400
    // Fancy g1 "7over": miss=-1000 → 1000
    // Fancy g2 "10over": hit=-1600, miss=+2000 → 1600
    // Total = 2000 + 1500 + 2400 + 1000 + 1600 = 8500
    expect(exposure).toBe(8500);
    expect(avbalance).toBe(11500);
  });
});

// ═════════════════════════════════════════════════════════════════════════
// 6. PROGRESSIVE BET PLACEMENT — PTI tracked after each bet
// ═════════════════════════════════════════════════════════════════════════
describe('Progressive Bet Placement: PTI never negative at any step', () => {
  it('adding fancy bets one by one, PTI stays >= 0 at every step', () => {
    const balance = 10000;
    const bets = [];

    // Step 1: Fancy back
    bets.push(
      fancy({
        teamName: '6 over run',
        otype: 'back',
        price: 1000,
        betAmount: 500,
      })
    );
    let state = assertPTI(balance, bets, 'step 1');
    expect(state.exposure).toBe(1000);
    expect(state.avbalance).toBe(9000);

    // Step 2: Fancy lay on different market
    bets.push(
      fancy({
        teamName: '7 over run',
        otype: 'lay',
        price: 2000,
        betAmount: 2500,
      })
    );
    state = assertPTI(balance, bets, 'step 2');
    expect(state.exposure).toBe(3000); // 1000 + 2000

    // Step 3: Fancy lay on same market as step 2 (same teamName)
    bets.push(
      fancy({
        teamName: '7 over run',
        otype: 'lay',
        price: 800,
        betAmount: 1000,
      })
    );
    state = assertPTI(balance, bets, 'step 3');
    // "6 over run": miss=-1000 → 1000
    // "7 over run": hit=-2000-800=-2800, miss=+2500+1000=+3500 → worst=-2800, exposure=2800
    expect(state.exposure).toBe(3800);

    // Step 4: Fancy back on same market as step 2 (offsetting!)
    bets.push(
      fancy({
        teamName: '7 over run',
        otype: 'back',
        price: 1500,
        betAmount: 750,
      })
    );
    state = assertPTI(balance, bets, 'step 4');
    // "6 over run": miss=-1000 → 1000
    // "7 over run": hit=750-2000-800=-2050, miss=-1500+2500+1000=+2000 → worst=-2050, exposure=2050
    expect(state.exposure).toBe(3050);
    expect(state.avbalance).toBe(6950);

    // Step 5: Sports bet on different market
    bets.push(
      sports({
        gameId: 'g2',
        teamName: 'CSK',
        otype: 'back',
        price: 1500,
        betAmount: 1200,
      })
    );
    state = assertPTI(balance, bets, 'step 5');
    // 3050 (fancy) + 1500 (sports) = 4550
    expect(state.exposure).toBe(4550);
    expect(state.avbalance).toBe(5450);
  });

  it('adding mixed bets progressively with large stakes', () => {
    const balance = 50000;
    const bets = [];

    // Step 1: Large sports back
    bets.push(
      sports({
        gameId: 'g1',
        teamName: 'MI',
        otype: 'back',
        price: 10000,
        betAmount: 8000,
      })
    );
    assertPTI(balance, bets, 'large step 1');

    // Step 2: Large fancy lay
    bets.push(
      fancy({
        gameId: 'g1',
        teamName: '6 over run',
        otype: 'lay',
        price: 8000,
        betAmount: 10000,
      })
    );
    assertPTI(balance, bets, 'large step 2');

    // Step 3: Another fancy lay
    bets.push(
      fancy({
        gameId: 'g1',
        teamName: '7 over run',
        otype: 'lay',
        price: 6400,
        betAmount: 8000,
      })
    );
    assertPTI(balance, bets, 'large step 3');

    // Step 4: Sports lay (offsetting sports)
    bets.push(
      sports({
        gameId: 'g1',
        teamName: 'MI',
        otype: 'lay',
        price: 8000,
        betAmount: 6400,
      })
    );
    const state = assertPTI(balance, bets, 'large step 4');

    // Sports "Match Odds": MI wins: +8000-8000=0, OTHER: -10000+6400=-3600 → 3600
    // Fancy "6 over": hit=-8000, miss=+10000 → 8000
    // Fancy "7 over": hit=-6400, miss=+8000 → 6400
    // Total = 3600 + 8000 + 6400 = 18000
    expect(state.exposure).toBe(18000);
    expect(state.avbalance).toBe(32000);
  });
});

// ═════════════════════════════════════════════════════════════════════════
// 7. POST-SETTLEMENT EXPOSURE RECALCULATION
// ═════════════════════════════════════════════════════════════════════════
describe('Post-Settlement: Exposure recalculated correctly', () => {
  it('settle one fancy market, remaining exposure correct', () => {
    const balance = 10000;
    const allBets = [
      fancy({
        teamName: '6 over run',
        otype: 'back',
        price: 1000,
        betAmount: 500,
      }),
      fancy({
        teamName: '6 over run',
        otype: 'lay',
        price: 600,
        betAmount: 300,
      }),
      fancy({
        teamName: '7 over run',
        otype: 'lay',
        price: 2000,
        betAmount: 2500,
      }),
      sports({
        gameId: 'g2',
        teamName: 'RCB',
        otype: 'back',
        price: 1500,
        betAmount: 1200,
      }),
    ];

    const beforeExposure = calculateAllExposure(allBets);
    // "6 over run": hit=500-600=-100, miss=-1000+300=-700 → 700
    // "7 over run": hit=-2000, miss=+2500 → 2000
    // Sports: 1500
    // Total = 700 + 2000 + 1500 = 4200
    expect(beforeExposure).toBe(4200);

    // Settle "6 over run" (remove those bets)
    const afterSettlement = allBets.filter((b) => b.teamName !== '6 over run');
    const afterExposure = calculateAllExposure(afterSettlement);

    // Only "7 over run" (2000) + sports (1500) remain
    expect(afterExposure).toBe(3500);
    expect(balance - afterExposure).toBe(6500);
    expect(balance - afterExposure).toBeGreaterThanOrEqual(0);

    // Exposure dropped by exactly the "6 over run" market exposure
    expect(beforeExposure - afterExposure).toBe(700);
  });

  it('settle sports market, fancy exposure unchanged', () => {
    const balance = 10000;
    const allBets = [
      sports({
        gameId: 'g1',
        teamName: 'India',
        otype: 'back',
        price: 2000,
        betAmount: 1600,
      }),
      sports({
        gameId: 'g1',
        teamName: 'India',
        otype: 'lay',
        price: 1500,
        betAmount: 1200,
      }),
      fancy({
        teamName: '8 over run',
        otype: 'lay',
        price: 3000,
        betAmount: 3750,
      }),
    ];

    const beforeExposure = calculateAllExposure(allBets);
    // Sports: India wins: +1600-1500=+100, OTHER: -2000+1200=-800 → 800
    // Fancy: hit=-3000, miss=+3750 → 3000
    // Total = 3800
    expect(beforeExposure).toBe(3800);

    // Settle sports (remove)
    const afterSettlement = allBets.filter((b) => b.gameType !== 'Match Odds');
    const afterExposure = calculateAllExposure(afterSettlement);

    // Only fancy remains = 3000
    expect(afterExposure).toBe(3000);
    expect(balance - afterExposure).toBe(7000);
  });

  it('settle all bets, exposure = 0', () => {
    expect(calculateAllExposure([])).toBe(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════
// 8. ALL FANCY GAME TYPES — correctly detected and calculated
// ═════════════════════════════════════════════════════════════════════════
describe('All Fancy Game Types', () => {
  const gameTypes = ['Normal', 'meter', 'line', 'ball', 'khado'];

  gameTypes.forEach((gameType) => {
    it(`gameType="${gameType}" is detected as fancy`, () => {
      const bet = fancy({ gameType });
      expect(isFancyBet(bet)).toBe(true);
    });

    it(`gameType="${gameType}" lay bet exposure = price (not |betAmount+price|)`, () => {
      const bet = fancy({
        gameType,
        teamName: `test-${gameType}`,
        otype: 'lay',
        price: 4000,
        betAmount: 5000,
      });
      expect(calculateAllExposure([bet])).toBe(4000);
    });
  });

  it('non-fancy gameTypes are NOT treated as fancy', () => {
    const nonFancy = ['Match Odds', 'Bookmaker', 'casino', 'Winner'];
    for (const gt of nonFancy) {
      expect(isFancyBet({ gameType: gt })).toBe(false);
    }
  });
});

// ═════════════════════════════════════════════════════════════════════════
// 9. STRESS TEST — many bets, PTI never negative
// ═════════════════════════════════════════════════════════════════════════
describe('Stress Test: Many bets, PTI always >= 0', () => {
  it('20 fancy lay bets across 10 markets, balance=100000', () => {
    const balance = 100000;
    const bets = [];

    for (let i = 0; i < 10; i++) {
      // Two lay bets per market
      bets.push(
        fancy({
          teamName: `${i + 6} over run`,
          otype: 'lay',
          price: 2000 + i * 200,
          betAmount: 2500 + i * 250,
        })
      );
      bets.push(
        fancy({
          teamName: `${i + 6} over run`,
          otype: 'lay',
          price: 1000 + i * 100,
          betAmount: 1250 + i * 125,
        })
      );
    }

    const exposure = calculateAllExposure(bets);
    const avbalance = balance - exposure;

    // Each market: two lay bets → hit = -(price1 + price2), miss = +(betAmount1 + betAmount2)
    // Since hit is always negative and miss is always positive, exposure = |hit| = price1 + price2
    let expectedExposure = 0;
    for (let i = 0; i < 10; i++) {
      const price1 = 2000 + i * 200;
      const price2 = 1000 + i * 100;
      expectedExposure += price1 + price2;
    }

    expect(exposure).toBe(expectedExposure);
    expect(avbalance).toBeGreaterThanOrEqual(0);
  });

  it('mixed 30 bets across 5 games, PTI always positive', () => {
    const balance = 200000;
    const bets = [];

    for (let g = 1; g <= 5; g++) {
      // 2 sports bets per game (back + lay offsetting)
      bets.push(
        sports({
          gameId: `game${g}`,
          teamName: `Team${g}`,
          otype: 'back',
          price: 3000,
          betAmount: 2400,
        })
      );
      bets.push(
        sports({
          gameId: `game${g}`,
          teamName: `Team${g}`,
          otype: 'lay',
          price: 2000,
          betAmount: 1600,
        })
      );
      // 4 fancy bets per game (2 markets, back+lay each)
      bets.push(
        fancy({
          gameId: `game${g}`,
          teamName: `${g * 2} over run`,
          otype: 'back',
          price: 1500,
          betAmount: 750,
        })
      );
      bets.push(
        fancy({
          gameId: `game${g}`,
          teamName: `${g * 2} over run`,
          otype: 'lay',
          price: 1000,
          betAmount: 500,
        })
      );
      bets.push(
        fancy({
          gameId: `game${g}`,
          teamName: `${g * 2 + 1} over run`,
          otype: 'back',
          price: 2000,
          betAmount: 1000,
        })
      );
      bets.push(
        fancy({
          gameId: `game${g}`,
          teamName: `${g * 2 + 1} over run`,
          otype: 'lay',
          price: 800,
          betAmount: 400,
        })
      );
    }

    expect(bets.length).toBe(30);

    const { exposure, avbalance } = assertPTI(
      balance,
      bets,
      'stress test 30 bets'
    );

    // Verify it's positive
    expect(avbalance).toBeGreaterThanOrEqual(0);

    // Verify each game's contribution is reasonable (no explosion from lay bug)
    // Sports per game: back(+2400) - lay(-2000) = +400 or back(-3000) + lay(+1600) = -1400 → 1400
    // Fancy per game market 1: hit=750-1000=-250, miss=-1500+500=-1000 → 1000
    // Fancy per game market 2: hit=1000-800=+200, miss=-2000+400=-1600 → 1600
    // Per game total = 1400 + 1000 + 1600 = 4000
    // 5 games × 4000 = 20000
    expect(exposure).toBe(20000);
    expect(avbalance).toBe(180000);
  });
});

// ═════════════════════════════════════════════════════════════════════════
// 10. REAL-WORLD SCENARIOS FROM PRODUCTION
// ═════════════════════════════════════════════════════════════════════════
describe('Real-World Production Scenarios', () => {
  it('srijan1 scenario: 8-over back + 8-over lay + 7-over back', () => {
    const balance = 10000;
    const bets = [
      fancy({
        teamName: '8 over run JK',
        otype: 'back',
        price: 200,
        betAmount: 100,
      }),
      fancy({
        teamName: '8 over run JK',
        otype: 'lay',
        price: 100,
        betAmount: 50,
      }),
      fancy({
        teamName: '7 over run JK',
        otype: 'back',
        price: 182,
        betAmount: 100,
      }),
    ];

    const { exposure, avbalance } = assertPTI(balance, bets, 'srijan1');

    // "8 over run JK": hit=100-100=0, miss=-200+50=-150 → 150
    // "7 over run JK": miss=-182 → 182
    // Total = 332
    expect(exposure).toBe(332);
    expect(avbalance).toBe(9668);
  });

  it('srijan1 after 7-over settles: only 8-over remains', () => {
    const balance = 10000;
    const bets = [
      fancy({
        teamName: '8 over run JK',
        otype: 'back',
        price: 200,
        betAmount: 100,
      }),
      fancy({
        teamName: '8 over run JK',
        otype: 'lay',
        price: 100,
        betAmount: 50,
      }),
    ];

    const { exposure, avbalance } = assertPTI(
      balance,
      bets,
      'srijan1 after settle'
    );
    // "8 over run JK": hit=100-100=0, miss=-200+50=-150 → 150
    expect(exposure).toBe(150);
    expect(avbalance).toBe(9850);
  });

  it('typical IPL session: multiple overs + match odds', () => {
    const balance = 50000;
    const bets = [
      // Match Odds bets
      sports({
        gameId: 'ipl1',
        teamName: 'CSK',
        otype: 'back',
        price: 5000,
        betAmount: 4000,
      }),
      sports({
        gameId: 'ipl1',
        teamName: 'CSK',
        otype: 'lay',
        price: 3000,
        betAmount: 2400,
      }),
      // Bookmaker bet (different market)
      sports({
        gameId: 'ipl1',
        marketName: 'Bookmaker',
        teamName: 'MI',
        otype: 'back',
        price: 2000,
        betAmount: 1600,
        gameType: 'Bookmaker',
      }),
      // Fancy: 6 over run
      fancy({
        gameId: 'ipl1',
        teamName: '6 over run CSK',
        otype: 'back',
        price: 3000,
        betAmount: 1500,
      }),
      fancy({
        gameId: 'ipl1',
        teamName: '6 over run CSK',
        otype: 'lay',
        price: 2000,
        betAmount: 1000,
      }),
      // Fancy: 10 over run
      fancy({
        gameId: 'ipl1',
        teamName: '10 over run CSK',
        otype: 'lay',
        price: 4000,
        betAmount: 5000,
      }),
      // Fancy: 15 over run
      fancy({
        gameId: 'ipl1',
        teamName: '15 over run CSK',
        otype: 'back',
        price: 2500,
        betAmount: 1250,
      }),
    ];

    const { exposure, avbalance } = assertPTI(balance, bets, 'typical IPL');

    // Sports Match Odds: CSK wins: +4000-3000=+1000, OTHER: -5000+2400=-2600 → 2600
    // Sports Bookmaker: MI wins: +1600, OTHER: -2000 → 2000
    // Fancy "6 over run CSK": hit=1500-2000=-500, miss=-3000+1000=-2000 → 2000
    // Fancy "10 over run CSK": hit=-4000, miss=+5000 → 4000
    // Fancy "15 over run CSK": miss=-2500 → 2500
    // Total = 2600 + 2000 + 2000 + 4000 + 2500 = 13100
    expect(exposure).toBe(13100);
    expect(avbalance).toBe(36900);
  });

  it('worst case: user places max bets near balance limit', () => {
    const balance = 10000;
    const bets = [
      // Sports: 2000
      sports({
        gameId: 'g1',
        teamName: 'India',
        otype: 'back',
        price: 2000,
        betAmount: 1600,
      }),
      // Fancy lay: 3000 (NOT 6000 with old bug)
      fancy({
        teamName: '6 over run',
        otype: 'lay',
        price: 3000,
        betAmount: 3750,
      }),
      // Fancy back: 2500
      fancy({
        teamName: '7 over run',
        otype: 'back',
        price: 2500,
        betAmount: 1250,
      }),
    ];

    const { exposure, avbalance } = assertPTI(balance, bets, 'near limit');

    // Sports: 2000
    // "6 over run": hit=-3000, miss=+3750 → 3000
    // "7 over run": miss=-2500 → 2500
    // Total = 7500
    expect(exposure).toBe(7500);
    expect(avbalance).toBe(2500);
    expect(avbalance).toBeGreaterThanOrEqual(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════
// 11. INVARIANT: exposure always matches manual calculation
// ═════════════════════════════════════════════════════════════════════════
describe('Invariant: calculateAllExposure matches manual calculation', () => {
  /**
   * For any set of bets, calculateAllExposure must equal
   * sum of manual per-market fancy exposure + non-fancy market exposure
   */
  const testCases = [
    {
      name: 'single back',
      bets: [fancy({ otype: 'back', price: 500, betAmount: 250 })],
    },
    {
      name: 'single lay',
      bets: [fancy({ otype: 'lay', price: 800, betAmount: 1000 })],
    },
    {
      name: 'back+lay same market',
      bets: [
        fancy({ otype: 'back', price: 500, betAmount: 250 }),
        fancy({ otype: 'lay', price: 300, betAmount: 150 }),
      ],
    },
    {
      name: 'three lays different markets',
      bets: [
        fancy({ teamName: 'm1', otype: 'lay', price: 1000, betAmount: 1250 }),
        fancy({ teamName: 'm2', otype: 'lay', price: 2000, betAmount: 2500 }),
        fancy({ teamName: 'm3', otype: 'lay', price: 3000, betAmount: 3750 }),
      ],
    },
    {
      name: 'mixed across markets',
      bets: [
        fancy({ teamName: 'm1', otype: 'back', price: 500, betAmount: 250 }),
        fancy({ teamName: 'm1', otype: 'lay', price: 400, betAmount: 200 }),
        fancy({ teamName: 'm2', otype: 'lay', price: 800, betAmount: 1000 }),
      ],
    },
  ];

  testCases.forEach(({ name, bets }) => {
    it(`${name}: matches manual reference`, () => {
      const actual = calculateFancyExposure(bets);

      // Group by market and sum manual per-market
      const markets = {};
      for (const b of bets) {
        const key = `${b.gameId}_${b.teamName}`;
        if (!markets[key]) markets[key] = [];
        markets[key].push(b);
      }
      let manual = 0;
      for (const marketBets of Object.values(markets)) {
        manual += manualFancyMarketExposure(marketBets);
      }

      expect(actual).toBe(manual);
    });
  });
});
