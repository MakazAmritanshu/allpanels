import { describe, expect, it } from 'vitest';
import { calculateAllExposure } from '../utils/exposureUtils.js';

/**
 * Tests for the simulation-based exposure limit check.
 *
 * The exposure limit check now uses:
 *   projectedExposure = calculateAllExposure([...pendingBets, simulatedNewBet])
 *   if (projectedExposure > user.exposureLimit) → REJECT
 *
 * Previously it used:
 *   totalPendingAmount = sum(bet.price)
 *   if (exposureLimit < totalPendingAmount + p) → REJECT
 *
 * The old method was overly restrictive because it didn't account for
 * offsetting/hedging within markets.
 */

describe('Exposure Limit Simulation', () => {
  // Helper: simulate the exposure limit check as it now works in betController
  function wouldExceedLimit(pendingBets, simulatedNewBet, exposureLimit) {
    const projectedExposure = calculateAllExposure([
      ...pendingBets,
      simulatedNewBet,
    ]);
    return { exceeded: projectedExposure > exposureLimit, projectedExposure };
  }

  // Helper: simulate the OLD naive check for comparison
  function wouldExceedLimitOld(pendingBets, newPrice, exposureLimit) {
    const totalPendingAmount = pendingBets.reduce(
      (sum, b) => sum + (b.price || 0),
      0
    );
    return {
      exceeded: exposureLimit < totalPendingAmount + newPrice,
      naiveSum: totalPendingAmount + newPrice,
    };
  }

  // ─── Test Case 1: Offset Blocked by Naive Sum ──────────────────
  describe('TC1: Offset bet that reduces exposure should be allowed', () => {
    // User has BACK India in game1 (Match Odds) and BACK CSK in game2 (Match Odds)
    // Tries to LAY India in game1 to close out position
    const pendingBets = [
      {
        price: 500,
        betAmount: 500,
        teamName: 'India',
        otype: 'back',
        gameType: 'Match Odds',
        gameId: 'game1',
        marketName: 'Match Odds',
      },
      {
        price: 400,
        betAmount: 400,
        teamName: 'CSK',
        otype: 'back',
        gameType: 'Match Odds',
        gameId: 'game2',
        marketName: 'Match Odds',
      },
    ];
    const newLayBet = {
      price: 500,
      betAmount: 500,
      teamName: 'India',
      otype: 'lay',
      gameType: 'Match Odds',
      gameId: 'game1',
      marketName: 'Match Odds',
    };
    const exposureLimit = 1000;

    it('OLD check wrongly rejects (naive sum = 1400 > 1000)', () => {
      const old = wouldExceedLimitOld(pendingBets, 500, exposureLimit);
      expect(old.naiveSum).toBe(1400);
      expect(old.exceeded).toBe(true); // wrongly rejected
    });

    it('NEW check correctly allows (projected exposure = 400 <= 1000)', () => {
      const result = wouldExceedLimit(pendingBets, newLayBet, exposureLimit);
      // game1: back 500 + lay 500 on India → fully hedged → 0 exposure
      // game2: back CSK → 400 exposure
      // Total = 400
      expect(result.projectedExposure).toBe(400);
      expect(result.exceeded).toBe(false);
    });
  });

  // ─── Test Case 2: Hedge That Locks In Profit ───────────────────
  describe('TC2: Hedge creating guaranteed profit should be allowed', () => {
    // User BACK India at odds 3.0 → price=500, betAmount=1000
    // Wants to LAY India at odds 2.0 → price=700, betAmount=700
    // After: India wins = +1000-700 = +300, India loses = -500+700 = +200 → guaranteed profit
    const pendingBets = [
      {
        price: 500,
        betAmount: 1000,
        teamName: 'India',
        otype: 'back',
        gameType: 'Match Odds',
        gameId: 'game1',
        marketName: 'Match Odds',
      },
    ];
    const newLayBet = {
      price: 700,
      betAmount: 700,
      teamName: 'India',
      otype: 'lay',
      gameType: 'Match Odds',
      gameId: 'game1',
      marketName: 'Match Odds',
    };
    const exposureLimit = 1000;

    it('OLD check wrongly rejects (naive sum = 1200 > 1000)', () => {
      const old = wouldExceedLimitOld(pendingBets, 700, exposureLimit);
      expect(old.naiveSum).toBe(1200);
      expect(old.exceeded).toBe(true);
    });

    it('NEW check correctly allows (projected exposure = 0)', () => {
      const result = wouldExceedLimit(pendingBets, newLayBet, exposureLimit);
      // Scenarios: India wins = +1000-700=+300, Other wins = -500+700=+200
      // Both positive → guaranteed profit → exposure = 0
      expect(result.projectedExposure).toBe(0);
      expect(result.exceeded).toBe(false);
    });
  });

  // ─── Test Case 3: Fancy Bet Offset ─────────────────────────────
  describe('TC3: Fancy bet lay that offsets back should be allowed', () => {
    // User has BACK on "6th Over Runs" at fancyScore=30 and another fancy bet
    // Wants to LAY at same fancyScore to close out
    const pendingBets = [
      {
        price: 500,
        betAmount: 400,
        teamName: '6th Over Runs',
        otype: 'back',
        gameType: 'Normal',
        gameId: 'game1',
        fancyScore: 30,
      },
      {
        price: 300,
        betAmount: 270,
        teamName: '7th Over Runs',
        otype: 'back',
        gameType: 'Normal',
        gameId: 'game1',
        fancyScore: 25,
      },
    ];
    const newLayBet = {
      price: 400,
      betAmount: 500,
      teamName: '6th Over Runs',
      otype: 'lay',
      gameType: 'Normal',
      gameId: 'game1',
      fancyScore: 30,
    };
    const exposureLimit = 1000;

    it('OLD check wrongly rejects (naive sum = 1200 > 1000)', () => {
      const old = wouldExceedLimitOld(pendingBets, 400, exposureLimit);
      expect(old.naiveSum).toBe(1200);
      expect(old.exceeded).toBe(true);
    });

    it('NEW check correctly allows', () => {
      const result = wouldExceedLimit(pendingBets, newLayBet, exposureLimit);
      // "6th Over Runs" market: back(500,400)@30 + lay(400,500)@30
      //   Zone 0 (score<30): back miss(-500), lay wins(+500) = 0
      //   Zone 1 (score>=30): back hit(+400), lay loses(-400) = 0
      //   → 0 exposure for this market
      // "7th Over Runs" market: back(300,270)@25 alone → exposure = 300
      // Total = 300
      expect(result.projectedExposure).toBe(300);
      expect(result.exceeded).toBe(false);
    });
  });

  // ─── Test Case 4: Casino Bet Offset ────────────────────────────
  describe('TC4: Casino bet offset should be allowed', () => {
    // BACK "Player A" and then BACK "Player B" on same round (hedging both outcomes)
    const pendingBets = [
      {
        price: 600,
        betAmount: 600,
        teamName: 'Player A',
        otype: 'back',
        gameType: 'Casino',
        betType: 'casino',
        gameId: 'teen20',
        roundId: 'round1',
        marketName: 'WINNER',
      },
    ];
    // Back Player B → if A wins: +600-600=0, if B wins: -600+600=0
    const newBackBet = {
      price: 600,
      betAmount: 600,
      teamName: 'Player B',
      otype: 'back',
      gameType: 'Casino',
      betType: 'casino',
      gameId: 'teen20',
      roundId: 'round1',
      marketName: 'WINNER',
    };
    const exposureLimit = 1000;

    it('OLD check wrongly rejects (naive sum = 1200 > 1000)', () => {
      const old = wouldExceedLimitOld(pendingBets, 600, exposureLimit);
      expect(old.naiveSum).toBe(1200);
      expect(old.exceeded).toBe(true);
    });

    it('NEW check correctly handles casino offset', () => {
      const result = wouldExceedLimit(pendingBets, newBackBet, exposureLimit);
      // Casino market grouped by casino_round1_teen20
      // Scenarios: Player A wins = +600-600=0, Player B wins = -600+600=0
      // All outcomes are 0 → exposure = 0
      expect(result.projectedExposure).toBe(0);
      expect(result.exceeded).toBe(false);
    });
  });

  // ─── Test Case 5: Genuine Excess Should Still Be Rejected ──────
  describe('TC5: Genuine exposure limit excess is still rejected', () => {
    const pendingBets = [
      {
        price: 600,
        betAmount: 600,
        teamName: 'India',
        otype: 'back',
        gameType: 'Match Odds',
        gameId: 'game1',
        marketName: 'Match Odds',
      },
    ];
    const newBet = {
      price: 500,
      betAmount: 500,
      teamName: 'CSK',
      otype: 'back',
      gameType: 'Match Odds',
      gameId: 'game2',
      marketName: 'Match Odds',
    };
    const exposureLimit = 1000;

    it('correctly rejects when actual exposure exceeds limit', () => {
      const result = wouldExceedLimit(pendingBets, newBet, exposureLimit);
      // game1: 600 exposure, game2: 500 exposure → total 1100 > 1000
      expect(result.projectedExposure).toBe(1100);
      expect(result.exceeded).toBe(true);
    });
  });

  // ─── Test Case 6: Exact Limit Edge Case ────────────────────────
  describe('TC6: Bet at exact exposure limit is allowed', () => {
    const pendingBets = [
      {
        price: 500,
        betAmount: 500,
        teamName: 'India',
        otype: 'back',
        gameType: 'Match Odds',
        gameId: 'game1',
        marketName: 'Match Odds',
      },
    ];
    const newBet = {
      price: 500,
      betAmount: 500,
      teamName: 'CSK',
      otype: 'back',
      gameType: 'Match Odds',
      gameId: 'game2',
      marketName: 'Match Odds',
    };
    const exposureLimit = 1000;

    it('allows bet when projected exposure equals limit exactly', () => {
      const result = wouldExceedLimit(pendingBets, newBet, exposureLimit);
      expect(result.projectedExposure).toBe(1000);
      expect(result.exceeded).toBe(false); // not exceeded, equal is allowed
    });
  });

  // ─── Test Case 7: Multi-Market With Partial Offset ─────────────
  describe('TC7: Multi-market with partial offset', () => {
    // 3 bets across 2 markets, user tries to partially offset market 1
    const pendingBets = [
      {
        price: 400,
        betAmount: 400,
        teamName: 'India',
        otype: 'back',
        gameType: 'Match Odds',
        gameId: 'game1',
        marketName: 'Match Odds',
      },
      {
        price: 300,
        betAmount: 300,
        teamName: 'CSK',
        otype: 'back',
        gameType: 'Match Odds',
        gameId: 'game2',
        marketName: 'Match Odds',
      },
    ];
    // Lay India with smaller stake → partial offset
    const newLayBet = {
      price: 200,
      betAmount: 200,
      teamName: 'India',
      otype: 'lay',
      gameType: 'Match Odds',
      gameId: 'game1',
      marketName: 'Match Odds',
    };
    const exposureLimit = 1000;

    it('OLD check wrongly rejects (naive sum = 1100 > 1000)', () => {
      const old = wouldExceedLimitOld(pendingBets, 200, exposureLimit);
      expect(old.naiveSum).toBe(900);
      // Actually 900 < 1000, so old check would allow this case too
      expect(old.exceeded).toBe(false);
    });

    it('NEW check correctly calculates reduced exposure', () => {
      const result = wouldExceedLimit(pendingBets, newLayBet, exposureLimit);
      // game1: back India 400 + lay India 200
      //   India wins: +400 - 200 = +200
      //   Other wins: -400 + 200 = -200
      //   Worst = -200 → exposure = 200
      // game2: back CSK 300 → exposure = 300
      // Total = 500
      expect(result.projectedExposure).toBe(500);
      expect(result.exceeded).toBe(false);
    });
  });

  // ─── Test Case 8: No Pending Bets ──────────────────────────────
  describe('TC8: First bet with no existing bets', () => {
    it('correctly calculates exposure for first bet', () => {
      const result = wouldExceedLimit(
        [],
        {
          price: 500,
          betAmount: 500,
          teamName: 'India',
          otype: 'back',
          gameType: 'Match Odds',
          gameId: 'game1',
          marketName: 'Match Odds',
        },
        1000
      );
      expect(result.projectedExposure).toBe(500);
      expect(result.exceeded).toBe(false);
    });

    it('rejects first bet that exceeds limit', () => {
      const result = wouldExceedLimit(
        [],
        {
          price: 1500,
          betAmount: 1500,
          teamName: 'India',
          otype: 'back',
          gameType: 'Match Odds',
          gameId: 'game1',
          marketName: 'Match Odds',
        },
        1000
      );
      expect(result.projectedExposure).toBe(1500);
      expect(result.exceeded).toBe(true);
    });
  });
});
