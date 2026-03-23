import { describe, expect, it } from 'vitest';

import {
  calculateAllExposure,
  calculateFancyExposure,
  calculateNonFancyMarketExposure,
  FANCY_GAME_TYPES,
  isFancyBet,
} from '../utils/exposureUtils.js';

describe('calculateAllExposure', () => {
  // ─── isFancyBet ────────────────────────────────────────────
  describe('isFancyBet', () => {
    it('detects all fancy game types', () => {
      for (const gt of FANCY_GAME_TYPES) {
        expect(isFancyBet({ gameType: gt })).toBe(true);
      }
    });

    it('returns false for sports/casino bets', () => {
      expect(isFancyBet({ gameType: 'Match Odds' })).toBe(false);
      expect(isFancyBet({ gameType: 'Bookmaker' })).toBe(false);
      expect(isFancyBet({ gameType: 'casino' })).toBe(false);
    });

    it('does NOT rely on betType (betType is never "fancy")', () => {
      // Even with betType='sports', if gameType is fancy it should detect
      expect(isFancyBet({ betType: 'sports', gameType: 'Normal' })).toBe(true);
      expect(isFancyBet({ betType: 'sports', gameType: 'Match Odds' })).toBe(
        false
      );
    });
  });

  // ─── Edge Cases ────────────────────────────────────────────
  describe('edge cases', () => {
    it('returns 0 for empty array', () => {
      expect(calculateAllExposure([])).toBe(0);
    });

    it('returns 0 for null/undefined', () => {
      expect(calculateAllExposure(null)).toBe(0);
      expect(calculateAllExposure(undefined)).toBe(0);
    });
  });

  // ─── Non-Fancy: Single Bet ────────────────────────────────
  describe('non-fancy: single bet', () => {
    it('single back bet exposure = price', () => {
      const bets = [
        {
          gameId: 'g1',
          marketName: 'Match Odds',
          teamName: 'Team A',
          otype: 'back',
          price: 200,
          betAmount: 100,
          betType: 'sports',
          gameType: 'Match Odds',
        },
      ];
      // Worst case: Team A loses → lose 200 (price)
      expect(calculateAllExposure(bets)).toBe(200);
    });

    it('single lay bet exposure = price', () => {
      const bets = [
        {
          gameId: 'g1',
          marketName: 'Match Odds',
          teamName: 'Team A',
          otype: 'lay',
          price: 150,
          betAmount: 50,
          betType: 'sports',
          gameType: 'Match Odds',
        },
      ];
      // Worst case: Team A wins → lose 150 (price/liability)
      expect(calculateAllExposure(bets)).toBe(150);
    });
  });

  // ─── Non-Fancy: Same Market Back+Lay Offsetting ───────────
  describe('non-fancy: same market back+lay offsetting', () => {
    it('back+lay on same team in same market reduces exposure', () => {
      const bets = [
        {
          gameId: 'g1',
          marketName: 'Match Odds',
          teamName: 'Team A',
          otype: 'back',
          price: 200,
          betAmount: 100,
          betType: 'sports',
          gameType: 'Match Odds',
        },
        {
          gameId: 'g1',
          marketName: 'Match Odds',
          teamName: 'Team A',
          otype: 'lay',
          price: 100,
          betAmount: 50,
          betType: 'sports',
          gameType: 'Match Odds',
        },
      ];
      // Scenario "Team A wins": back wins (+100), lay loses (-100) = 0
      // Scenario "__OTHER__": back loses (-200), lay wins (+50) = -150
      // Worst case = -150, exposure = 150
      // Simple sum would give 200+100 = 300 (WRONG)
      expect(calculateAllExposure(bets)).toBe(150);
    });

    it('back+lay on different teams in same market', () => {
      const bets = [
        {
          gameId: 'g1',
          marketName: 'Match Odds',
          teamName: 'Team A',
          otype: 'back',
          price: 200,
          betAmount: 100,
          betType: 'sports',
          gameType: 'Match Odds',
        },
        {
          gameId: 'g1',
          marketName: 'Match Odds',
          teamName: 'Team B',
          otype: 'lay',
          price: 100,
          betAmount: 50,
          betType: 'sports',
          gameType: 'Match Odds',
        },
      ];
      // Scenario "Team A wins": back wins (+100), lay wins (+50) = +150 → no loss
      // Scenario "Team B wins": back loses (-200), lay loses (-100) = -300
      // Worst case = -300, exposure = 300
      expect(calculateAllExposure(bets)).toBe(300);
    });
  });

  // ─── Non-Fancy: Different Markets (no offsetting) ─────────
  describe('non-fancy: different markets', () => {
    it('bets on different markets sum independently', () => {
      const bets = [
        {
          gameId: 'g1',
          marketName: 'Match Odds',
          teamName: 'Team A',
          otype: 'back',
          price: 200,
          betAmount: 100,
          betType: 'sports',
          gameType: 'Match Odds',
        },
        {
          gameId: 'g2',
          marketName: 'Match Odds',
          teamName: 'Team X',
          otype: 'back',
          price: 150,
          betAmount: 80,
          betType: 'sports',
          gameType: 'Match Odds',
        },
      ];
      // Different games → different markets → exposure = 200 + 150 = 350
      expect(calculateAllExposure(bets)).toBe(350);
    });
  });

  // ─── Fancy: scenario-based (hit/miss) ─────────────────────
  describe('fancy: scenario-based exposure', () => {
    it('single fancy back bet: exposure = price', () => {
      const bets = [
        {
          gameId: 'g1',
          teamName: '8 over run JK',
          otype: 'back',
          price: 200,
          betAmount: 100,
          betType: 'sports',
          gameType: 'Normal',
        },
      ];
      // Hit: +betAmount(100), Miss: -price(-200)
      // Worst = -200, exposure = 200
      expect(calculateAllExposure(bets)).toBe(200);
    });

    it('single fancy lay bet: exposure = price (worst-case loss)', () => {
      const bets = [
        {
          gameId: 'g1',
          teamName: '8 over run JK',
          otype: 'lay',
          price: 800,
          betAmount: 1000,
          betType: 'sports',
          gameType: 'Normal',
        },
      ];
      // Hit: -price(-800), Miss: +betAmount(1000)
      // Worst = -800, exposure = 800
      // OLD BUG: |1000 + 800| = 1800 (overcounted by 2.25x!)
      expect(calculateAllExposure(bets)).toBe(800);
    });

    it('fancy offset lay bet (negative betAmount): worst case is price', () => {
      const bets = [
        {
          gameId: 'g1',
          teamName: '8 over run JK',
          otype: 'lay',
          price: 100,
          betAmount: -50,
          betType: 'sports',
          gameType: 'Normal',
        },
      ];
      // Hit: -price(-100), Miss: +betAmount(-50) = -50
      // Both scenarios are losses! Worst = -100, exposure = 100
      expect(calculateAllExposure(bets)).toBe(100);
    });

    it('fancy back+lay on same market: offsetting reduces exposure', () => {
      const bets = [
        {
          gameId: 'g1',
          teamName: '8 over run JK',
          otype: 'back',
          price: 200,
          betAmount: 100,
          betType: 'sports',
          gameType: 'Normal',
        },
        {
          gameId: 'g1',
          teamName: '8 over run JK',
          otype: 'lay',
          price: 100,
          betAmount: 50,
          betType: 'sports',
          gameType: 'Normal',
        },
      ];
      // Hit: back wins(+100) + lay loses(-100) = 0
      // Miss: back loses(-200) + lay wins(+50) = -150
      // Worst = -150, exposure = 150
      expect(calculateAllExposure(bets)).toBe(150);
    });

    it('multiple fancy lay bets do NOT cause PTI negative (the original bug)', () => {
      // This is the exact scenario that caused PTI to go negative:
      // balance=10000, place two fancy lay bets
      const balance = 10000;
      const bets = [
        {
          gameId: 'g1',
          teamName: '6 over run',
          otype: 'lay',
          price: 4000, // stake=5000 * (80/100)
          betAmount: 5000,
          betType: 'sports',
          gameType: 'Normal',
        },
        {
          gameId: 'g1',
          teamName: '7 over run',
          otype: 'lay',
          price: 800, // stake=1000 * (80/100)
          betAmount: 1000,
          betType: 'sports',
          gameType: 'Normal',
        },
      ];
      const exposure = calculateAllExposure(bets);
      // "6 over run": Hit -4000, Miss +5000 → exposure = 4000
      // "7 over run": Hit -800, Miss +1000 → exposure = 800
      // Total = 4800
      expect(exposure).toBe(4800);
      // avbalance = 10000 - 4800 = 5200 (positive!)
      // OLD BUG: |5000+4000| + |1000+800| = 9000+1800 = 10800 → avbalance = -800 (NEGATIVE!)
      expect(balance - exposure).toBeGreaterThanOrEqual(0);
    });
  });

  // ─── Mixed: Fancy + Non-Fancy ─────────────────────────────
  describe('mixed: fancy + non-fancy', () => {
    it('adds fancy and non-fancy exposure together', () => {
      const bets = [
        // Non-fancy back bet: exposure = 200
        {
          gameId: 'g1',
          marketName: 'Match Odds',
          teamName: 'Team A',
          otype: 'back',
          price: 200,
          betAmount: 100,
          betType: 'sports',
          gameType: 'Match Odds',
        },
        // Fancy back bet: exposure = 150
        {
          gameId: 'g2',
          teamName: '7 over run',
          otype: 'back',
          price: 150,
          betAmount: 80,
          betType: 'sports',
          gameType: 'Normal',
        },
      ];
      // Non-fancy: 200, Fancy: 150
      expect(calculateAllExposure(bets)).toBe(350);
    });

    it('non-fancy offsetting does not affect fancy calculation', () => {
      const bets = [
        // Non-fancy back+lay on same market (offsetting)
        {
          gameId: 'g1',
          marketName: 'Match Odds',
          teamName: 'Team A',
          otype: 'back',
          price: 200,
          betAmount: 100,
          betType: 'sports',
          gameType: 'Match Odds',
        },
        {
          gameId: 'g1',
          marketName: 'Match Odds',
          teamName: 'Team A',
          otype: 'lay',
          price: 100,
          betAmount: 50,
          betType: 'sports',
          gameType: 'Match Odds',
        },
        // Fancy back bet
        {
          gameId: 'g2',
          teamName: '8 over run',
          otype: 'back',
          price: 300,
          betAmount: 150,
          betType: 'sports',
          gameType: 'Normal',
        },
      ];
      // Non-fancy: 150 (with offsetting), Fancy: 300
      // Simple sum would give 200+100+300 = 600 (WRONG)
      expect(calculateAllExposure(bets)).toBe(450);
    });
  });

  // ─── calculateNonFancyMarketExposure (unit) ───────────────
  describe('calculateNonFancyMarketExposure', () => {
    it('returns 0 for empty', () => {
      expect(calculateNonFancyMarketExposure([])).toBe(0);
    });

    it('handles the srijan1 case: 8-over back+lay', () => {
      // This is the exact bug scenario from production
      const bets = [
        {
          gameId: 'g1',
          marketName: 'Match Odds',
          teamName: '8 over run JK',
          otype: 'back',
          price: 200,
          betAmount: 100,
          betType: 'sports',
          gameType: 'Match Odds',
        },
        {
          gameId: 'g1',
          marketName: 'Match Odds',
          teamName: '8 over run JK',
          otype: 'lay',
          price: 100,
          betAmount: 50,
          betType: 'sports',
          gameType: 'Match Odds',
        },
      ];
      // With market-based: worst case = 150
      // Simple sum would be 300 (the bug)
      expect(calculateNonFancyMarketExposure(bets)).toBe(150);
    });
  });

  // ─── calculateFancyExposure (unit) ────────────────────────
  describe('calculateFancyExposure', () => {
    it('returns 0 for empty', () => {
      expect(calculateFancyExposure([])).toBe(0);
    });

    it('separate back markets sum independently', () => {
      const bets = [
        {
          gameId: 'g1',
          teamName: '6 over run',
          otype: 'back',
          price: 100,
          betAmount: 50,
        },
        {
          gameId: 'g1',
          teamName: '7 over run',
          otype: 'back',
          price: 200,
          betAmount: 80,
        },
      ];
      // Market 1: miss=-100, Market 2: miss=-200
      expect(calculateFancyExposure(bets)).toBe(300);
    });

    it('separate lay markets sum independently', () => {
      const bets = [
        {
          gameId: 'g1',
          teamName: '6 over run',
          otype: 'lay',
          price: 400,
          betAmount: 500,
        },
        {
          gameId: 'g1',
          teamName: '7 over run',
          otype: 'lay',
          price: 800,
          betAmount: 1000,
        },
      ];
      // Market 1: hit=-400, miss=+500 → exposure=400
      // Market 2: hit=-800, miss=+1000 → exposure=800
      // OLD BUG: |500+400| + |1000+800| = 900+1800 = 2700
      expect(calculateFancyExposure(bets)).toBe(1200);
    });

    it('guaranteed profit market (all scenarios positive) = 0 exposure', () => {
      const bets = [
        {
          gameId: 'g1',
          teamName: '6 over run',
          otype: 'back',
          price: 100,
          betAmount: 200,
        },
        {
          gameId: 'g1',
          teamName: '6 over run',
          otype: 'lay',
          price: 50,
          betAmount: 300,
        },
      ];
      // Hit: +200 (back wins) - 50 (lay loses) = +150
      // Miss: -100 (back loses) + 300 (lay wins) = +200
      // Both positive → no exposure
      expect(calculateFancyExposure(bets)).toBe(0);
    });
  });

  // ─── Multi-threshold (different fancyScores) ─────────────
  describe('calculateFancyExposure: multi-threshold gap zones', () => {
    it('back@high + lay@low (danger gap) — worst case is BOTH lose', () => {
      // Back at fancyScore=50, Lay at fancyScore=40
      // Gap zone (40 <= score < 50): both lose!
      const bets = [
        {
          gameId: 'g1',
          teamName: '6 over run',
          otype: 'back',
          price: 500,
          betAmount: 650,
          fancyScore: 50,
        },
        {
          gameId: 'g1',
          teamName: '6 over run',
          otype: 'lay',
          price: 325,
          betAmount: 250,
          fancyScore: 40,
        },
      ];
      // Thresholds: [40, 50] → 3 zones
      // Zone 0 (score < 40):  back misses(-500) + lay misses(+250) = -250
      // Zone 1 (40 ≤ s < 50): back misses(-500) + lay hits(-325)  = -825
      // Zone 2 (score ≥ 50):  back hits(+650)   + lay hits(-325)  = +325
      // Worst = -825, exposure = 825
      //
      // OLD BUG (2-scenario): hitNet=650-325=325, missNet=-500+250=-250 → exposure=250
      expect(calculateFancyExposure(bets)).toBe(825);
    });

    it('back@low + lay@high (proper hedge) — middle zone is profitable', () => {
      // Back at fancyScore=40, Lay at fancyScore=50
      // Middle zone (40 <= score < 50): both win!
      const bets = [
        {
          gameId: 'g1',
          teamName: '6 over run',
          otype: 'back',
          price: 100,
          betAmount: 130,
          fancyScore: 40,
        },
        {
          gameId: 'g1',
          teamName: '6 over run',
          otype: 'lay',
          price: 65,
          betAmount: 50,
          fancyScore: 50,
        },
      ];
      // Thresholds: [40, 50] → 3 zones
      // Zone 0 (score < 40):  back misses(-100) + lay misses(+50)  = -50
      // Zone 1 (40 ≤ s < 50): back hits(+130)   + lay misses(+50)  = +180
      // Zone 2 (score ≥ 50):  back hits(+130)   + lay hits(-65)    = +65
      // Worst = -50, exposure = 50
      expect(calculateFancyExposure(bets)).toBe(50);
    });

    it('three thresholds — 4 zones evaluated', () => {
      // back@30, lay@40, back@50 on same market
      const bets = [
        {
          gameId: 'g1',
          teamName: '6 over run',
          otype: 'back',
          price: 100,
          betAmount: 130,
          fancyScore: 30,
        },
        {
          gameId: 'g1',
          teamName: '6 over run',
          otype: 'lay',
          price: 200,
          betAmount: 150,
          fancyScore: 40,
        },
        {
          gameId: 'g1',
          teamName: '6 over run',
          otype: 'back',
          price: 300,
          betAmount: 390,
          fancyScore: 50,
        },
      ];
      // Thresholds: [30, 40, 50] → 4 zones
      // Zone 0 (s < 30):    back30 miss(-100) + lay40 miss(+150) + back50 miss(-300) = -250
      // Zone 1 (30 ≤ s <40): back30 hit(+130) + lay40 miss(+150) + back50 miss(-300) = -20
      // Zone 2 (40 ≤ s <50): back30 hit(+130) + lay40 hit(-200)  + back50 miss(-300) = -370
      // Zone 3 (s ≥ 50):     back30 hit(+130) + lay40 hit(-200)  + back50 hit(+390)  = +320
      // Worst = -370, exposure = 370
      expect(calculateFancyExposure(bets)).toBe(370);
    });

    it('same fancyScore bets still work (single threshold, 2 zones)', () => {
      const bets = [
        {
          gameId: 'g1',
          teamName: '6 over run',
          otype: 'back',
          price: 200,
          betAmount: 100,
          fancyScore: 40,
        },
        {
          gameId: 'g1',
          teamName: '6 over run',
          otype: 'lay',
          price: 100,
          betAmount: 50,
          fancyScore: 40,
        },
      ];
      // Thresholds: [40] → 2 zones (same as old hit/miss)
      // Zone 0 (s < 40):  -200 + 50 = -150
      // Zone 1 (s ≥ 40):  +100 - 100 = 0
      // Worst = -150, exposure = 150
      expect(calculateFancyExposure(bets)).toBe(150);
    });

    it('PTI stays safe with multi-threshold bets', () => {
      const balance = 10000;
      // back@50 + lay@40 → danger gap, exposure = 825
      const bets = [
        {
          gameId: 'g1',
          teamName: '6 over run',
          otype: 'back',
          price: 500,
          betAmount: 650,
          fancyScore: 50,
          gameType: 'Normal',
        },
        {
          gameId: 'g1',
          teamName: '6 over run',
          otype: 'lay',
          price: 325,
          betAmount: 250,
          fancyScore: 40,
          gameType: 'Normal',
        },
      ];
      const exposure = calculateAllExposure(bets);
      expect(exposure).toBe(825);
      expect(balance - exposure).toBeGreaterThanOrEqual(0);
    });

    it('mixed: multi-threshold fancy + sports bets', () => {
      const bets = [
        // Sports bet
        {
          gameId: 'g1',
          marketName: 'Match Odds',
          teamName: 'India',
          otype: 'back',
          price: 1000,
          betAmount: 800,
          betType: 'sports',
          gameType: 'Match Odds',
        },
        // Fancy: back@50 + lay@40 (danger gap = 825)
        {
          gameId: 'g1',
          teamName: '6 over run',
          otype: 'back',
          price: 500,
          betAmount: 650,
          fancyScore: 50,
          gameType: 'Normal',
        },
        {
          gameId: 'g1',
          teamName: '6 over run',
          otype: 'lay',
          price: 325,
          betAmount: 250,
          fancyScore: 40,
          gameType: 'Normal',
        },
      ];
      // Sports: 1000
      // Fancy: 825 (gap zone)
      // Total: 1825
      expect(calculateAllExposure(bets)).toBe(1825);
    });
  });
});
