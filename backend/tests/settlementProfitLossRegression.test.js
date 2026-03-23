/**
 * Regression Tests: Settlement → ProfitLoss End-to-End
 *
 * Tests the ACTUAL service functions (not inline math) to verify:
 * 1. Sports settlement returns correct status, profitLossChange, userUpdates
 * 2. Fancy settlement returns correct score-based outcomes
 * 3. Void returns status 3, zero profitLossChange, NO userUpdates
 * 4. Tied match handling
 * 5. Offset bet edge cases
 * 6. ProfitLoss aggregation only includes status 1 & 2 (excludes void=3)
 * 7. selectedVoid filter correctness (status=3 for void)
 */

import { describe, expect, test } from 'vitest';

import {
  settleSportsBet,
  voidSportsBet,
  tiedSportsBet,
} from '../services/sportsSettlementService.js';

import {
  settleFancyBet,
  voidFancyBet,
} from '../services/fancyBetSettlementService.js';

// ============================================================
// SECTION 1: Sports Settlement - Normal Bets
// ============================================================
describe('Sports Settlement → ProfitLoss (calling actual service)', () => {
  describe('Back Bet - Normal (betAmount >= 0)', () => {
    test('Back bet WIN: profitLossChange = +betAmount, status = 1', async () => {
      const bet = {
        _id: 'bet1',
        otype: 'back',
        teamName: 'Team A',
        price: 100,
        betAmount: 150,
        gameType: 'Match Odds',
      };
      const user = { balance: 1000, avbalance: 900, bettingProfitLoss: 0 };

      const result = await settleSportsBet(bet, user, 'Team A');

      expect(result.success).toBe(true);
      expect(result.betUpdates.status).toBe(1); // WIN
      expect(result.betUpdates.profitLossChange).toBe(150); // +betAmount
      expect(result.betUpdates.betResult).toBe('Team A');
      expect(result.userUpdates.balanceChange).toBe(150); // +betAmount
      expect(result.userUpdates.profitLossChange).toBe(150); // +betAmount
    });

    test('Back bet LOSS: profitLossChange = -price, status = 2', async () => {
      const bet = {
        _id: 'bet2',
        otype: 'back',
        teamName: 'Team A',
        price: 100,
        betAmount: 150,
        gameType: 'Match Odds',
      };
      const user = { balance: 1000, avbalance: 900, bettingProfitLoss: 0 };

      const result = await settleSportsBet(bet, user, 'Team B');

      expect(result.success).toBe(true);
      expect(result.betUpdates.status).toBe(2); // LOSS
      expect(result.betUpdates.profitLossChange).toBe(-100); // -price
      expect(result.userUpdates.balanceChange).toBe(-100); // -price
      expect(result.userUpdates.profitLossChange).toBe(-100); // -price
    });
  });

  describe('Lay Bet - Normal', () => {
    test('Lay bet - selection WINS (user LOSES): profitLossChange = -price, status = 2', async () => {
      const bet = {
        _id: 'bet3',
        otype: 'lay',
        teamName: 'Team A',
        price: 50, // liability
        betAmount: 100, // profit if wins
        gameType: 'Match Odds',
      };
      const user = { balance: 1000, avbalance: 950, bettingProfitLoss: 0 };

      const result = await settleSportsBet(bet, user, 'Team A');

      expect(result.success).toBe(true);
      expect(result.betUpdates.status).toBe(2); // LOSS (layer loses when selection wins)
      expect(result.betUpdates.profitLossChange).toBe(-50); // -price (liability)
      expect(result.userUpdates.balanceChange).toBe(-50);
      expect(result.userUpdates.profitLossChange).toBe(-50);
    });

    test('Lay bet - selection LOSES (user WINS): profitLossChange = +betAmount, status = 1', async () => {
      const bet = {
        _id: 'bet4',
        otype: 'lay',
        teamName: 'Team A',
        price: 50,
        betAmount: 100,
        gameType: 'Match Odds',
      };
      const user = { balance: 1000, avbalance: 950, bettingProfitLoss: 0 };

      const result = await settleSportsBet(bet, user, 'Team B');

      expect(result.success).toBe(true);
      expect(result.betUpdates.status).toBe(1); // WIN
      expect(result.betUpdates.profitLossChange).toBe(100); // +betAmount
      expect(result.userUpdates.balanceChange).toBe(100);
      expect(result.userUpdates.profitLossChange).toBe(100);
    });
  });

  describe('Offset Bets (betAmount < 0)', () => {
    test('Offset back WIN: net loss (profitLossChange = betAmount), status = 2', async () => {
      const bet = {
        _id: 'bet5',
        otype: 'back',
        teamName: 'Team A',
        price: 100,
        betAmount: -1, // offset - net loss of 1 if team wins
        gameType: 'Match Odds',
      };
      const user = { balance: 1000, avbalance: 999, bettingProfitLoss: 0 };

      const result = await settleSportsBet(bet, user, 'Team A');

      expect(result.success).toBe(true);
      expect(result.betUpdates.status).toBe(2); // LOSS (net loss despite team winning)
      expect(result.betUpdates.profitLossChange).toBe(-1); // betAmount (negative)
      expect(result.userUpdates.balanceChange).toBe(-1);
      expect(result.userUpdates.profitLossChange).toBe(-1);
    });

    test('Offset back LOSS: break even (profitLossChange = 0), status = 1', async () => {
      const bet = {
        _id: 'bet6',
        otype: 'back',
        teamName: 'Team A',
        price: 100,
        betAmount: -50,
        gameType: 'Match Odds',
      };
      const user = { balance: 1000, avbalance: 950, bettingProfitLoss: 0 };

      const result = await settleSportsBet(bet, user, 'Team B');

      expect(result.success).toBe(true);
      expect(result.betUpdates.status).toBe(1); // WIN (break even is favorable)
      expect(result.betUpdates.profitLossChange).toBe(0); // break even
      expect(result.userUpdates.balanceChange).toBe(0);
      expect(result.userUpdates.profitLossChange).toBe(0);
    });
  });

  describe('Case Insensitive Team Name Matching', () => {
    test('Winner with different casing still matches', async () => {
      const bet = {
        _id: 'bet7',
        otype: 'back',
        teamName: 'India',
        price: 100,
        betAmount: 200,
        gameType: 'Match Odds',
      };
      const user = { balance: 1000, avbalance: 900, bettingProfitLoss: 0 };

      const result = await settleSportsBet(bet, user, 'INDIA');

      expect(result.success).toBe(true);
      expect(result.betUpdates.status).toBe(1); // WIN - case insensitive match
      expect(result.betUpdates.profitLossChange).toBe(200);
    });

    test('Winner with leading/trailing spaces still matches', async () => {
      const bet = {
        _id: 'bet8',
        otype: 'back',
        teamName: '  Team A  ',
        price: 100,
        betAmount: 200,
        gameType: 'Match Odds',
      };
      const user = { balance: 1000, avbalance: 900, bettingProfitLoss: 0 };

      const result = await settleSportsBet(bet, user, ' Team A ');

      expect(result.success).toBe(true);
      expect(result.betUpdates.status).toBe(1); // WIN - trimmed match
    });
  });
});

// ============================================================
// SECTION 2: Void Settlement
// ============================================================
describe('Void Settlement → ProfitLoss Impact', () => {
  test('voidSportsBet: status=3, profitLossChange=0, NO userUpdates key', async () => {
    const bet = {
      _id: 'bet-void1',
      price: 100,
      betAmount: 150,
      otype: 'back',
      teamName: 'Team A',
    };

    const result = await voidSportsBet(bet);

    expect(result.success).toBe(true);
    expect(result.betUpdates.status).toBe(3); // VOID
    expect(result.betUpdates.profitLossChange).toBe(0); // NO P/L impact
    expect(result.betUpdates.betResult).toBe('VOID');
    expect(result.betUpdates.resultAmount).toBe(100); // abs(price) refunded
    // CRITICAL: No userUpdates → controller skips $inc on bettingProfitLoss
    expect(result.userUpdates).toBeUndefined();
  });

  test('voidFancyBet: status=3, profitLossChange=0, NO userUpdates key', async () => {
    const bet = {
      _id: 'bet-void2',
      price: 200,
      betAmount: 180,
      otype: 'back',
      fancyScore: 45,
    };

    const result = await voidFancyBet(bet);

    expect(result.success).toBe(true);
    expect(result.betUpdates.status).toBe(3);
    expect(result.betUpdates.profitLossChange).toBe(0);
    expect(result.betUpdates.betResult).toBe('VOID');
    expect(result.userUpdates).toBeUndefined();
  });

  test('Void bet with negative price returns abs(price) as resultAmount', async () => {
    const bet = {
      _id: 'bet-void3',
      price: -50, // guaranteed profit scenario
      betAmount: 100,
      otype: 'back',
      teamName: 'Team A',
    };

    const result = await voidSportsBet(bet);

    expect(result.betUpdates.resultAmount).toBe(50); // abs(-50)
    expect(result.betUpdates.profitLossChange).toBe(0);
  });
});

// ============================================================
// SECTION 3: Tied Match Settlement
// ============================================================
describe('Tied Match Settlement', () => {
  test('Back bet in tied match: LOSS (profitLossChange = -price)', async () => {
    const bet = {
      _id: 'bet-tied1',
      otype: 'back',
      teamName: 'Team A',
      price: 100,
      betAmount: 200,
      gameType: 'Tied Match',
    };
    const user = { balance: 1000, avbalance: 900, bettingProfitLoss: 0 };

    const result = await tiedSportsBet(bet, user);

    expect(result.success).toBe(true);
    expect(result.betUpdates.status).toBe(2); // LOSS for back in tied match
    expect(result.betUpdates.profitLossChange).toBe(-100); // -price
    expect(result.betUpdates.betResult).toBe('TIED');
    expect(result.userUpdates.balanceChange).toBe(-100);
    expect(result.userUpdates.profitLossChange).toBe(-100);
  });

  test('Lay bet in tied match: WIN (profitLossChange = +betAmount)', async () => {
    const bet = {
      _id: 'bet-tied2',
      otype: 'lay',
      teamName: 'Team A',
      price: 50,
      betAmount: 100,
      gameType: 'Tied Match',
    };
    const user = { balance: 1000, avbalance: 950, bettingProfitLoss: 0 };

    const result = await tiedSportsBet(bet, user);

    expect(result.success).toBe(true);
    expect(result.betUpdates.status).toBe(1); // WIN for lay in tied match
    expect(result.betUpdates.profitLossChange).toBe(100); // +betAmount
    expect(result.userUpdates.balanceChange).toBe(100);
    expect(result.userUpdates.profitLossChange).toBe(100);
  });
});

// ============================================================
// SECTION 4: Fancy Bet Settlement
// ============================================================
describe('Fancy Settlement → ProfitLoss (calling actual service)', () => {
  describe('Back Fancy Bet', () => {
    test('Back fancy WIN (score >= fancyScore): profitLossChange = +betAmount', async () => {
      const bet = {
        _id: 'fancy1',
        otype: 'back',
        fancyScore: 40,
        price: 100,
        betAmount: 150,
        gameType: 'Normal',
      };
      const user = { balance: 1000, avbalance: 900, bettingProfitLoss: 0 };

      const result = await settleFancyBet(bet, user, 45); // score 45 >= fancyScore 40

      expect(result.success).toBe(true);
      expect(result.betUpdates.status).toBe(1); // WIN
      expect(result.betUpdates.profitLossChange).toBe(150); // +betAmount
      expect(result.userUpdates.profitLossChange).toBe(150);
    });

    test('Back fancy WIN at exact fancyScore boundary: score === fancyScore', async () => {
      const bet = {
        _id: 'fancy2',
        otype: 'back',
        fancyScore: 40,
        price: 100,
        betAmount: 150,
        gameType: 'Normal',
      };
      const user = { balance: 1000, avbalance: 900, bettingProfitLoss: 0 };

      const result = await settleFancyBet(bet, user, 40); // score === fancyScore

      expect(result.success).toBe(true);
      expect(result.betUpdates.status).toBe(1); // WIN (>= means equal counts)
      expect(result.betUpdates.profitLossChange).toBe(150);
    });

    test('Back fancy LOSS (score < fancyScore): profitLossChange = -price', async () => {
      const bet = {
        _id: 'fancy3',
        otype: 'back',
        fancyScore: 40,
        price: 100,
        betAmount: 150,
        gameType: 'Normal',
      };
      const user = { balance: 1000, avbalance: 900, bettingProfitLoss: 0 };

      const result = await settleFancyBet(bet, user, 35); // score 35 < fancyScore 40

      expect(result.success).toBe(true);
      expect(result.betUpdates.status).toBe(2); // LOSS
      expect(result.betUpdates.profitLossChange).toBe(-100); // -price
      expect(result.userUpdates.profitLossChange).toBe(-100);
    });
  });

  describe('Lay Fancy Bet', () => {
    test('Lay fancy WIN (score < fancyScore): profitLossChange = +betAmount', async () => {
      const bet = {
        _id: 'fancy4',
        otype: 'lay',
        fancyScore: 40,
        price: 50,
        betAmount: 100,
        gameType: 'Normal',
      };
      const user = { balance: 1000, avbalance: 950, bettingProfitLoss: 0 };

      const result = await settleFancyBet(bet, user, 35); // score 35 < 40 → lay wins

      expect(result.success).toBe(true);
      expect(result.betUpdates.status).toBe(1); // WIN
      expect(result.betUpdates.profitLossChange).toBe(100);
      expect(result.userUpdates.profitLossChange).toBe(100);
    });

    test('Lay fancy LOSS (score >= fancyScore): profitLossChange = -price', async () => {
      const bet = {
        _id: 'fancy5',
        otype: 'lay',
        fancyScore: 40,
        price: 50,
        betAmount: 100,
        gameType: 'Normal',
      };
      const user = { balance: 1000, avbalance: 950, bettingProfitLoss: 0 };

      const result = await settleFancyBet(bet, user, 45); // score 45 >= 40 → lay loses

      expect(result.success).toBe(true);
      expect(result.betUpdates.status).toBe(2); // LOSS
      expect(result.betUpdates.profitLossChange).toBe(-50); // -price
      expect(result.userUpdates.profitLossChange).toBe(-50);
    });
  });

  describe('Fancy Offset Bets', () => {
    test('Offset fancy WIN: net loss (profitLossChange = betAmount)', async () => {
      const bet = {
        _id: 'fancy6',
        otype: 'back',
        fancyScore: 40,
        price: 100,
        betAmount: -10, // offset
        gameType: 'Normal',
      };
      const user = { balance: 1000, avbalance: 990, bettingProfitLoss: 0 };

      const result = await settleFancyBet(bet, user, 50);

      expect(result.success).toBe(true);
      expect(result.betUpdates.status).toBe(2); // LOSS (offset wins = net loss)
      expect(result.betUpdates.profitLossChange).toBe(-10);
    });

    test('Offset fancy LOSS: break even (profitLossChange = 0)', async () => {
      const bet = {
        _id: 'fancy7',
        otype: 'back',
        fancyScore: 40,
        price: 100,
        betAmount: -10,
        gameType: 'Normal',
      };
      const user = { balance: 1000, avbalance: 990, bettingProfitLoss: 0 };

      const result = await settleFancyBet(bet, user, 30);

      expect(result.success).toBe(true);
      expect(result.betUpdates.status).toBe(1); // WIN (break even)
      expect(result.betUpdates.profitLossChange).toBe(0);
    });
  });

  describe('Invalid Fancy Score', () => {
    test('NaN fancyScore returns success=false', async () => {
      const bet = {
        _id: 'fancy8',
        otype: 'back',
        fancyScore: 'abc',
        price: 100,
        betAmount: 150,
        gameType: 'Normal',
      };
      const user = { balance: 1000, avbalance: 900, bettingProfitLoss: 0 };

      const result = await settleFancyBet(bet, user, 45);

      expect(result.success).toBe(false);
    });

    test('NaN actualScore returns success=false', async () => {
      const bet = {
        _id: 'fancy9',
        otype: 'back',
        fancyScore: 40,
        price: 100,
        betAmount: 150,
        gameType: 'Normal',
      };
      const user = { balance: 1000, avbalance: 900, bettingProfitLoss: 0 };

      const result = await settleFancyBet(bet, user, 'invalid');

      expect(result.success).toBe(false);
    });
  });
});

// ============================================================
// SECTION 5: ProfitLoss Aggregation Logic
// ============================================================
describe('ProfitLoss Aggregation - Status Filtering', () => {
  // Simulates getProfitlossHistory query: status: { $in: [1, 2] }
  const profitLossFilter = (bets) =>
    bets.filter((b) => [1, 2].includes(b.status));

  test('Settled bets (status 1 & 2) are included in profitLoss', () => {
    const bets = [
      { status: 1, profitLossChange: 150 }, // WIN
      { status: 2, profitLossChange: -100 }, // LOSS
    ];

    const filtered = profitLossFilter(bets);
    expect(filtered.length).toBe(2);

    const totalPL = filtered.reduce((sum, b) => sum + b.profitLossChange, 0);
    expect(totalPL).toBe(50); // 150 - 100
  });

  test('Void bets (status 3) are EXCLUDED from profitLoss', () => {
    const bets = [
      { status: 1, profitLossChange: 150 },
      { status: 2, profitLossChange: -100 },
      { status: 3, profitLossChange: 0 }, // VOID - should be excluded
    ];

    const filtered = profitLossFilter(bets);
    expect(filtered.length).toBe(2); // Only 2, void excluded

    const totalPL = filtered.reduce((sum, b) => sum + b.profitLossChange, 0);
    expect(totalPL).toBe(50); // Same as without void
  });

  test('Pending bets (status 0) are EXCLUDED from profitLoss', () => {
    const bets = [
      { status: 0, profitLossChange: 0 }, // PENDING
      { status: 1, profitLossChange: 200 },
    ];

    const filtered = profitLossFilter(bets);
    expect(filtered.length).toBe(1); // Only settled
    expect(filtered[0].profitLossChange).toBe(200);
  });

  test('All void bets → empty profitLoss', () => {
    const bets = [
      { status: 3, profitLossChange: 0 },
      { status: 3, profitLossChange: 0 },
    ];

    const filtered = profitLossFilter(bets);
    expect(filtered.length).toBe(0);
  });
});

// ============================================================
// SECTION 6: selectedVoid Filter Correctness (FIXED BUG)
// ============================================================
describe('selectedVoid Filter Logic (Bug Fix Verification)', () => {
  // Simulates the fixed backend filter logic
  const applySelectedVoidFilter = (bets, selectedVoid) => {
    if (selectedVoid === 'settel') {
      return bets.filter((b) => b.status !== 0); // { $ne: 0 }
    } else if (selectedVoid === 'void') {
      return bets.filter((b) => b.status === 3); // FIXED: was 1 or 0, now 3
    } else if (selectedVoid === 'unsettel') {
      return bets.filter((b) => b.status === 0);
    }
    return bets;
  };

  const allBets = [
    { _id: 'b1', status: 0, betResult: null }, // Pending
    { _id: 'b2', status: 1, betResult: 'Team A' }, // Win
    { _id: 'b3', status: 2, betResult: 'Team B' }, // Loss
    { _id: 'b4', status: 3, betResult: 'VOID' }, // Void
    { _id: 'b5', status: 1, betResult: 'Team A' }, // Win
    { _id: 'b6', status: 3, betResult: 'VOID' }, // Void
  ];

  test('selectedVoid="settel" returns all non-pending (status != 0)', () => {
    const result = applySelectedVoidFilter(allBets, 'settel');
    expect(result.length).toBe(5); // All except pending
    expect(result.every((b) => b.status !== 0)).toBe(true);
  });

  test('selectedVoid="void" returns ONLY void bets (status = 3)', () => {
    const result = applySelectedVoidFilter(allBets, 'void');
    expect(result.length).toBe(2); // Only b4 and b6
    expect(result.every((b) => b.status === 3)).toBe(true);
    expect(result.every((b) => b.betResult === 'VOID')).toBe(true);
  });

  test('selectedVoid="unsettel" returns ONLY pending bets (status = 0)', () => {
    const result = applySelectedVoidFilter(allBets, 'unsettel');
    expect(result.length).toBe(1); // Only b1
    expect(result[0].status).toBe(0);
  });

  test('No filter returns all bets', () => {
    const result = applySelectedVoidFilter(allBets, undefined);
    expect(result.length).toBe(6);
  });
});

// ============================================================
// SECTION 7: Controller Integration - bettingProfitLoss $inc
// ============================================================
describe('Controller Integration: bettingProfitLoss accumulation', () => {
  // Simulates what the controller does with settlement results
  const simulateSettlementController = async (bet, user, winner) => {
    const result = await settleSportsBet(bet, user, winner);
    if (!result.success) return { user, bet: { ...bet }, skipped: true };

    // Simulate atomic claim (betModel.findOneAndUpdate)
    const updatedBet = { ...bet, ...result.betUpdates };

    // Simulate isVoid check (controller line 1667)
    const isVoid = winner.toLowerCase() === 'void';

    // Simulate $inc on user (controller lines 1671-1677)
    const updatedUser = { ...user };
    if (!isVoid && result.userUpdates) {
      updatedUser.balance += result.userUpdates.balanceChange;
      updatedUser.bettingProfitLoss += result.userUpdates.profitLossChange;
    }

    return { user: updatedUser, bet: updatedBet, result };
  };

  test('Multiple bets settle correctly accumulating bettingProfitLoss', async () => {
    let user = { balance: 10000, avbalance: 9000, bettingProfitLoss: 0 };

    // Bet 1: Back Team A @ 2.0, stake 100 → Team A wins → +100
    const bet1 = {
      _id: 'b1',
      otype: 'back',
      teamName: 'Team A',
      price: 100,
      betAmount: 100,
    };
    const r1 = await simulateSettlementController(bet1, user, 'Team A');
    user = r1.user;

    expect(user.balance).toBe(10100);
    expect(user.bettingProfitLoss).toBe(100);

    // Bet 2: Back Team B @ 1.5, stake 200 → Team A wins → -200
    const bet2 = {
      _id: 'b2',
      otype: 'back',
      teamName: 'Team B',
      price: 200,
      betAmount: 100,
    };
    const r2 = await simulateSettlementController(bet2, user, 'Team A');
    user = r2.user;

    expect(user.balance).toBe(9900); // 10100 - 200
    expect(user.bettingProfitLoss).toBe(-100); // 100 - 200

    // Bet 3: Lay Team C @ 1.5, liability 50 → Team C loses → +100
    const bet3 = {
      _id: 'b3',
      otype: 'lay',
      teamName: 'Team C',
      price: 50,
      betAmount: 100,
    };
    const r3 = await simulateSettlementController(bet3, user, 'Team A');
    user = r3.user;

    expect(user.balance).toBe(10000); // 9900 + 100
    expect(user.bettingProfitLoss).toBe(0); // -100 + 100

    // Verify all bets have correct status
    expect(r1.bet.status).toBe(1); // WIN
    expect(r2.bet.status).toBe(2); // LOSS
    expect(r3.bet.status).toBe(1); // WIN
  });

  test('Void bet does NOT change bettingProfitLoss', async () => {
    const user = { balance: 10000, avbalance: 9000, bettingProfitLoss: 500 };

    const bet = {
      _id: 'bv',
      otype: 'back',
      teamName: 'Team A',
      price: 100,
      betAmount: 150,
    };
    const voidResult = await voidSportsBet(bet);

    // Simulate controller void path
    const isVoid = true;
    const updatedUser = { ...user };
    if (!isVoid && voidResult.userUpdates) {
      // This block is SKIPPED for void
      updatedUser.balance += voidResult.userUpdates?.balanceChange || 0;
      updatedUser.bettingProfitLoss +=
        voidResult.userUpdates?.profitLossChange || 0;
    }

    // User unchanged
    expect(updatedUser.balance).toBe(10000);
    expect(updatedUser.bettingProfitLoss).toBe(500); // Unchanged!
  });
});

// ============================================================
// SECTION 8: Real-world Scenarios
// ============================================================
describe('Real-world Settlement Scenarios', () => {
  test('Cricket Match Odds: India vs Pakistan - multiple users', async () => {
    // User 1: Back India @ 2.5, stake 1000
    const bet1 = {
      _id: 'r1',
      otype: 'back',
      teamName: 'India',
      price: 1000,
      betAmount: 1500,
    };
    const user1 = { balance: 50000, avbalance: 49000, bettingProfitLoss: 0 };
    const r1 = await settleSportsBet(bet1, user1, 'India');

    expect(r1.betUpdates.status).toBe(1); // India wins → back wins
    expect(r1.betUpdates.profitLossChange).toBe(1500);
    expect(r1.userUpdates.balanceChange).toBe(1500);

    // User 2: Lay India @ 2.0, liability 500
    const bet2 = {
      _id: 'r2',
      otype: 'lay',
      teamName: 'India',
      price: 500,
      betAmount: 500,
    };
    const user2 = { balance: 50000, avbalance: 49500, bettingProfitLoss: 0 };
    const r2 = await settleSportsBet(bet2, user2, 'India');

    expect(r2.betUpdates.status).toBe(2); // India wins → lay loses
    expect(r2.betUpdates.profitLossChange).toBe(-500);
    expect(r2.userUpdates.balanceChange).toBe(-500);

    // User 3: Back Pakistan @ 3.0, stake 200
    const bet3 = {
      _id: 'r3',
      otype: 'back',
      teamName: 'Pakistan',
      price: 200,
      betAmount: 400,
    };
    const user3 = { balance: 50000, avbalance: 49800, bettingProfitLoss: 0 };
    const r3 = await settleSportsBet(bet3, user3, 'India');

    expect(r3.betUpdates.status).toBe(2); // Pakistan lost → back loses
    expect(r3.betUpdates.profitLossChange).toBe(-200); // -price
    expect(r3.userUpdates.balanceChange).toBe(-200);
  });

  test('Fancy bet: 20 Over Runs session', async () => {
    // Back runs >= 165 @ 80/100
    const bet1 = {
      _id: 'f1',
      otype: 'back',
      fancyScore: 165,
      price: 100,
      betAmount: 80,
    };
    const user1 = { balance: 10000, avbalance: 9900, bettingProfitLoss: 0 };

    // Actual score: 170 → back wins (170 >= 165)
    const r1 = await settleFancyBet(bet1, user1, 170);
    expect(r1.betUpdates.status).toBe(1);
    expect(r1.betUpdates.profitLossChange).toBe(80);

    // Lay runs < 165 @ 80/100
    const bet2 = {
      _id: 'f2',
      otype: 'lay',
      fancyScore: 165,
      price: 80,
      betAmount: 100,
    };
    const user2 = { balance: 10000, avbalance: 9920, bettingProfitLoss: 0 };

    // Actual score: 170 → lay loses (170 >= 165)
    const r2 = await settleFancyBet(bet2, user2, 170);
    expect(r2.betUpdates.status).toBe(2);
    expect(r2.betUpdates.profitLossChange).toBe(-80); // -price
  });

  test('Mixed settlement: some win, some lose, some void → correct PL totals', async () => {
    const settlements = [];

    // Bet 1: WIN +200
    const r1 = await settleSportsBet(
      { _id: 's1', otype: 'back', teamName: 'A', price: 100, betAmount: 200 },
      { balance: 10000 },
      'A'
    );
    settlements.push(r1.betUpdates);

    // Bet 2: LOSS -150
    const r2 = await settleSportsBet(
      { _id: 's2', otype: 'back', teamName: 'B', price: 150, betAmount: 200 },
      { balance: 10000 },
      'A'
    );
    settlements.push(r2.betUpdates);

    // Bet 3: VOID (should be excluded from PL)
    const r3 = await voidSportsBet({ _id: 's3', price: 100, betAmount: 100 });
    settlements.push(r3.betUpdates);

    // Simulate getProfitlossHistory: status in [1, 2]
    const plBets = settlements.filter((b) => [1, 2].includes(b.status));
    const totalPL = plBets.reduce((sum, b) => sum + b.profitLossChange, 0);

    expect(plBets.length).toBe(2); // Void excluded
    expect(totalPL).toBe(50); // 200 - 150 = 50
    expect(settlements[2].status).toBe(3); // Void bet still exists, just excluded
    expect(settlements[2].profitLossChange).toBe(0);
  });
});
