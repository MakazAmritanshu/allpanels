/**
 * Comprehensive tests for fancyBetSettlementService.js
 *
 * Covers:
 *   1. settleFancyBet  - all 8 paths (back/lay x normal/offset x win/loss)
 *   2. calculateExposure - empty, back-only, lay-only, mixed, non-fancy, edge cases
 *   3. recalculateAvbalance - basic formula
 *   4. voidFancyBet    - quick sanity (detailed tests in voidFancyBet.test.js)
 *   5. Edge cases       - string scores, NaN, boundary, zero values
 *   6. P/L consistency  - cumulative settlement matches expected bettingProfitLoss
 *   7. Complete journeys - place -> settle -> verify all user fields
 */
import { describe, expect, it } from 'vitest';

import {
  calculateExposure,
  recalculateAvbalance,
  settleFancyBet,
  voidFancyBet,
} from '../services/fancyBetSettlementService.js';

// ─── helpers ────────────────────────────────────────────────────────
const makeBet = (overrides = {}) => ({
  _id: 'bet_001',
  userId: 'user_001',
  otype: 'back',
  price: 100,
  betAmount: 50,
  fancyScore: '180',
  gameType: 'Normal',
  betType: 'fancy',
  teamName: 'India',
  gameId: 'game_001',
  status: 0,
  ...overrides,
});

const makeUser = (overrides = {}) => ({
  _id: 'user_001',
  balance: 5000,
  avbalance: 4900,
  exposure: 100,
  bettingProfitLoss: 0,
  baseBalance: 5000,
  ...overrides,
});

// ═══════════════════════════════════════════════════════════════════
// 1. settleFancyBet — BACK bets
// ═══════════════════════════════════════════════════════════════════
describe('settleFancyBet - Back Bets', () => {
  it('normal back WIN (score >= fancyScore)', async () => {
    const bet = makeBet({
      otype: 'back',
      price: 100,
      betAmount: 50,
      fancyScore: '180',
    });
    const user = makeUser();
    const result = await settleFancyBet(bet, user, 200);

    expect(result.success).toBe(true);
    expect(result.betUpdates.status).toBe(1); // WIN
    expect(result.betUpdates.profitLossChange).toBe(50); // betAmount
    expect(result.betUpdates.resultAmount).toBe(50); // |betAmount|
    expect(result.userUpdates.balanceChange).toBe(50); // betAmount
    expect(result.userUpdates.avBalanceChange).toBe(150); // betAmount + price
    expect(result.userUpdates.profitLossChange).toBe(50);
  });

  it('normal back WIN at exact boundary (score === fancyScore)', async () => {
    const bet = makeBet({
      otype: 'back',
      price: 100,
      betAmount: 50,
      fancyScore: '180',
    });
    const result = await settleFancyBet(bet, makeUser(), 180);

    expect(result.success).toBe(true);
    expect(result.betUpdates.status).toBe(1); // WIN — score >= fancyScore
    expect(result.betUpdates.profitLossChange).toBe(50);
  });

  it('normal back LOSS (score < fancyScore)', async () => {
    const bet = makeBet({
      otype: 'back',
      price: 100,
      betAmount: 50,
      fancyScore: '180',
    });
    const result = await settleFancyBet(bet, makeUser(), 150);

    expect(result.success).toBe(true);
    expect(result.betUpdates.status).toBe(2); // LOSS
    expect(result.betUpdates.profitLossChange).toBe(-100); // -price
    expect(result.betUpdates.resultAmount).toBe(100); // |price|
    expect(result.userUpdates.balanceChange).toBe(-100);
    expect(result.userUpdates.avBalanceChange).toBe(-100);
    expect(result.userUpdates.profitLossChange).toBe(-100);
  });

  it('offset back WIN — user LOSES (betAmount < 0)', async () => {
    const bet = makeBet({
      otype: 'back',
      price: 50,
      betAmount: -38,
      fancyScore: '180',
    });
    const result = await settleFancyBet(bet, makeUser(), 200);

    expect(result.success).toBe(true);
    expect(result.betUpdates.status).toBe(2); // status = LOSS
    expect(result.betUpdates.profitLossChange).toBe(-38); // betAmount (negative)
    expect(result.betUpdates.resultAmount).toBe(38); // |betAmount|
    expect(result.userUpdates.balanceChange).toBe(-38);
    expect(result.userUpdates.avBalanceChange).toBe(0);
  });

  it('offset back LOSS — user BREAKS EVEN (betAmount < 0)', async () => {
    const bet = makeBet({
      otype: 'back',
      price: 50,
      betAmount: -38,
      fancyScore: '180',
    });
    const result = await settleFancyBet(bet, makeUser(), 150);

    expect(result.success).toBe(true);
    expect(result.betUpdates.status).toBe(1); // status = WIN (break-even)
    expect(result.betUpdates.profitLossChange).toBe(0);
    expect(result.betUpdates.resultAmount).toBe(0);
    expect(result.userUpdates.balanceChange).toBe(0);
    expect(result.userUpdates.avBalanceChange).toBe(38); // -betAmount restored
  });
});

// ═══════════════════════════════════════════════════════════════════
// 2. settleFancyBet — LAY bets
// ═══════════════════════════════════════════════════════════════════
describe('settleFancyBet - Lay Bets', () => {
  it('normal lay WIN (score < fancyScore)', async () => {
    const bet = makeBet({
      otype: 'lay',
      price: 100,
      betAmount: 50,
      fancyScore: '180',
    });
    const result = await settleFancyBet(bet, makeUser(), 150);

    expect(result.success).toBe(true);
    expect(result.betUpdates.status).toBe(1); // WIN
    expect(result.betUpdates.profitLossChange).toBe(50);
    expect(result.userUpdates.balanceChange).toBe(50);
    expect(result.userUpdates.avBalanceChange).toBe(150); // betAmount + price
  });

  it('normal lay LOSS (score >= fancyScore)', async () => {
    const bet = makeBet({
      otype: 'lay',
      price: 100,
      betAmount: 50,
      fancyScore: '180',
    });
    const result = await settleFancyBet(bet, makeUser(), 200);

    expect(result.success).toBe(true);
    expect(result.betUpdates.status).toBe(2); // LOSS
    expect(result.betUpdates.profitLossChange).toBe(-100);
    expect(result.userUpdates.balanceChange).toBe(-100);
    expect(result.userUpdates.avBalanceChange).toBe(-100);
  });

  it('normal lay LOSS at exact boundary (score === fancyScore)', async () => {
    const bet = makeBet({
      otype: 'lay',
      price: 100,
      betAmount: 50,
      fancyScore: '180',
    });
    const result = await settleFancyBet(bet, makeUser(), 180);

    expect(result.success).toBe(true);
    expect(result.betUpdates.status).toBe(2); // lay loses when score >= fancyScore
    expect(result.betUpdates.profitLossChange).toBe(-100);
  });

  it('offset lay WIN — user LOSES (betAmount < 0)', async () => {
    const bet = makeBet({
      otype: 'lay',
      price: 50,
      betAmount: -40,
      fancyScore: '180',
    });
    const result = await settleFancyBet(bet, makeUser(), 150);

    expect(result.success).toBe(true);
    expect(result.betUpdates.status).toBe(2); // status = LOSS
    expect(result.betUpdates.profitLossChange).toBe(-40);
    expect(result.userUpdates.balanceChange).toBe(-40);
    expect(result.userUpdates.avBalanceChange).toBe(0);
  });

  it('offset lay LOSS — user BREAKS EVEN (betAmount < 0)', async () => {
    const bet = makeBet({
      otype: 'lay',
      price: 50,
      betAmount: -40,
      fancyScore: '180',
    });
    const result = await settleFancyBet(bet, makeUser(), 200);

    expect(result.success).toBe(true);
    expect(result.betUpdates.status).toBe(1); // WIN (break-even)
    expect(result.betUpdates.profitLossChange).toBe(0);
    expect(result.userUpdates.balanceChange).toBe(0);
    expect(result.userUpdates.avBalanceChange).toBe(40);
  });
});

// ═══════════════════════════════════════════════════════════════════
// 3. settleFancyBet — Edge Cases
// ═══════════════════════════════════════════════════════════════════
describe('settleFancyBet - Edge Cases', () => {
  it('handles string fancyScore and string actualScore', async () => {
    const bet = makeBet({ fancyScore: '45' });
    const result = await settleFancyBet(bet, makeUser(), '50');

    expect(result.success).toBe(true);
    expect(result.betUpdates.betResult).toBe('50');
  });

  it('returns failure for NaN fancyScore', async () => {
    const bet = makeBet({ fancyScore: 'abc' });
    const result = await settleFancyBet(bet, makeUser(), 100);

    expect(result.success).toBe(false);
    expect(result.message).toContain('Invalid fancy score');
  });

  it('returns failure for NaN actualScore', async () => {
    const bet = makeBet({ fancyScore: '180' });
    const result = await settleFancyBet(bet, makeUser(), 'not_a_number');

    expect(result.success).toBe(false);
    expect(result.message).toContain('Invalid fancy score');
  });

  it('returns failure for undefined actualScore', async () => {
    const bet = makeBet({ fancyScore: '180' });
    const result = await settleFancyBet(bet, makeUser(), undefined);

    expect(result.success).toBe(false);
  });

  it('handles score of 0 correctly', async () => {
    const bet = makeBet({
      otype: 'back',
      fancyScore: '0',
      price: 100,
      betAmount: 50,
    });
    const result = await settleFancyBet(bet, makeUser(), 0);

    expect(result.success).toBe(true);
    // 0 >= 0 → back wins
    expect(result.betUpdates.status).toBe(1);
  });

  it('handles negative score correctly', async () => {
    const bet = makeBet({
      otype: 'back',
      fancyScore: '-5',
      price: 100,
      betAmount: 50,
    });
    const result = await settleFancyBet(bet, makeUser(), -3);

    expect(result.success).toBe(true);
    // -3 >= -5 → back wins
    expect(result.betUpdates.status).toBe(1);
  });

  it('handles decimal fancyScore', async () => {
    const bet = makeBet({
      otype: 'back',
      fancyScore: '45.5',
      price: 100,
      betAmount: 50,
    });

    const winResult = await settleFancyBet(bet, makeUser(), 45.5);
    expect(winResult.betUpdates.status).toBe(1); // 45.5 >= 45.5

    const loseResult = await settleFancyBet(bet, makeUser(), 45.4);
    expect(loseResult.betUpdates.status).toBe(2); // 45.4 < 45.5
  });

  it('handles zero betAmount (edge: not negative, not positive)', async () => {
    const bet = makeBet({
      otype: 'back',
      price: 100,
      betAmount: 0,
      fancyScore: '50',
    });
    const result = await settleFancyBet(bet, makeUser(), 60);

    expect(result.success).toBe(true);
    // betAmount >= 0 (not < 0), so normal path
    expect(result.betUpdates.status).toBe(1); // WIN
    expect(result.betUpdates.profitLossChange).toBe(0); // betAmount = 0
    expect(result.userUpdates.balanceChange).toBe(0);
  });

  it('includes settledAt timestamp and settledBy', async () => {
    const before = new Date();
    const bet = makeBet();
    const result = await settleFancyBet(bet, makeUser(), 200);

    expect(result.betUpdates.settledBy).toBe('api');
    expect(result.betUpdates.settledAt).toBeInstanceOf(Date);
    expect(result.betUpdates.settledAt.getTime()).toBeGreaterThanOrEqual(
      before.getTime()
    );
  });

  it('betResult is string representation of actual score', async () => {
    const result = await settleFancyBet(makeBet(), makeUser(), 123.45);
    expect(result.betUpdates.betResult).toBe('123.45');
  });
});

// ═══════════════════════════════════════════════════════════════════
// 4. settleFancyBet — All game types produce same settlement logic
// ═══════════════════════════════════════════════════════════════════
describe('settleFancyBet - Game Types', () => {
  const gameTypes = ['Normal', 'meter', 'line', 'ball', 'khado'];

  gameTypes.forEach((gameType) => {
    it(`${gameType}: back WIN produces same result`, async () => {
      const bet = makeBet({
        gameType,
        otype: 'back',
        price: 100,
        betAmount: 50,
        fancyScore: '30',
      });
      const result = await settleFancyBet(bet, makeUser(), 40);

      expect(result.success).toBe(true);
      expect(result.betUpdates.status).toBe(1);
      expect(result.betUpdates.profitLossChange).toBe(50);
    });

    it(`${gameType}: lay LOSS produces same result`, async () => {
      const bet = makeBet({
        gameType,
        otype: 'lay',
        price: 80,
        betAmount: 60,
        fancyScore: '30',
      });
      const result = await settleFancyBet(bet, makeUser(), 40);

      expect(result.success).toBe(true);
      expect(result.betUpdates.status).toBe(2);
      expect(result.betUpdates.profitLossChange).toBe(-80);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════
// 5. calculateExposure
// ═══════════════════════════════════════════════════════════════════
describe('calculateExposure', () => {
  it('returns 0 for empty array', () => {
    expect(calculateExposure([])).toBe(0);
  });

  it('returns 0 for null/undefined', () => {
    expect(calculateExposure(null)).toBe(0);
    expect(calculateExposure(undefined)).toBe(0);
  });

  it('back-only fancy bets: sum of prices', () => {
    const bets = [
      makeBet({
        otype: 'back',
        price: 100,
        betAmount: 50,
        betType: 'fancy',
        teamName: 'India',
        gameId: 'g1',
      }),
      makeBet({
        otype: 'back',
        price: 200,
        betAmount: 100,
        betType: 'fancy',
        teamName: 'India',
        gameId: 'g1',
      }),
    ];
    // backMaxLoss = 100 + 200 = 300, layMaxLoss = 0 → max(300, 0) = 300
    expect(calculateExposure(bets)).toBe(300);
  });

  it('lay-only fancy bets: sum of liabilities', () => {
    const bets = [
      makeBet({
        otype: 'lay',
        price: 60,
        betAmount: 100,
        betType: 'fancy',
        teamName: 'India',
        gameId: 'g1',
      }),
      makeBet({
        otype: 'lay',
        price: 40,
        betAmount: 80,
        betType: 'fancy',
        teamName: 'India',
        gameId: 'g1',
      }),
    ];
    // hit: -60-40=-100, miss: +100+80=+180 → worstCase=-100, exposure=100
    expect(calculateExposure(bets)).toBe(100);
  });

  it('mixed back/lay fancy on same market: worst-case', () => {
    const bets = [
      makeBet({
        otype: 'back',
        price: 100,
        betAmount: 50,
        betType: 'fancy',
        teamName: 'India',
        gameId: 'g1',
      }),
      makeBet({
        otype: 'lay',
        price: 60,
        betAmount: 80,
        betType: 'fancy',
        teamName: 'India',
        gameId: 'g1',
      }),
    ];
    // hit: +50-60=-10, miss: -100+80=-20 → worstCase=-20, exposure=20
    expect(calculateExposure(bets)).toBe(20);
  });

  it('different markets are calculated independently', () => {
    const bets = [
      makeBet({
        otype: 'back',
        price: 100,
        betType: 'fancy',
        teamName: 'India',
        gameId: 'g1',
      }),
      makeBet({
        otype: 'back',
        price: 200,
        betType: 'fancy',
        teamName: 'Australia',
        gameId: 'g1',
      }),
    ];
    // Market 1 (India): backMaxLoss=100, Market 2 (Australia): backMaxLoss=200 → 300
    expect(calculateExposure(bets)).toBe(300);
  });

  it('skips fancy bets without teamName', () => {
    const bets = [
      makeBet({
        otype: 'back',
        price: 100,
        betType: 'fancy',
        teamName: undefined,
        gameId: 'g1',
      }),
    ];
    expect(calculateExposure(bets)).toBe(0);
  });

  it('non-fancy bets: normal price-based exposure', () => {
    const bets = [
      { price: 100, betAmount: 200, betType: 'sports', otype: 'back' },
      { price: 150, betAmount: 300, betType: 'sports', otype: 'back' },
    ];
    // nonFancyExposure = 100 + 150 = 250
    expect(calculateExposure(bets)).toBe(250);
  });

  it('non-fancy: negative price means guaranteed profit, no exposure', () => {
    const bets = [
      { price: -50, betAmount: 200, betType: 'sports', otype: 'back' },
    ];
    expect(calculateExposure(bets)).toBe(0);
  });

  it('non-fancy offset bet: max(|betAmount|, price)', () => {
    const bets = [
      { price: 60, betAmount: -40, betType: 'sports', otype: 'back' },
    ];
    // betAmount < 0 → max(|−40|, 60) = 60
    expect(calculateExposure(bets)).toBe(60);
  });

  it('mixed fancy + non-fancy: both contribute', () => {
    const bets = [
      makeBet({
        otype: 'back',
        price: 100,
        betType: 'fancy',
        teamName: 'India',
        gameId: 'g1',
      }),
      { price: 200, betAmount: 400, betType: 'sports', otype: 'back' },
    ];
    // fancy exposure = 100, non-fancy = 200 → 300
    expect(calculateExposure(bets)).toBe(300);
  });
});

// ═══════════════════════════════════════════════════════════════════
// 6. recalculateAvbalance
// ═══════════════════════════════════════════════════════════════════
describe('recalculateAvbalance', () => {
  it('sets avbalance = balance - exposure', () => {
    const user = { balance: 5000, avbalance: 0 };
    recalculateAvbalance(user, 300);
    expect(user.avbalance).toBe(4700);
  });

  it('handles zero exposure', () => {
    const user = { balance: 5000, avbalance: 0 };
    recalculateAvbalance(user, 0);
    expect(user.avbalance).toBe(5000);
  });

  it('can produce negative avbalance', () => {
    const user = { balance: 100, avbalance: 0 };
    recalculateAvbalance(user, 500);
    expect(user.avbalance).toBe(-400);
  });
});

// ═══════════════════════════════════════════════════════════════════
// 7. voidFancyBet — quick sanity
// ═══════════════════════════════════════════════════════════════════
describe('voidFancyBet - sanity', () => {
  it('always returns status 3, profitLossChange 0', async () => {
    const bet = makeBet({ price: 250 });
    const result = await voidFancyBet(bet);

    expect(result.success).toBe(true);
    expect(result.betUpdates.status).toBe(3);
    expect(result.betUpdates.profitLossChange).toBe(0);
    expect(result.betUpdates.resultAmount).toBe(250);
    expect(result.betUpdates.betResult).toBe('VOID');
  });
});

// ═══════════════════════════════════════════════════════════════════
// 8. P/L Consistency — cumulative settlement
// ═══════════════════════════════════════════════════════════════════
describe('P/L Consistency - Multiple Bet Settlement', () => {
  it('sum of profitLossChange across settled bets equals expected bettingProfitLoss', async () => {
    const bets = [
      makeBet({
        _id: 'b1',
        otype: 'back',
        price: 100,
        betAmount: 50,
        fancyScore: '180',
      }),
      makeBet({
        _id: 'b2',
        otype: 'lay',
        price: 80,
        betAmount: 60,
        fancyScore: '190',
      }),
      makeBet({
        _id: 'b3',
        otype: 'back',
        price: 200,
        betAmount: 100,
        fancyScore: '150',
      }),
      makeBet({
        _id: 'b4',
        otype: 'back',
        price: 50,
        betAmount: -30,
        fancyScore: '200',
      }),
    ];

    const scores = [200, 180, 160, 210]; // b1: back win, b2: lay win, b3: back win, b4: offset win (user loses)
    const user = makeUser();

    let cumulativePL = 0;
    let cumulativeBalanceChange = 0;

    for (let i = 0; i < bets.length; i++) {
      const result = await settleFancyBet(bets[i], user, scores[i]);
      expect(result.success).toBe(true);
      cumulativePL += result.betUpdates.profitLossChange;
      cumulativeBalanceChange += result.userUpdates.balanceChange;
    }

    // Verify PL = sum of all profitLossChange values
    // b1: back win → +50
    // b2: lay win (score 180 < 190) → +60
    // b3: back win (160 >= 150) → +100
    // b4: offset win (210 >= 200, betAmount<0) → -30
    expect(cumulativePL).toBe(50 + 60 + 100 + -30);
    expect(cumulativePL).toBe(180);
    expect(cumulativeBalanceChange).toBe(cumulativePL);
  });

  it('mixed wins and losses accumulate correctly', async () => {
    const bets = [
      makeBet({
        _id: 'b1',
        otype: 'back',
        price: 100,
        betAmount: 50,
        fancyScore: '180',
      }),
      makeBet({
        _id: 'b2',
        otype: 'back',
        price: 200,
        betAmount: 100,
        fancyScore: '180',
      }),
      makeBet({
        _id: 'b3',
        otype: 'lay',
        price: 150,
        betAmount: 75,
        fancyScore: '180',
      }),
    ];

    // Score = 150 → all backs lose, lay wins
    const score = 150;
    let totalPL = 0;

    for (const bet of bets) {
      const result = await settleFancyBet(bet, makeUser(), score);
      totalPL += result.betUpdates.profitLossChange;
    }

    // b1: back loss → -100
    // b2: back loss → -200
    // b3: lay win (150 < 180) → +75
    expect(totalPL).toBe(-100 + -200 + 75);
    expect(totalPL).toBe(-225);
  });

  it('void bets do not affect P/L accumulation', async () => {
    const bet1 = makeBet({
      _id: 'b1',
      otype: 'back',
      price: 100,
      betAmount: 50,
      fancyScore: '180',
    });
    const bet2 = makeBet({ _id: 'b2', price: 200 });

    const settleResult = await settleFancyBet(bet1, makeUser(), 200); // WIN
    const voidResult = await voidFancyBet(bet2);

    const totalPL =
      settleResult.betUpdates.profitLossChange +
      voidResult.betUpdates.profitLossChange;
    expect(totalPL).toBe(50); // void adds 0
  });

  it('all offset bets: net P/L is sum of only the winning offsets', async () => {
    const bets = [
      makeBet({
        _id: 'o1',
        otype: 'back',
        price: 50,
        betAmount: -30,
        fancyScore: '180',
      }),
      makeBet({
        _id: 'o2',
        otype: 'lay',
        price: 60,
        betAmount: -25,
        fancyScore: '170',
      }),
    ];

    // Score = 200 → o1 back offset wins (user loses -30), o2 lay offset loses (user breaks even 0)
    let totalPL = 0;
    for (const bet of bets) {
      const result = await settleFancyBet(bet, makeUser(), 200);
      totalPL += result.betUpdates.profitLossChange;
    }
    // o1: back offset win → -30 (user loses)
    // o2: lay offset loses (200 >= 170 → lay condition is score < fancyScore which is false → loss side) → 0 (break even)
    expect(totalPL).toBe(-30);
  });
});

// ═══════════════════════════════════════════════════════════════════
// 9. Complete Settlement Journeys
// ═══════════════════════════════════════════════════════════════════
describe('Complete Settlement Journeys', () => {
  it('place back bet -> settle WIN -> verify user fields', async () => {
    const user = makeUser({
      balance: 5000,
      avbalance: 5000,
      exposure: 0,
      bettingProfitLoss: 0,
    });
    const bet = makeBet({
      otype: 'back',
      price: 100,
      betAmount: 50,
      fancyScore: '180',
    });

    // Step 1: Place bet (simulated)
    user.exposure += bet.price;
    user.avbalance -= bet.price;
    expect(user.exposure).toBe(100);
    expect(user.avbalance).toBe(4900);

    // Step 2: Settle (score = 200, back wins)
    const result = await settleFancyBet(bet, user, 200);
    expect(result.success).toBe(true);

    // Step 3: Apply user updates via atomic $inc (simulated)
    user.balance += result.userUpdates.balanceChange;
    user.bettingProfitLoss += result.userUpdates.profitLossChange;

    // Step 4: Recalculate exposure (bet settled, no more pending)
    const newExposure = calculateExposure([]);
    recalculateAvbalance(user, newExposure);

    // Step 5: Verify
    expect(user.balance).toBe(5050);
    expect(user.bettingProfitLoss).toBe(50);
    expect(user.avbalance).toBe(5050);
    expect(newExposure).toBe(0);
  });

  it('place back bet -> settle LOSS -> verify user fields', async () => {
    const user = makeUser({
      balance: 5000,
      avbalance: 5000,
      exposure: 0,
      bettingProfitLoss: 0,
    });
    const bet = makeBet({
      otype: 'back',
      price: 100,
      betAmount: 50,
      fancyScore: '180',
    });

    // Place
    user.exposure += bet.price;
    user.avbalance -= bet.price;

    // Settle (loss)
    const result = await settleFancyBet(bet, user, 150);
    user.balance += result.userUpdates.balanceChange;
    user.bettingProfitLoss += result.userUpdates.profitLossChange;

    const newExposure = calculateExposure([]);
    recalculateAvbalance(user, newExposure);

    expect(user.balance).toBe(4900);
    expect(user.bettingProfitLoss).toBe(-100);
    expect(user.avbalance).toBe(4900);
  });

  it('two bets on same market, one wins one loses', async () => {
    const user = makeUser({
      balance: 10000,
      avbalance: 10000,
      exposure: 0,
      bettingProfitLoss: 0,
    });

    const bet1 = makeBet({
      _id: 'b1',
      otype: 'back',
      price: 200,
      betAmount: 100,
      fancyScore: '180',
      teamName: 'India',
      gameId: 'g1',
    });
    const bet2 = makeBet({
      _id: 'b2',
      otype: 'lay',
      price: 150,
      betAmount: 75,
      fancyScore: '180',
      teamName: 'India',
      gameId: 'g1',
    });

    // Place both
    const pendingBets = [bet1, bet2];
    const exposure = calculateExposure(pendingBets);
    user.exposure = exposure;
    user.avbalance = user.balance - exposure;

    // Settle both with score 200 (back wins, lay loses)
    const r1 = await settleFancyBet(bet1, user, 200);
    const r2 = await settleFancyBet(bet2, user, 200);

    user.balance += r1.userUpdates.balanceChange + r2.userUpdates.balanceChange;
    user.bettingProfitLoss +=
      r1.userUpdates.profitLossChange + r2.userUpdates.profitLossChange;

    // No more pending bets
    recalculateAvbalance(user, 0);

    // back win: +100, lay loss: -150 → net = -50
    expect(user.bettingProfitLoss).toBe(-50);
    expect(user.balance).toBe(9950);
    expect(user.avbalance).toBe(9950);
  });

  it('offset bet journey: place offset -> settle -> balance unchanged on break-even', async () => {
    const user = makeUser({
      balance: 5000,
      avbalance: 5000,
      exposure: 0,
      bettingProfitLoss: 0,
    });
    const offsetBet = makeBet({
      otype: 'back',
      price: 50,
      betAmount: -38,
      fancyScore: '180',
    });

    // Place offset bet
    user.exposure += offsetBet.price;
    user.avbalance -= offsetBet.price;

    // Settle: score < 180 → back loses → offset loss = break even
    const result = await settleFancyBet(offsetBet, user, 150);
    user.balance += result.userUpdates.balanceChange;
    user.bettingProfitLoss += result.userUpdates.profitLossChange;
    recalculateAvbalance(user, 0);

    expect(user.balance).toBe(5000); // unchanged
    expect(user.bettingProfitLoss).toBe(0); // unchanged
    expect(user.avbalance).toBe(5000);
  });

  it('sequential settlement: balance = baseBalance + cumulative PL', async () => {
    const baseBalance = 10000;
    const user = makeUser({
      balance: baseBalance,
      avbalance: baseBalance,
      exposure: 0,
      bettingProfitLoss: 0,
      baseBalance,
    });

    const bets = [
      makeBet({
        _id: 'b1',
        otype: 'back',
        price: 100,
        betAmount: 80,
        fancyScore: '50',
      }),
      makeBet({
        _id: 'b2',
        otype: 'back',
        price: 200,
        betAmount: 120,
        fancyScore: '60',
      }),
      makeBet({
        _id: 'b3',
        otype: 'lay',
        price: 150,
        betAmount: 100,
        fancyScore: '40',
      }),
    ];

    // Scores: 55 (b1 back wins), 50 (b2 back loses), 50 (b3 lay: 50 < 40 is false → lay loses)
    const scores = [55, 50, 50];

    // Settle all
    for (let i = 0; i < bets.length; i++) {
      const result = await settleFancyBet(bets[i], user, scores[i]);
      user.balance += result.userUpdates.balanceChange;
      user.bettingProfitLoss += result.userUpdates.profitLossChange;
    }

    recalculateAvbalance(user, 0);

    // b1: back win (55>=50) → PL=+80
    // b2: back loss (50<60) → PL=-200
    // b3: lay loss (50>=40, lay needs score<40) → PL=-150
    const expectedPL = 80 + -200 + -150;
    expect(user.bettingProfitLoss).toBe(expectedPL);
    expect(user.balance).toBe(baseBalance + expectedPL);
    expect(user.avbalance).toBe(user.balance);
  });
});

// ═══════════════════════════════════════════════════════════════════
// 10. profitLossChange formula verification
// ═══════════════════════════════════════════════════════════════════
describe('profitLossChange Formula Verification', () => {
  it('WIN: profitLossChange always equals betAmount', async () => {
    const amounts = [50, 100, 250, 500, 1000];
    for (const amt of amounts) {
      const bet = makeBet({
        otype: 'back',
        betAmount: amt,
        price: 200,
        fancyScore: '10',
      });
      const result = await settleFancyBet(bet, makeUser(), 20);
      expect(result.betUpdates.profitLossChange).toBe(amt);
    }
  });

  it('LOSS: profitLossChange always equals -price', async () => {
    const prices = [50, 100, 250, 500, 1000];
    for (const p of prices) {
      const bet = makeBet({
        otype: 'back',
        price: p,
        betAmount: 50,
        fancyScore: '100',
      });
      const result = await settleFancyBet(bet, makeUser(), 50);
      expect(result.betUpdates.profitLossChange).toBe(-p);
    }
  });

  it('offset WIN: profitLossChange equals betAmount (which is negative)', async () => {
    const negAmounts = [-10, -25, -50, -100];
    for (const amt of negAmounts) {
      const bet = makeBet({
        otype: 'back',
        betAmount: amt,
        price: 60,
        fancyScore: '10',
      });
      const result = await settleFancyBet(bet, makeUser(), 20);
      expect(result.betUpdates.profitLossChange).toBe(amt);
    }
  });

  it('offset LOSS: profitLossChange always equals 0', async () => {
    const negAmounts = [-10, -25, -50, -100];
    for (const amt of negAmounts) {
      const bet = makeBet({
        otype: 'back',
        betAmount: amt,
        price: 60,
        fancyScore: '100',
      });
      const result = await settleFancyBet(bet, makeUser(), 50);
      expect(result.betUpdates.profitLossChange).toBe(0);
    }
  });
});
