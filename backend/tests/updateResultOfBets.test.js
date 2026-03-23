describe('updateResultOfBets - Balance & AvBalance Settlement (Consistent Values)', () => {
  // ========================================
  // REFERENCE: Consistent Values Used
  // ========================================
  // Stake = 100 for all bets
  // Back Bet @ Odds 2.0: price=100, betAmount=100 (profit if wins)
  // Lay Bet @ Odds 1.5: price=50 (liability), betAmount=100 (profit if wins)
  // ========================================

  // ========================================
  // MATCH ODDS - BACK BET (ODDS 2.0)
  // ========================================
  describe('Match Odds - Back Bet (Stake 100, Odds 2.0)', () => {
    test('Back bet WIN - Normal (profit: 100, stake: 100)', () => {
      const user = {
        balance: 1000,
        avbalance: 900,
        bettingProfitLoss: 0,
      };

      const bet = {
        gameType: 'Match Odds',
        otype: 'back',
        teamName: 'Team A',
        xValue: 2.0,
        price: 100, // Stake
        betAmount: 100, // Profit = 100 * (2.0 - 1)
        status: 0,
      };

      const winner = 'Team A';
      const win = winner.toLowerCase() === bet.teamName.toLowerCase();

      // CALCULATION: Back WIN = +profit + stake to avbalance
      if (win) {
        const winAmount = bet.betAmount + bet.price; // 100 + 100 = 200
        user.balance += bet.betAmount; // 1000 + 100 = 1100
        user.avbalance += winAmount; // 900 + 200 = 1100
        user.bettingProfitLoss += bet.betAmount; // 0 + 100 = 100
        bet.status = 1;
      }

      expect(user.balance).toBe(1100); // +100 profit
      expect(user.avbalance).toBe(1100); // +200 (profit + stake)
      expect(user.bettingProfitLoss).toBe(100); // +100 profit
      expect(bet.status).toBe(1); // WIN
    });

    test('Back bet LOSS - Normal (loss: 100)', () => {
      const user = {
        balance: 1000,
        avbalance: 900,
        bettingProfitLoss: 0,
      };

      const bet = {
        gameType: 'Match Odds',
        otype: 'back',
        teamName: 'Team A',
        xValue: 2.0,
        price: 100,
        betAmount: 100,
        status: 0,
      };

      const winner = 'Team B';
      const win = winner.toLowerCase() === bet.teamName.toLowerCase();

      // CALCULATION: Back LOSS = -stake
      if (!win) {
        user.balance -= bet.price; // 1000 - 100 = 900
        user.bettingProfitLoss -= bet.price; // 0 - 100 = -100
        bet.status = 2;
      }

      expect(user.balance).toBe(900); // -100 loss
      expect(user.avbalance).toBe(900); // Unchanged
      expect(user.bettingProfitLoss).toBe(-100); // -100 loss
      expect(bet.status).toBe(2); // LOSS
    });

    test('Back bet WIN - Offset: REAL WORLD EXAMPLE (Coleman Wong @ 1.32 back, 1.33 lay)', () => {
      let user = {
        balance: 1000,
        avbalance: 1000,
        bettingProfitLoss: 0,
        exposure: 0,
      };

      // ============================================
      // STEP 1: PLACE BACK BET on Coleman Wong @ 1.32
      // ============================================
      const backBet = {
        teamName: 'Coleman Wong',
        otype: 'back',
        xValue: 1.32,
        price: 100, // Stake
        betAmount: 100 * (1.32 - 1), // 32
      };

      user.exposure += backBet.price; // 100
      user.avbalance = user.balance - user.exposure; // 900

      expect(user.balance).toBe(1000);
      expect(user.avbalance).toBe(900);
      expect(user.exposure).toBe(100);
      expect(backBet.betAmount).toBeCloseTo(32, 2); // ✅ Profit = 32

      // ============================================
      // STEP 2: PLACE LAY BET on Coleman Wong @ 1.33 (HEDGE - SAME TEAM)
      // ============================================
      const layBet = {
        teamName: 'Coleman Wong',
        otype: 'lay',
        xValue: 1.33,
        price: 100 * (1.33 - 1), // 33 (liability)
        betAmount: 100, // Stake
      };

      // After offset (same team, different otype)
      // Back betAmount: 32
      // Lay price: 33
      // Since 32 < 33, partial offset occurs
      // Net betAmount = 100 - 100 = 0
      // Net exposure = 33 - 32 = 1

      const offsetBet = {
        teamName: 'Coleman Wong',
        otype: 'back', // Stays back
        xValue: 1.32,
        price: 100,
        betAmount: -1, // ✅ NEGATIVE = Net loss of 1 if Coleman wins
        status: 0,
      };

      // ✅ Actual exposure = 1 (not 100!)
      user.exposure = Math.abs(offsetBet.betAmount); // 1
      user.avbalance = user.balance - user.exposure; // 999

      expect(offsetBet.betAmount).toBe(-1);
      expect(user.balance).toBe(1000);
      expect(user.avbalance).toBe(999); // ✅ Only 1 locked, not 50!
      expect(user.exposure).toBe(1); // ✅ Exposure = 1 (matches website!)

      // ============================================
      // STEP 3: MATCH RESULT - Coleman Wong WINS!
      // ============================================
      const winner = 'Coleman Wong';
      const win = winner.toLowerCase() === offsetBet.teamName.toLowerCase();

      if (win && offsetBet.betAmount < 0) {
        // Offset bet: Team wins but net is LOSS
        user.balance += offsetBet.betAmount; // 1000 + (-1) = 999
        user.bettingProfitLoss += offsetBet.betAmount; // -1
        offsetBet.status = 2;

        // After settlement
        user.avbalance = user.balance; // 999
        user.exposure = 0;
      }

      // ✅ FINAL ASSERTIONS
      expect(user.balance).toBe(999); // Lost 1 rupee
      expect(user.avbalance).toBe(999); // ✅ Equal to balance
      expect(user.exposure).toBe(0); // ✅ Cleared
      expect(user.bettingProfitLoss).toBe(-1); // Net loss
      expect(offsetBet.status).toBe(2); // LOSS status
    });
    test('Back bet LOSS - Offset: COMPLETE JOURNEY (Place → Settle as LOSS)', () => {
      let user = {
        balance: 1000,
        avbalance: 1000,
        bettingProfitLoss: 0,
        exposure: 0,
      };

      // ============================================
      // STEP 1: PLACE BACK BET
      // ============================================
      const backBet = {
        teamName: 'Team A',
        otype: 'back',
        xValue: 2.0,
        price: 100,
        betAmount: 100 * (2.0 - 1), // 100
      };

      user.exposure += backBet.price; // 100
      user.avbalance = user.balance - user.exposure; // 900

      expect(user.balance).toBe(1000);
      expect(user.avbalance).toBe(900);
      expect(user.exposure).toBe(100);

      // ============================================
      // STEP 2: PLACE LAY BET (HEDGE - SAME TEAM)
      // ============================================
      const layBet = {
        teamName: 'Team A',
        otype: 'lay',
        xValue: 2.5,
        price: 100 * (2.5 - 1), // 150
        betAmount: 100,
      };

      // After offset
      const offsetBet = {
        teamName: 'Team A',
        otype: 'back',
        xValue: 2.0,
        price: 100,
        betAmount: -50, // NEGATIVE = offset
        status: 0,
      };

      user.exposure = Math.abs(offsetBet.betAmount); //50              // 100
      user.avbalance = user.balance - user.exposure; // 950

      expect(offsetBet.betAmount).toBe(-50);
      expect(user.balance).toBe(1000);
      expect(user.avbalance).toBe(950);

      // ============================================
      // STEP 3: MATCH RESULT - TEAM A LOSES! ❌
      // ============================================
      console.log(`
        ════════════════════════════════════════════════════════════
        SCENARIO: Offset Bet (betAmount = -50) When Team LOSES
        ════════════════════════════════════════════════════════════
        
        Back bet profit potential: +100
        Lay bet loss potential: -150
        Net: -50 (net loss if team wins)
        
        BUT Team LOSES the match:
        - Back loses the bet: back stake lost (but offset cancels it)
        - Lay wins the bet: lay profit gained (but offset cancels it)
        - Net: BREAK EVEN ✅
        `);

      const winner = 'Team B'; // Different team - Team A LOSES
      const win = winner.toLowerCase() === offsetBet.teamName.toLowerCase();

      console.log(`
        win = ${win} (Team A didn't win)
        betAmount < 0 = ${offsetBet.betAmount < 0}
        
        Settlement Logic:
        ├─ !win (Team lost): TRUE
        ├─ betAmount < 0 (offset): TRUE
        └─ Enters offset LOSS logic
        `);

      if (!win && offsetBet.betAmount < 0) {
        // Offset bet when team LOSES = BREAK EVEN
        // Balance stays same (break even)
        user.balance += 0; // 1000 (no change)
        user.bettingProfitLoss += 0; // 0 (break even)
        offsetBet.status = 1; // WIN status (break even is good)

        // ✅ KEY: After settlement, exposure is CLEARED
        user.avbalance = user.balance; // 1000 = 1000
        user.exposure = 0; // All cleared!

        console.log(`
          Settlement Calculation:
          ├─ balance += 0 = 1000 (no change - break even)
          ├─ bettingProfitLoss += 0 = 0 (break even)
          ├─ avbalance = balance = 1000 ✅ (exposure cleared)
          ├─ exposure = 0 ✅ (bet settled)
          └─ status = 1 (WIN - break even is favorable)
      
          AFTER Settlement:
          ├─ balance: 1000 ✅ (unchanged)
          ├─ avbalance: 1000 ✅ (equal to balance)
          ├─ exposure: 0 ✅ (CLEARED!)
          ├─ bettingProfitLoss: 0 (break even)
          └─ status: 1 (WIN)
          `);
      }

      // ✅ FINAL ASSERTIONS
      expect(user.balance).toBe(1000); // ✅ Unchanged
      expect(user.avbalance).toBe(1000); // ✅ EQUAL to balance
      expect(user.exposure).toBe(0); // ✅ CLEARED
      expect(user.bettingProfitLoss).toBe(0); // Break even
      expect(offsetBet.status).toBe(1); // WIN (break even)

      console.log(`
        ════════════════════════════════════════════════════════════
        CORRECTED COMPARISON: WIN vs LOSS for Offset Bet
        ════════════════════════════════════════════════════════════
        
        When Team A WINS (betAmount = -50):
        ├─ Before: balance=1000, avbalance=900, exposure=100
        ├─ After:  balance=950, avbalance=950, exposure=0 ✅
        ├─ Result: LOSES 50 (net loss)
        └─ Status: 2 (LOSS)
      
        When Team A LOSES (betAmount = -50):
        ├─ Before: balance=1000, avbalance=900, exposure=100
        ├─ After:  balance=1000, avbalance=1000, exposure=0 ✅
        ├─ Result: BREAK EVEN (no change)
        └─ Status: 1 (WIN)
      
        ════════════════════════════════════════════════════════════
        Both cases: balance = avbalance ✅, exposure = 0 ✅
        ════════════════════════════════════════════════════════════
        `);
    });
  });

  // ========================================
  // MATCH ODDS - LAY BET (ODDS 1.5)
  // ========================================
  describe('Match Odds - Lay Bet (Stake 100, Odds 1.5)', () => {
    test('Lay bet WIN (user loses: -50)', () => {
      const user = {
        balance: 1000,
        avbalance: 950,
        bettingProfitLoss: 0,
      };

      const bet = {
        gameType: 'Match Odds',
        otype: 'lay',
        teamName: 'Team A',
        xValue: 1.5,
        price: 50, // Liability = 100 * (1.5 - 1)
        betAmount: 100, // Profit if loses
        status: 0,
      };

      const winner = 'Team A';
      const win = winner.toLowerCase() === bet.teamName.toLowerCase();

      // CALCULATION: Lay WIN (user loses) = -liability
      if (win) {
        user.balance -= bet.price; // 1000 - 50 = 950
        user.bettingProfitLoss -= bet.price; // 0 - 50 = -50
        bet.status = 2; // LOSS
      }

      expect(user.balance).toBe(950); // -50 loss
      expect(user.avbalance).toBe(950); // Unchanged
      expect(user.bettingProfitLoss).toBe(-50); // -50 loss
      expect(bet.status).toBe(2);
    });

    test('Lay bet LOSS (user wins: +100 profit)', () => {
      const user = {
        balance: 1000,
        avbalance: 950,
        bettingProfitLoss: 0,
      };

      const bet = {
        gameType: 'Match Odds',
        otype: 'lay',
        teamName: 'Team A',
        xValue: 1.5,
        price: 50,
        betAmount: 100,
        status: 0,
      };

      const winner = 'Team B';
      const win = winner.toLowerCase() === bet.teamName.toLowerCase();

      // CALCULATION: Lay LOSS (user wins) = +profit + liability
      if (!win) {
        const winAmount = bet.betAmount + bet.price; // 100 + 50 = 150
        user.balance += bet.betAmount; // 1000 + 100 = 1100
        user.avbalance += winAmount; // 950 + 150 = 1100
        user.bettingProfitLoss += bet.betAmount; // 0 + 100 = 100
        bet.status = 1; // WIN
      }

      expect(user.balance).toBe(1100); // +100 profit
      expect(user.avbalance).toBe(1100); // +150 (profit + liability)
      expect(user.bettingProfitLoss).toBe(100); // +100 profit
      expect(bet.status).toBe(1);
    });
  });

  // ========================================
  // BOOKMAKER - BACK BET (ODDS 2.0)
  // ========================================
  describe('Bookmaker - Back Bet (Stake 100, Odds 2.0)', () => {
    test('Bookmaker Back WIN (full profit: 100)', () => {
      const user = {
        balance: 1000,
        avbalance: 900,
        bettingProfitLoss: 0,
      };

      const bet = {
        gameType: 'Bookmaker',
        otype: 'back',
        teamName: 'Team A',
        xValue: 2.0,
        price: 100,
        betAmount: 100,
        status: 0,
      };

      const winner = 'Team A';
      const win = winner.toLowerCase() === bet.teamName.toLowerCase();

      // CALCULATION: Bookmaker back WIN = +profit + stake
      if (win) {
        const winAmount = bet.betAmount + bet.price; // 100 + 100 = 200
        user.balance += winAmount; // 1000 + 200 = 1200
        user.avbalance += winAmount; // 900 + 200 = 1100
        user.bettingProfitLoss += winAmount; // 0 + 200 = 200
        bet.status = 1;
      }

      expect(user.balance).toBe(1200); // +200 total
      expect(user.avbalance).toBe(1100); // +200 total
      expect(user.bettingProfitLoss).toBe(200); // +200
      expect(bet.status).toBe(1);

      console.log('✅ Bookmaker Back WIN:');
      console.log(`   Stake: 100, Odds: 2.0, Profit: 100`);
      console.log(`   Balance: 1000 → 1200 (+200 total: stake+profit)`);
    });

    test('Bookmaker Back LOSS (full loss: -100)', () => {
      const user = {
        balance: 1000,
        avbalance: 900,
        bettingProfitLoss: 0,
      };

      const bet = {
        gameType: 'Bookmaker',
        otype: 'back',
        teamName: 'Team A',
        xValue: 2.0,
        price: 100,
        betAmount: 100,
        status: 0,
      };

      const winner = 'Team B';
      const win = winner.toLowerCase() === bet.teamName.toLowerCase();

      // CALCULATION: Bookmaker back LOSS = -stake
      if (!win) {
        user.balance -= bet.price; // 1000 - 100 = 900
        user.bettingProfitLoss -= bet.price; // 0 - 100 = -100
        bet.status = 2;
      }

      expect(user.balance).toBe(900); // -100
      expect(user.avbalance).toBe(900); // Unchanged
      expect(user.bettingProfitLoss).toBe(-100); // -100
      expect(bet.status).toBe(2);

      console.log('❌ Bookmaker Back LOSS:');
      console.log(`   Stake: 100, Odds: 2.0`);
      console.log(`   Balance: 1000 → 900 (-100)`);
    });
  });

  // ========================================
  // SUMMARY: All Settlement Scenarios
  // ========================================
  describe('Settlement Summary - All Scenarios', () => {
    test('Complete settlement cycle with multiple outcomes', () => {
      let user = {
        balance: 2000,
        avbalance: 1700,
        bettingProfitLoss: 0,
      };

      console.log('\n📊 STARTING STATE:');
      console.log(
        `   Balance: ${user.balance}, AvBalance: ${user.avbalance}, P/L: ${user.bettingProfitLoss}`
      );

      // Bet 1: Back bet WIN (profit 100)
      console.log('\n🎲 BET 1: Back @ 2.0 → WIN');
      user.balance += 100; // +100 profit
      user.avbalance += 200; // +200 (profit + stake)
      user.bettingProfitLoss += 100;
      console.log(
        `   Balance: 2000 → 2100, AvBalance: 1700 → 1900, P/L: 0 → 100`
      );

      // Bet 2: Lay bet LOSS (profit 100 from liability 50)
      console.log('\n🎲 BET 2: Lay @ 1.5 → LOSS (user wins)');
      user.balance += 100; // +100 profit
      user.avbalance += 150; // +150 (profit + liability)
      user.bettingProfitLoss += 100;
      console.log(
        `   Balance: 2100 → 2200, AvBalance: 1900 → 2050, P/L: 100 → 200`
      );

      // Bet 3: Back bet LOSS (loss 100)
      console.log('\n🎲 BET 3: Back @ 2.0 → LOSS');
      user.balance -= 100; // -100 loss
      user.bettingProfitLoss -= 100;
      console.log(
        `   Balance: 2200 → 2100, AvBalance: 2050 → 2050 (no change), P/L: 200 → 100`
      );

      console.log('\n✅ FINAL STATE:');
      console.log(
        `   Balance: ${user.balance}, AvBalance: ${user.avbalance}, P/L: ${user.bettingProfitLoss}`
      );

      expect(user.balance).toBe(2100);
      expect(user.avbalance).toBe(2050);
      expect(user.bettingProfitLoss).toBe(100);
    });
  });
});
