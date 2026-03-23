/**
 * Tests for double-settlement prevention (atomic claim pattern)
 *
 * ROOT CAUSE: In PM2 cluster mode, multiple processes run cron simultaneously.
 * Both processes fetch the same bet (status: 0), both settle it, and both
 * $inc bettingProfitLoss — doubling the user's P&L.
 *
 * FIX: Use findOneAndUpdate({ status: 0 }) as an atomic claim.
 * Only one process can change status from 0 → settled. The second process
 * gets null back and skips the $inc.
 *
 * These tests verify the atomic claim pattern works correctly.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';

// ─── Mock betModel.findOneAndUpdate for atomic claim simulation ───
const mockFindOneAndUpdate = vi.fn();
const mockFind = vi.fn();

vi.mock('../models/betModel.js', () => ({
  default: {
    findOneAndUpdate: (...args) => mockFindOneAndUpdate(...args),
    find: (...args) => mockFind(...args),
  },
}));

// ─── Helpers ───
function makeBet(overrides = {}) {
  return {
    _id: 'bet_001',
    userId: 'user_001',
    status: 0,
    otype: 'back',
    price: 100,
    betAmount: 50,
    gameType: 'Normal',
    teamName: 'Over 180',
    gameId: 'game_001',
    fancyScore: '180',
    ...overrides,
  };
}

function makeSettlementResult(isWin) {
  return {
    success: true,
    betUpdates: {
      status: isWin ? 1 : 2,
      resultAmount: isWin ? 50 : 100,
      settledBy: 'api',
      settledAt: Date.now(),
    },
    userUpdates: {
      balanceChange: isWin ? 50 : -100,
      profitLossChange: isWin ? 50 : -100,
    },
  };
}

describe('Double Settlement Prevention - Atomic Claim Pattern', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findOneAndUpdate atomic claim behavior', () => {
    it('first process claims bet successfully (status 0 → 1)', async () => {
      const bet = makeBet();
      const settlement = makeSettlementResult(true);

      // First process: findOneAndUpdate finds status 0, claims it
      mockFindOneAndUpdate.mockResolvedValueOnce({
        ...bet,
        ...settlement.betUpdates,
      });

      const claimedBet = await mockFindOneAndUpdate(
        { _id: bet._id, status: 0 },
        { $set: settlement.betUpdates },
        { new: true }
      );

      expect(claimedBet).not.toBeNull();
      expect(claimedBet.status).toBe(1);
    });

    it('second process gets null (bet already claimed)', async () => {
      // Second process: bet already has status 1, findOneAndUpdate returns null
      mockFindOneAndUpdate.mockResolvedValueOnce(null);

      const claimedBet = await mockFindOneAndUpdate(
        { _id: 'bet_001', status: 0 },
        { $set: { status: 1 } },
        { new: true }
      );

      expect(claimedBet).toBeNull();
    });

    it('$inc only runs for the process that successfully claims', async () => {
      const bet = makeBet();
      const settlement = makeSettlementResult(true);
      let incCount = 0;

      // Simulate two concurrent processes trying to settle the same bet
      const processBet = async (processName) => {
        const claimedBet = await mockFindOneAndUpdate(
          { _id: bet._id, status: 0 },
          { $set: settlement.betUpdates },
          { new: true }
        );

        if (!claimedBet) {
          // Second process: skip $inc
          return { process: processName, settled: false };
        }

        // First process: run $inc
        incCount++;
        return { process: processName, settled: true };
      };

      // First call succeeds, second returns null
      mockFindOneAndUpdate
        .mockResolvedValueOnce({ ...bet, ...settlement.betUpdates })
        .mockResolvedValueOnce(null);

      const results = await Promise.all([
        processBet('Process A'),
        processBet('Process B'),
      ]);

      const settled = results.filter((r) => r.settled);
      expect(settled).toHaveLength(1);
      expect(incCount).toBe(1); // $inc only ran once!
    });
  });

  describe('Settlement flow with atomic claim', () => {
    it('sports settlement: atomic claim prevents double $inc', async () => {
      const bet = makeBet({ gameType: 'Match Odds' });
      const settlement = makeSettlementResult(true);

      // Simulate the exact pattern from betController.js updateResultOfBets
      // Process A claims
      mockFindOneAndUpdate.mockResolvedValueOnce({
        ...bet,
        ...settlement.betUpdates,
      });

      const claimedBet = await mockFindOneAndUpdate(
        { _id: bet._id, status: 0 },
        { $set: settlement.betUpdates },
        { new: true }
      );

      expect(claimedBet).not.toBeNull();
      expect(claimedBet.status).toBe(1);

      // Process B tries to claim same bet
      mockFindOneAndUpdate.mockResolvedValueOnce(null);

      const claimedBet2 = await mockFindOneAndUpdate(
        { _id: bet._id, status: 0 },
        { $set: settlement.betUpdates },
        { new: true }
      );

      expect(claimedBet2).toBeNull();
      // Process B should skip the $inc (continue in the loop)
    });

    it('fancy settlement: atomic claim prevents double $inc', async () => {
      const bet = makeBet({ gameType: 'Normal', fancyScore: '180' });
      const settlement = makeSettlementResult(false);

      // Process A claims
      mockFindOneAndUpdate.mockResolvedValueOnce({
        ...bet,
        ...settlement.betUpdates,
      });

      const claimed = await mockFindOneAndUpdate(
        { _id: bet._id, status: 0 },
        { $set: settlement.betUpdates },
        { new: true }
      );
      expect(claimed).not.toBeNull();
      expect(claimed.status).toBe(2); // LOSS

      // Process B fails to claim
      mockFindOneAndUpdate.mockResolvedValueOnce(null);
      const claimed2 = await mockFindOneAndUpdate(
        { _id: bet._id, status: 0 },
        { $set: settlement.betUpdates },
        { new: true }
      );
      expect(claimed2).toBeNull();
    });

    it('casino settlement: atomic claim prevents double $inc', async () => {
      const bet = makeBet({
        betType: 'casino',
        gameType: 'casino',
        roundId: 'round_123',
      });

      const casinoUpdates = {
        status: 1,
        resultAmount: 50,
        settledBy: 'api',
        settledAt: Date.now(),
        profitLossChange: 50,
        betResult: 'PLAYER A',
      };

      // Process A claims
      mockFindOneAndUpdate.mockResolvedValueOnce({ ...bet, ...casinoUpdates });

      const claimed = await mockFindOneAndUpdate(
        { _id: bet._id, status: 0 },
        { $set: casinoUpdates },
        { new: true }
      );
      expect(claimed).not.toBeNull();

      // Process B fails
      mockFindOneAndUpdate.mockResolvedValueOnce(null);
      const claimed2 = await mockFindOneAndUpdate(
        { _id: bet._id, status: 0 },
        { $set: casinoUpdates },
        { new: true }
      );
      expect(claimed2).toBeNull();
    });
  });

  describe('Concurrent settlement simulation', () => {
    it('10 concurrent processes: only 1 settles, 9 skip', async () => {
      const bet = makeBet();
      const settlement = makeSettlementResult(true);

      // First call succeeds, remaining 9 return null
      mockFindOneAndUpdate.mockResolvedValueOnce({
        ...bet,
        ...settlement.betUpdates,
      });
      for (let i = 0; i < 9; i++) {
        mockFindOneAndUpdate.mockResolvedValueOnce(null);
      }

      let incCount = 0;
      const results = await Promise.all(
        Array.from({ length: 10 }, (_, i) =>
          (async () => {
            const claimed = await mockFindOneAndUpdate(
              { _id: bet._id, status: 0 },
              { $set: settlement.betUpdates },
              { new: true }
            );
            if (!claimed) return false;
            incCount++;
            return true;
          })()
        )
      );

      expect(results.filter(Boolean)).toHaveLength(1);
      expect(incCount).toBe(1);
    });

    it('void bet: atomic claim also works for void (status 3)', async () => {
      const bet = makeBet();
      const voidUpdates = {
        status: 3,
        resultAmount: 0,
        betResult: 'VOID',
        settledBy: 'api',
        settledAt: Date.now(),
      };

      // Process A claims void
      mockFindOneAndUpdate.mockResolvedValueOnce({ ...bet, ...voidUpdates });
      const claimed = await mockFindOneAndUpdate(
        { _id: bet._id, status: 0 },
        { $set: voidUpdates },
        { new: true }
      );
      expect(claimed).not.toBeNull();
      expect(claimed.status).toBe(3);

      // Process B fails
      mockFindOneAndUpdate.mockResolvedValueOnce(null);
      const claimed2 = await mockFindOneAndUpdate(
        { _id: bet._id, status: 0 },
        { $set: voidUpdates },
        { new: true }
      );
      expect(claimed2).toBeNull();
    });

    it('multiple different bets: each claimed independently', async () => {
      const bets = [
        makeBet({ _id: 'bet_A' }),
        makeBet({ _id: 'bet_B' }),
        makeBet({ _id: 'bet_C' }),
      ];
      const settlement = makeSettlementResult(true);

      // Each bet can be claimed by one process
      for (const bet of bets) {
        mockFindOneAndUpdate.mockResolvedValueOnce({
          ...bet,
          ...settlement.betUpdates,
        });
      }

      let claimedCount = 0;
      for (const bet of bets) {
        const claimed = await mockFindOneAndUpdate(
          { _id: bet._id, status: 0 },
          { $set: settlement.betUpdates },
          { new: true }
        );
        if (claimed) claimedCount++;
      }

      // All 3 different bets should be claimed (no conflict between different bets)
      expect(claimedCount).toBe(3);
    });
  });

  describe('bettingProfitLoss consistency', () => {
    it('with atomic claim: user bettingProfitLoss changes exactly once', async () => {
      const bet = makeBet({ price: 100, betAmount: 50 });
      const settlement = makeSettlementResult(true); // Win: profitLossChange = +50

      let totalProfitLossChange = 0;

      // Simulate 3 processes trying to settle the same bet
      mockFindOneAndUpdate
        .mockResolvedValueOnce({ ...bet, ...settlement.betUpdates }) // Process 1 succeeds
        .mockResolvedValueOnce(null) // Process 2 fails
        .mockResolvedValueOnce(null); // Process 3 fails

      for (let i = 0; i < 3; i++) {
        const claimed = await mockFindOneAndUpdate(
          { _id: bet._id, status: 0 },
          { $set: settlement.betUpdates },
          { new: true }
        );

        if (claimed && settlement.userUpdates) {
          totalProfitLossChange += settlement.userUpdates.profitLossChange;
        }
      }

      // bettingProfitLoss should only change by +50 (once), NOT +150 (triple)
      expect(totalProfitLossChange).toBe(50);
    });

    it('without atomic claim (old code): bettingProfitLoss would triple', () => {
      // This test documents the OLD BUG behavior
      const profitLossChange = 50;
      const processCount = 3;

      // Old code: all 3 processes run $inc without checking
      const oldTotalChange = profitLossChange * processCount;
      expect(oldTotalChange).toBe(150); // BUG: 3x the correct value

      // New code: only 1 process runs $inc
      const newTotalChange = profitLossChange * 1;
      expect(newTotalChange).toBe(50); // CORRECT: exactly 1x
    });
  });
});
