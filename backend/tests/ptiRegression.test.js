/**
 * PTI (Available Balance) Regression Tests
 *
 * Simulates a user with balance=10000 placing multiple fancy and non-fancy bets.
 * After each bet, verifies:
 *   1. exposure = calculateAllExposure(allPendingBets)
 *   2. avbalance = balance - exposure
 *   3. avbalance >= 0 (PTI never goes negative)
 *
 * These tests caught the bug where calculateTotalMarketExposure used
 * betType === 'fancy' (never matches) causing fancy bets to be treated
 * as non-fancy, producing inflated exposure and negative PTI.
 */
import { describe, expect, it } from 'vitest';

import { calculateAllExposure } from '../utils/exposureUtils.js';

// Helper: simulate user state after placing bets
function checkPTI(balance, pendingBets, label) {
  const exposure = calculateAllExposure(pendingBets);
  const avbalance = balance - exposure;
  return { exposure, avbalance, label };
}

describe('PTI Regression: balance=10000, mixed fancy+sports bets', () => {
  const BALANCE = 10000;

  // ─── Scenario 1: Sports only, progressive bets ──────────────
  describe('Scenario 1: Sports bets only', () => {
    const pendingBets = [];

    it('Step 1: Back Team A @ 2.0, stake 1000 → exposure=1000, PTI=9000', () => {
      pendingBets.push({
        gameId: 'cricket1',
        marketName: 'Match Odds',
        teamName: 'India',
        otype: 'back',
        price: 1000,
        betAmount: 1000,
        betType: 'sports',
        gameType: 'Match Odds',
      });
      const { exposure, avbalance } = checkPTI(BALANCE, pendingBets);
      expect(exposure).toBe(1000);
      expect(avbalance).toBe(9000);
      expect(avbalance).toBeGreaterThanOrEqual(0);
    });

    it('Step 2: Lay India @ 1.8, stake 800 on same market → exposure reduces via offsetting', () => {
      pendingBets.push({
        gameId: 'cricket1',
        marketName: 'Match Odds',
        teamName: 'India',
        otype: 'lay',
        price: 800,
        betAmount: 640,
        betType: 'sports',
        gameType: 'Match Odds',
      });
      const { exposure, avbalance } = checkPTI(BALANCE, pendingBets);
      // Scenario "India wins": back wins (+1000) + lay loses (-800) = +200
      // Scenario "__OTHER__": back loses (-1000) + lay wins (+640) = -360
      // Worst case = -360, exposure = 360
      expect(exposure).toBe(360);
      expect(avbalance).toBe(9640);
      expect(avbalance).toBeGreaterThanOrEqual(0);
    });

    it('Step 3: Back Australia on different game → exposures sum independently', () => {
      pendingBets.push({
        gameId: 'cricket2',
        marketName: 'Match Odds',
        teamName: 'Australia',
        otype: 'back',
        price: 2000,
        betAmount: 1500,
        betType: 'sports',
        gameType: 'Match Odds',
      });
      const { exposure, avbalance } = checkPTI(BALANCE, pendingBets);
      // Game 1: 360 (from step 2), Game 2: 2000
      expect(exposure).toBe(2360);
      expect(avbalance).toBe(7640);
      expect(avbalance).toBeGreaterThanOrEqual(0);
    });
  });

  // ─── Scenario 2: Fancy only, progressive bets ──────────────
  describe('Scenario 2: Fancy bets only', () => {
    const pendingBets = [];

    it('Step 1: Fancy back 6 over run, price=500 → exposure=500', () => {
      pendingBets.push({
        gameId: 'cricket1',
        teamName: '6 over run IND',
        otype: 'back',
        price: 500,
        betAmount: 250,
        betType: 'sports',
        gameType: 'Normal',
      });
      const { exposure, avbalance } = checkPTI(BALANCE, pendingBets);
      expect(exposure).toBe(500);
      expect(avbalance).toBe(9500);
      expect(avbalance).toBeGreaterThanOrEqual(0);
    });

    it('Step 2: Fancy back 7 over run (different market) → exposures add', () => {
      pendingBets.push({
        gameId: 'cricket1',
        teamName: '7 over run IND',
        otype: 'back',
        price: 800,
        betAmount: 400,
        betType: 'sports',
        gameType: 'Normal',
      });
      const { exposure, avbalance } = checkPTI(BALANCE, pendingBets);
      // Market 1: 500, Market 2: 800
      expect(exposure).toBe(1300);
      expect(avbalance).toBe(8700);
      expect(avbalance).toBeGreaterThanOrEqual(0);
    });

    it('Step 3: Fancy lay 6 over run (same market as step 1) → worst-case logic', () => {
      pendingBets.push({
        gameId: 'cricket1',
        teamName: '6 over run IND',
        otype: 'lay',
        price: 300,
        betAmount: 150,
        betType: 'sports',
        gameType: 'Normal',
      });
      const { exposure, avbalance } = checkPTI(BALANCE, pendingBets);
      // Market "6 over run IND": hit=250-300=-50, miss=-500+150=-350 → exposure=350
      // Market "7 over run IND": miss=-800 → exposure=800
      // Total = 350 + 800 = 1150
      expect(exposure).toBe(1150);
      expect(avbalance).toBe(8850);
      expect(avbalance).toBeGreaterThanOrEqual(0);
    });

    it('Step 4: More fancy bets across different game types', () => {
      pendingBets.push({
        gameId: 'cricket1',
        teamName: '10 over run IND',
        otype: 'back',
        price: 1200,
        betAmount: 600,
        betType: 'sports',
        gameType: 'meter',
      });
      pendingBets.push({
        gameId: 'cricket1',
        teamName: '10 over run IND',
        otype: 'lay',
        price: 700,
        betAmount: 350,
        betType: 'sports',
        gameType: 'meter',
      });
      const { exposure, avbalance } = checkPTI(BALANCE, pendingBets);
      // "6 over run IND": hit=-50, miss=-350 → exposure=350
      // "7 over run IND": miss=-800 → exposure=800
      // "10 over run IND": hit=600-700=-100, miss=-1200+350=-850 → exposure=850
      // Total = 350 + 800 + 850 = 2000
      expect(exposure).toBe(2000);
      expect(avbalance).toBe(8000);
      expect(avbalance).toBeGreaterThanOrEqual(0);
    });
  });

  // ─── Scenario 3: THE KEY BUG — Mixed fancy + sports ────────
  describe('Scenario 3: Mixed fancy + sports (the bug that caused negative PTI)', () => {
    const pendingBets = [];

    it('Step 1: Sports back India, price=1500 → exposure=1500', () => {
      pendingBets.push({
        gameId: 'cricket1',
        marketName: 'Match Odds',
        teamName: 'India',
        otype: 'back',
        price: 1500,
        betAmount: 1200,
        betType: 'sports',
        gameType: 'Match Odds',
      });
      const { exposure, avbalance } = checkPTI(BALANCE, pendingBets);
      expect(exposure).toBe(1500);
      expect(avbalance).toBe(8500);
      expect(avbalance).toBeGreaterThanOrEqual(0);
    });

    it('Step 2: Fancy back 8 over run, price=2000 → total=3500', () => {
      pendingBets.push({
        gameId: 'cricket1',
        teamName: '8 over run IND',
        otype: 'back',
        price: 2000,
        betAmount: 1000,
        betType: 'sports',
        gameType: 'Normal',
      });
      const { exposure, avbalance } = checkPTI(BALANCE, pendingBets);
      // Sports: 1500, Fancy: 2000
      expect(exposure).toBe(3500);
      expect(avbalance).toBe(6500);
      expect(avbalance).toBeGreaterThanOrEqual(0);
    });

    it('Step 3: Sports lay India on same market → sports reduces, fancy unchanged', () => {
      pendingBets.push({
        gameId: 'cricket1',
        marketName: 'Match Odds',
        teamName: 'India',
        otype: 'lay',
        price: 1000,
        betAmount: 800,
        betType: 'sports',
        gameType: 'Match Odds',
      });
      const { exposure, avbalance } = checkPTI(BALANCE, pendingBets);
      // Sports "Match Odds" market:
      //   India wins: back(+1200) + lay(-1000) = +200
      //   OTHER: back(-1500) + lay(+800) = -700
      //   Worst = -700, exposure = 700
      // Fancy: 2000
      // Total = 700 + 2000 = 2700
      expect(exposure).toBe(2700);
      expect(avbalance).toBe(7300);
      expect(avbalance).toBeGreaterThanOrEqual(0);
    });

    it('Step 4: Fancy lay 8 over run → fancy reduces, sports unchanged', () => {
      pendingBets.push({
        gameId: 'cricket1',
        teamName: '8 over run IND',
        otype: 'lay',
        price: 1500,
        betAmount: 750,
        betType: 'sports',
        gameType: 'Normal',
      });
      const { exposure, avbalance } = checkPTI(BALANCE, pendingBets);
      // Sports: 700 (unchanged)
      // Fancy "8 over run IND":
      //   hit=1000-1500=-500, miss=-2000+750=-1250
      //   worstCase=-1250, exposure=1250
      // Total = 700 + 1250 = 1950
      expect(exposure).toBe(1950);
      expect(avbalance).toBe(8050);
      expect(avbalance).toBeGreaterThanOrEqual(0);
    });

    it('Step 5: Add another fancy market + another sports game', () => {
      // Fancy on different market
      pendingBets.push({
        gameId: 'cricket1',
        teamName: '15 over run IND',
        otype: 'back',
        price: 1000,
        betAmount: 500,
        betType: 'sports',
        gameType: 'Normal',
      });
      // Sports on different game
      pendingBets.push({
        gameId: 'cricket2',
        marketName: 'Match Odds',
        teamName: 'England',
        otype: 'back',
        price: 500,
        betAmount: 400,
        betType: 'sports',
        gameType: 'Match Odds',
      });
      const { exposure, avbalance } = checkPTI(BALANCE, pendingBets);
      // Sports game1 "Match Odds": 700
      // Sports game2 "Match Odds": 500
      // Fancy "8 over run IND": 1250
      // Fancy "15 over run IND": 1000
      // Total = 700 + 500 + 1250 + 1000 = 3450
      expect(exposure).toBe(3450);
      expect(avbalance).toBe(6550);
      expect(avbalance).toBeGreaterThanOrEqual(0);
    });
  });

  // ─── Scenario 4: Simulate srijan1 exact production scenario ─
  describe('Scenario 4: srijan1 production scenario (8-over back+lay + 7-over)', () => {
    it('8-over back + 8-over lay + 7-over back = correct exposure', () => {
      const pendingBets = [
        // 8-over back (fancy)
        {
          gameId: 'g1',
          teamName: '8 over run JK',
          otype: 'back',
          price: 200,
          betAmount: 100,
          betType: 'sports',
          gameType: 'Normal',
        },
        // 8-over lay (fancy)
        {
          gameId: 'g1',
          teamName: '8 over run JK',
          otype: 'lay',
          price: 100,
          betAmount: 50,
          betType: 'sports',
          gameType: 'Normal',
        },
        // 7-over back (fancy)
        {
          gameId: 'g1',
          teamName: '7 over run JK',
          otype: 'back',
          price: 182,
          betAmount: 100,
          betType: 'sports',
          gameType: 'Normal',
        },
      ];

      const exposure = calculateAllExposure(pendingBets);
      // "8 over run JK": hit=100-100=0, miss=-200+50=-150 → exposure=150
      // "7 over run JK": miss=-182 → exposure=182
      // Total = 150 + 182 = 332
      expect(exposure).toBe(332);

      const avbalance = BALANCE - exposure;
      expect(avbalance).toBe(9668);
      expect(avbalance).toBeGreaterThanOrEqual(0);
    });

    it('after 7-over settles, only 8-over bets remain', () => {
      // Only 8-over bets remain (7-over settled)
      const pendingBets = [
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

      const exposure = calculateAllExposure(pendingBets);
      // "8 over run JK": hit=100-100=0, miss=-200+50=-150 → exposure=150
      // The OLD bug: simple sum = 200 + 100 = 300 (WRONG)
      expect(exposure).toBe(150);

      const avbalance = BALANCE - exposure;
      expect(avbalance).toBe(9850);
      expect(avbalance).toBeGreaterThanOrEqual(0);
    });
  });

  // ─── Scenario 5: Heavy mixed load — stress test ─────────────
  describe('Scenario 5: Heavy mixed load (10 bets, 3 games, fancy+sports)', () => {
    it('PTI never goes negative with 10 diverse bets', () => {
      const pendingBets = [
        // Game 1 - Match Odds (sports)
        {
          gameId: 'g1',
          marketName: 'Match Odds',
          teamName: 'CSK',
          otype: 'back',
          price: 500,
          betAmount: 400,
          betType: 'sports',
          gameType: 'Match Odds',
        },
        {
          gameId: 'g1',
          marketName: 'Match Odds',
          teamName: 'CSK',
          otype: 'lay',
          price: 300,
          betAmount: 240,
          betType: 'sports',
          gameType: 'Match Odds',
        },
        {
          gameId: 'g1',
          marketName: 'Match Odds',
          teamName: 'MI',
          otype: 'back',
          price: 200,
          betAmount: 600,
          betType: 'sports',
          gameType: 'Match Odds',
        },

        // Game 1 - Fancy markets
        {
          gameId: 'g1',
          teamName: '6 over run',
          otype: 'back',
          price: 400,
          betAmount: 200,
          betType: 'sports',
          gameType: 'Normal',
        },
        {
          gameId: 'g1',
          teamName: '6 over run',
          otype: 'lay',
          price: 250,
          betAmount: 125,
          betType: 'sports',
          gameType: 'Normal',
        },
        {
          gameId: 'g1',
          teamName: '10 over run',
          otype: 'back',
          price: 600,
          betAmount: 300,
          betType: 'sports',
          gameType: 'meter',
        },

        // Game 2 - Match Odds (sports)
        {
          gameId: 'g2',
          marketName: 'Match Odds',
          teamName: 'RCB',
          otype: 'back',
          price: 350,
          betAmount: 280,
          betType: 'sports',
          gameType: 'Match Odds',
        },

        // Game 2 - Bookmaker (sports, different market)
        {
          gameId: 'g2',
          marketName: 'Bookmaker',
          teamName: 'RCB',
          otype: 'lay',
          price: 150,
          betAmount: 120,
          betType: 'sports',
          gameType: 'Bookmaker',
        },

        // Game 2 - Fancy
        {
          gameId: 'g2',
          teamName: '8 over run',
          otype: 'back',
          price: 300,
          betAmount: 150,
          betType: 'sports',
          gameType: 'Normal',
        },
        {
          gameId: 'g2',
          teamName: '8 over run',
          otype: 'lay',
          price: 200,
          betAmount: 100,
          betType: 'sports',
          gameType: 'Normal',
        },
      ];

      const exposure = calculateAllExposure(pendingBets);

      // === Non-fancy markets ===

      // Game 1 Match Odds (2 teams: CSK, MI — no __OTHER__):
      //   CSK wins: CSK back(+400) + CSK lay(-300) + MI back(-200) = -100
      //   MI wins: CSK back(-500) + CSK lay(+240) + MI back(+600) = +340
      //   Worst = -100, exposure = 100
      const g1MatchOdds = 100;

      // Game 2 Match Odds (1 team: RCB):
      //   RCB wins: +280
      //   OTHER: -350
      //   Worst = -350, exposure = 350
      const g2MatchOdds = 350;

      // Game 2 Bookmaker (1 team: RCB):
      //   RCB wins: lay loses -150
      //   OTHER: lay wins +120
      //   Worst = -150, exposure = 150
      const g2Bookmaker = 150;

      const totalNonFancy = g1MatchOdds + g2MatchOdds + g2Bookmaker;

      // === Fancy markets (scenario-based: hit/miss) ===

      // Game 1 "6 over run": hit=200-250=-50, miss=-400+125=-275 → exposure=275
      const g1_6over = 275;

      // Game 1 "10 over run": miss=-600 → exposure=600
      const g1_10over = 600;

      // Game 2 "8 over run": hit=150-200=-50, miss=-300+100=-200 → exposure=200
      const g2_8over = 200;

      const totalFancy = g1_6over + g1_10over + g2_8over;

      const expectedExposure = totalNonFancy + totalFancy;
      // 100 + 350 + 150 + 275 + 600 + 200 = 1675
      expect(expectedExposure).toBe(1675);
      expect(exposure).toBe(expectedExposure);

      const avbalance = BALANCE - exposure;
      expect(avbalance).toBe(8325);
      expect(avbalance).toBeGreaterThanOrEqual(0);
    });
  });

  // ─── Scenario 6: Edge — all fancy game types ────────────────
  describe('Scenario 6: All 5 fancy game types in one session', () => {
    it('each fancy game type is correctly detected and calculated', () => {
      const pendingBets = [
        {
          gameId: 'g1',
          teamName: '6 over run',
          otype: 'back',
          price: 100,
          betAmount: 50,
          betType: 'sports',
          gameType: 'Normal',
        },
        {
          gameId: 'g1',
          teamName: 'runs meter',
          otype: 'back',
          price: 200,
          betAmount: 100,
          betType: 'sports',
          gameType: 'meter',
        },
        {
          gameId: 'g1',
          teamName: 'boundary line',
          otype: 'back',
          price: 300,
          betAmount: 150,
          betType: 'sports',
          gameType: 'line',
        },
        {
          gameId: 'g1',
          teamName: '5th ball',
          otype: 'back',
          price: 400,
          betAmount: 200,
          betType: 'sports',
          gameType: 'ball',
        },
        {
          gameId: 'g1',
          teamName: 'khado market',
          otype: 'back',
          price: 500,
          betAmount: 250,
          betType: 'sports',
          gameType: 'khado',
        },
        // Plus a sports bet to verify separation
        {
          gameId: 'g1',
          marketName: 'Match Odds',
          teamName: 'India',
          otype: 'back',
          price: 150,
          betAmount: 120,
          betType: 'sports',
          gameType: 'Match Odds',
        },
      ];

      const exposure = calculateAllExposure(pendingBets);
      // Fancy: 100 + 200 + 300 + 400 + 500 = 1500
      // Sports: 150
      // Total = 1650
      expect(exposure).toBe(1650);

      const avbalance = BALANCE - exposure;
      expect(avbalance).toBe(8350);
      expect(avbalance).toBeGreaterThanOrEqual(0);
    });
  });

  // ─── Scenario 7: Progressive bets until near-limit ──────────
  describe('Scenario 7: Fill up balance to near-limit, PTI stays >= 0', () => {
    it('placing bets that use almost all balance → PTI stays positive', () => {
      const pendingBets = [
        // Sports: 3000 exposure
        {
          gameId: 'g1',
          marketName: 'Match Odds',
          teamName: 'India',
          otype: 'back',
          price: 3000,
          betAmount: 2400,
          betType: 'sports',
          gameType: 'Match Odds',
        },
        // Fancy: 3000 exposure
        {
          gameId: 'g1',
          teamName: '6 over run',
          otype: 'back',
          price: 3000,
          betAmount: 1500,
          betType: 'sports',
          gameType: 'Normal',
        },
        // Sports game 2: 2000 exposure
        {
          gameId: 'g2',
          marketName: 'Match Odds',
          teamName: 'England',
          otype: 'back',
          price: 2000,
          betAmount: 1600,
          betType: 'sports',
          gameType: 'Match Odds',
        },
        // Fancy game 2: 1500 exposure
        {
          gameId: 'g2',
          teamName: '10 over run',
          otype: 'back',
          price: 1500,
          betAmount: 750,
          betType: 'sports',
          gameType: 'Normal',
        },
      ];

      const exposure = calculateAllExposure(pendingBets);
      // Sports: 3000 + 2000 = 5000
      // Fancy: 3000 + 1500 = 4500
      // Total = 9500
      expect(exposure).toBe(9500);

      const avbalance = BALANCE - exposure;
      expect(avbalance).toBe(500);
      expect(avbalance).toBeGreaterThanOrEqual(0);
    });
  });

  // ─── Scenario 8: Verify offsetting keeps PTI positive ───────
  describe('Scenario 8: Large bets with offsetting keep PTI positive', () => {
    it('back+lay offsetting on sports prevents over-counting', () => {
      const pendingBets = [
        // Large sports back
        {
          gameId: 'g1',
          marketName: 'Match Odds',
          teamName: 'India',
          otype: 'back',
          price: 8000,
          betAmount: 6400,
          betType: 'sports',
          gameType: 'Match Odds',
        },
        // Large sports lay on same team (offsets!)
        {
          gameId: 'g1',
          marketName: 'Match Odds',
          teamName: 'India',
          otype: 'lay',
          price: 7500,
          betAmount: 6000,
          betType: 'sports',
          gameType: 'Match Odds',
        },
        // Fancy bet
        {
          gameId: 'g1',
          teamName: '8 over run',
          otype: 'back',
          price: 1000,
          betAmount: 500,
          betType: 'sports',
          gameType: 'Normal',
        },
      ];

      const exposure = calculateAllExposure(pendingBets);
      // Sports "Match Odds":
      //   India wins: back(+6400) + lay(-7500) = -1100
      //   OTHER: back(-8000) + lay(+6000) = -2000
      //   Worst = -2000, exposure = 2000
      // Fancy: 1000
      // Total = 3000
      //
      // WITHOUT offsetting (simple sum): 8000 + 7500 + 1000 = 16500 → PTI = -6500 (BUG!)
      expect(exposure).toBe(3000);

      const avbalance = BALANCE - exposure;
      expect(avbalance).toBe(7000);
      expect(avbalance).toBeGreaterThanOrEqual(0);
    });

    it('back+lay offsetting on fancy prevents over-counting', () => {
      const pendingBets = [
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
        // Large fancy back
        {
          gameId: 'g1',
          teamName: '8 over run',
          otype: 'back',
          price: 6000,
          betAmount: 3000,
          betType: 'sports',
          gameType: 'Normal',
        },
        // Large fancy lay on same market
        {
          gameId: 'g1',
          teamName: '8 over run',
          otype: 'lay',
          price: 5500,
          betAmount: 2750,
          betType: 'sports',
          gameType: 'Normal',
        },
      ];

      const exposure = calculateAllExposure(pendingBets);
      // Sports: 1000
      // Fancy "8 over run": hit=3000-5500=-2500, miss=-6000+2750=-3250
      //   worstCase=-3250, exposure=3250
      // Total = 1000 + 3250 = 4250
      expect(exposure).toBe(4250);

      const avbalance = BALANCE - exposure;
      expect(avbalance).toBe(5750);
      expect(avbalance).toBeGreaterThanOrEqual(0);
    });
  });

  // ─── Scenario 9: Settlement simulation ──────────────────────
  describe('Scenario 9: Place 6 bets, settle 2, verify exposure recalculation', () => {
    it('exposure correctly drops after bets are settled (removed from pending)', () => {
      // Initial: 6 pending bets
      const allBets = [
        {
          id: 'b1',
          gameId: 'g1',
          marketName: 'Match Odds',
          teamName: 'India',
          otype: 'back',
          price: 1000,
          betAmount: 800,
          betType: 'sports',
          gameType: 'Match Odds',
        },
        {
          id: 'b2',
          gameId: 'g1',
          marketName: 'Match Odds',
          teamName: 'India',
          otype: 'lay',
          price: 600,
          betAmount: 480,
          betType: 'sports',
          gameType: 'Match Odds',
        },
        {
          id: 'b3',
          gameId: 'g1',
          teamName: '7 over run',
          otype: 'back',
          price: 500,
          betAmount: 250,
          betType: 'sports',
          gameType: 'Normal',
        },
        {
          id: 'b4',
          gameId: 'g1',
          teamName: '7 over run',
          otype: 'lay',
          price: 300,
          betAmount: 150,
          betType: 'sports',
          gameType: 'Normal',
        },
        {
          id: 'b5',
          gameId: 'g2',
          marketName: 'Match Odds',
          teamName: 'England',
          otype: 'back',
          price: 800,
          betAmount: 640,
          betType: 'sports',
          gameType: 'Match Odds',
        },
        {
          id: 'b6',
          gameId: 'g2',
          teamName: '10 over run',
          otype: 'back',
          price: 400,
          betAmount: 200,
          betType: 'sports',
          gameType: 'Normal',
        },
      ];

      // Before settlement: all 6 pending
      const beforeExposure = calculateAllExposure(allBets);
      const beforeAvbalance = BALANCE - beforeExposure;
      expect(beforeAvbalance).toBeGreaterThanOrEqual(0);

      // Sports g1: India wins: +800-600=+200; OTHER: -1000+480=-520 → 520
      // Fancy g1 7over: hit=250-300=-50, miss=-500+150=-350 → exposure=350
      // Sports g2: 800
      // Fancy g2 10over: 400
      // Total before = 520 + 350 + 800 + 400 = 2070
      expect(beforeExposure).toBe(2070);

      // After settlement: remove 7-over bets (b3, b4) — they settled
      const afterSettlement = allBets.filter(
        (b) => b.id !== 'b3' && b.id !== 'b4'
      );

      const afterExposure = calculateAllExposure(afterSettlement);
      const afterAvbalance = BALANCE - afterExposure;

      // Sports g1: still 520
      // Fancy g1 7over: GONE (settled)
      // Sports g2: still 800
      // Fancy g2 10over: still 400
      // Total after = 520 + 800 + 400 = 1720
      expect(afterExposure).toBe(1720);
      expect(afterAvbalance).toBe(8280);
      expect(afterAvbalance).toBeGreaterThanOrEqual(0);

      // Exposure dropped by exactly the 7-over fancy market exposure
      expect(beforeExposure - afterExposure).toBe(350);
    });
  });
});
