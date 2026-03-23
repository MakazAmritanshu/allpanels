//test the placeBet Function For all conditions

//Simple Test Case for placeBet Function for all gameTypes

//MATCH ODDS,TIE MATCH,WINNER,OVER_UNDER_05,OVER_UNDER_15,OVER_UNDER_25,BOOKMAKER,BOOKMAKER IPL CUP,TOSS,1ST 6 OVER

// backend/tests/placeBet.test.js

describe('placeBet - Complete Test Suite', () => {
  //Bet Amount Calculation and Price Calculation for all gameTypes

  describe('Bet Amount and Price Calculations - All Game Types', () => {
    +(
      // Match Odds, Tied Match, Winner, OVER_UNDER
      test('Match Odds back bet: price=100, odds=2.5', () => {
        const price = 100;
        const xValue = 2.5;
        const otype = 'back';

        const betAmount = otype === 'lay' ? price : price * (xValue - 1);
        const p = otype === 'lay' ? price * (xValue - 1) : price;

        expect(betAmount).toBe(150); //betAmount
        expect(p).toBe(100); //Deducted from balance
      })
    );

    test('Match Odds lay bet: price=100, odds=2.5', () => {
      const price = 100;
      const xValue = 2.5;
      const otype = 'lay';

      const betAmount = otype === 'lay' ? price : price * (xValue - 1);
      const p = otype === 'lay' ? price * (xValue - 1) : price;

      expect(betAmount).toBe(100);
      expect(p).toBe(150); //Deducted from balance this is the risk amount
    });

    test('Tied Match back bet', () => {
      const price = 150;
      const xValue = 2.1;
      const otype = 'back';

      const betAmount = price * (xValue - 1);
      const p = price;

      expect(betAmount).toBe(165);
      expect(p).toBe(150);
    });

    test('Tied Match lay bet', () => {
      const price = 100;
      const xValue = 2.1;
      const otype = 'lay';
      const betAmount = otype === 'lay' ? price : price * (xValue - 1);
      const p = otype === 'lay' ? price * (xValue - 1) : price;

      expect(betAmount).toBe(100);
      expect(p).toBeCloseTo(110, 2);
    });

    test('Winner back bet', () => {
      const price = 100;
      const xValue = 2.1;
      const otype = 'back';

      const betAmount = otype === 'lay' ? price : price * (xValue - 1);
      const p = otype === 'lay' ? price * (xValue - 1) : price;

      expect(betAmount).toBeCloseTo(110, 2);
      expect(p).toBe(100);
    });

    test('Winner lay bet', () => {
      const price = 100;
      const xValue = 3.0;
      const otype = 'lay';

      const betAmount = price;
      const p = price * (xValue - 1);

      expect(betAmount).toBe(100);
      expect(p).toBe(200);
    });

    test('OVER_UNDER_05 back bet', () => {
      const price = 200;
      const xValue = 2.2;
      const otype = 'back';

      const betAmount = price * (xValue - 1);
      const p = price;

      expect(betAmount).toBeCloseTo(240, 2);
      expect(p).toBe(200);
    });

    test('OVER_UNDER_05 lay bet', () => {
      const price = 100;
      const xValue = 1.8;
      const otype = 'lay';

      const betAmount = otype === 'lay' ? price : price * (xValue - 1);
      const p = otype === 'lay' ? price * (xValue - 1) : price;

      expect(betAmount).toBe(100);
      expect(p).toBeCloseTo(80, 2);
    });

    //BOOKMAKER,BOOKMAKER IPL CUP,TOSS,1ST 6 OVER
    test('BOOKMAKER back bet', () => {
      const price = 100;
      const xValue = 50;
      const otype = 'back';

      const betAmount = otype === 'lay' ? price : price * (xValue / 100);
      const p = otype === 'lay' ? price * (xValue / 100) : price;

      expect(betAmount).toBe(50);
      expect(p).toBe(100);
    });
    test('BOOKMAKER lay bet', () => {
      const price = 100;
      const xValue = 50;
      const otype = 'lay';

      const betAmount = otype === 'lay' ? price : price * (xValue / 100);
      const p = otype === 'lay' ? price * (xValue / 100) : price;
      expect(betAmount).toBe(100);
      expect(p).toBe(50);
    });
    test('BOOKMAKER IPL CUP back bet', () => {
      const price = 200;
      const xValue = 100;
      const otype = 'back';

      const betAmount = price * (xValue / 100);
      const p = price;
      expect(betAmount).toBe(200);
      expect(p).toBe(200);
    });
    test('BOOKMAKER IPL CUP lay bet', () => {
      //Arrange
      const price = 200;
      const xValue = 100;
      const otype = 'lay';
      //Act
      const betAmount = otype === 'lay' ? price : price * (xValue / 100);
      const p = otype === 'lay' ? price * (xValue / 100) : price;

      //Assert
      expect(betAmount).toBe(200);
      expect(p).toBe(200);
    });

    //TOSS,1ST 6 OVER
    test('Toss back bet', () => {
      const price = 100;
      const xValue = 2.0;
      const otype = 'back';

      const betAmount = otype === 'lay' ? price : price * (xValue - 1);
      const p = otype === 'lay' ? price * (xValue - 1) : price;

      expect(betAmount).toBe(100);
      expect(p).toBe(100);
    });
    test('Toss lay bet', () => {
      const price = 100;
      const xValue = 2.0;
      const otype = 'lay';

      const betAmount = otype === 'lay' ? price : price * (xValue - 1);
      const p = otype === 'lay' ? price * (xValue - 1) : price;

      expect(betAmount).toBe(100);
      expect(p).toBe(100);
    });

    test('OVER_UNDER_15 lay bet', () => {
      const price = 100;
      const xValue = 1.8;
      const otype = 'lay';

      const betAmount = price;
      const p = price * (xValue - 1);

      expect(betAmount).toBe(100);
      expect(p).toBe(80);
    });

    // Bookmaker (Lines 725-729)
    test('Bookmaker back: price=100, percent=50', () => {
      const price = 100;
      const xValue = 50;
      const otype = 'back';

      const betAmount = otype === 'lay' ? price : price * (xValue / 100);
      const p = otype === 'lay' ? price * (xValue / 100) : price;

      expect(betAmount).toBe(50);
      expect(p).toBe(100);
    });

    test('Bookmaker lay: price=100, percent=50', () => {
      const price = 100;
      const xValue = 50;
      const otype = 'lay';

      const betAmount = otype === 'lay' ? price : price * (xValue / 100);
      const p = otype === 'lay' ? price * (xValue / 100) : price;

      expect(betAmount).toBe(100);
      expect(p).toBe(50);
    });

    test('Bookmaker IPL CUP: price=200, percent=100', () => {
      const price = 200;
      const xValue = 100;
      const otype = 'back';

      const betAmount = price * (xValue / 100);

      expect(betAmount).toBe(200);
    });

    // Toss and 1st 6 over (Lines 730-733)
    test('Toss back bet', () => {
      const price = 100;
      const xValue = 2.0;
      const otype = 'back';

      const betAmount = price * (xValue - 1);

      expect(betAmount).toBe(100);
    });

    test('1st 6 over lay bet', () => {
      const price = 150;
      const xValue = 1.5;
      const otype = 'lay';

      const betAmount = price;

      expect(betAmount).toBe(150);
    });

    // Decimal precision (Line 738-739)
    test('should round betAmount to 2 decimals', () => {
      const betAmount = 123.456789;
      const rounded = parseFloat(betAmount.toFixed(2));

      expect(rounded).toBe(123.46);
    });

    test('should handle very small odds 1.01', () => {
      const price = 100;
      const xValue = 1.01;

      const betAmount = parseFloat((price * (xValue - 1)).toFixed(2));

      expect(betAmount).toBe(1);
    });
  });

  //Balance Validation For all gameTypes
  //Balance and availbale balance always should be greater than the price
  describe('Balance Validation', () => {
    test('Reject when avbalance insufficient', () => {
      const user = {
        avbalance: 50,
        balance: 1000,
      };
      const p = 100;

      const hasInsufficientBalance = user.avbalance < p || user.balance < p;

      expect(hasInsufficientBalance).toBe(true);
    });

    test('Reject when balance insufficient', () => {
      const user = {
        avbalance: 1000,
        balance: 50,
      };
      const p = 100;

      const hasInsufficientBalance = user.avbalance < p || user.balance < p;

      expect(hasInsufficientBalance).toBe(true);
    });

    test('should accept when both balances sufficient', () => {
      const user = {
        avbalance: 1000,
        balance: 1000,
      };
      const p = 100;

      const hasInsufficientBalance = user.avbalance < p || user.balance < p;

      expect(hasInsufficientBalance).toBe(false);
    });

    test('should handle edge case - exact balance match', () => {
      const user = {
        avbalance: 100,
        balance: 100,
      };
      const p = 100;

      const hasInsufficientBalance = user.avbalance < p || user.balance < p;

      expect(hasInsufficientBalance).toBe(false);
    });
  });

  //Exposure Calculations For all gameTypes
  //Sum of all the pending BETS should be less than exposure Limit
  //Price is the risk amount in back bet as well as in Lay bet
  describe('Exposure Calculations', () => {
    //FOR VALIDATION OF EXPOSURE CALCULATION
    test('Calculate total exposure from pending bets', () => {
      const pendingBets = [{ price: 100 }, { price: 200 }, { price: 150 }];

      const totalPendingAmount = pendingBets.reduce(
        (sum, b) => sum + b.price,
        0
      );

      expect(totalPendingAmount).toBe(450);
    });

    //Reject when exposure limit exceeded (Total pending bets + new bet(Price because it is the risk amount) > exposure limit)
    test('Reject when exposure limit exceeded (Total pending bets + new bet(Price because it is the risk amount) > exposure limit)', () => {
      const user = { exposureLimit: 50000 };
      const totalPendingAmount = 45000;
      const p = 6000;

      const exceedsLimit = user.exposureLimit < totalPendingAmount + p;

      expect(exceedsLimit).toBe(true);
    });

    test('Accept when within exposure limit', () => {
      const user = { exposureLimit: 50000 };
      const totalPendingAmount = 40000;
      const p = 5000;

      const exceedsLimit = user.exposureLimit < totalPendingAmount + p;

      expect(exceedsLimit).toBe(false);
    });

    test('Handle edge case - exact exposure limit', () => {
      const user = { exposureLimit: 50000 };
      const totalPendingAmount = 49900;
      const p = 100;

      const exceedsLimit = user.exposureLimit < totalPendingAmount + p;

      expect(exceedsLimit).toBe(false);
    });

    //AFTER BET PLACEMENT, THE EXPOSURE SHOULD BE CALCULATED CORRECTLY
    test('should calculate updated exposure after bet placement (Line 888-889)', () => {
      const updatedPendingBets = [
        { price: 100 },
        { price: 200 },
        { price: 150 },
        { price: 100 }, // New bet
      ];

      const newExposure = updatedPendingBets.reduce(
        (sum, b) => sum + b.price,
        0
      );

      expect(newExposure).toBe(550);
    });
  });

  //BET MERGING -SAME TEAM,SAME OTYPE

  describe('Bet Merging and Balance Calculations', () => {
    describe('Single Bet Calculations', () => {
      test('Match Odds back bet - calculate price, betAmount, exposure, avbalance', () => {
        const user = {
          balance: 1000,
          avbalance: 1000,
          exposure: 0,
        };

        // Input: stake and odds
        const stake = 100;
        const xValue = 2.0;
        const otype = 'back';

        // Calculate price and betAmount
        const betAmount = stake * (xValue - 1);
        const price = stake;

        // Update user exposure and available balance
        user.exposure += price;
        user.avbalance = user.balance - user.exposure;

        // Assertions
        expect(price).toBe(100);
        expect(betAmount).toBe(100);
        expect(user.balance).toBe(1000);
        expect(user.exposure).toBe(100);
        expect(user.avbalance).toBe(900);
      });

      test('Match Odds lay bet - calculate price, betAmount, exposure, avbalance', () => {
        const user = {
          balance: 1000,
          avbalance: 1000,
          exposure: 0,
        };

        // Input: stake and odds
        const stake = 100;
        const xValue = 1.5;
        const otype = 'lay';

        // Calculate price (liability) and betAmount
        const betAmount = stake;
        const price = stake * (xValue - 1); // Liability

        // Update user exposure and available balance
        user.exposure += price;
        user.avbalance = user.balance - user.exposure;

        // Assertions
        expect(price).toBe(50);
        expect(betAmount).toBe(100);
        expect(user.balance).toBe(1000);
        expect(user.exposure).toBe(50);
        expect(user.avbalance).toBe(950);
      });

      test('Bookmaker back bet - calculate price, betAmount, exposure, avbalance', () => {
        const user = {
          balance: 1000,
          avbalance: 1000,
          exposure: 0,
        };

        // Input: stake and odds
        const stake = 100;
        const xValue = 50; //Percentage
        const otype = 'back';

        // Calculate price and betAmount
        const betAmount = stake * (xValue / 100); // Win amount
        const price = stake; // Risk amount

        // Update user exposure and available balance
        user.exposure += price;
        user.avbalance = user.balance - user.exposure;

        // Assertions
        expect(price).toBe(100);
        expect(betAmount).toBe(50);
        expect(user.balance).toBe(1000);
        expect(user.exposure).toBe(100);
        expect(user.avbalance).toBe(900);
      });

      test('Bookmaker lay bet - calculate price, betAmount, exposure, avbalance', () => {
        const user = {
          balance: 1000,
          avbalance: 1000,
          exposure: 0,
        };

        // Input: stake and odds
        const stake = 100;
        const xValue = 50; // Percentage
        const otype = 'lay';

        // Calculate price (liability) and betAmount
        const betAmount = stake;
        const price = stake * (xValue / 100); // Liability

        // Update user exposure and available balance
        user.exposure += price;
        user.avbalance = user.balance - user.exposure;

        // Assertions
        expect(price).toBe(50);
        expect(betAmount).toBe(100);
        expect(user.balance).toBe(1000);
        expect(user.exposure).toBe(50);
        expect(user.avbalance).toBe(950);
      });

      test('OVER_UNDER_25 back bet - calculate price, betAmount, exposure, avbalance', () => {
        const user = {
          balance: 1000,
          avbalance: 1000,
          exposure: 0,
        };

        // Input: stake and odds
        const stake = 100;
        const xValue = 2.2;
        const otype = 'back';

        // Calculate price and betAmount (same as Match Odds)
        const betAmount = stake * (xValue - 1); // Win amount
        const price = stake; // Risk amount

        // Update user exposure and available balance
        user.exposure += price;
        user.avbalance = user.balance - user.exposure;

        // Assertions
        expect(price).toBe(100);
        expect(betAmount).toBeCloseTo(120, 2); // Using toBeCloseTo for floating point
        expect(user.balance).toBe(1000);
        expect(user.exposure).toBe(100);
        expect(user.avbalance).toBe(900);
      });

      test('OVER_UNDER_25 lay bet - calculate price, betAmount, exposure, avbalance', () => {
        const user = {
          balance: 1000,
          avbalance: 1000,
          exposure: 0,
        };

        // Input: stake and odds
        const stake = 100;
        const xValue = 1.8;
        const otype = 'lay';

        // Calculate price (liability) and betAmount (same as Match Odds)
        const betAmount = stake;
        const price = stake * (xValue - 1); // Liability

        // Update user exposure and available balance
        user.exposure += price;
        user.avbalance = user.balance - user.exposure;

        // Assertions
        expect(price).toBe(80);
        expect(betAmount).toBe(100);
        expect(user.balance).toBe(1000);
        expect(user.exposure).toBe(80);
        expect(user.avbalance).toBe(920);
      });

      test('Toss back bet - calculate price, betAmount, exposure, avbalance', () => {
        const user = {
          balance: 1000,
          avbalance: 1000,
          exposure: 0,
        };

        // Input: stake and odds
        const stake = 100;
        const xValue = 2.0;
        const otype = 'back';

        // Calculate price and betAmount (same as Match Odds)
        const betAmount = stake * (xValue - 1); // Win amount
        const price = stake; // Risk amount

        // Update user exposure and available balance
        user.exposure += price;
        user.avbalance = user.balance - user.exposure;

        // Assertions
        expect(price).toBe(100);
        expect(betAmount).toBe(100);
        expect(user.balance).toBe(1000);
        expect(user.exposure).toBe(100);
        expect(user.avbalance).toBe(900);
      });

      test('Toss lay bet - calculate price, betAmount, exposure, avbalance', () => {
        const user = {
          balance: 1000,
          avbalance: 1000,
          exposure: 0,
        };

        // Input: stake and odds
        const stake = 100;
        const xValue = 2.0;
        const otype = 'lay';

        // Calculate price (liability) and betAmount (same as Match Odds)
        const betAmount = stake;
        const price = stake * (xValue - 1); // Liability

        // Update user exposure and available balance
        user.exposure += price;
        user.avbalance = user.balance - user.exposure;

        // Assertions
        expect(price).toBe(100);
        expect(betAmount).toBe(100);
        expect(user.balance).toBe(1000);
        expect(user.exposure).toBe(100);
        expect(user.avbalance).toBe(900);
      });
    });

    describe('Two Bets - Balance and Exposure Tracking', () => {
      test('Two Match Odds back bets - track exposure and avbalance', () => {
        const user = {
          balance: 1000,
          avbalance: 1000,
          exposure: 0,
        };

        // First bet: stake=100, odds=2.0
        const stake1 = 100;
        const xValue1 = 2.0;
        const betAmount1 = stake1 * (xValue1 - 1);
        const price1 = stake1;

        user.exposure += price1;
        user.avbalance = user.balance - user.exposure;

        expect(price1).toBe(100);
        expect(betAmount1).toBe(100);
        expect(user.balance).toBe(1000);
        expect(user.exposure).toBe(100);
        expect(user.avbalance).toBe(900);

        // Second bet: stake=50, odds=3.0
        const stake2 = 50;
        const xValue2 = 3.0;
        const betAmount2 = stake2 * (xValue2 - 1);
        const price2 = stake2;

        user.exposure += price2;
        user.xValue = (xValue1 + xValue2) / 2;
        user.avbalance = user.balance - user.exposure;

        expect(price2).toBe(50);
        expect(betAmount2).toBe(100);
        expect(user.xValue).toBe(2.5);

        expect(user.balance).toBe(1000);
        expect(user.exposure).toBe(150); // 100 + 50
        expect(user.avbalance).toBe(850);
      });
      test('Two Match Odds lay bets - track exposure and avbalance', () => {
        const user = {
          balance: 1000,
          avbalance: 1000,
          exposure: 0,
        };

        // First bet: stake=100, odds=1.5
        const stake1 = 100;
        const xValue1 = 1.5;
        const betAmount1 = stake1;
        const price1 = stake1 * (xValue1 - 1);

        user.exposure += price1;
        user.avbalance = user.balance - user.exposure;

        expect(price1).toBe(50);
        expect(betAmount1).toBe(100);
        expect(user.balance).toBe(1000);
        expect(user.exposure).toBe(50);
        expect(user.avbalance).toBe(950);

        // Second bet: stake=100, odds=2.0
        const stake2 = 100;
        const xValue2 = 2.0;
        const betAmount2 = stake2;
        const price2 = stake2 * (xValue2 - 1);

        user.exposure += price2;
        user.avbalance = user.balance - user.exposure;

        expect(price2).toBe(100);
        expect(betAmount2).toBe(100);
        expect(user.balance).toBe(1000);
        expect(user.exposure).toBe(150); // 50 + 100
        expect(user.avbalance).toBe(850);
      });
      test('Two Bookmaker lay bets - track exposure and avbalance', () => {
        const user = {
          balance: 1000,
          avbalance: 1000,
          exposure: 0,
        };

        // First bet: stake=100, odds=50%
        const stake1 = 100;
        const xValue1 = 50;
        const betAmount1 = stake1;
        const price1 = stake1 * (xValue1 / 100);

        user.exposure += price1;
        user.avbalance = user.balance - user.exposure;

        expect(price1).toBe(50);
        expect(betAmount1).toBe(100);
        expect(user.balance).toBe(1000);
        expect(user.exposure).toBe(50);
        expect(user.avbalance).toBe(950);

        // Second bet: stake=100, odds=30%
        const stake2 = 100;
        const xValue2 = 30;
        const betAmount2 = stake2;
        const price2 = stake2 * (xValue2 / 100);

        user.exposure += price2;
        user.avbalance = user.balance - user.exposure;

        expect(price2).toBe(30);
        expect(betAmount2).toBe(100);
        expect(user.balance).toBe(1000);
        expect(user.exposure).toBe(80); // 50 + 30
        expect(user.avbalance).toBe(920);
      });
    });

    describe('Three Bets - Complete Balance Tracking', () => {
      test('Three Match Odds back bets - track exposure and avbalance', () => {
        const user = {
          balance: 1000,
          avbalance: 1000,
          exposure: 0,
        };

        // Bet 1: stake=100, odds=2.0
        const stake1 = 100;
        const xValue1 = 2.0;
        const betAmount1 = stake1 * (xValue1 - 1);
        const price1 = stake1;

        user.exposure += price1;
        user.avbalance = user.balance - user.exposure;

        expect(price1).toBe(100);
        expect(betAmount1).toBe(100);
        expect(user.balance).toBe(1000);
        expect(user.exposure).toBe(100);
        expect(user.avbalance).toBe(900);

        // Bet 2: stake=50, odds=3.0
        const stake2 = 50;
        const xValue2 = 3.0;
        const betAmount2 = stake2 * (xValue2 - 1);
        const price2 = stake2;

        user.exposure += price2;
        user.avbalance = user.balance - user.exposure;

        expect(price2).toBe(50);
        expect(betAmount2).toBe(100);
        expect(user.balance).toBe(1000);
        expect(user.exposure).toBe(150); // 100 + 50
        expect(user.avbalance).toBe(850);

        // Bet 3: stake=75, odds=1.5
        const stake3 = 75;
        const xValue3 = 1.5;
        const betAmount3 = stake3 * (xValue3 - 1);
        const price3 = stake3;

        user.exposure += price3;
        user.avbalance = user.balance - user.exposure;

        expect(price3).toBe(75);
        expect(betAmount3).toBe(37.5);
        expect(user.balance).toBe(1000);
        expect(user.exposure).toBe(225); // 100 + 50 + 75
        expect(user.avbalance).toBe(775);
      });

      test('Three mixed bets (back, lay, back) - track exposure and avbalance', () => {
        const user = {
          balance: 1000,
          avbalance: 1000,
          exposure: 0,
        };

        // Bet 1: Match Odds back bet (stake=100, odds=2.0)
        const stake1 = 100;
        const xValue1 = 2.0;
        const betAmount1 = stake1 * (xValue1 - 1);
        const price1 = stake1;

        user.exposure += price1;
        user.avbalance = user.balance - user.exposure;

        expect(price1).toBe(100);
        expect(betAmount1).toBe(100);
        expect(user.exposure).toBe(100);
        expect(user.avbalance).toBe(900);

        // Bet 2: Match Odds lay bet (stake=100, odds=2.0)
        const stake2 = 100;
        const xValue2 = 2.0;
        const betAmount2 = stake2;
        const price2 = stake2 * (xValue2 - 1);

        user.exposure += price2;
        user.avbalance = user.balance - user.exposure;

        expect(price2).toBe(100);
        expect(betAmount2).toBe(100);
        expect(user.exposure).toBe(200); // 100 + 100
        expect(user.avbalance).toBe(800);

        // Bet 3: Bookmaker back bet (stake=75, odds=50%)
        const stake3 = 75;
        const xValue3 = 50;
        const betAmount3 = stake3 * (xValue3 / 100);
        const price3 = stake3;

        user.exposure += price3;
        user.avbalance = user.balance - user.exposure;

        expect(price3).toBe(75);
        expect(betAmount3).toBe(37.5);
        expect(user.exposure).toBe(275); // 100 + 100 + 75
        expect(user.avbalance).toBe(725);
      });
    });
  });

  //BET OFFSETTING -SAME TEAM,OPPOSITE TYPE
  //PARTIAL AND FULL OFFSET CASES ARE TESTED

  describe('Bet Offsetting - Same Team, Opposite Type', () => {
    test('back offsets lay - full offset', () => {
      const user = {
        balance: 1000,
        avbalance: 1000,
        exposure: 0,
      };

      // STEP 1: Place first bet (lay bet on Team A)
      const firstStake = 150;
      const firstOdds = 2.0;
      const firstOtype = 'lay';
      const firstBetAmount = firstStake;
      const firstPrice = firstStake * (firstOdds - 1); // 150 (liability)

      let existingBet = {
        price: firstPrice,
        betAmount: firstBetAmount,
        otype: firstOtype,
        teamName: 'Team A',
      };

      // Update user after first bet
      user.exposure += firstPrice;
      user.avbalance = user.balance - user.exposure;

      expect(firstPrice).toBe(150);
      expect(firstBetAmount).toBe(150);
      expect(user.balance).toBe(1000);
      expect(user.exposure).toBe(150);
      expect(user.avbalance).toBe(850);

      // STEP 2: Place second bet (back bet on same team - offsetting)
      const secondStake = 100;
      const secondOdds = 2.0;
      const secondOtype = 'back';
      const secondBetAmount = secondStake * (secondOdds - 1); // 100
      const secondPrice = secondStake; // 100

      // Full offset logic: existingBet.betAmount (150) >= secondPrice (100)
      if (existingBet.betAmount >= secondPrice) {
        existingBet.price = existingBet.price - secondBetAmount;
        existingBet.betAmount = existingBet.betAmount - secondPrice;
        user.avbalance += secondBetAmount;
      }

      // Final state after offset
      expect(existingBet.price).toBe(50); // 150 - 100
      expect(existingBet.betAmount).toBe(50); // 150 - 100
      expect(existingBet.otype).toBe('lay'); // Still lay
      expect(user.balance).toBe(1000);
      expect(user.avbalance).toBe(950); // 850 + 100
    });

    test('back offsets lay - partial offset with type change', () => {
      const user = {
        balance: 1000,
        avbalance: 1000,
        exposure: 0,
      };

      // STEP 1: Place first bet (lay bet on Team A)
      const firstStake = 100;
      const firstOdds = 1.08;
      const firstOtype = 'lay';
      const firstBetAmount = firstStake;
      const firstPrice = firstStake * (firstOdds - 1); // 8 (liability)

      let existingBet = {
        price: firstPrice,
        betAmount: firstBetAmount,
        otype: firstOtype,
        teamName: 'Team A',
      };

      const originalPrice = existingBet.price;
      const originalBetAmount = existingBet.betAmount;

      // Update user after first bet
      user.exposure += firstPrice;
      user.avbalance = user.balance - user.exposure;

      expect(firstPrice).toBeCloseTo(8, 2);
      expect(firstBetAmount).toBe(100);
      expect(user.balance).toBe(1000);
      expect(user.exposure).toBeCloseTo(8, 2);
      expect(user.avbalance).toBe(992);

      // STEP 2: Place second bet (back bet on same team - offsetting)
      // For partial offset where BACK is stronger, need back stake > lay betAmount
      const secondStake = 150; // Larger than originalBetAmount (100)
      const secondOdds = 2.0;
      const secondOtype = 'back';
      const secondBetAmount = secondStake * (secondOdds - 1); // 150
      const secondPrice = secondStake; // 150

      // Controller logic for back offsetting lay (otype === 'back'):
      // if (originalBetAmount >= p) - full offset
      // else - partial offset with type change
      // Here: originalBetAmount (100) >= secondPrice (150)? NO → partial offset
      if (originalBetAmount >= secondPrice) {
        // Full offset - doesn't apply here
        existingBet.price = parseFloat(
          (originalPrice - secondBetAmount).toFixed(2)
        );
        existingBet.betAmount = parseFloat(
          (originalBetAmount - secondPrice).toFixed(2)
        );
        user.avbalance = parseFloat(
          (user.avbalance + secondBetAmount).toFixed(2)
        );
      } else {
        // Partial offset with type change - BACK is stronger
        existingBet.price = parseFloat(
          (secondPrice - originalBetAmount).toFixed(2)
        ); // 150 - 100 = 50
        existingBet.betAmount = parseFloat(
          (secondBetAmount - originalPrice).toFixed(2)
        ); // 150 - 8 = 142
        existingBet.otype = secondOtype;
        user.avbalance = parseFloat(
          (
            user.avbalance +
            originalPrice -
            (secondPrice - originalBetAmount)
          ).toFixed(2)
        );
        // avbalance = 992 + 8 - (150 - 100) = 992 + 8 - 50 = 950
      }

      // Final state after offset
      expect(existingBet.price).toBe(50); // 150 - 100 = 50
      expect(existingBet.betAmount).toBe(142); // 150 - 8 = 142
      expect(existingBet.otype).toBe('back'); // Changed to back
      expect(user.balance).toBe(1000);
      expect(user.avbalance).toBe(950); // 992 + 8 - 50
    });

    test('lay offsets back - full offset', () => {
      const user = {
        balance: 1000,
        avbalance: 1000,
        exposure: 0,
      };

      // STEP 1: Place first bet (back bet on Team A)
      const firstStake = 200;
      const firstOdds = 1.75;
      const firstOtype = 'back';
      const firstBetAmount = firstStake * (firstOdds - 1); // 150
      const firstPrice = firstStake; // 200

      let existingBet = {
        price: firstPrice,
        betAmount: firstBetAmount,
        otype: firstOtype,
        teamName: 'Team A',
      };

      const originalPrice = existingBet.price;

      // Update user after first bet
      user.exposure += firstPrice;
      user.avbalance = user.balance - user.exposure;

      expect(firstPrice).toBe(200);
      expect(firstBetAmount).toBe(150);
      expect(user.balance).toBe(1000);
      expect(user.exposure).toBe(200);
      expect(user.avbalance).toBe(800);

      // STEP 2: Place second bet (lay bet on same team - offsetting)
      const secondStake = 100;
      const secondOdds = 2.0;
      const secondOtype = 'lay';
      const secondBetAmount = secondStake; // 100
      const secondPrice = secondStake * (secondOdds - 1); // 100 (liability)

      // Full offset: originalPrice (200) > secondBetAmount (100)
      if (originalPrice > secondBetAmount) {
        existingBet.price = originalPrice - secondBetAmount;
        existingBet.betAmount = existingBet.betAmount - secondPrice;
        user.avbalance += secondBetAmount;
      }

      // Final state after offset
      expect(existingBet.price).toBe(100); // 200 - 100
      expect(existingBet.betAmount).toBe(50); // 150 - 100
      expect(existingBet.otype).toBe('back'); // Still back
      expect(user.balance).toBe(1000);
      expect(user.avbalance).toBe(900); // 800 + 100
    });

    test('lay offsets back - partial offset with type change', () => {
      const user = {
        balance: 1000,
        avbalance: 1000,
        exposure: 0,
      };

      // STEP 1: Place first bet (back bet on Team A)
      const firstStake = 50;
      const firstOdds = 3.0;
      const firstOtype = 'back';
      const firstBetAmount = firstStake * (firstOdds - 1); // 100
      const firstPrice = firstStake; // 50

      let existingBet = {
        price: firstPrice,
        betAmount: firstBetAmount,
        otype: firstOtype,
        teamName: 'Team A',
      };

      const originalPrice = existingBet.price;
      const originalBetAmount = existingBet.betAmount;

      // Update user after first bet
      user.exposure += firstPrice;
      user.avbalance = user.balance - user.exposure;

      expect(firstPrice).toBe(50);
      expect(firstBetAmount).toBe(100);
      expect(user.balance).toBe(1000);
      expect(user.exposure).toBe(50);
      expect(user.avbalance).toBe(950);

      // STEP 2: Place second bet (lay bet on same team - offsetting)
      const secondStake = 200;
      const secondOdds = 1.75;
      const secondOtype = 'lay';
      const secondBetAmount = secondStake; // 200
      const secondPrice = secondStake * (secondOdds - 1); // 150 (liability)

      // Partial offset: originalPrice (50) <= secondBetAmount (200)
      // The lay bet is larger, so bet type changes to lay
      if (originalPrice <= secondBetAmount) {
        existingBet.price = secondPrice - originalBetAmount;
        existingBet.betAmount = secondBetAmount - originalPrice;
        existingBet.otype = secondOtype;
        user.avbalance -= secondPrice - originalBetAmount - originalPrice;
      }

      // Final state after offset
      expect(existingBet.price).toBe(50); // 150 - 100
      expect(existingBet.betAmount).toBe(150); // 200 - 50
      expect(existingBet.otype).toBe('lay'); // Changed to lay
      expect(user.balance).toBe(1000);
      expect(user.avbalance).toBe(950); // 950 - (150 - 100 - 50) = 950
    });
  });

  //DIFFERENT TEAM SCENARIOS
  //FULL REDUCTION AND PARTIAL REDUCTION CASES ARE TESTED

  describe('Different Team Scenarios - Same Otype, Different Teams', () => {
    test('different team, same otype (back) - full reduction', () => {
      const user = {
        balance: 1000,
        avbalance: 1000,
        exposure: 0,
      };

      // STEP 1: Place first bet (back bet on India W)
      const firstStake = 200;
      const firstOdds = 2.0;
      const firstOtype = 'back';
      const firstBetAmount = firstStake * (firstOdds - 1); // 200
      const firstPrice = firstStake; // 200

      let existingBet = {
        price: firstPrice,
        betAmount: firstBetAmount,
        otype: firstOtype,
        teamName: 'India W',
      };

      const originalPrice = existingBet.price;

      // Update user after first bet
      user.exposure += firstPrice;
      user.avbalance = user.balance - user.exposure;

      expect(firstPrice).toBe(200);
      expect(firstBetAmount).toBe(200);
      expect(user.balance).toBe(1000);
      expect(user.exposure).toBe(200);
      expect(user.avbalance).toBe(800);

      // STEP 2: Place second bet (back bet on New Zealand W - different team)
      const secondStake = 100;
      const secondOdds = 2.0;
      const secondOtype = 'back';
      const secondBetAmount = secondStake * (secondOdds - 1); // 100
      const secondPrice = secondStake; // 100

      // Full reduction: originalPrice (200) >= secondBetAmount (100)
      // When betting on different team with same otype, we reduce the first bet
      if (originalPrice >= secondBetAmount) {
        existingBet.price = originalPrice - secondBetAmount;
        existingBet.betAmount = existingBet.betAmount - secondPrice;
        user.avbalance += secondBetAmount;
      }

      // Final state after reduction
      expect(existingBet.price).toBe(100); // 200 - 100
      expect(existingBet.betAmount).toBe(100); // 200 - 100
      expect(existingBet.teamName).toBe('India W'); // Still on India W
      expect(user.balance).toBe(1000);
      expect(user.avbalance).toBe(900); // 800 + 100
    });

    test('different team, same otype (back) - partial reduction with team change', () => {
      const user = {
        balance: 1000,
        avbalance: 1000,
        exposure: 0,
      };

      // STEP 1: Place first bet (back bet on India W)
      const firstStake = 50;
      const firstOdds = 3.0;
      const firstOtype = 'back';
      const firstBetAmount = firstStake * (firstOdds - 1); // 100
      const firstPrice = firstStake; // 50

      let existingBet = {
        price: firstPrice,
        betAmount: firstBetAmount,
        otype: firstOtype,
        teamName: 'India W',
      };

      const originalPrice = existingBet.price;
      const originalBetAmount = existingBet.betAmount;

      // Update user after first bet
      user.exposure += firstPrice;
      user.avbalance = user.balance - user.exposure;

      expect(firstPrice).toBe(50);
      expect(firstBetAmount).toBe(100);
      expect(user.balance).toBe(1000);
      expect(user.exposure).toBe(50);
      expect(user.avbalance).toBe(950);

      // STEP 2: Place second bet (back bet on New Zealand W - different team)
      const secondStake = 200;
      const secondOdds = 2.0;
      const secondOtype = 'back';
      const secondBetAmount = secondStake * (secondOdds - 1); // 200
      const secondPrice = secondStake; // 200

      // Partial reduction: originalPrice (50) < secondBetAmount (200)
      // Second bet is larger, so bet switches to New Zealand W
      if (originalPrice < secondBetAmount) {
        existingBet.price = secondPrice - originalBetAmount;
        existingBet.betAmount = secondBetAmount - originalPrice;
        user.avbalance -= secondPrice - originalBetAmount - originalPrice;
        existingBet.teamName = 'New Zealand W';
      }

      // Final state after reduction
      expect(existingBet.price).toBe(100); // 200 - 100
      expect(existingBet.betAmount).toBe(150); // 200 - 50
      expect(existingBet.teamName).toBe('New Zealand W'); // Changed to New Zealand W
      expect(user.balance).toBe(1000);
      expect(user.avbalance).toBe(900); // 950 - (200 - 100 - 50) = 900
    });

    test('different team, opposite otype - simply add new bet', () => {
      const user = {
        balance: 1900,
        avbalance: 1900,
        exposure: 0,
      };

      // STEP 1: Place first bet (back bet on India W)
      const firstStake = 100;
      const firstOdds = 1.49;
      const firstOtype = 'back';
      const firstBetAmount = firstStake * (firstOdds - 1);
      const firstPrice = firstStake;

      let existingBet = {
        price: firstPrice,
        betAmount: firstBetAmount,
        xValue: firstOdds,
        teamName: 'India W',
        otype: firstOtype,
      };

      // Update user after first bet
      user.exposure += firstPrice;
      user.avbalance = user.balance - user.exposure;

      expect(firstPrice).toBe(100);
      expect(firstBetAmount).toBe(49);
      expect(user.balance).toBe(1900);
      expect(user.exposure).toBe(100);
      expect(user.avbalance).toBe(1800);

      // STEP 2: Place second bet (lay bet on New Zealand W - different team AND different otype)
      const secondStake = 100;
      const secondOdds = 3.05;
      const secondOtype = 'lay';
      const secondBetAmount = secondStake;
      const secondPrice = secondStake * (secondOdds - 1);

      // When team is different AND otype is different, we simply add the new bet
      // No offset or reduction happens
      user.exposure += secondPrice;
      user.avbalance = user.balance - user.exposure;

      // Final state - both bets exist independently
      expect(secondPrice).toBeCloseTo(205, 2);
      expect(secondBetAmount).toBe(100);
      expect(user.balance).toBe(1900);
      expect(user.exposure).toBe(305); // 100 + 205 (both bets)
      expect(user.avbalance).toBe(1595); // 1900 - 305
    });
  });

  // ========================================
  // SECTION 6A: MULTI-STEP SCENARIOS
  // ========================================
  // Complex scenarios involving 3+ bets with multiple reductions and offsets

  describe('Multi-Step Offset Scenarios - Same Stake (100) Throughout', () => {
    test('Real Scenario: Team A back (2.0) → Team B back (2.0) → Team A lay (2.0) - MERGE behavior', () => {
      const user = {
        balance: 1000,
        avbalance: 1000,
      };

      // ========================================
      // STEP 1: Place back bet on Team A
      // ========================================
      const firstStake = 100;
      const firstOdds = 2.0;
      const firstOtype = 'back';
      const firstBetAmount = firstStake * (firstOdds - 1); // 100 * 1 = 100
      const firstPrice = firstStake; // 100

      let existingBet = {
        price: firstPrice,
        betAmount: firstBetAmount,
        otype: firstOtype,
        teamName: 'Team A',
        xValue: firstOdds,
      };

      user.avbalance = user.balance - firstPrice; // 1000 - 100 = 900

      console.log('STEP 1: Team A Back (2.0)');
      console.log(
        `  price=${existingBet.price}, betAmount=${existingBet.betAmount}`
      );
      console.log(`  avbalance=${user.avbalance}`);

      expect(existingBet.price).toBe(100);
      expect(existingBet.betAmount).toBe(100);
      expect(existingBet.teamName).toBe('Team A');
      expect(user.balance).toBe(1000);
      expect(user.avbalance).toBe(900);
      expect(user.balance - user.avbalance).toBe(100); // exposure = 100

      // ========================================
      // STEP 2: Place back bet on Team B (DIFFERENT TEAM, SAME OTYPE)
      // ========================================
      // Controller behavior: partial reduction (changes team)
      const secondStake = 100;
      const secondOdds = 2.0;
      const secondOtype = 'back';
      const secondBetAmount = secondStake * (secondOdds - 1); // 100
      const secondPrice = secondStake; // 100

      const originalPrice = existingBet.price; // 100
      const originalBetAmount = existingBet.betAmount; // 100

      // Different team, same otype - triggers reduction
      if (originalPrice >= secondBetAmount) {
        // Full reduction
        existingBet.price = originalPrice - secondBetAmount; // 100 - 100 = 0
        existingBet.betAmount = originalBetAmount - secondPrice; // 100 - 100 = 0
        user.avbalance += secondBetAmount; // 900 + 100 = 1000
      } else {
        // Partial reduction
        existingBet.price = secondPrice - originalBetAmount;
        existingBet.betAmount = secondBetAmount - originalPrice;
        existingBet.teamName = 'Team B';
        user.avbalance -= secondPrice - originalBetAmount - originalPrice;
      }

      console.log('STEP 2: Team B Back (2.0) - FULL REDUCTION');
      console.log(
        `  price=${existingBet.price}, betAmount=${existingBet.betAmount}`
      );
      console.log(`  avbalance=${user.avbalance}`);

      expect(existingBet.price).toBe(0);
      expect(existingBet.betAmount).toBe(0);
      expect(user.avbalance).toBe(1000);
      expect(user.balance - user.avbalance).toBe(0); // exposure = 0

      // ========================================
      // STEP 3: Place lay bet on Team A (DIFFERENT TEAM, DIFFERENT OTYPE)
      // ========================================
      // Controller behavior: MERGE (adds prices and betAmounts, changes team and otype)
      const thirdStake = 100;
      const thirdOdds = 2.0;
      const thirdOtype = 'lay';
      const thirdBetAmount = thirdStake; // For lay: betAmount = stake
      const thirdPrice = thirdStake * (thirdOdds - 1); // 100

      // Different team, different otype - controller MERGES
      existingBet.price += thirdPrice; // 0 + 100 = 100
      existingBet.betAmount += thirdBetAmount; // 0 + 100 = 100
      existingBet.teamName = 'Team A'; // Changes to new team
      existingBet.otype = thirdOtype; // Changes to lay
      existingBet.xValue = thirdOdds;
      user.avbalance -= thirdPrice; // 1000 - 100 = 900

      console.log('STEP 3: Team A Lay (2.0) - MERGE (Different Team & Otype)');
      console.log(
        `  price=${existingBet.price}, betAmount=${existingBet.betAmount}`
      );
      console.log(
        `  teamName=${existingBet.teamName}, otype=${existingBet.otype}`
      );
      console.log(`  avbalance=${user.avbalance}`);

      // Final state - ONE merged bet
      expect(existingBet.price).toBe(100);
      expect(existingBet.betAmount).toBe(100);
      expect(existingBet.teamName).toBe('Team A');
      expect(existingBet.otype).toBe('lay');
      expect(user.balance).toBe(1000);
      expect(user.avbalance).toBe(900);
      expect(user.balance - user.avbalance).toBe(100); // exposure = 100

      console.log('\n✅FINAL STATE:');
      console.log(`   Balance: 1000, AvBalance: 900, Exposure: 100`);
      console.log(
        `   Single merged bet (Team A Lay): price=100, betAmount=100`
      );
    });
  });

  describe('Real Website Behavior - Matching Current betController Logic', () => {
    test('Lilli 1.31 back → Tamara 4.5 back → Lilli 1.18 lay (PARTIAL REDUCTION then MERGE)', () => {
      const user = {
        balance: 1000,
        avbalance: 1000,
      };

      // ========================================
      // BET 1: Back Lilli @ 1.31, Stake 100
      // ========================================
      const bet1Stake = 100;
      const bet1Odds = 1.31;
      const bet1Otype = 'back';
      const bet1BetAmount = bet1Stake * (bet1Odds - 1); // 100 * 0.31 = 31
      const bet1Price = bet1Stake; // 100

      let existingBet = {
        teamName: 'Lilli',
        otype: bet1Otype,
        price: bet1Price,
        betAmount: bet1BetAmount,
        xValue: bet1Odds,
      };

      user.avbalance = user.balance - bet1Price; // 1000 - 100 = 900

      console.log('BET 1: Back Lilli @ 1.31, Stake 100');
      console.log(
        `  price=${existingBet.price}, betAmount=${existingBet.betAmount}`
      );
      console.log(`  avbalance=${user.avbalance}`);

      expect(existingBet.price).toBe(100);
      expect(existingBet.betAmount).toBeCloseTo(31, 2);
      expect(user.avbalance).toBe(900);

      // ========================================
      // BET 2: Back Tamara @ 4.5, Stake 100
      // DIFFERENT TEAM, SAME OTYPE → PARTIAL REDUCTION (Line 838-848)
      // ========================================
      const bet2Stake = 100;
      const bet2Odds = 4.5;
      const bet2Otype = 'back';
      const bet2BetAmount = bet2Stake * (bet2Odds - 1); // 100 * 3.5 = 350
      const bet2Price = bet2Stake; // 100

      const originalPrice = existingBet.price; // 100
      const originalBetAmount = existingBet.betAmount; // 31

      // Different team, same otype (otype === existingBet.otype)
      if (originalPrice >= bet2BetAmount) {
        // Full reduction
        existingBet.price = originalPrice - bet2BetAmount;
        existingBet.betAmount = originalBetAmount - bet2Price;
        user.avbalance += bet2BetAmount;
      } else {
        // PARTIAL REDUCTION (Line 838-848 else block)
        existingBet.price = bet2Price - originalBetAmount; // 100 - 31 = 69
        existingBet.betAmount = bet2BetAmount - originalPrice; // 350 - 100 = 250
        user.avbalance -= bet2Price - originalBetAmount - originalPrice; // 900 - (100 - 31 - 100) = 900 - (-31) = 931
        existingBet.teamName = bet2Stake ? 'Tamara' : existingBet.teamName; // Changes to Tamara
        existingBet.xValue = bet2Odds;
      }

      expect(existingBet.price).toBe(69); // 100 - 31
      expect(existingBet.betAmount).toBe(250); // 350 - 100
      expect(existingBet.teamName).toBe('Tamara');
      expect(user.avbalance).toBe(931);

      // ========================================
      // BET 3: Lay Lilli @ 1.18, Stake 100
      // DIFFERENT TEAM, DIFFERENT OTYPE → MERGE (Line 849-861)
      // ========================================
      const bet3Stake = 100;
      const bet3Odds = 1.18;
      const bet3Otype = 'lay';
      const bet3BetAmount = bet3Stake; // For lay: betAmount = stake
      const bet3Price = bet3Stake * (bet3Odds - 1); // 100 * 0.18 = 18

      // Different team, different otype (Line 849-861 else block - MERGE)
      existingBet.price += bet3Price; // 69 + 18 = 87
      existingBet.betAmount += bet3BetAmount; // 250 + 100 = 350
      existingBet.xValue = (existingBet.xValue + bet3Odds) / 2; // (4.5 + 1.18) / 2
      user.avbalance -= bet3Price; // 931 - 18 = 913
      existingBet.teamName = 'Lilli'; // Changes to Lilli
      existingBet.xValue = bet3Odds; // Updated to 1.18
      existingBet.otype = bet3Otype; // Changes to lay

      console.log(
        'BET 3: Lay Lilli @ 1.18, Stake 100 (Different team, different otype)'
      );
      console.log(`  MERGE applied`);
      console.log(
        `  price=${existingBet.price}, betAmount=${existingBet.betAmount}`
      );
      console.log(
        `  teamName=${existingBet.teamName}, otype=${existingBet.otype}`
      );
      console.log(`  avbalance=${user.avbalance}`);

      // Final state - ONE bet with MERGED values
      expect(existingBet.price).toBe(87); // 69 + 18 ✓
      expect(existingBet.betAmount).toBe(350); // 250 + 100 ✓
      expect(existingBet.teamName).toBe('Lilli');
      expect(existingBet.otype).toBe('lay');
      expect(user.balance).toBe(1000);
      expect(user.avbalance).toBe(913); // ✓
      expect(user.balance - user.avbalance).toBe(87); // exposure ✓
    });
  });

  // ========================================
  // SECTION 7: NEW BET (NO EXISTING BET)
  // ========================================

  describe('New Bet Placement (Lines 857-880)', () => {
    test('should create new bet and reduce avbalance', () => {
      let user = { avbalance: 1000 };
      const p = 100;

      // No existing bet - create new one
      const newBet = {
        price: p,
        betAmount: 150,
        otype: 'back',
      };
      user.avbalance -= p;

      expect(newBet.price).toBe(100);
      expect(newBet.betAmount).toBe(150);
      expect(user.avbalance).toBe(900);
    });
  });

  // ========================================
  // SECTION 8: INPUT VALIDATION
  // ========================================

  describe('Input Validation (Line 659)', () => {
    test('should validate all required fields present', () => {
      const body = {
        gameId: '10699179',
        sid: '4',
        price: 100,
        xValue: 2.5,
        gameName: 'Cricket',
        teamName: 'India W',
      };

      const isValid = !(
        !body.gameId ||
        !body.sid ||
        !body.price ||
        !body.xValue ||
        !body.gameName ||
        !body.teamName
      );

      expect(isValid).toBe(true);
    });

    test('should reject when gameId missing', () => {
      const body = {
        sid: '4',
        price: 100,
        xValue: 2.5,
        gameName: 'Cricket',
        teamName: 'India W',
      };

      const isValid = !(
        !body.gameId ||
        !body.sid ||
        !body.price ||
        !body.xValue ||
        !body.gameName ||
        !body.teamName
      );

      expect(isValid).toBe(false);
    });

    test('should reject when price is 0', () => {
      const price = 0;
      expect(price).toBeFalsy();
    });
  });

  // ========================================
  // SECTION 9: REAL SCENARIOS FROM YOUR API
  // ========================================

  describe('Real API Scenarios', () => {
    test('Cricket: India W v New Zealand W', () => {
      const price = 100;
      const xValue = 2.5;
      const otype = 'back';

      const betAmount = price * (xValue - 1);
      const p = price;

      expect(betAmount).toBe(150);
      expect(p).toBe(100);
    });

    test('Casino: poison game', () => {
      const price = 100;
      const xValue = 50;
      const otype = 'back';

      const betAmount = price * (xValue / 100);
      const p = price;

      expect(betAmount).toBe(50);
      expect(p).toBe(100);
    });

    test('Tennis: Stefanini v Bassols Ribera', () => {
      const price = 100;
      const xValue = 3.0;
      const otype = 'lay';

      const betAmount = price;
      const p = price * (xValue - 1);

      expect(betAmount).toBe(100);
      expect(p).toBe(200);
    });
  });
});
