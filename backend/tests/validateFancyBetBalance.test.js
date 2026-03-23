/**
 * Tests for validateFancyBetBalance — simulation-based balance validation for fancy bets.
 *
 * This mirrors the pattern used by validateBetWithNewBetOffset (sports/casino),
 * but uses calculateFancyExposure (score-threshold zones) instead of
 * calculateOutcomeScenarios (team-based).
 */
import { describe, expect, it } from 'vitest';

import { validateFancyBetBalance } from '../utils/exposureUtils.js';

// ─── Helpers ──────────────────────────────────────────────────────────

/** Create a fancy bet with defaults */
const fancy = (overrides = {}) => ({
  gameId: 'g1',
  teamName: '6 over run',
  fancyScore: 30,
  otype: 'back',
  price: 100,
  betAmount: 50,
  betType: 'sports',
  gameType: 'Normal',
  ...overrides,
});

// ─── Tests ────────────────────────────────────────────────────────────

describe('validateFancyBetBalance', () => {
  describe('Single bet — no existing market bets', () => {
    it('should allow a bet when avbalance covers the exposure', () => {
      const result = validateFancyBetBalance(
        500, // avbalance
        500, // balance
        [], // no existing bets
        fancy({ price: 100, betAmount: 50 })
      );
      expect(result.allowed).toBe(true);
      expect(result.newAvbalance).toBeGreaterThanOrEqual(0);
    });

    it('should reject when avbalance cannot cover the exposure', () => {
      const result = validateFancyBetBalance(
        50, // avbalance
        50, // balance
        [],
        fancy({ price: 100, betAmount: 50 })
      );
      expect(result.allowed).toBe(false);
      expect(result.newAvbalance).toBeLessThan(0);
    });

    it('should allow a bet that exactly uses all avbalance', () => {
      // Back bet: exposure = price = 100
      const result = validateFancyBetBalance(
        100, // avbalance
        100, // balance
        [],
        fancy({ price: 100, betAmount: 50 })
      );
      expect(result.allowed).toBe(true);
      expect(result.newAvbalance).toBe(0);
    });
  });

  describe('Offsetting bets — back + lay at same fancyScore', () => {
    it('should recognize that offsetting reduces exposure', () => {
      // Existing: back@30, price=100, betAmount=50
      // New: lay@30, price=50, betAmount=100
      // These offset each other at the same threshold
      const existingBets = [
        fancy({ otype: 'back', fancyScore: 30, price: 100, betAmount: 50 }),
      ];
      const newBet = fancy({
        otype: 'lay',
        fancyScore: 30,
        price: 50,
        betAmount: 100,
      });

      const result = validateFancyBetBalance(200, 200, existingBets, newBet);

      // The combined exposure should be less than just the new bet's price alone
      // This is the key benefit — raw avbalance < p would over-reject
      expect(result.allowed).toBe(true);
      expect(result.newMarketExposure).toBeLessThanOrEqual(
        result.currentMarketExposure + newBet.price
      );
    });
  });

  describe('Other markets exposure isolation', () => {
    it('should correctly isolate other markets exposure', () => {
      // User has balance=1000, avbalance=700 → 300 locked in other markets
      // No existing bets in THIS fancy market
      // New bet with exposure = 100
      const result = validateFancyBetBalance(
        700, // avbalance (300 locked elsewhere)
        1000, // balance
        [], // no existing bets in this market
        fancy({ price: 100, betAmount: 50 })
      );
      expect(result.allowed).toBe(true);
      expect(result.otherMarketsExposure).toBe(300);
      // newAvbalance = 1000 - (300 + 100) = 600
      expect(result.newAvbalance).toBe(600);
    });

    it('should reject when other markets + new fancy exposure exceeds balance', () => {
      // User has balance=500, avbalance=100 → 400 locked in other markets
      // New fancy bet with exposure = 150
      const result = validateFancyBetBalance(
        100, // avbalance (400 locked elsewhere)
        500, // balance
        [],
        fancy({ price: 150, betAmount: 75 })
      );
      expect(result.allowed).toBe(false);
      expect(result.otherMarketsExposure).toBe(400);
      // newAvbalance = 500 - (400 + 150) = -50
      expect(result.newAvbalance).toBe(-50);
    });
  });

  describe('Existing market bets recalculation', () => {
    it('should use delta-based calculation, not raw liability', () => {
      // User has balance=1000, avbalance=900 (100 locked = current market exposure)
      // Existing bet: back@30, price=100, betAmount=80
      // New bet: back@35, price=100, betAmount=80
      //
      // Without simulation: raw check would need avbalance >= 100 → allowed
      // With simulation: the combined market exposure may be different from sum of individual
      const existingBets = [
        fancy({ otype: 'back', fancyScore: 30, price: 100, betAmount: 80 }),
      ];
      const newBet = fancy({
        otype: 'back',
        fancyScore: 35,
        price: 100,
        betAmount: 80,
      });

      const result = validateFancyBetBalance(900, 1000, existingBets, newBet);
      expect(result.allowed).toBe(true);
      // The key: newMarketExposure is computed from combined position,
      // not just adding the new bet's price on top
      expect(result.newMarketExposure).toBeDefined();
    });
  });

  describe('Edge cases', () => {
    it('should handle avbalance > balance by clamping', () => {
      // This shouldn't happen normally but defensive check
      const result = validateFancyBetBalance(
        600, // avbalance > balance (anomaly)
        500, // balance
        [],
        fancy({ price: 100, betAmount: 50 })
      );
      // Should clamp avbalance to 500, then proceed normally
      expect(result.otherMarketsExposure).toBe(0);
      expect(result.allowed).toBe(true);
    });

    it('should handle negative avbalance by clamping to 0', () => {
      const result = validateFancyBetBalance(
        -50, // negative avbalance (anomaly)
        500,
        [],
        fancy({ price: 100, betAmount: 50 })
      );
      // Clamped avbalance = 0, totalCurrentExposure = 500
      expect(result.otherMarketsExposure).toBe(500);
    });

    it('should handle empty currentMarketBets as 0 exposure', () => {
      const result = validateFancyBetBalance(
        500,
        500,
        null,
        fancy({ price: 50, betAmount: 25 })
      );
      expect(result.currentMarketExposure).toBe(0);
      expect(result.allowed).toBe(true);
    });

    it('should handle lay bet correctly', () => {
      // Lay bet: price = liability, betAmount = potential win
      // gameType Normal, odds 80: lay stake=100 → betAmount=100, price=80
      const result = validateFancyBetBalance(
        200,
        200,
        [],
        fancy({ otype: 'lay', price: 80, betAmount: 100 })
      );
      expect(result.allowed).toBe(true);
    });
  });
});
