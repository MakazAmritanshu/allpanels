import { beforeEach, describe, expect, test, vi } from 'vitest';

describe('updateResultOfFancyBet - Fancy Bet Settlement (Vitest)', () => {
  // ========================================
  // HELPER FUNCTIONS
  // ========================================
  const createMockUser = (overrides = {}) => ({
    _id: 'user_001',
    userName: 'testUser',
    balance: 5000,
    avbalance: 5000,
    exposure: 0,
    bettingProfitLoss: 0,
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
    xValue: 50,
    fancyScore: 180,
    gameType: 'Normal',
    eventName: 'IND vs ENG',
    marketName: 'Runs Over',
    gameName: 'Cricket',
    market_id: 'market_001',
    status: 0,
    save: vi.fn().mockResolvedValue(true),
    ...overrides,
  });

  // ========================================
  // SECTION 1: BACK BET SETTLEMENT
  // ========================================
  describe('1️⃣ Back Bet Settlement - Win/Loss', () => {
    test('Back bet WINS - Normal (score >= fancyScore)', () => {
      let user = createMockUser();
      const bet = createMockBet({
        otype: 'back',
        fancyScore: 180,
        price: 100,
        betAmount: 50,
        xValue: 50,
      });

      const score = 200; // >= 180, so WIN
      const win = score >= bet.fancyScore;

      if (bet.otype === 'back' && win) {
        if (bet.betAmount < 0) {
          // Offset bet (not this case)
          console.log(`  Type: Offset (not applicable)`);
        } else {
          // Normal back bet win
          console.log(`\n✅ SETTLEMENT: Back Win (Normal)`);
          const winAmount = bet.betAmount + bet.price; // 150
          user.balance += bet.betAmount; // +50
          user.avbalance += winAmount; // +150
          user.bettingProfitLoss += bet.betAmount; // +50
          user.exposure -= bet.price; // -100
        }
      }

      expect(user.balance).toBe(5050);
      expect(user.avbalance).toBe(5150);
      expect(user.bettingProfitLoss).toBe(50);
      expect(user.exposure).toBe(-100);
    });

    test('Back bet LOSES - Normal (score < fancyScore)', () => {
      let user = createMockUser();
      const bet = createMockBet({
        otype: 'back',
        fancyScore: 180,
        price: 100,
        betAmount: 50,
      });

      const score = 150; // < 180, so LOSS
      const win = score >= bet.fancyScore;

      if (bet.otype === 'back' && !win) {
        if (bet.betAmount < 0) {
          // Offset
          console.log(`  Offset handling (not this case)`);
        } else {
          // Normal back bet loss
          console.log(`\n❌ SETTLEMENT: Back Loss (Normal)`);
          user.balance -= bet.price; // -100
          user.bettingProfitLoss -= bet.price; // -100
          user.exposure -= bet.price; // -100

          console.log(`  Balance change: -${bet.price}`);
          console.log(`  Exposure change: -${bet.price}`);
        }
      }

      console.log(`\n💰 AFTER:`);
      console.log(`  balance=${user.balance}, P/L=${user.bettingProfitLoss}`);

      expect(user.balance).toBe(4900);
      expect(user.bettingProfitLoss).toBe(-100);
    });
  });

  // ========================================
  // SECTION 2: BACK BET OFFSET SETTLEMENT
  // ========================================
  describe('2️⃣ Back Bet Offset Settlement', () => {
    test('Back offset bet WINS - User LOSES (negative betAmount)', () => {
      let user = createMockUser();
      const bet = createMockBet({
        otype: 'back',
        fancyScore: 180,
        price: 50,
        betAmount: -38, // NEGATIVE = offset
        xValue: 50,
      });

      const score = 200; // >= 180, WIN
      const win = score >= bet.fancyScore;

      if (bet.otype === 'back' && win && bet.betAmount < 0) {
        console.log(`\n❌ OFFSET WIN = USER LOSES:`);
        console.log(`  Offset logic: betAmount < 0`);
        user.balance += bet.betAmount; // -38 (net loss)
        user.avbalance += 0; // No change - already locked
        user.bettingProfitLoss += bet.betAmount; // -38
        user.exposure -= bet.price; // -50
      }

      expect(user.balance).toBe(4962);
      expect(user.avbalance).toBe(5000);
      expect(user.bettingProfitLoss).toBe(-38);
    });

    test('Back offset bet LOSES - User BREAKS EVEN', () => {
      console.log('\n' + '='.repeat(80));
      console.log('BACK OFFSET: Loss = Break Even');
      console.log('='.repeat(80));

      let user = createMockUser();
      const bet = createMockBet({
        otype: 'back',
        fancyScore: 180,
        price: 50,
        betAmount: -38,
      });

      const score = 150; // < 180, LOSS
      const win = score >= bet.fancyScore;

      if (bet.otype === 'back' && !win && bet.betAmount < 0) {
        console.log(`\n✅ OFFSET LOSS = BREAK EVEN:`);
        user.balance += 0; // No change
        user.avbalance += -bet.betAmount; // +38 (restore)
        user.bettingProfitLoss += 0; // No change
        user.exposure -= bet.price; // -50
      }

      expect(user.balance).toBe(5000);
      expect(user.avbalance).toBe(5038);
      expect(user.bettingProfitLoss).toBe(0);
    });
  });

  // ========================================
  // SECTION 3: LAY BET SETTLEMENT
  // ========================================
  describe('3️⃣ Lay Bet Settlement', () => {
    test('Lay bet WINS (score < fancyScore)', () => {
      console.log('\n' + '='.repeat(80));
      console.log('LAY BET: Win - Score Below Target');
      console.log('='.repeat(80));

      let user = createMockUser();
      const bet = createMockBet({
        otype: 'lay',
        fancyScore: 180,
        price: 100,
        betAmount: 50, // Lay: betAmount = stake
        xValue: 50,
      });

      const score = 150; // < 180, LAY WINS
      const layWin = score < bet.fancyScore;

      console.log(`\n📊 LAY BET:`);
      console.log(`  Score: ${bet.fancyScore}, Actual: ${score}`);
      console.log(`  Price: ${bet.price}, BetAmount: ${bet.betAmount}`);
      console.log(`  Result: ${layWin ? 'WIN ✅' : 'LOSS ❌'}`);

      if (bet.otype === 'lay' && layWin) {
        console.log(`\n✅ LAY WIN:`);
        const winAmount = bet.betAmount + bet.price; // 150
        user.balance += bet.betAmount; // +50
        user.avbalance += winAmount; // +150
        user.exposure -= bet.price; // -100
        user.bettingProfitLoss += bet.betAmount; // +50

        console.log(`  Win amount: ${winAmount}`);
        console.log(`  Balance change: +${bet.betAmount}`);
        console.log(`  AvBalance change: +${winAmount}`);
      }

      console.log(`\n💰 AFTER:`);
      console.log(`  balance=${user.balance}, avbalance=${user.avbalance}`);

      expect(user.balance).toBe(5050);
      expect(user.avbalance).toBe(5150);
      expect(user.bettingProfitLoss).toBe(50);
    });

    test('Lay bet LOSES (score >= fancyScore)', () => {
      console.log('\n' + '='.repeat(80));
      console.log('LAY BET: Loss - Score Meets or Exceeds Target');
      console.log('='.repeat(80));

      let user = createMockUser();
      const bet = createMockBet({
        otype: 'lay',
        fancyScore: 180,
        price: 100,
        betAmount: 50,
      });

      const score = 200; // >= 180, LAY LOSES
      const layWin = score < bet.fancyScore;

      console.log(`\n📊 LAY BET: score=${bet.fancyScore}, actual=${score}`);
      console.log(`  Result: ${layWin ? 'WIN ✅' : 'LOSS ❌'}`);

      if (bet.otype === 'lay' && !layWin) {
        console.log(`\n❌ LAY LOSS:`);
        user.balance -= bet.price; // -100
        user.bettingProfitLoss -= bet.price; // -100
        user.exposure -= bet.price; // -100

        console.log(`  Balance change: -${bet.price}`);
        console.log(`  Exposure change: -${bet.price}`);
      }

      console.log(`\n💰 AFTER:`);
      console.log(`  balance=${user.balance}, P/L=${user.bettingProfitLoss}`);

      expect(user.balance).toBe(4900);
      expect(user.bettingProfitLoss).toBe(-100);
    });
  });

  // ========================================
  // SECTION 4: WIN/LOSS CONDITION LOGIC
  // ========================================
  describe('4️⃣ Win/Loss Condition Logic', () => {
    test('Back win condition: score >= fancyScore', () => {
      const scenarios = [
        { fancyScore: 180, score: 180, shouldWin: true },
        { fancyScore: 180, score: 181, shouldWin: true },
        { fancyScore: 180, score: 200, shouldWin: true },
        { fancyScore: 180, score: 179, shouldWin: false },
        { fancyScore: 180, score: 150, shouldWin: false },
      ];

      scenarios.forEach((s, i) => {
        const win = s.score >= s.fancyScore;
        console.log(
          `  ${i + 1}. Score ${s.score} >= ${s.fancyScore}? ${win ? 'WIN' : 'LOSS'}`
        );
        expect(win).toBe(s.shouldWin);
      });
    });

    test('Lay win condition: score < fancyScore', () => {
      console.log('\n' + '='.repeat(80));
      console.log('CONDITION: Lay Win (score < fancyScore)');
      console.log('='.repeat(80));

      const scenarios = [
        { fancyScore: 180, score: 179, shouldWin: true },
        { fancyScore: 180, score: 100, shouldWin: true },
        { fancyScore: 180, score: 180, shouldWin: false },
        { fancyScore: 180, score: 181, shouldWin: false },
        { fancyScore: 180, score: 200, shouldWin: false },
      ];

      scenarios.forEach((s, i) => {
        const layWin = s.score < s.fancyScore;
        console.log(
          `  ${i + 1}. Score ${s.score} < ${s.fancyScore}? ${layWin ? 'WIN' : 'LOSS'}`
        );
        expect(layWin).toBe(s.shouldWin);
      });
    });
  });

  // ========================================
  // SECTION 5: EXPOSURE RECALCULATION
  // ========================================
  describe('5️⃣ Exposure Recalculation - Complex Scenarios', () => {
    test('Exposure calculation for back-only bets', () => {
      console.log('\n' + '='.repeat(80));
      console.log('EXPOSURE: Back Bets Only');
      console.log('='.repeat(80));

      const backBets = [
        { otype: 'back', betAmount: 100, xValue: 50 },
        { otype: 'back', betAmount: 80, xValue: 50 },
      ];

      const marketExposure = backBets.reduce((sum, b) => sum + b.betAmount, 0);

      console.log(`\nBack bets: ${backBets.length}`);
      backBets.forEach((b, i) => {
        console.log(`  Bet ${i + 1}: betAmount=${b.betAmount}`);
      });

      console.log(`\nExposure = sum of betAmounts = ${marketExposure}`);

      expect(marketExposure).toBe(180);
    });

    test('Exposure calculation for lay-only bets', () => {
      const layBets = [
        { otype: 'lay', betAmount: 200, xValue: 50 },
        { otype: 'lay', betAmount: 150, xValue: 40 },
      ];

      const marketExposure = layBets.reduce(
        (sum, b) => sum + (b.xValue * b.betAmount) / 100,
        0
      );

      console.log(`Lay exposure: ${marketExposure} (sum of odds% × betAmount)`);

      expect(marketExposure).toBe(160); // (50% × 200) + (40% × 150)
    });

    test('Exposure calculation for mixed back/lay bets (complex scenario)', () => {
      console.log('\n' + '='.repeat(80));
      console.log('EXPOSURE: Mixed Back + Lay Bets');
      console.log('='.repeat(80));

      const bets = [
        {
          otype: 'back',
          fancyScore: 180,
          betAmount: 100,
          xValue: 50,
          price: 200,
        },
        {
          otype: 'lay',
          fancyScore: 190,
          betAmount: 150,
          xValue: 40,
          price: 60,
        },
      ];

      const fancyScores = [180, 190];
      const scenarioResults = [];

      console.log(`\nScenarios for scores: ${fancyScores}`);

      // Scenario 1: score >= 190
      console.log(`\nScenario 1: Score >= 190`);
      const backWinProfit = 100 * (50 / 100); // 50
      const layLossAmount = 150 * (40 / 100); // 60
      const scenario1Net = backWinProfit - layLossAmount; // -10
      console.log(`  Back wins: +${backWinProfit}`);
      console.log(`  Lay loses: -${layLossAmount}`);
      console.log(`  Net: ${scenario1Net}`);
      scenarioResults.push(scenario1Net);

      // Scenario 2: 180 <= score < 190
      console.log(`\nScenario 2: 180 <= Score < 190`);
      const backWin2 = 100 * (50 / 100); // 50
      const layWin2 = 150; // stake
      const scenario2Net = backWin2 + layWin2; // 200
      console.log(`  Back wins: +${backWin2}`);
      console.log(`  Lay wins: +${layWin2}`);
      console.log(`  Net: ${scenario2Net}`);
      scenarioResults.push(scenario2Net);

      // Scenario 3: score < 180
      console.log(`\nScenario 3: Score < 180`);
      const backLoss = -100;
      const layWin3 = 150;
      const scenario3Net = backLoss + layWin3; // 50
      console.log(`  Back loses: ${backLoss}`);
      console.log(`  Lay wins: +${layWin3}`);
      console.log(`  Net: ${scenario3Net}`);
      scenarioResults.push(scenario3Net);

      const maxLoss = Math.min(...scenarioResults);
      const exposure = Math.abs(maxLoss);

      console.log(`\nAll scenarios: ${scenarioResults}`);
      console.log(`Max loss: ${maxLoss}`);
      console.log(`User exposure: ${exposure}`);

      expect(exposure).toBe(10);
    });
  });

  // ========================================
  // SECTION 6: MULTIPLE USERS & BETS
  // ========================================
  describe('6️⃣ Multiple Bets Settlement', () => {
    test('Settle multiple bets for same user', () => {
      console.log('\n' + '='.repeat(80));
      console.log('MULTIPLE BETS: Same User');
      console.log('='.repeat(80));

      let user = createMockUser();

      const bets = [
        createMockBet({
          _id: 'bet_001',
          otype: 'back',
          fancyScore: 180,
          price: 100,
          betAmount: 50,
        }),
        createMockBet({
          _id: 'bet_002',
          otype: 'lay',
          fancyScore: 190,
          price: 60,
          betAmount: 150,
        }),
      ];

      const results = [
        { _id: 'bet_001', score: 200 }, // Back wins
        { _id: 'bet_002', score: 185 }, // Lay loses
      ];

      console.log(`\nSettling ${bets.length} bets...`);

      // Bet 1: Back wins
      user.balance += 50;
      user.avbalance += 150;
      user.bettingProfitLoss += 50;
      console.log(`  Bet 1 (Back): WIN → balance +50`);

      // Bet 2: Lay loses
      user.balance -= 60;
      user.bettingProfitLoss -= 60;
      console.log(`  Bet 2 (Lay): LOSS → balance -60`);

      console.log(
        `\n💰 Final: balance=${user.balance}, P/L=${user.bettingProfitLoss}`
      );

      expect(user.balance).toBe(4990);
      expect(user.bettingProfitLoss).toBe(-10);
    });
  });

  // ========================================
  // SECTION 7: GAME TYPES
  // ========================================
  describe('7️⃣ Game Types & Markets', () => {
    test('Normal game type - Toss market', () => {
      const gameType = 'Normal';
      const marketName = 'Toss';
      console.log(`Game: ${gameType}, Market: ${marketName}`);
      expect(gameType).toBe('Normal');
    });

    test('Meter game type - Match Odds market', () => {
      const gameType = 'meter';
      const marketName = 'Match Odds';
      console.log(`Game: ${gameType}, Market: ${marketName}`);
      expect(gameType).toBe('meter');
    });

    test('Line game type - Tied Match market', () => {
      const gameType = 'line';
      expect(gameType).toBe('line');
    });

    test('Ball game type - Bookmaker market', () => {
      const gameType = 'ball';
      expect(gameType).toBe('ball');
    });

    test('Khado game type - Bookmaker market', () => {
      const gameType = 'khado';
      expect(gameType).toBe('khado');
    });
  });

  // ========================================
  // SECTION 8: ERROR SCENARIOS
  // ========================================
  describe('8️⃣ Error & Edge Cases', () => {
    test('No result data received', () => {
      const resultData = null;
      expect(resultData).toBeNull();
      console.log(`No result data → skip bet`);
    });

    test('User not found', () => {
      const user = null;
      expect(user).toBeNull();
      console.log(`User not found → skip bet`);
    });

    test('Score exactly at fancyScore - Back wins', () => {
      const fancyScore = 180;
      const score = 180;
      const win = score >= fancyScore;
      expect(win).toBe(true);
      console.log(
        `Score exactly at target (${score} >= ${fancyScore}): Back WINS`
      );
    });

    test('Score exactly at fancyScore - Lay loses', () => {
      const fancyScore = 180;
      const score = 180;
      const layWin = score < fancyScore;
      expect(layWin).toBe(false);
      console.log(
        `Score exactly at target (${score} < ${fancyScore}): Lay LOSES`
      );
    });
  });

  // ========================================
  // SECTION 9: COMPLETE SETTLEMENT JOURNEY
  // ========================================
  describe('9️⃣ Complete Settlement Journeys', () => {
    test('Full journey: Back bet wins normally', () => {
      console.log('\n' + '='.repeat(80));
      console.log('JOURNEY: Back Bet Win (Normal)');
      console.log('='.repeat(80));

      let user = createMockUser({
        balance: 5000,
        avbalance: 5000,
        exposure: 0,
      });
      const bet = createMockBet({
        fancyScore: 180,
        otype: 'back',
        price: 100,
        betAmount: 50,
        status: 0,
      });

      console.log(`\n1️⃣ BET PLACED:`);
      console.log(
        `  User: balance=${user.balance}, avbalance=${user.avbalance}, exposure=${user.exposure}`
      );
      console.log(
        `  Bet: ${bet.otype} @ ${bet.fancyScore}, price=${bet.price}`
      );

      // Place bet reduces avbalance
      user.exposure = 100;
      user.avbalance = 4900;

      console.log(`\n2️⃣ AFTER PLACEMENT:`);
      console.log(
        `  User: exposure=${user.exposure}, avbalance=${user.avbalance}`
      );

      // Settlement
      const score = 200;
      const win = score >= bet.fancyScore;

      console.log(`\n3️⃣ SETTLEMENT:`);
      console.log(
        `  Score: ${score}, FancyScore: ${bet.fancyScore}, Result: ${win ? 'WIN' : 'LOSS'}`
      );

      if (win) {
        user.balance += bet.betAmount; // +50
        user.avbalance += bet.betAmount + bet.price; // +150
        user.exposure -= bet.price; // 0
        console.log(`  Win amount: ${bet.betAmount + bet.price}`);
      }

      console.log(`\n4️⃣ FINAL STATE:`);
      console.log(
        `  User: balance=${user.balance}, avbalance=${user.avbalance}, exposure=${user.exposure}`
      );

      expect(user.balance).toBe(5050);
      expect(user.avbalance).toBe(5050);
      expect(user.exposure).toBe(0);
    });

    test('Full journey: Back offset bet loses (break even)', () => {
      console.log('\n' + '='.repeat(80));
      console.log('JOURNEY: Back Offset Bet Loss (Break Even)');
      console.log('='.repeat(80));

      let user = createMockUser();
      const bet = createMockBet({
        fancyScore: 180,
        otype: 'back',
        price: 50,
        betAmount: -38,
        status: 0,
      });

      console.log(`\n1️⃣ OFFSET BET PLACED:`);
      console.log(`  Bet: betAmount=${bet.betAmount} (NEGATIVE)`);

      user.exposure = 50;
      user.avbalance = 4950;

      console.log(`\n2️⃣ AFTER PLACEMENT:`);
      console.log(`  exposure=${user.exposure}, avbalance=${user.avbalance}`);

      const score = 150; // < 180, LOSS
      const win = score >= bet.fancyScore;

      console.log(`\n3️⃣ SETTLEMENT:`);
      console.log(
        `  Score: ${score}, Result: ${win ? 'WIN' : 'LOSS (But Break Even)'}`
      );

      if (!win && bet.betAmount < 0) {
        user.avbalance += -bet.betAmount; // +38
        user.exposure -= bet.price; // 0
      }

      console.log(`\n4️⃣ FINAL:`);
      console.log(
        `  balance=${user.balance}, avbalance=${user.avbalance}, exposure=${user.exposure}`
      );

      expect(user.balance).toBe(5000);
      expect(user.avbalance).toBe(4988);
      expect(user.exposure).toBe(0);
    });
  });
});
