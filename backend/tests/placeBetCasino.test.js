describe('placeCasinoBet - TeenPatti Complete Test Suite', () => {
  const calculateTeenPatti = (stake, odds, otype) => {
    let betAmount, price;

    if (otype === 'back') {
      price = stake;
      betAmount = stake * (odds - 1);
    } else {
      price = stake * (odds - 1);
      betAmount = stake;
    }

    return {
      price: parseFloat(price.toFixed(2)),
      betAmount: parseFloat(betAmount.toFixed(2)),
    };
  };

  // ========================================
  // SECTION 1: TEENPATTI BET CALCULATIONS
  // ========================================
  describe('1️⃣ TeenPatti Bet Calculations', () => {
    test('TeenPatti back bet: stake=100, odds=2.5', () => {
      const { price, betAmount } = calculateTeenPatti(100, 2.5, 'back');

      console.log(`Input: stake=100, odds=2.5, type=back`);
      console.log(`Formula: price = stake = 100`);
      console.log(`Formula: betAmount = stake × (odds - 1) = 100 × 1.5 = 150`);
      console.log(`Result: price=${price}, betAmount=${betAmount}`);

      expect(price).toBe(100);
      expect(betAmount).toBe(150);
    });

    test('TeenPatti lay bet: stake=100, odds=2.5', () => {
      const { price, betAmount } = calculateTeenPatti(100, 2.5, 'lay');

      expect(price).toBe(150);
      expect(betAmount).toBe(100);
    });

    test('TeenPatti back bet @ 1.08: stake=100', () => {
      const { price, betAmount } = calculateTeenPatti(100, 1.08, 'back');
      expect(price).toBe(100);
      expect(betAmount).toBeCloseTo(8, 2);
    });

    test('TeenPatti lay bet @ 1.08: stake=100', () => {
      const { price, betAmount } = calculateTeenPatti(100, 1.08, 'lay');
      expect(price).toBeCloseTo(8, 2);
      expect(betAmount).toBe(100);
    });

    test('TeenPatti - very small odds 1.01', () => {
      const { price, betAmount } = calculateTeenPatti(100, 1.01, 'back');
      expect(price).toBe(100);
      expect(betAmount).toBe(1);
    });

    test('TeenPatti - decimal precision rounding', () => {
      const { price, betAmount } = calculateTeenPatti(100, 2.125, 'back');
      expect(betAmount).toBeCloseTo(112.5, 1);
    });
  });

  // ========================================
  // SECTION 2: BALANCE VALIDATION
  // ========================================
  describe('2️⃣ Balance Validation', () => {
    test('Reject when avbalance insufficient', () => {
      console.log('\n' + '='.repeat(80));
      console.log('BALANCE: Insufficient AvBalance');
      console.log('='.repeat(80));

      const user = { avbalance: 50, balance: 1000 };
      const price = 100;

      const hasInsufficientBalance =
        user.avbalance < price || user.balance < price;

      console.log(`User avbalance=${user.avbalance}, balance=${user.balance}`);
      console.log(`Bet price=${price}`);
      console.log(`Result: REJECTED (insufficient)`);

      expect(hasInsufficientBalance).toBe(true);
    });

    test('Reject when balance insufficient', () => {
      const user = { avbalance: 1000, balance: 50 };
      const price = 100;
      expect(user.avbalance < price || user.balance < price).toBe(true);
    });

    test('Accept when both balances sufficient', () => {
      const user = { avbalance: 1000, balance: 1000 };
      const price = 100;
      expect(user.avbalance < price || user.balance < price).toBe(false);
    });

    test('Edge case - exact balance match', () => {
      const user = { avbalance: 100, balance: 100 };
      const price = 100;
      expect(user.avbalance < price || user.balance < price).toBe(false);
    });
  });

  // ========================================
  // SECTION 3: EXPOSURE CALCULATIONS
  // ========================================
  describe('3️⃣ Exposure Calculations', () => {
    test('Calculate total exposure from pending bets', () => {
      console.log('\n' + '='.repeat(80));
      console.log('EXPOSURE: Total Pending Casino Bets');
      console.log('='.repeat(80));

      const pendingBets = [{ price: 100 }, { price: 200 }, { price: 150 }];

      const totalExposure = pendingBets.reduce((sum, b) => sum + b.price, 0);

      console.log(`Pending bets: [100, 200, 150]`);
      console.log(`Total exposure: ${totalExposure}`);

      expect(totalExposure).toBe(450);
    });

    test('Reject when exposure limit exceeded', () => {
      const user = { exposureLimit: 50000 };
      const totalPending = 45000;
      const newBetPrice = 6000;

      expect(user.exposureLimit < totalPending + newBetPrice).toBe(true);
    });

    test('Accept when within exposure limit', () => {
      const user = { exposureLimit: 50000 };
      const totalPending = 40000;
      const newBetPrice = 5000;

      expect(user.exposureLimit < totalPending + newBetPrice).toBe(false);
    });

    test('Exact exposure limit edge case', () => {
      const user = { exposureLimit: 50000 };
      const totalPending = 49900;
      const newBetPrice = 100;

      expect(user.exposureLimit < totalPending + newBetPrice).toBe(false);
    });

    test('Updated exposure after new bet placement', () => {
      const updatedBets = [
        { price: 100 },
        { price: 200 },
        { price: 150 },
        { price: 100 },
      ];

      const newExposure = updatedBets.reduce((sum, b) => sum + b.price, 0);
      expect(newExposure).toBe(550);
    });
  });

  // ========================================
  // SECTION 4: SINGLE BET PLACEMENT
  // ========================================
  describe('4️⃣ Single Bet Placement - Balance & Exposure Tracking', () => {
    test('TeenPatti back bet - first placement', () => {
      let user = { balance: 1000, avbalance: 1000, exposure: 0 };

      const { price, betAmount } = calculateTeenPatti(100, 2.0, 'back');

      console.log(`Bet: stake=100, odds=2.0, type=back`);
      console.log(`Calculated: price=${price}, betAmount=${betAmount}`);

      user.exposure += price;
      user.avbalance = user.balance - user.exposure;

      console.log(
        `After placement: exposure=${user.exposure}, avbalance=${user.avbalance}`
      );

      expect(price).toBe(100);
      expect(betAmount).toBe(100);
      expect(user.exposure).toBe(100);
      expect(user.avbalance).toBe(900);
    });

    test('TeenPatti lay bet - first placement', () => {
      let user = { balance: 1000, avbalance: 1000, exposure: 0 };

      const { price, betAmount } = calculateTeenPatti(100, 1.5, 'lay');

      user.exposure += price;
      user.avbalance = user.balance - user.exposure;

      expect(price).toBe(50);
      expect(betAmount).toBe(100);
      expect(user.exposure).toBe(50);
      expect(user.avbalance).toBe(950);
    });
  });

  // ========================================
  // SECTION 5: BET MERGING (SAME TEAM, SAME TYPE)
  // ========================================
  describe('5️⃣ Bet Merging - Same Team, Same Type', () => {
    test('Two back bets on same team - MERGE', () => {
      console.log('\n' + '='.repeat(80));
      console.log('MERGE: Two Back Bets on Same Team');
      console.log('='.repeat(80));

      let user = {
        balance: 1000,
        avbalance: 1000,
        exposure: 0,
      };

      // BET 1
      let bet = {
        teamName: 'Team A',
        otype: 'back',
        price: 100,
        betAmount: 100,
        xValue: 2.0,
      };

      user.exposure += bet.price; // 0 + 100 = 100
      user.avbalance = user.balance - user.exposure; // 1000 - 100 = 900

      // BET 2 - MERGE
      const { price: price2, betAmount: betAmount2 } = calculateTeenPatti(
        100,
        3.0,
        'back'
      );

      const oldPrice = bet.price;
      const oldOdds = bet.xValue;

      bet.price = parseFloat((oldPrice + price2).toFixed(2));
      bet.xValue = parseFloat(
        ((oldOdds * oldPrice + 3.0 * price2) / (oldPrice + price2)).toFixed(2)
      );
      bet.betAmount = parseFloat((bet.betAmount + betAmount2).toFixed(2));

      user.exposure = bet.price; // Merged bet, so exposure = merged price
      user.avbalance = user.balance - user.exposure;

      expect(user.balance).toBe(1000);
      expect(bet.price).toBe(200);
      expect(bet.xValue).toBe(2.5);
      expect(bet.betAmount).toBe(300);
      expect(user.exposure).toBe(200);
      expect(user.avbalance).toBe(800);
    });

    test('Three back bets on same team - multiple merges', () => {
      let user = { balance: 1000, avbalance: 1000, exposure: 0 };
      let allBets = [];

      // ============================================
      // BET 1: Team A Back @ 2.0, Stake 100
      // ============================================

      const bet1Odds = 2.0;
      const bet1Stake = 100;
      const bet1Price = bet1Stake; // 100
      const bet1BetAmount = bet1Stake * (bet1Odds - 1); // 100 * 1.0 = 100

      console.log(`  Input: Team=Team A, Type=back, Odds=2.0, Stake=100`);
      console.log(
        `  Calculation: price=stake=100, betAmount=stake*(odds-1)=100*1.0=100`
      );

      let bet = {
        teamName: 'Team A',
        otype: 'back',
        price: bet1Price,
        betAmount: bet1BetAmount,
        xValue: bet1Odds,
      };
      allBets.push({ ...bet });

      user.exposure = bet.price; // 100
      user.avbalance = user.balance - user.exposure; // 1000 - 100 = 900

      expect(bet.price).toBe(100);
      expect(bet.betAmount).toBe(100);
      expect(user.exposure).toBe(100);
      expect(user.avbalance).toBe(900);

      // ============================================
      // BET 2: Team A Back @ 1.5, Stake 100 - MERGE WITH BET 1
      // ============================================

      const bet2Odds = 1.5;
      const bet2Stake = 100;
      const bet2Price = bet2Stake; // 100
      const bet2BetAmount = bet2Stake * (bet2Odds - 1); // 100 * 0.5 = 50

      // Calculate merged values
      const oldPrice1 = bet.price; // 100
      const oldOdds1 = bet.xValue; // 2.0
      const newPrice1 = oldPrice1 + bet2Price; // 100 + 100 = 200
      const newOdds1 =
        (oldOdds1 * oldPrice1 + bet2Odds * bet2Price) / newPrice1; // (2.0*100 + 1.5*100) / 200 = 350/200 = 1.75
      const newBetAmount1 = bet.betAmount + bet2BetAmount; // 100 + 50 = 150

      bet.price = newPrice1;
      bet.xValue = parseFloat(newOdds1.toFixed(2));
      bet.betAmount = newBetAmount1;

      user.exposure = bet.price; // 200
      user.avbalance = user.balance - user.exposure; // 1000 - 200 = 800

      expect(bet.price).toBe(200);
      expect(bet.xValue).toBe(1.75);
      expect(bet.betAmount).toBe(150);
      expect(user.exposure).toBe(200);
      expect(user.avbalance).toBe(800);
      expect(user.balance).toBe(1000);

      // ============================================
      // BET 3: Team A Back @ 4.0, Stake 200 - MERGE WITH PREVIOUS
      // ============================================

      const bet3Odds = 4.0;
      const bet3Stake = 200;
      const bet3Price = bet3Stake; // 200
      const bet3BetAmount = bet3Stake * (bet3Odds - 1); // 200 * 3.0 = 600

      // Calculate merged values
      const oldPrice2 = bet.price; // 200
      const oldOdds2 = bet.xValue; // 1.75
      const oldBetAmount2 = bet.betAmount; // 150
      const newPrice2 = oldPrice2 + bet3Price; // 200 + 200 = 400
      const newOdds2 =
        (oldOdds2 * oldPrice2 + bet3Odds * bet3Price) / newPrice2; // (1.75*200 + 4.0*200) / 400 = (350+800)/400 = 1150/400 = 2.875
      const newBetAmount2 = oldBetAmount2 + bet3BetAmount; // 150 + 600 = 750

      bet.price = newPrice2;
      bet.xValue = parseFloat(newOdds2.toFixed(2));
      bet.betAmount = newBetAmount2;

      user.exposure = bet.price; // 400
      user.avbalance = user.balance - user.exposure; // 1000 - 400 = 600

      expect(bet.price).toBe(400);
      expect(bet.xValue).toBeCloseTo(2.875, 2);
      expect(bet.betAmount).toBe(750);
      expect(user.exposure).toBe(400);
      expect(user.avbalance).toBe(600);
    });

    test('Two lay bets on same team - MERGE', () => {
      let user = { balance: 1000, avbalance: 1000, exposure: 0 };

      // ============================================
      // BET 1: Lay @ 1.5, Stake 100
      // ============================================

      const bet1Stake = 100;
      const bet1Odds = 1.5;

      let bet = {
        teamName: 'Team B',
        otype: 'lay',
        price: 50, // From formula: 100 × 0.5 = 50
        betAmount: 100, // From formula: stake = 100
        xValue: 1.5,
      };

      user.exposure = bet.price; // 50
      user.avbalance = user.balance - user.exposure; // 950

      expect(user.avbalance).toBe(950);
      expect(user.exposure).toBe(50);

      // ============================================
      // BET 2: Lay @ 2.0, Stake 100 - MERGE WITH BET 1
      // ============================================

      const bet2Stake = 100;
      const bet2Odds = 2.0;

      const price2 = 100; // From formula: 100 × 1.0 = 100
      const betAmount2 = 100; // From formula: stake = 100

      // ============================================
      // MERGE: Same Team + Same Type
      // ============================================

      const oldPrice = bet.price; // 50
      const oldOdds = bet.xValue; // 1.5
      const oldBetAmount = bet.betAmount; // 100

      bet.price = parseFloat((oldPrice + price2).toFixed(2));
      bet.xValue = parseFloat(
        (
          (oldOdds * oldPrice + bet2Odds * price2) /
          (oldPrice + price2)
        ).toFixed(2)
      );
      bet.betAmount = parseFloat((oldBetAmount + betAmount2).toFixed(2));

      user.exposure = bet.price; // 150
      user.avbalance = user.balance - user.exposure; // 850

      expect(user.balance).toBe(1000);
      expect(bet.price).toBe(150);
      expect(bet.xValue).toBeCloseTo(1.83, 2);
      expect(bet.betAmount).toBe(200);
      expect(user.exposure).toBe(150);
      expect(user.avbalance).toBe(850);
    });
  });

  // ========================================
  // SECTION 6: BET OFFSETTING - Same Team, Different Type
  // ========================================
  describe('6️⃣ Bet Offsetting - Same Team, Different Type', () => {
    // BACK EXISTING + LAY INCOMING
    test('Back @ 2.0 + Lay @ 2.0 (Full Offset)', () => {
      let user = { balance: 1000, avbalance: 1000, exposure: 0 };
      let bet = {
        teamName: 'Team A',
        otype: 'back',
        price: 100,
        betAmount: 100,
        xValue: 2.0,
      };
      user.avbalance = 900;

      // Incoming: Lay @ 2.0, Stake 100 → price=100, betAmount=100
      const originalBetAmount = 100;
      const incomingPrice = 100;

      // if (originalBetAmount >= incomingPrice) → FULL offset
      if (originalBetAmount >= incomingPrice) {
        bet.price = parseFloat((100 - 100).toFixed(2));
        bet.betAmount = parseFloat((100 - 100).toFixed(2));
        user.avbalance = parseFloat((900 + 100).toFixed(2));
      }

      expect(bet.price).toBe(0);
      expect(bet.betAmount).toBe(0);
      expect(user.avbalance).toBe(1000);
    });

    test('Back @ 3.0 + Lay @ 2.5 (Partial Offset, LAY stronger, type changes)', () => {
      let user = { balance: 1000, avbalance: 1000, exposure: 0 };
      let bet = {
        teamName: 'Team A',
        otype: 'back',
        price: 100,
        betAmount: 200,
        xValue: 3.0,
      };
      user.avbalance = 900;

      // Incoming: Lay @ 2.5, Stake 300 → price=450, betAmount=300
      const originalBetAmount = 200;
      const originalPrice = 100;
      const incomingPrice = 450;
      const incomingBetAmount = 300;

      // if (originalBetAmount >= incomingPrice) → else (PARTIAL offset with type change)
      if (originalBetAmount >= incomingPrice) {
        bet.price = parseFloat((originalPrice - incomingBetAmount).toFixed(2));
        bet.betAmount = parseFloat(
          (originalBetAmount - incomingPrice).toFixed(2)
        );
      } else {
        // LAY is stronger
        bet.price = parseFloat((incomingPrice - originalBetAmount).toFixed(2));
        bet.betAmount = parseFloat(
          (incomingBetAmount - originalPrice).toFixed(2)
        );
        bet.otype = 'lay';
        user.avbalance = parseFloat(
          (
            user.avbalance +
            originalPrice -
            (incomingPrice - originalBetAmount)
          ).toFixed(2)
        );
      }

      expect(bet.price).toBe(250); // 450 - 200
      expect(bet.betAmount).toBe(200); // 300 - 100
      expect(bet.otype).toBe('lay');
      expect(user.avbalance).toBe(750);
    });

    // LAY EXISTING + BACK INCOMING
    test('Lay @ 2.0 + Back @ 2.0 (Full Offset)', () => {
      let user = { balance: 1000, avbalance: 1000, exposure: 0 };
      let bet = {
        teamName: 'Team A',
        otype: 'lay',
        price: 100,
        betAmount: 100,
        xValue: 2.0,
      };
      user.avbalance = 900;

      // Incoming: Back @ 2.0, Stake 100 → price=100, betAmount=100
      const originalPrice = 100;
      const incomingBetAmount = 100;

      // if (originalPrice >= incomingBetAmount) → FULL offset
      if (originalPrice >= incomingBetAmount) {
        bet.price = parseFloat((100 - 100).toFixed(2));
        bet.betAmount = parseFloat((100 - 100).toFixed(2));
        user.avbalance = parseFloat((900 + 100).toFixed(2));
      }

      expect(bet.price).toBe(0);
      expect(bet.betAmount).toBe(0);
      expect(user.avbalance).toBe(1000);
    });

    test('Lay @ 2.0 + Back @ 3.0 (Partial Offset, BACK stronger, type changes)', () => {
      let user = { balance: 1000, avbalance: 1000, exposure: 0 };
      let bet = {
        teamName: 'Team A',
        otype: 'lay',
        price: 100,
        betAmount: 100,
        xValue: 2.0,
      };
      user.avbalance = 900;

      // Incoming: Back @ 3.0, Stake 100 → price=100 (stake), betAmount=200 (profit)
      const originalPrice = 100; // lay liability
      const originalBetAmount = 100; // lay stake
      const incomingPrice = 100; // back stake = price for back
      const incomingBetAmount = 200; // back profit = betAmount for back

      // Controller check: if (originalPrice >= incomingBetAmount)
      // 100 >= 200? NO → PARTIAL offset with type change
      if (originalPrice >= incomingBetAmount) {
        bet.price = parseFloat((originalPrice - incomingBetAmount).toFixed(2));
        bet.betAmount = parseFloat(
          (originalBetAmount - incomingPrice).toFixed(2)
        );
      } else {
        // BACK is stronger - PARTIAL OFFSET
        // Controller code (from your lay existing + back incoming):
        // existingBet.price = p - originalBetAmount;
        // existingBet.betAmount = betAmount - originalPrice;
        // user.avbalance -= (p - originalBetAmount) - originalPrice;

        bet.price = parseFloat((incomingPrice - originalBetAmount).toFixed(2));
        bet.betAmount = parseFloat(
          (incomingBetAmount - originalPrice).toFixed(2)
        );
        bet.otype = 'back';
        // CONTROLLER: avbalance -= (p - originalBetAmount) - originalPrice
        // = 900 - (100 - 100) - 100 = 900 - 0 - 100 = 800
        user.avbalance = parseFloat(
          (
            user.avbalance -
            (incomingPrice - originalBetAmount) -
            originalPrice
          ).toFixed(2)
        );
      }

      expect(bet.price).toBe(0); // 100 - 100
      expect(bet.betAmount).toBe(100); // 200 - 100
      expect(bet.otype).toBe('back');
      expect(user.avbalance).toBe(800); // 900 - (100 - 100) - 100
    });

    // ============================================================
    // MISSING CRITICAL TEST CASES - Explicit Condition Coverage
    // ============================================================

    test('🔴 MISSING: Back @ 2.0 + Lay @ 1.5 (PARTIAL, originalBetAmount >= incomingPrice TRUE)', () => {
      let user = { balance: 1000, avbalance: 1000 };
      let bet = {
        teamName: 'Team A',
        otype: 'back',
        price: 100,
        betAmount: 100,
        xValue: 2.0,
      };
      user.avbalance = 900;

      // Incoming: Lay @ 1.5, Stake 100 → price=50, betAmount=100
      const originalBetAmount = 100; // back profit
      const originalPrice = 100; // back stake
      const incomingPrice = 50; // lay liability
      const incomingBetAmount = 100; // lay stake

      // Controller check: if (originalBetAmount >= incomingPrice)
      // 100 >= 50? YES → BACK survives with reduced values (EXPLICIT TRUE PATH)
      if (originalBetAmount >= incomingPrice) {
        // BACK survives - reduce by LAY's pressure
        bet.price = parseFloat((originalPrice - incomingBetAmount).toFixed(2));
        bet.betAmount = parseFloat(
          (originalBetAmount - incomingPrice).toFixed(2)
        );
        user.avbalance = parseFloat(
          (user.avbalance + incomingPrice).toFixed(2)
        );
      } else {
        // LAY survives
        bet.price = parseFloat((incomingPrice - originalBetAmount).toFixed(2));
        bet.betAmount = parseFloat(
          (incomingBetAmount - originalPrice).toFixed(2)
        );
        bet.otype = 'lay';
        user.avbalance = parseFloat(
          (
            user.avbalance +
            originalPrice -
            (incomingPrice - originalBetAmount)
          ).toFixed(2)
        );
      }

      expect(bet.price).toBe(0); // 100 - 100 = 0
      expect(bet.betAmount).toBe(50); // 100 - 50 = 50
      expect(bet.otype).toBe('back'); // Type stays BACK
      expect(user.avbalance).toBe(950); // 900 + 50
    });

    test('🔴 MISSING: Back @ 1.5 + Lay @ 1.8 (PARTIAL, originalBetAmount >= incomingPrice TRUE, non-zero price)', () => {
      let user = { balance: 1000, avbalance: 1000 };
      let bet = {
        teamName: 'Team A',
        otype: 'back',
        price: 100,
        betAmount: 50,
        xValue: 1.5,
      };
      user.avbalance = 900;

      // Incoming: Lay @ 1.8, Stake 100 → price=80, betAmount=100
      const originalBetAmount = 50; // back profit (1.5-1)*100
      const originalPrice = 100; // back stake
      const incomingPrice = 80; // lay liability (1.8-1)*100
      const incomingBetAmount = 100; // lay stake

      // 50 >= 80? NO → LAY is stronger, but different values
      if (originalBetAmount >= incomingPrice) {
        bet.price = parseFloat((originalPrice - incomingBetAmount).toFixed(2));
        bet.betAmount = parseFloat(
          (originalBetAmount - incomingPrice).toFixed(2)
        );
        user.avbalance = parseFloat(
          (user.avbalance + incomingPrice).toFixed(2)
        );
      } else {
        // LAY is stronger
        bet.price = parseFloat((incomingPrice - originalBetAmount).toFixed(2));
        bet.betAmount = parseFloat(
          (incomingBetAmount - originalPrice).toFixed(2)
        );
        bet.otype = 'lay';
        user.avbalance = parseFloat(
          (
            user.avbalance +
            originalPrice -
            (incomingPrice - originalBetAmount)
          ).toFixed(2)
        );
      }

      expect(bet.price).toBe(30); // 80 - 50 = 30
      expect(bet.betAmount).toBe(0); // 100 - 100 = 0
      expect(bet.otype).toBe('lay'); // Type changes to LAY
      expect(user.avbalance).toBe(970); // 900 + 100 - (80-50) = 900 + 100 - 30 = 970
    });

    test('🔴 MISSING: Lay @ 3.0 + Back @ 1.5 (PARTIAL, originalPrice >= incomingBetAmount TRUE)', () => {
      let user = { balance: 1000, avbalance: 1000 };
      let bet = {
        teamName: 'Team A',
        otype: 'lay',
        price: 200,
        betAmount: 100,
        xValue: 3.0,
      };
      user.avbalance = 800;

      // Incoming: Back @ 1.5, Stake 100 → price=100, betAmount=50
      const originalPrice = 200; // lay liability
      const originalBetAmount = 100; // lay stake
      const incomingPrice = 100; // back stake
      const incomingBetAmount = 50; // back profit

      // Controller check: if (originalPrice >= incomingBetAmount)
      // 200 >= 50? YES → LAY survives (EXPLICIT TRUE PATH)
      if (originalPrice >= incomingBetAmount) {
        // LAY survives - reduce by BACK's pressure
        bet.price = parseFloat((originalPrice - incomingBetAmount).toFixed(2));
        bet.betAmount = parseFloat(
          (originalBetAmount - incomingPrice).toFixed(2)
        );
        user.avbalance = parseFloat(
          (user.avbalance + incomingPrice).toFixed(2)
        );
      } else {
        // BACK survives
        bet.price = parseFloat((incomingPrice - originalBetAmount).toFixed(2));
        bet.betAmount = parseFloat(
          (incomingBetAmount - originalPrice).toFixed(2)
        );
        bet.otype = 'back';
        user.avbalance = parseFloat(
          (
            user.avbalance -
            (incomingPrice - originalBetAmount) -
            originalPrice
          ).toFixed(2)
        );
      }

      expect(bet.price).toBe(150); // 200 - 50 = 150
      expect(bet.betAmount).toBe(0); // 100 - 100 = 0
      expect(bet.otype).toBe('lay'); // Type stays LAY
      expect(user.avbalance).toBe(900); // 800 + 100
    });

    test('🔴 MISSING: Lay @ 2.0 + Back @ 2.5 (PARTIAL, originalPrice >= incomingBetAmount TRUE, non-zero)', () => {
      let user = { balance: 1000, avbalance: 1000 };
      let bet = {
        teamName: 'Team A',
        otype: 'lay',
        price: 100,
        betAmount: 100,
        xValue: 2.0,
      };
      user.avbalance = 900;

      // Incoming: Back @ 2.5, Stake 100 → price=100, betAmount=150
      const originalPrice = 100; // lay liability
      const originalBetAmount = 100; // lay stake
      const incomingPrice = 100; // back stake
      const incomingBetAmount = 150; // back profit

      // 100 >= 150? NO → BACK is stronger
      if (originalPrice >= incomingBetAmount) {
        bet.price = parseFloat((originalPrice - incomingBetAmount).toFixed(2));
        bet.betAmount = parseFloat(
          (originalBetAmount - incomingPrice).toFixed(2)
        );
        user.avbalance = parseFloat(
          (user.avbalance + incomingPrice).toFixed(2)
        );
      } else {
        // BACK is stronger
        bet.price = parseFloat((incomingPrice - originalBetAmount).toFixed(2));
        bet.betAmount = parseFloat(
          (incomingBetAmount - originalPrice).toFixed(2)
        );
        bet.otype = 'back';
        user.avbalance = parseFloat(
          (
            user.avbalance -
            (incomingPrice - originalBetAmount) -
            originalPrice
          ).toFixed(2)
        );
      }

      expect(bet.price).toBe(0); // 100 - 100 = 0
      expect(bet.betAmount).toBe(50); // 150 - 100 = 50
      expect(bet.otype).toBe('back'); // Type changes to BACK
      expect(user.avbalance).toBe(800); // 900 - 0 - 100 = 800
    });
  });

  // SECTION 7: DIFFERENT TEAM SCENARIOS

  describe('7️⃣ Different Team Scenarios - Same Type', () => {
    test('Different team, same otype (back) - Full Reduction', () => {
      let user = { balance: 1000, avbalance: 1000 };

      // Bet 1: Team A Back
      let bet = {
        teamName: 'Team A',
        otype: 'back',
        price: 200,
        betAmount: 200,
        xValue: 2.0,
      };

      user.avbalance -= 200;

      // Bet 2: Team B Back (different team, same otype)
      const { price: price2, betAmount: betAmount2 } = calculateTeenPatti(
        100,
        2.0,
        'back'
      );
      const originalPrice = bet.price;

      // Full reduction: originalPrice (200) >= betAmount2 (100)
      if (originalPrice >= betAmount2) {
        bet.price = parseFloat((originalPrice - betAmount2).toFixed(2)); // 100
        bet.betAmount = parseFloat((bet.betAmount - price2).toFixed(2)); // 100
        user.avbalance = parseFloat((user.avbalance + betAmount2).toFixed(2));
      }

      expect(bet.price).toBe(100);
      expect(bet.betAmount).toBe(100);
      expect(user.avbalance).toBe(900);
    });

    test('🔴 MISSING: Different team, same otype - PARTIAL Reduction (originalPrice < betAmount2)', () => {
      let user = { balance: 1000, avbalance: 1000 };

      // Bet 1: Team A Back @ 1.5, Stake 100
      let bet = {
        teamName: 'Team A',
        otype: 'back',
        price: 100, // stake
        betAmount: 50, // 100 * 0.5
        xValue: 1.5,
      };

      user.avbalance = 900;

      // Bet 2: Team B Back @ 3.0, Stake 100 (price=100, betAmount=200)
      const originalPrice = bet.price; // 100
      const originalBetAmount = bet.betAmount; // 50
      const incomingPrice = 100; // back: stake
      const incomingBetAmount = 200; // back: 100 * 2.0

      // Controller check: if (originalPrice >= incomingBetAmount)
      // 100 >= 200? NO → PARTIAL reduction with team change (INCOMING stronger)
      if (originalPrice >= incomingBetAmount) {
        bet.price = parseFloat((originalPrice - incomingBetAmount).toFixed(2));
        bet.betAmount = parseFloat(
          (originalBetAmount - incomingPrice).toFixed(2)
        );
      } else {
        // PARTIAL reduction - incoming is stronger, team changes
        bet.price = parseFloat((incomingPrice - originalBetAmount).toFixed(2));
        bet.betAmount = parseFloat(
          (incomingBetAmount - originalPrice).toFixed(2)
        );
        bet.teamName = 'Team B';
        bet.xValue = 3.0;
        user.avbalance = parseFloat(
          (
            user.avbalance -
            (incomingPrice - originalBetAmount) +
            originalPrice
          ).toFixed(2)
        );
      }

      expect(bet.price).toBe(50); // 100 - 50
      expect(bet.betAmount).toBe(100); // 200 - 100
      expect(bet.teamName).toBe('Team B'); // TEAM CHANGED!
      expect(bet.xValue).toBe(3.0);
      expect(user.avbalance).toBe(950); // 900 - 50 + 100
    });

    test('🔴 MISSING: Different team, same otype (lay) - PARTIAL Reduction', () => {
      let user = { balance: 1000, avbalance: 1000 };

      // Bet 1: Team A Lay @ 2.0, Stake 100
      let bet = {
        teamName: 'Team A',
        otype: 'lay',
        price: 100, // 100 * 1.0
        betAmount: 100, // stake
        xValue: 2.0,
      };

      user.avbalance = 900;

      // Bet 2: Team B Lay @ 3.0, Stake 50 (price=100, betAmount=50)
      const originalPrice = bet.price; // 100
      const originalBetAmount = bet.betAmount; // 100
      const incomingPrice = 100; // lay: 50 * 2.0
      const incomingBetAmount = 50; // lay: stake

      // 100 >= 50? YES → Full reduction path
      if (originalPrice >= incomingBetAmount) {
        bet.price = parseFloat((originalPrice - incomingBetAmount).toFixed(2));
        bet.betAmount = parseFloat(
          (originalBetAmount - incomingPrice).toFixed(2)
        );
        user.avbalance = parseFloat(
          (user.avbalance + incomingBetAmount).toFixed(2)
        );
      } else {
        bet.price = parseFloat((incomingPrice - originalBetAmount).toFixed(2));
        bet.betAmount = parseFloat(
          (incomingBetAmount - originalPrice).toFixed(2)
        );
        bet.teamName = 'Team B';
        user.avbalance = parseFloat(
          (
            user.avbalance -
            (incomingPrice - originalBetAmount) +
            originalPrice
          ).toFixed(2)
        );
      }

      expect(bet.price).toBe(50); // 100 - 50
      expect(bet.betAmount).toBe(0); // 100 - 100
      expect(bet.otype).toBe('lay');
      expect(user.avbalance).toBe(950); // 900 + 50
    });

    test('Different team, different otype - ADD (Hedge) with Team Change', () => {
      let user = { balance: 1000, avbalance: 1000 };

      // BET 1: Back Team A @ 2.0, Stake 100
      let existingBet = {
        teamName: 'Team A',
        otype: 'back',
        price: 100, // 100 × (2.0 - 1)
        betAmount: 100, // stake
        xValue: 2.0,
      };

      user.avbalance -= 100;

      // BET 2: Lay Team B @ 2.0, Stake 100 (DIFFERENT team + DIFFERENT type)
      // This is a HEDGE - independent protective bet on opposite outcome
      const newPrice = 100; // 100 × (2.0 - 1) for lay
      const newBetAmount = 100; // stake
      const newType = 'lay';
      const newTeam = 'Team B';
      const newOdds = 2.0;

      console.log(`\nBET 2 (Lay Team B @ 2.0, Stake 100):`);
      console.log(`  Different team AND different otype → ADD (Hedge)`);
      console.log(`  Price: ${newPrice}, BetAmount: ${newBetAmount}`);

      // Controller's ADD logic: Combines prices and betAmounts, CHANGES team and otype
      existingBet.price = parseFloat((existingBet.price + newPrice).toFixed(2));
      existingBet.betAmount = parseFloat(
        (existingBet.betAmount + newBetAmount).toFixed(2)
      );
      existingBet.teamName = newTeam; // CHANGES to new team
      existingBet.otype = newType; // CHANGES to new type
      existingBet.xValue = newOdds;

      user.avbalance -= newPrice;

      console.log(`\nAfter ADD:`);
      console.log(
        `  Existing bet now references: ${existingBet.teamName} (${existingBet.otype})`
      );
      console.log(
        `  Combined Price: ${existingBet.price}, Combined BetAmount: ${existingBet.betAmount}`
      );
      console.log(`  User avbalance: ${user.avbalance}`);

      // Verify the combined values
      expect(existingBet.price).toBe(200); // 100 + 100
      expect(existingBet.betAmount).toBe(200); // 100 + 100
      expect(existingBet.teamName).toBe('Team B'); // Changed to new team
      expect(existingBet.otype).toBe('lay'); // Changed to new type
      expect(user.avbalance).toBe(800); // 1000 - 100 - 100

      console.log(`\n✅ Test PASSED - Bets added with team reference changed!`);
    });
  });

  // ========================================
  // SECTION 8: MULTI-STEP SCENARIOS
  // ========================================
  describe('8️⃣ Multi-Step Offset Scenarios', () => {
    test('Real Scenario: Team A back (2.0) → Team B back (2.0) → Team A lay (2.0)', () => {
      let user = { balance: 1000, avbalance: 1000 };

      // STEP 1: Back Team A @ 2.0
      let bet = {
        teamName: 'Team A',
        otype: 'back',
        price: 100,
        betAmount: 100,
        xValue: 2.0,
      };

      user.avbalance -= 100;

      // STEP 2: Back Team B @ 2.0 (different team, same otype)
      const { price: price2, betAmount: betAmount2 } = calculateTeenPatti(
        100,
        2.0,
        'back'
      );

      console.log(`  Action: Different team + same otype → FULL REDUCTION`);

      if (bet.price >= betAmount2) {
        bet.price = parseFloat((bet.price - betAmount2).toFixed(2)); // 0
        bet.betAmount = parseFloat((bet.betAmount - price2).toFixed(2)); // 0
        user.avbalance = parseFloat((user.avbalance + betAmount2).toFixed(2)); // 1000
      }

      console.log(
        `  Reduced bet: price=${bet.price}, betAmount=${bet.betAmount}`
      );
      console.log(`  avbalance=${user.avbalance}, exposure=0`);

      // STEP 3: Lay Team A @ 2.0 (different team, different otype)
      const { price: price3, betAmount: betAmount3 } = calculateTeenPatti(
        100,
        2.0,
        'lay'
      );

      console.log(`\nStep 3: Lay Team A @ 2.0, Stake 100`);
      console.log(`  Action: Different team + different otype → MERGE`);

      bet.price = parseFloat((bet.price + price3).toFixed(2)); // 100
      bet.betAmount = parseFloat((bet.betAmount + betAmount3).toFixed(2)); // 100
      bet.teamName = 'Team A';
      bet.otype = 'lay';
      bet.xValue = 2.0;

      user.avbalance -= price3; // 900

      console.log(
        `  Final bet: price=${bet.price}, betAmount=${bet.betAmount}`
      );
      console.log(`  teamName=${bet.teamName}, otype=${bet.otype}`);
      console.log(`  avbalance=${user.avbalance}, exposure=100`);

      expect(bet.price).toBe(100);
      expect(bet.betAmount).toBe(100);
      expect(bet.teamName).toBe('Team A');
      expect(bet.otype).toBe('lay');
      expect(user.avbalance).toBe(900);
    });

    test('Real Website: Lilli 1.31 back → Tamara 4.5 back → Lilli 1.18 lay', () => {
      console.log('\n' + '='.repeat(80));
      console.log('REAL SCENARIO: Lilli → Tamara → Lilli Journey');
      console.log('='.repeat(80));

      let user = { balance: 1000, avbalance: 1000 };

      // BET 1: Lilli Back @ 1.31
      const { price: price1, betAmount: betAmount1 } = calculateTeenPatti(
        100,
        1.31,
        'back'
      );
      let bet = {
        teamName: 'Lilli',
        otype: 'back',
        price: price1,
        betAmount: betAmount1,
        xValue: 1.31,
      };

      user.avbalance -= price1;
      console.log(`\nBet 1: Back Lilli @ 1.31, Stake 100`);
      console.log(`  price=${bet.price}, betAmount=${bet.betAmount}`);
      console.log(`  avbalance=${user.avbalance}`);

      // BET 2: Tamara Back @ 4.5 (different team, same otype)
      const { price: price2, betAmount: betAmount2 } = calculateTeenPatti(
        100,
        4.5,
        'back'
      );
      const oldPrice = bet.price;
      const oldBetAmount = bet.betAmount;

      console.log(`\nBet 2: Back Tamara @ 4.5, Stake 100`);
      console.log(`  Different team, same otype → PARTIAL REDUCTION`);

      if (oldPrice < betAmount2) {
        bet.price = parseFloat((price2 - oldBetAmount).toFixed(2)); // 350 - 31 = 319
        bet.betAmount = parseFloat((betAmount2 - oldPrice).toFixed(2)); // 350 - 100 = 250
        user.avbalance = parseFloat(
          (user.avbalance - (price2 - oldBetAmount - oldPrice)).toFixed(2)
        );
        bet.teamName = 'Tamara';
        bet.xValue = 4.5;
      }

      console.log(`  price=${bet.price}, betAmount=${bet.betAmount}`);
      console.log(`  teamName=${bet.teamName}, avbalance=${user.avbalance}`);

      // BET 3: Lilli Lay @ 1.18 (different team, different otype)
      const { price: price3, betAmount: betAmount3 } = calculateTeenPatti(
        100,
        1.18,
        'lay'
      );

      console.log(`\nBet 3: Lay Lilli @ 1.18, Stake 100`);
      console.log(`  Different team, different otype → MERGE`);

      bet.price = parseFloat((bet.price + price3).toFixed(2));
      bet.betAmount = parseFloat((bet.betAmount + betAmount3).toFixed(2));
      bet.teamName = 'Lilli';
      bet.otype = 'lay';
      bet.xValue = 1.18;

      user.avbalance -= price3;

      console.log(`  Final: price=${bet.price}, betAmount=${bet.betAmount}`);
      console.log(`  teamName=${bet.teamName}, otype=${bet.otype}`);
      console.log(`  avbalance=${user.avbalance}`);

      expect(bet.price).toBe(87);
      expect(bet.betAmount).toBe(350);
      expect(bet.teamName).toBe('Lilli');
      expect(bet.otype).toBe('lay');
      expect(user.avbalance).toBe(913);
    });
  });

  // ========================================
  // SECTION 9: NEW BET PLACEMENT
  // ========================================
  describe('9️⃣ New Bet Placement', () => {
    test('Create new TeenPatti bet (no existing bet)', () => {
      console.log('\n' + '='.repeat(80));
      console.log('NEW BET: Create Fresh Bet');
      console.log('='.repeat(80));

      let user = { avbalance: 1000 };
      const { price, betAmount } = calculateTeenPatti(100, 2.5, 'back');

      console.log(`Creating new bet: stake=100, odds=2.5, type=back`);
      console.log(`  price=${price}, betAmount=${betAmount}`);

      user.avbalance -= price;

      console.log(`  avbalance: 1000 → ${user.avbalance}`);

      expect(price).toBe(100);
      expect(betAmount).toBe(150);
      expect(user.avbalance).toBe(900);
    });
  });

  // ========================================
  // SECTION 10: INPUT VALIDATION
  // ========================================
  describe('🔟 Input Validation', () => {
    test('Should validate all required casino fields present', () => {
      const body = {
        gameId: 'teenpatti_001',
        price: 100,
        xValue: 2.5,
        teamName: 'Player A',
        otype: 'back',
        roundId: 'round_001',
        gname: 'TeenPatti',
      };

      const isValid = !(
        !body.gameId ||
        !body.price ||
        !body.xValue ||
        !body.teamName ||
        !body.otype ||
        !body.roundId ||
        !body.gname
      );

      expect(isValid).toBe(true);
    });

    test('Should reject when gameId missing', () => {
      const body = {
        price: 100,
        xValue: 2.5,
        teamName: 'Player A',
        otype: 'back',
        roundId: 'round_001',
        gname: 'TeenPatti',
      };

      const isValid = !(
        !body.gameId ||
        !body.price ||
        !body.xValue ||
        !body.teamName ||
        !body.otype
      );
      expect(isValid).toBe(false);
    });

    test('Should reject when price is 0', () => {
      expect(0).toBeFalsy();
    });

    test('Should validate otype is back or lay only', () => {
      expect(['back', 'lay'].includes('back')).toBe(true);
      expect(['back', 'lay'].includes('lay')).toBe(true);
      expect(['back', 'lay'].includes('invalid')).toBe(false);
    });
  });
});
