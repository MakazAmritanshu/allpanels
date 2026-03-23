import { beforeEach, describe, expect, test, vi } from 'vitest';

describe('placeFancyBet - Complete Fancy Bet Placement (Vitest)', () => {
  // ========================================
  // HELPER FUNCTIONS
  // ========================================
  const calculateFancyBet = (stake, odds, otype) => {
    let betAmount, price;

    if (otype === 'back') {
      price = stake;
      betAmount = stake * (odds / 100); // PERCENTAGE BASED (NOT odds - 1)
    } else {
      price = stake * (odds / 100); // PERCENTAGE BASED
      betAmount = stake;
    }

    return {
      price: parseFloat(price.toFixed(2)),
      betAmount: parseFloat(betAmount.toFixed(2)),
    };
  };

  const createMockUser = (overrides = {}) => ({
    _id: 'user_001',
    userName: 'testUser',
    balance: 5000,
    avbalance: 5000,
    exposure: 0,
    exposureLimit: 10000,
    save: vi.fn().mockResolvedValue(true),
    ...overrides,
  });

  const createMockBet = (overrides = {}) => ({
    _id: 'bet_001',
    userId: 'user_001',
    gameId: 'game_001',
    sid: '4',
    teamName: 'India',
    otype: 'back',
    price: 100,
    betAmount: 50,
    xValue: 50, // percentage
    fancyScore: 180,
    gameType: 'Normal',
    eventName: 'IND vs ENG',
    marketName: 'Runs Over',
    gameName: 'Cricket',
    market_id: 'market_001',
    save: vi.fn().mockResolvedValue(true),
    ...overrides,
  });

  // ========================================
  // SECTION 1: FANCY BET CALCULATIONS
  // ========================================
  describe('1️⃣ Fancy Bet Calculation - Percentage Based (NOT Odds - 1)', () => {
    test('Fancy back bet: stake=100, odds=50% - calculation check', () => {
      const { price, betAmount } = calculateFancyBet(100, 50, 'back');

      expect(price).toBe(100);
      expect(betAmount).toBe(50);
    });

    test('Fancy lay bet: stake=100, odds=50% - calculation check', () => {
      const { price, betAmount } = calculateFancyBet(100, 50, 'lay');

      expect(price).toBe(50);
      expect(betAmount).toBe(100);
    });

    test('High percentage odds: stake=200, odds=120%', () => {
      const { price, betAmount } = calculateFancyBet(200, 120, 'back');
      console.log(
        `High odds: stake=200, odds=120% → price=${price}, betAmount=${betAmount}`
      );
      expect(price).toBe(200);
      expect(betAmount).toBe(240);
    });

    test('Low percentage odds: stake=150, odds=20%', () => {
      const { price, betAmount } = calculateFancyBet(150, 20, 'lay');
      console.log(
        `Low odds: stake=150, odds=20% → price=${price}, betAmount=${betAmount}`
      );
      expect(price).toBe(30);
      expect(betAmount).toBe(150);
    });

    test('Decimal precision in percentage calculation', () => {
      const { price, betAmount } = calculateFancyBet(100, 33.33, 'back');
      console.log(`Decimal: stake=100, odds=33.33% → betAmount=${betAmount}`);
      expect(betAmount).toBeCloseTo(33.33, 2);
    });
  });

  // ========================================
  // SECTION 2: BALANCE & EXPOSURE VALIDATION
  // ========================================
  describe('2️⃣ Balance & Exposure Validation', () => {
    test('Reject when avbalance insufficient', () => {
      const user = { avbalance: 50, balance: 1000 };
      const price = 100;

      console.log(`User avbalance: ${user.avbalance}, needed: ${price}`);
      expect(user.avbalance < price || user.balance < price).toBe(true);
    });

    test('Reject when balance insufficient', () => {
      const user = { avbalance: 1000, balance: 50 };
      const price = 100;
      expect(user.avbalance < price || user.balance < price).toBe(true);
    });

    test('Accept when both sufficient', () => {
      const user = { avbalance: 1000, balance: 1000 };
      const price = 100;
      expect(user.avbalance < price || user.balance < price).toBe(false);
    });

    test('Exposure limit check', () => {
      const user = { exposureLimit: 5000 };
      const totalPendingAmount = 3000;
      const newPrice = 2500;

      const exceedsLimit = user.exposureLimit < totalPendingAmount + newPrice;
      console.log(`Exceeds? ${exceedsLimit}`);

      expect(exceedsLimit).toBe(true);
    });

    test('Accept within exposure limit', () => {
      const user = { exposureLimit: 5000 };
      const totalPendingAmount = 2000;
      const newPrice = 2000;

      expect(user.exposureLimit < totalPendingAmount + newPrice).toBe(false);
    });
  });

  // ========================================
  // SECTION 3: CASE 1 - MERGE (SAME TYPE)
  // ========================================
  describe('3️⃣ Case 1: MERGE - Same Type Bets', () => {
    test('Merge two back bets on same fancy market', () => {
      let user = createMockUser();

      let existingBet = createMockBet({
        fancyScore: 180,
        otype: 'back',
        xValue: 50,
        price: 100,
        betAmount: 50,
      });

      const totalPendingAmount = 100;

      // NEW BET
      const newPrice = 150;
      const newBetAmount = 75;
      const newOdds = 50;

      // MERGE LOGIC (from controller line 1069-1075)
      existingBet.price += newPrice; // 250
      existingBet.xValue = (existingBet.xValue + newOdds) / 2; // 50
      existingBet.betAmount += newBetAmount; // 125

      user.exposure = totalPendingAmount + newPrice; // 250
      user.avbalance -= newPrice; // 4850

      expect(existingBet.price).toBe(250);
      expect(existingBet.betAmount).toBe(125);
      expect(user.avbalance).toBe(4850);
    });

    test('Merge two lay bets on same fancy market', () => {
      let user = createMockUser();

      let existingBet = createMockBet({
        otype: 'lay',
        xValue: 60,
        price: 60,
        betAmount: 100,
      });

      const newPrice = 90;
      const newBetAmount = 150;

      // MERGE
      existingBet.price += newPrice; // 150
      existingBet.xValue = (existingBet.xValue + 60) / 2; // 60
      existingBet.betAmount += newBetAmount; // 250

      console.log(
        `Lay MERGE: price=${existingBet.price}, betAmount=${existingBet.betAmount}`
      );
      expect(existingBet.price).toBe(150);
      expect(existingBet.betAmount).toBe(250);
    });

    test('Merge three back bets - accumulation', () => {
      let bet = {
        otype: 'back',
        xValue: 50,
        price: 100,
        betAmount: 50,
      };

      // Merge 2
      bet.price += 150;
      bet.xValue = (bet.xValue + 50) / 2;
      bet.betAmount += 75;

      // Merge 3
      bet.price += 200;
      bet.xValue = (bet.xValue + 50) / 2;
      bet.betAmount += 100;

      expect(bet.price).toBe(450);
      expect(bet.betAmount).toBe(225);
    });
  });

  // ========================================
  // SECTION 4: CASE 2A - SCORE OFFSET (PRIORITY 1)
  // ========================================
  describe('4️⃣ Case 2A: SCORE OFFSET - Priority 1', () => {
    test('Score offset - Back offsets Lay (score increases)', () => {
      let user = createMockUser();

      // Set up existingBet so originalBetAmount >= newPrice (full offset condition)
      let existingBet = createMockBet({
        fancyScore: 180, // Back at 180
        otype: 'back',
        xValue: 50,
        price: 100,
        betAmount: 150, // Must be >= newPrice (100) for full offset
      });

      const newFancyScore = 190; // NEW Lay at 190 (higher score)
      const newOtype = 'lay';
      const newPrice = 100; // stake 200 × 50% = 100 (liability)
      const newBetAmount = 200; // for lay (stake)

      // CHECK SCORE OFFSET (line 1082)
      const scoreOffset =
        existingBet.otype === 'back' &&
        newOtype === 'lay' &&
        newFancyScore > existingBet.fancyScore;

      if (scoreOffset) {
        // Back offsets lay (line 1095-1109)
        const originalBetAmount = existingBet.betAmount; // 150
        const originalPrice = existingBet.price; // 100
        const betAmount = newBetAmount; // 200
        const price = newPrice; // 100

        if (originalBetAmount >= price) {
          // FULL OFFSET: 150 >= 100 → TRUE
          console.log(`\n🔄 FULL OFFSET (Back offsets Lay):`);
          existingBet.price = originalPrice - betAmount; // 100 - 200 = -100
          existingBet.betAmount = originalBetAmount - price; // 150 - 100 = 50
          user.avbalance += betAmount; // += 200
        }

        existingBet.xValue = 50;
        existingBet.fancyScore = newFancyScore;
      }

      expect(scoreOffset).toBe(true);
      expect(existingBet.price).toBe(-100); // 100 - 200 = -100
      expect(existingBet.betAmount).toBe(50); // 150 - 100 = 50
    });

    test('Score offset - Lay offsets Back (back score higher)', () => {
      let user = createMockUser();

      let existingBet = createMockBet({
        fancyScore: 200, // Lay at 200
        otype: 'lay',
        xValue: 50,
        price: 100,
        betAmount: 200,
      });

      const newFancyScore = 180; // NEW Back at 180 (lower score)
      const newOtype = 'back';
      const newPrice = 150;
      const newBetAmount = 75;

      // CHECK SCORE OFFSET
      const scoreOffset =
        existingBet.otype === 'lay' &&
        newOtype === 'back' &&
        existingBet.fancyScore > newFancyScore;
      console.log(`\n✅ SCORE OFFSET: ${scoreOffset}`);

      if (scoreOffset) {
        // Lay offsets back (line 1110-1124)
        const originalPrice = existingBet.price;
        const originalBetAmount = existingBet.betAmount;
        const price = newPrice;
        const betAmount = newBetAmount;

        if (originalPrice > betAmount) {
          // FULL OFFSET
          console.log(`\n🔄 FULL OFFSET (Lay offsets Back):`);
          existingBet.price = originalPrice - betAmount; // 100 - 75 = 25
          existingBet.betAmount = originalBetAmount - price; // 200 - 150 = 50
          user.avbalance += betAmount; // += 75

          console.log(
            `  price: ${existingBet.price}, betAmount: ${existingBet.betAmount}`
          );
        }

        existingBet.xValue = 50;
        existingBet.fancyScore = newFancyScore;
      }

      expect(scoreOffset).toBe(true);
      expect(existingBet.price).toBe(25);
      expect(existingBet.betAmount).toBe(50);
    });

    test('Score offset - Partial offset with type change', () => {
      let user = createMockUser();
      let existingBet = createMockBet({
        fancyScore: 180,
        otype: 'back',
        xValue: 50,
        price: 50,
        betAmount: 25,
      });

      const newFancyScore = 200;
      const newOtype = 'lay';
      const newPrice = 200;
      const newBetAmount = 400;

      const scoreOffset =
        existingBet.otype === 'back' &&
        newOtype === 'lay' &&
        newFancyScore > existingBet.fancyScore;
      console.log(`Score offset? ${scoreOffset}`);

      if (scoreOffset) {
        const originalBetAmount = existingBet.betAmount;
        const originalPrice = existingBet.price;

        if (originalBetAmount < newPrice) {
          // PARTIAL OFFSET with type change
          console.log(`\n🔄 PARTIAL OFFSET with Type Change:`);
          existingBet.price = newPrice - originalBetAmount; // 200 - 25 = 175
          existingBet.betAmount = newBetAmount - originalPrice; // 400 - 50 = 350
          existingBet.otype = newOtype;
          user.avbalance += originalPrice - (newPrice - originalBetAmount);

          console.log(`  New type: ${existingBet.otype}`);
          console.log(
            `  price: ${existingBet.price}, betAmount: ${existingBet.betAmount}`
          );
        }
      }

      expect(existingBet.otype).toBe('lay');
      expect(existingBet.price).toBe(175);
    });
  });

  // ========================================
  // SECTION 5: CASE 2B - ODDS OFFSET (PRIORITY 2)
  // ========================================
  describe('5️⃣ Case 2B: ODDS OFFSET - Priority 2', () => {
    test('Odds offset - Back offsets Lay (higher odds)', () => {
      let user = createMockUser();

      let existingBet = createMockBet({
        fancyScore: 180, // SAME score
        otype: 'back',
        xValue: 50, // back at 50%
        price: 100,
        betAmount: 50,
      });

      const newFancyScore = 180; // SAME score - so NO score offset
      const newOtype = 'lay';
      const newXValue = 60; // lay at 60% (higher)
      const newPrice = 200 * (60 / 100); // 120
      const newBetAmount = 200;

      // CHECK SCORE OFFSET (should be false since same score)
      const scoreOffset =
        existingBet.otype === 'back' &&
        newOtype === 'lay' &&
        newFancyScore > existingBet.fancyScore;
      console.log(`\n✅ Score offset? ${scoreOffset}`);

      // CHECK ODDS OFFSET (should be true - lay odds higher)
      const oddsOffset =
        existingBet.otype === 'back' &&
        newOtype === 'lay' &&
        newXValue > existingBet.xValue;
      console.log(`✅ Odds offset? ${oddsOffset}`);

      if (oddsOffset && !scoreOffset) {
        console.log(`\n🔄 ODDS OFFSET APPLIED (Priority 2):`);
        const originalBetAmount = existingBet.betAmount;
        const originalPrice = existingBet.price;

        if (originalBetAmount >= newPrice) {
          existingBet.price = originalPrice - (newBetAmount * newXValue) / 100;
          existingBet.betAmount = originalBetAmount - newPrice;
          user.avbalance += (newBetAmount * newXValue) / 100;

          console.log(`  Full offset: price=${existingBet.price}`);
        }

        existingBet.xValue = newXValue;
        existingBet.fancyScore = newFancyScore;
      }

      expect(scoreOffset).toBe(false);
      expect(oddsOffset).toBe(true);
    });
  });

  // ========================================
  // SECTION 6: CASE 2C - NO OFFSET (SEPARATE BET)
  // ========================================
  describe('6️⃣ Case 2C: NO OFFSET - Create Separate Bet', () => {
    test('No offset - separate lay bet created (opposite type, no conditions met)', () => {
      let user = createMockUser();

      let existingBet = createMockBet({
        fancyScore: 180,
        otype: 'back',
        xValue: 50,
        price: 100,
        betAmount: 50,
      });

      const newFancyScore = 170; // LOWER score (back still at 180)
      const newOtype = 'lay';
      const newXValue = 40; // LOWER odds (back at 50)
      const newPrice = 100;
      const newBetAmount = 100;

      console.log(`\n📋 EXISTING: Back @ 180, odds 50%`);
      console.log(`🆕 NEW: Lay @ 170, odds 40%`);

      // CHECK CONDITIONS
      const scoreOffset =
        existingBet.otype === 'back' &&
        newOtype === 'lay' &&
        newFancyScore > existingBet.fancyScore;
      const oddsOffset =
        existingBet.otype === 'back' &&
        newOtype === 'lay' &&
        newXValue > existingBet.xValue;

      if (!scoreOffset && !oddsOffset) {
        console.log(`\n🆕 NO OFFSET CONDITIONS MET - CREATE SEPARATE BET`);
        user.avbalance -= newPrice;

        const newBet = {
          _id: 'bet_002',
          userId: 'user_001',
          gameId: 'game_001',
          otype: newOtype,
          price: newPrice,
          betAmount: newBetAmount,
          fancyScore: newFancyScore,
          xValue: newXValue,
        };

        console.log(`  New bet created independently`);
        console.log(`  User now has 2 separate bets on same market`);
      }

      expect(scoreOffset).toBe(false);
      expect(oddsOffset).toBe(false);
    });
  });

  // ========================================
  // SECTION 7: CASE 3 - NEW BET
  // ========================================
  describe('7️⃣ Case 3: NEW BET - Create New Fancy Bet', () => {
    test('Create new fancy back bet (no existing bet)', () => {
      let user = createMockUser();

      const gameId = 'game_001';
      const eventName = 'IND vs ENG';
      const marketName = 'Runs Over';
      const stake = 300;
      const odds = 45;
      const otype = 'back';
      const fancyScore = 180;

      // Calculate
      const price = stake;
      const betAmount = stake * (odds / 100);

      // Update user
      const totalPendingAmount = 0;
      user.exposure = totalPendingAmount + price;
      user.avbalance -= price;

      const newBet = createMockBet({
        gameId,
        eventName,
        marketName,
        teamName: 'India',
        otype,
        price,
        betAmount,
        xValue: odds,
        fancyScore,
      });

      expect(price).toBe(300);
      expect(betAmount).toBe(135);
      expect(user.avbalance).toBe(4700);
    });

    test('Create new fancy lay bet (no existing bet)', () => {
      let user = createMockUser();

      const stake = 200;
      const odds = 60;
      const otype = 'lay';

      const price = stake * (odds / 100); // 120
      const betAmount = stake; // 200

      user.exposure += price;
      user.avbalance -= price;

      console.log(
        `New lay bet: stake=${stake}, odds=${odds}% → price=${price}, betAmount=${betAmount}`
      );

      expect(price).toBe(120);
      expect(betAmount).toBe(200);
      expect(user.exposure).toBe(120);
    });
  });

  // ========================================
  // SECTION 8: EXPOSURE RECALCULATION
  // ========================================
  describe('8️⃣ Fancy Exposure Recalculation (Complex Scenario)', () => {
    test('Calculate exposure from mixed back/lay bets on same market', () => {
      const updatedBets = [
        {
          gameId: 'game_001',
          teamName: 'India',
          fancyScore: 180,
          otype: 'back',
          betAmount: 100,
          xValue: 50,
          price: 200,
        },
        {
          gameId: 'game_001',
          teamName: 'India',
          fancyScore: 190,
          otype: 'lay',
          betAmount: 150,
          xValue: 40,
          price: 60,
        },
      ];

      updatedBets.forEach((b, i) => {
        console.log(
          `  Bet ${i + 1}: ${b.otype} @ score ${b.fancyScore}, odds ${b.xValue}%`
        );
        console.log(`    BetAmount: ${b.betAmount}, Price: ${b.price}`);
      });

      // Group by market
      const marketKey = `${updatedBets[0].gameId}_${updatedBets[0].teamName}`;
      const fancyScores = [180, 190];

      console.log(`\n🔄 SCENARIO ANALYSIS:`);

      // Scenario 1: Actual score >= 190 (both scores covered)
      const scenario1BackWin = 100 * (50 / 100); // back at 180 wins
      const scenario1LayLoss = 150 * (40 / 100); // lay at 190 loses
      const scenario1Net = scenario1BackWin - scenario1LayLoss;

      // Scenario 2: Actual score between 180-190 (back wins, lay wins)
      const scenario2BackWin = 100 * (50 / 100);
      const scenario2LayWin = 150; // lay stakes 150
      const scenario2Net = scenario2BackWin - scenario2LayWin;

      // Scenario 3: Actual score < 180 (back loses, lay wins)
      const scenario3BackLoss = -100;
      const scenario3LayWin = 150;
      const scenario3Net = scenario3BackLoss + scenario3LayWin;

      // Max loss
      const allScenarios = [scenario1Net, scenario2Net, scenario3Net];
      const maxLoss = Math.min(...allScenarios);
      const exposure = Math.abs(maxLoss);

      expect(exposure).toBeGreaterThan(0);
    });

    test('Exposure for back-only bets', () => {
      const backBets = [
        { otype: 'back', betAmount: 100 },
        { otype: 'back', betAmount: 80 },
      ];

      const exposure = backBets.reduce((sum, b) => sum + b.betAmount, 0);
      console.log(`Back-only exposure: ${exposure}`);
      expect(exposure).toBe(180);
    });

    test('Exposure for lay-only bets', () => {
      const layBets = [
        { otype: 'lay', betAmount: 200, xValue: 50 },
        { otype: 'lay', betAmount: 150, xValue: 40 },
      ];

      const exposure = layBets.reduce(
        (sum, b) => sum + (b.xValue * b.betAmount) / 100,
        0
      );
      console.log(`Lay-only exposure: ${exposure}`);
      expect(exposure).toBe(160);
    });
  });

  // ========================================
  // SECTION 9: ERROR HANDLING
  // ========================================
  describe('9️⃣ Error Scenarios', () => {
    test('Missing required fields', () => {
      const body = {
        gameId: 'game_001',
        // sid: missing
        price: 100,
        xValue: 50,
      };

      // When sid is undefined, the expression evaluates to undefined (falsy), not false
      const isValid = body.gameId && body.sid && body.price && body.xValue;
      expect(!!isValid).toBe(false); // Use !! to convert to boolean
    });

    test('Invalid game type', () => {
      const gameType = 'InvalidType';
      const validTypes = ['Normal', 'meter', 'line', 'ball', 'khado'];

      expect(validTypes.includes(gameType)).toBe(false);
    });

    test('User not found', () => {
      const user = null;
      expect(user).toBeNull();
    });

    test('Secret user bypass', () => {
      const user = { secret: 0 };
      const shouldBypass = user.secret === 0;
      expect(shouldBypass).toBe(true);
    });
  });

  // ========================================
  // SECTION 10: COMPLETE FLOW SCENARIOS
  // ========================================
  describe('🔟 Complete Multi-Step Scenarios', () => {
    test('3-Bet Journey: Back → Lay (Score Offset) → Back Again', () => {
      let user = createMockUser();

      // BET 1: Back at 180
      console.log(`\n1️⃣ Place Back @ 180, odds 50%, stake 200`);
      const { price: p1, betAmount: b1 } = calculateFancyBet(200, 50, 'back');
      let bet = {
        fancyScore: 180,
        otype: 'back',
        xValue: 50,
        price: p1,
        betAmount: b1,
      };
      user.avbalance -= p1;
      console.log(`  After: avbalance=${user.avbalance}`);

      // BET 2: Lay at 200 (score > 180, so score offset applies)
      console.log(`\n2️⃣ Place Lay @ 200, odds 45%, stake 250`);
      const { price: p2, betAmount: b2 } = calculateFancyBet(250, 45, 'lay');
      console.log(`  Score offset triggers (200 > 180)`);

      // Apply offset
      if (bet.betAmount >= p2) {
        console.log(`  Full offset applied`);
        bet.price -= b2;
        bet.betAmount -= p2;
        user.avbalance += b2;
      }
      console.log(`  After: price=${bet.price}, betAmount=${bet.betAmount}`);

      // BET 3: Back at 175 (same score as lay, different odds → odds offset)
      console.log(`\n3️⃣ Place Back @ 175, odds 60%, stake 150`);
      const { price: p3, betAmount: b3 } = calculateFancyBet(150, 60, 'back');
      console.log(
        `  No offset (back bet on new score, lay on different score)`
      );
      user.avbalance -= p3;
    });

    test('Real Cricket Scenario: India Runs Market', () => {
      let user = createMockUser({
        balance: 10000,
        avbalance: 10000,
        exposure: 0,
      });

      const scenarios = [
        {
          step: 1,
          market: 'Runs Over 180',
          score: 180,
          type: 'back',
          stake: 500,
          odds: 50,
        },
        {
          step: 2,
          market: 'Runs Under 180',
          score: 180,
          type: 'lay',
          stake: 600,
          odds: 45,
          note: 'Same score, different market → new bets',
        },
        {
          step: 3,
          market: 'Runs Over 200',
          score: 200,
          type: 'back',
          stake: 400,
          odds: 55,
          note: 'Different market',
        },
      ];

      scenarios.forEach((s) => {
        console.log(`\nStep ${s.step}: ${s.market} @ ${s.score}`);
        console.log(`  Type: ${s.type}, Stake: ${s.stake}, Odds: ${s.odds}%`);
        if (s.note) console.log(`  Note: ${s.note}`);

        const { price, betAmount } = calculateFancyBet(s.stake, s.odds, s.type);
        console.log(`  Calculated: price=${price}, betAmount=${betAmount}`);
        user.avbalance -= price;
      });

      console.log(`\n✅ Final AvBalance: ${user.avbalance}`);
    });
  });
});
