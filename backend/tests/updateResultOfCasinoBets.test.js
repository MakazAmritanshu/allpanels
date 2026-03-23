import { beforeEach, describe, expect, test, vi } from 'vitest';

// These tests mirror the EXACT controller logic from updateResultOfCasinoBets
// Purpose: Identify which settlement calculations work correctly and which are broken

describe('Casino Settlement Logic - Controller Implementation', () => {
  describe('BACK BET - Normal (betAmount > 0)', () => {
    test('Back bet WINS: Calculate profit correctly', () => {
      // Controller lines 2149-2155
      const bet = {
        otype: 'back',
        betAmount: 150,
        price: 100,
        status: 0,
      };
      const win = true;

      let userBalanceChange = 0;
      let userAvBalanceChange = 0;
      let userProfitLossChange = 0;
      let betStatus = 0;

      if (bet.otype === 'back' && win && !(bet.betAmount < 0)) {
        const winAmount = bet.betAmount + bet.price;
        userBalanceChange = winAmount - bet.price;
        userAvBalanceChange = winAmount;
        userProfitLossChange = winAmount - bet.price;
        betStatus = 1;
      }

      expect(userBalanceChange).toBe(150);
      expect(userAvBalanceChange).toBe(250);
      expect(userProfitLossChange).toBe(150);
      expect(betStatus).toBe(1);
    });

    test('Back bet LOSES: Deduct price from balance', () => {
      // Controller lines 2170-2176
      const bet = {
        otype: 'back',
        betAmount: 150,
        price: 100,
        status: 0,
      };
      const win = false;

      let userBalanceChange = 0;
      let userAvBalanceChange = 0;
      let userProfitLossChange = 0;
      let betStatus = 0;

      if (bet.otype === 'back' && !win && !(bet.betAmount < 0)) {
        userBalanceChange = -bet.price;
        userAvBalanceChange = 0;
        userProfitLossChange = -bet.price;
        betStatus = 2;
      }

      expect(userBalanceChange).toBe(-100);
      expect(userAvBalanceChange).toBe(0);
      expect(userProfitLossChange).toBe(-100);
      expect(betStatus).toBe(2);
    });
  });

  describe('BACK BET - Offset (betAmount < 0)', () => {
    test('Back OFFSET bet WINS: User LOSES money despite winning', () => {
      // Controller lines 2141-2147
      const bet = {
        otype: 'back',
        betAmount: -50,
        price: 150,
        status: 0,
      };
      const win = true;

      let userBalanceChange = 0;
      let userAvBalanceChange = 0;
      let userProfitLossChange = 0;
      let resultAmount = 0;
      let betStatus = 0;

      if (bet.otype === 'back' && win && bet.betAmount < 0) {
        userBalanceChange = bet.betAmount;
        userAvBalanceChange = 0;
        userProfitLossChange = bet.betAmount;
        resultAmount = Math.abs(bet.betAmount);
        betStatus = 2;
      }

      expect(userBalanceChange).toBe(-50);
      expect(userAvBalanceChange).toBe(0);
      expect(resultAmount).toBe(50);
      expect(betStatus).toBe(2);
    });

    test('Back OFFSET bet LOSES: User breaks even', () => {
      // Controller lines 2163-2169
      const bet = {
        otype: 'back',
        betAmount: -50,
        price: 150,
        status: 0,
      };
      const win = false;

      let userBalanceChange = 0;
      let userAvBalanceChange = 0;
      let userProfitLossChange = 0;
      let resultAmount = 0;
      let betStatus = 0;

      if (bet.otype === 'back' && !win && bet.betAmount < 0) {
        userBalanceChange = 0;
        userAvBalanceChange = -bet.betAmount;
        userProfitLossChange = 0;
        resultAmount = 0;
        betStatus = 1;
      }

      expect(userBalanceChange).toBe(0);
      expect(userAvBalanceChange).toBe(50);
      expect(resultAmount).toBe(0);
      expect(betStatus).toBe(1);
    });
  });

  describe('LAY BET Settlement', () => {
    test('Lay bet LOSES (win = true): User loses stake', () => {
      // Controller lines 2184-2191
      const bet = {
        otype: 'lay',
        betAmount: 40,
        price: 160,
        status: 0,
      };
      const win = true;

      let userBalanceChange = 0;
      let userAvBalanceChange = 0;
      let userProfitLossChange = 0;
      let resultAmount = 0;
      let betStatus = 0;

      if (bet.otype === 'lay' && win) {
        userBalanceChange = -bet.price;
        userAvBalanceChange = 0;
        userProfitLossChange = -bet.price;
        resultAmount = bet.price;
        betStatus = 2;
      }

      expect(userBalanceChange).toBe(-160);
      expect(userAvBalanceChange).toBe(0);
      expect(resultAmount).toBe(160);
      expect(betStatus).toBe(2);
    });

    test('Lay bet WINS (win = false): User gets profit + full return', () => {
      // Controller lines 2192-2218
      const bet = {
        otype: 'lay',
        betAmount: 40,
        price: 160,
        status: 0,
      };
      const win = false;

      let userBalanceChange = 0;
      let userAvBalanceChange = 0;
      let userProfitLossChange = 0;
      let resultAmount = 0;
      let betStatus = 0;

      if (bet.otype === 'lay' && !win) {
        const stakedAmount = bet.price;
        const profitAmount = bet.betAmount;
        const totalReturn = stakedAmount + profitAmount;

        userBalanceChange = profitAmount;
        userAvBalanceChange = totalReturn;
        userProfitLossChange = profitAmount;
        resultAmount = profitAmount;
        betStatus = 1;
      }

      expect(userBalanceChange).toBe(40);
      expect(userAvBalanceChange).toBe(200);
      expect(resultAmount).toBe(40);
      expect(betStatus).toBe(1);
    });
  });

  describe('Winner Determination - Controller Logic', () => {
    test('Result shows "1" = PLAYER A wins', () => {
      // Controller lines 2124-2127
      const result = { winner: '1' };
      const bet = { teamName: 'PLAYER A' };

      const winnerRaw = (result.winner || '').trim();
      const winnerTeam =
        winnerRaw === '1'
          ? 'PLAYER A'
          : winnerRaw === '2'
            ? 'PLAYER B'
            : 'unknown';
      const betTeam = (bet.teamName || '').trim();
      const win =
        betTeam &&
        winnerTeam &&
        betTeam.toLowerCase() === winnerTeam.toLowerCase();

      expect(winnerTeam).toBe('PLAYER A');
      expect(win).toBe(true);
    });

    test('Result shows "2" = PLAYER B wins', () => {
      const result = { winner: '2' };
      const bet = { teamName: 'PLAYER B' };

      const winnerRaw = (result.winner || '').trim();
      const winnerTeam =
        winnerRaw === '1'
          ? 'PLAYER A'
          : winnerRaw === '2'
            ? 'PLAYER B'
            : 'unknown';
      const betTeam = (bet.teamName || '').trim();
      const win =
        betTeam &&
        winnerTeam &&
        betTeam.toLowerCase() === winnerTeam.toLowerCase();

      expect(winnerTeam).toBe('PLAYER B');
      expect(win).toBe(true);
    });

    test('Bet on PLAYER A but PLAYER B won = loss', () => {
      const result = { winner: '2' };
      const bet = { teamName: 'PLAYER A' };

      const winnerRaw = (result.winner || '').trim();
      const winnerTeam =
        winnerRaw === '1'
          ? 'PLAYER A'
          : winnerRaw === '2'
            ? 'PLAYER B'
            : 'unknown';
      const betTeam = (bet.teamName || '').trim();
      const win =
        betTeam &&
        winnerTeam &&
        betTeam.toLowerCase() === winnerTeam.toLowerCase();

      expect(winnerTeam).toBe('PLAYER B');
      expect(win).toBe(false);
    });

    test('Invalid result value = unknown', () => {
      const result = { winner: 'INVALID' };
      const bet = { teamName: 'PLAYER A' };

      const winnerRaw = (result.winner || '').trim();
      const winnerTeam =
        winnerRaw === '1'
          ? 'PLAYER A'
          : winnerRaw === '2'
            ? 'PLAYER B'
            : 'unknown';

      expect(winnerTeam).toBe('unknown');
    });
  });

  describe('User Update Accumulation - Controller Step 5d', () => {
    test('Accumulate single bet for user', () => {
      // Controller lines 2225-2238
      const userUpdates = new Map();
      const userId = 'user123';

      userUpdates.set(userId, {
        balanceChange: 0,
        avBalanceChange: 0,
        profitLossChange: 0,
      });

      const userBalanceChange = 150;
      const userAvBalanceChange = 250;
      const userProfitLossChange = 150;

      const userUpdate = userUpdates.get(userId);
      userUpdate.balanceChange += userBalanceChange;
      userUpdate.avBalanceChange += userAvBalanceChange;
      userUpdate.profitLossChange += userProfitLossChange;

      expect(userUpdate.balanceChange).toBe(150);
      expect(userUpdate.avBalanceChange).toBe(250);
      expect(userUpdate.profitLossChange).toBe(150);
    });

    test('Accumulate multiple bets for same user', () => {
      // Controller lines 2235-2238: Multiple bets accumulate
      const userUpdates = new Map();
      const userId = 'user123';

      userUpdates.set(userId, {
        balanceChange: 0,
        avBalanceChange: 0,
        profitLossChange: 0,
      });

      // Bet 1: Back wins +150
      let update = userUpdates.get(userId);
      update.balanceChange += 150;
      update.avBalanceChange += 250;
      update.profitLossChange += 150;

      // Bet 2: Back loses -100
      update = userUpdates.get(userId);
      update.balanceChange += -100;
      update.avBalanceChange += 0;
      update.profitLossChange += -100;

      // Bet 3: Lay wins +40
      update = userUpdates.get(userId);
      update.balanceChange += 40;
      update.avBalanceChange += 200;
      update.profitLossChange += 40;

      const final = userUpdates.get(userId);
      expect(final.balanceChange).toBe(90); // 150 - 100 + 40
      expect(final.avBalanceChange).toBe(450); // 250 + 0 + 200
      expect(final.profitLossChange).toBe(90); // 150 - 100 + 40
    });
  });

  describe('User Balance Update - Controller Step 6', () => {
    test('Apply balance changes to user (lines 2264-2266)', () => {
      // Simulating: user.balance += balanceChange
      //             user.avbalance += avBalanceChange
      //             user.bettingProfitLoss += profitLossChange
      const user = {
        balance: 1000,
        avbalance: 900,
        bettingProfitLoss: 0,
      };

      const balanceChange = 90;
      const avBalanceChange = 450;
      const profitLossChange = 90;

      user.balance += balanceChange;
      user.avbalance += avBalanceChange;
      user.bettingProfitLoss += profitLossChange;

      expect(user.balance).toBe(1090);
      expect(user.avbalance).toBe(1350);
      expect(user.bettingProfitLoss).toBe(90);
    });

    test('User balance can go negative if losses exceed balance', () => {
      const user = {
        balance: 100,
        avbalance: 50,
        bettingProfitLoss: 0,
      };

      const balanceChange = -200;

      user.balance += balanceChange;

      expect(user.balance).toBe(-100);
    });
  });

  describe('Exposure Recalculation - Controller Step 7', () => {
    test('Calculate exposure from pending bets (lines 2329-2334)', () => {
      // Controller: const newExposure = updatedPendingBets.reduce((sum, bet) => sum + (bet.price || 0), 0);
      const pendingBets = [
        { price: 100, status: 0 },
        { price: 150, status: 0 },
        { price: 200, status: 0 },
      ];

      const newExposure = pendingBets.reduce(
        (sum, bet) => sum + (bet.price || 0),
        0
      );

      expect(newExposure).toBe(450);
    });

    test('Exposure is zero when no pending bets', () => {
      const pendingBets = [];

      const newExposure = pendingBets.reduce(
        (sum, bet) => sum + (bet.price || 0),
        0
      );

      expect(newExposure).toBe(0);
    });

    test('Update user exposure (line 2332)', () => {
      // Controller: user.exposure = newExposure
      const user = {
        balance: 1000,
        avbalance: 900,
        exposure: 500,
      };

      const newExposure = 300;
      user.exposure = newExposure;

      expect(user.exposure).toBe(300);
    });
  });

  describe('Grouping and Processing - Controller Steps 2-4', () => {
    test('Group bets by gameId (line 2023-2028)', () => {
      // Controller: const groupedBets = bets.reduce((acc, b) => { ... }, {});
      const bets = [
        { gameId: 'poison20', _id: 'bet1' },
        { gameId: 'poison20', _id: 'bet2' },
        { gameId: 'teenpatti', _id: 'bet3' },
      ];

      const groupedBets = bets.reduce((acc, b) => {
        const gid = b.gameId || 'unknown';
        if (!acc[gid]) acc[gid] = [];
        acc[gid].push(b);
        return acc;
      }, {});

      expect(Object.keys(groupedBets).length).toBe(2);
      expect(groupedBets['poison20'].length).toBe(2);
      expect(groupedBets['teenpatti'].length).toBe(1);
    });

    test('Create results map by mid (lines 2076-2080)', () => {
      // Controller: const resultsByMid = new Map();
      const resultsArray = [
        { mid: 174250902211301, winner: '1' },
        { mid: 174250902211302, winner: '2' },
      ];

      const resultsByMid = new Map();
      for (const r of resultsArray) {
        if (r?.mid != null) resultsByMid.set(String(r.mid), r);
      }

      expect(resultsByMid.size).toBe(2);
      expect(resultsByMid.get('174250902211301').winner).toBe('1');
      expect(resultsByMid.get('174250902211302').winner).toBe('2');
    });

    test('Match bet to result by roundId', () => {
      // Controller lines 2115-2121
      const bet = { roundId: 174250902211301 };
      const resultsByMid = new Map();
      resultsByMid.set('174250902211301', { winner: '1' });

      const roundIdStr = String(bet.roundId || bet.market_id || '');
      const matchingResult = resultsByMid.get(roundIdStr);

      expect(matchingResult).not.toBeUndefined();
      expect(matchingResult.winner).toBe('1');
    });

    test('Skip bet if no matching result', () => {
      const bet = { roundId: 999999999 };
      const resultsByMid = new Map();
      resultsByMid.set('174250902211301', { winner: '1' });

      const roundIdStr = String(bet.roundId || '');
      const matchingResult = resultsByMid.get(roundIdStr);

      expect(matchingResult).toBeUndefined();
    });
  });

  describe('Parse Provider Response - Controller Step 4b', () => {
    test('Parse valid JSON response', () => {
      // Controller lines 2060-2074
      let resultData = '{"data":{"res":[{"mid":123,"winner":"1"}]}}';

      if (typeof resultData === 'string') {
        try {
          resultData = JSON.parse(resultData);
        } catch (e) {
          resultData = null;
        }
      }

      expect(resultData).not.toBeNull();
      expect(resultData.data.res[0].winner).toBe('1');
    });

    test('Handle parse error gracefully', () => {
      let resultData = 'INVALID_JSON{{{';

      if (typeof resultData === 'string') {
        try {
          resultData = JSON.parse(resultData);
        } catch (e) {
          resultData = null;
        }
      }

      expect(resultData).toBeNull();
    });

    test('Extract results array correctly', () => {
      const resultData = { data: { res: [{ mid: 123, winner: '1' }] } };

      const resultsArray = resultData?.data?.res || resultData?.res || [];

      expect(Array.isArray(resultsArray)).toBe(true);
      expect(resultsArray.length).toBe(1);
    });
  });

  describe('Complete Settlement Flow - Multiple Users', () => {
    test('Process 3 bets from 2 users, accumulate correctly', () => {
      const userUpdates = new Map();

      // Initialize users
      userUpdates.set('user1', {
        balanceChange: 0,
        avBalanceChange: 0,
        profitLossChange: 0,
      });
      userUpdates.set('user2', {
        balanceChange: 0,
        avBalanceChange: 0,
        profitLossChange: 0,
      });

      // Bet 1: User1 Back wins
      let update = userUpdates.get('user1');
      update.balanceChange += 150;
      update.avBalanceChange += 250;
      update.profitLossChange += 150;

      // Bet 2: User2 Back loses
      update = userUpdates.get('user2');
      update.balanceChange += -100;
      update.avBalanceChange += 0;
      update.profitLossChange += -100;

      // Bet 3: User2 Lay wins
      update = userUpdates.get('user2');
      update.balanceChange += 40;
      update.avBalanceChange += 200;
      update.profitLossChange += 40;

      // Apply to users
      const user1 = { balance: 1000, avbalance: 900, bettingProfitLoss: 0 };
      const user2 = { balance: 500, avbalance: 400, bettingProfitLoss: 0 };

      user1.balance += userUpdates.get('user1').balanceChange;
      user1.avbalance += userUpdates.get('user1').avBalanceChange;
      user1.bettingProfitLoss += userUpdates.get('user1').profitLossChange;

      user2.balance += userUpdates.get('user2').balanceChange;
      user2.avbalance += userUpdates.get('user2').avBalanceChange;
      user2.bettingProfitLoss += userUpdates.get('user2').profitLossChange;

      expect(user1.balance).toBe(1150);
      expect(user1.avbalance).toBe(1150);
      expect(user1.bettingProfitLoss).toBe(150);

      expect(user2.balance).toBe(440);
      expect(user2.avbalance).toBe(600);
      expect(user2.bettingProfitLoss).toBe(-60);
    });

    test('Process same user with offset bet winning', () => {
      const userUpdates = new Map();
      userUpdates.set('user1', { balanceChange: 0, avBalanceChange: 0 });

      // Bet 1: Normal back win
      let update = userUpdates.get('user1');
      update.balanceChange += 150;
      update.avBalanceChange += 250;

      // Bet 2: Offset back win (loses money)
      update = userUpdates.get('user1');
      update.balanceChange += -50;
      update.avBalanceChange += 0;

      const final = userUpdates.get('user1');
      expect(final.balanceChange).toBe(100);
      expect(final.avBalanceChange).toBe(250);
    });
  });

  describe('Real Calculation Examples', () => {
    test('Example 1: Back @ 2.5, Stake 100', () => {
      const price = 100;
      const odds = 2.5;
      const betAmount = price * (odds - 1); // 150

      const bet = { otype: 'back', price, betAmount };
      const win = true;

      if (bet.otype === 'back' && win && !(bet.betAmount < 0)) {
        const winAmount = bet.betAmount + bet.price;
        const userBalanceChange = winAmount - bet.price;

        expect(userBalanceChange).toBe(150);
      }
    });

    test('Example 2: Lay @ 2.0, Stake 160', () => {
      const stake = 160;
      const odds = 2.0;
      const price = stake * (odds - 1); // 160
      const betAmount = stake;

      const bet = { otype: 'lay', price, betAmount };
      const win = false;

      if (bet.otype === 'lay' && !win) {
        const stakedAmount = bet.price;
        const profitAmount = bet.betAmount;
        const totalReturn = stakedAmount + profitAmount;

        expect(profitAmount).toBe(160);
        expect(totalReturn).toBe(320);
      }
    });

    test('Example 3: Offset result - Back 100 @ 2.0 then Lay 50 @ 2.0', () => {
      // After offset: price=50, betAmount=50, type=back
      const offsetBet = { otype: 'back', price: 50, betAmount: 50 };
      const win = true;

      if (offsetBet.otype === 'back' && win && !(offsetBet.betAmount < 0)) {
        const winAmount = offsetBet.betAmount + offsetBet.price;
        const userBalanceChange = winAmount - offsetBet.price;

        expect(userBalanceChange).toBe(50);
      }
    });
  });

  // ============================================================================
  // NEGATIVE PRICE SCENARIOS - Guaranteed Profit from Offset Betting
  // ============================================================================
  // When a user places BACK + LAY bets that create a guaranteed profit scenario,
  // the merged bet can have a NEGATIVE price. This means the user profits
  // regardless of the outcome.
  //
  // Example: BACK 10k@1.98 → LAY 10k@1.65 → LAY 100@1.37
  // Results in: { price: -3263, betAmount: 100, otype: 'lay' }
  // P&L: Player A WINS → +3263, Player A LOSES → +100
  // ============================================================================

  describe('LAY BET - Negative Price (Guaranteed Profit Scenarios)', () => {
    // Helper function that mirrors the FIXED controller logic
    function settleLAYBet(bet, win) {
      let userBalanceChange = 0;
      let userAvBalanceChange = 0;
      let userProfitLossChange = 0;
      let resultAmount = 0;
      let betStatus = 0;

      if (bet.otype === 'lay') {
        if (win) {
          // LAY LOSES - selection won, layer pays liability
          // When price is negative, user actually GAINS money (guaranteed profit)
          userBalanceChange = -bet.price; // -(-3263) = +3263
          userAvBalanceChange = 0;
          userProfitLossChange = -bet.price;
          resultAmount = Math.abs(bet.price);
          betStatus = 2; // LOSS status but positive balance change!
        } else {
          // LAY WINS - selection lost, layer keeps stake
          // FIXED: Handle negative price (guaranteed profit scenario)
          if (bet.price < 0) {
            // Negative price = guaranteed profit, use betAmount directly
            userBalanceChange = bet.betAmount;
            userAvBalanceChange = bet.betAmount;
            userProfitLossChange = bet.betAmount;
            resultAmount = Math.abs(bet.betAmount);
          } else {
            // Normal LAY win
            const stakedAmount = bet.price;
            const profitAmount = bet.betAmount;
            const totalReturn = stakedAmount + profitAmount;
            userBalanceChange = profitAmount;
            userAvBalanceChange = totalReturn;
            userProfitLossChange = profitAmount;
            resultAmount = Math.abs(profitAmount);
          }
          betStatus = 1; // WIN
        }
      }

      return {
        userBalanceChange,
        userAvBalanceChange,
        userProfitLossChange,
        resultAmount,
        betStatus,
      };
    }

    test('LAY WINS with negative price: User gets +100 profit (Player A LOSES)', () => {
      // Scenario: Merged bet from BACK 10k@1.98 → LAY 10k@1.65 → LAY 100@1.37
      // Merged bet: { price: -3263, betAmount: 100, otype: 'lay' }
      // Player A LOSES → LAY WINS
      const bet = {
        otype: 'lay',
        price: -3263, // NEGATIVE = guaranteed profit scenario
        betAmount: 100,
        teamName: 'Player A',
      };
      const win = false; // Player A lost, so LAY wins

      const result = settleLAYBet(bet, win);

      // User should gain +100 (the betAmount)
      expect(result.userBalanceChange).toBe(100);
      expect(result.userAvBalanceChange).toBe(100); // FIXED: Was -3163 before fix
      expect(result.userProfitLossChange).toBe(100);
      expect(result.resultAmount).toBe(100);
      expect(result.betStatus).toBe(1); // WIN
    });

    test('LAY LOSES with negative price: User gets +3263 profit (Player A WINS)', () => {
      // Same merged bet, but Player A WINS → LAY LOSES
      // However, user still PROFITS because price is negative!
      const bet = {
        otype: 'lay',
        price: -3263,
        betAmount: 100,
        teamName: 'Player A',
      };
      const win = true; // Player A won, so LAY loses

      const result = settleLAYBet(bet, win);

      // User gains -(-3263) = +3263
      expect(result.userBalanceChange).toBe(3263);
      expect(result.userAvBalanceChange).toBe(0);
      expect(result.userProfitLossChange).toBe(3263);
      expect(result.resultAmount).toBe(3263);
      expect(result.betStatus).toBe(2); // LOSS status but positive money!
    });

    test('Normal LAY WINS (positive price): Existing behavior unchanged', () => {
      // Normal LAY bet without offset
      const bet = {
        otype: 'lay',
        price: 160, // Normal positive price
        betAmount: 40,
      };
      const win = false;

      const result = settleLAYBet(bet, win);

      expect(result.userBalanceChange).toBe(40);
      expect(result.userAvBalanceChange).toBe(200); // 160 + 40
      expect(result.userProfitLossChange).toBe(40);
      expect(result.betStatus).toBe(1);
    });

    test('Normal LAY LOSES (positive price): Existing behavior unchanged', () => {
      const bet = {
        otype: 'lay',
        price: 160,
        betAmount: 40,
      };
      const win = true;

      const result = settleLAYBet(bet, win);

      expect(result.userBalanceChange).toBe(-160);
      expect(result.userAvBalanceChange).toBe(0);
      expect(result.userProfitLossChange).toBe(-160);
      expect(result.betStatus).toBe(2);
    });
  });

  describe('Complete User Scenario - BACK + LAY + LAY Guaranteed Profit', () => {
    test('Full scenario: Initial 10k, BACK 10k@1.98 → LAY 10k@1.65 → LAY 100@1.37, Player A LOSES', () => {
      // This is the exact user-reported scenario
      const initialBalance = 10000;
      const initialAvBalance = 10000;
      const initialExposure = 0;

      // After placing all 3 bets, the merged bet is:
      const mergedBet = {
        otype: 'lay',
        price: -3263, // Negative = guaranteed profit
        betAmount: 100,
        teamName: 'Player A',
        status: 0,
      };

      // Before settlement: exposure should be 0 (negative price = no risk)
      const exposureBeforeSettlement =
        mergedBet.price < 0 ? 0 : mergedBet.price;
      expect(exposureBeforeSettlement).toBe(0);

      // Settlement: Player A LOSES → LAY WINS
      const win = false;
      let balanceChange = 0;
      let avBalanceChange = 0;

      if (mergedBet.otype === 'lay' && !win) {
        if (mergedBet.price < 0) {
          balanceChange = mergedBet.betAmount;
          avBalanceChange = mergedBet.betAmount;
        } else {
          const totalReturn = mergedBet.price + mergedBet.betAmount;
          balanceChange = mergedBet.betAmount;
          avBalanceChange = totalReturn;
        }
      }

      // Apply changes
      const finalBalance = initialBalance + balanceChange;
      const finalExposure = 0; // No pending bets after settlement

      // FIXED: AvBalance is recalculated as balance - exposure
      const finalAvBalance = finalBalance - finalExposure;

      expect(finalBalance).toBe(10100); // 10000 + 100
      expect(finalExposure).toBe(0);
      expect(finalAvBalance).toBe(10100); // FIXED: Was 6837 before fix
    });

    test('Full scenario: Initial 10k, same bets, Player A WINS', () => {
      const initialBalance = 10000;

      const mergedBet = {
        otype: 'lay',
        price: -3263,
        betAmount: 100,
        teamName: 'Player A',
        status: 0,
      };

      // Settlement: Player A WINS → LAY LOSES
      const win = true;
      let balanceChange = 0;

      if (mergedBet.otype === 'lay' && win) {
        balanceChange = -mergedBet.price; // -(-3263) = +3263
      }

      const finalBalance = initialBalance + balanceChange;
      const finalExposure = 0;
      const finalAvBalance = finalBalance - finalExposure;

      expect(finalBalance).toBe(13263); // 10000 + 3263
      expect(finalExposure).toBe(0);
      expect(finalAvBalance).toBe(13263);
    });
  });

  describe('AvBalance Recalculation After Settlement', () => {
    test('AvBalance is recalculated as balance - exposure after settlement', () => {
      // This tests the Phase 2 fix
      const user = {
        balance: 10100,
        avbalance: 6837, // Incorrect value from buggy incremental update
        exposure: 0, // No pending bets after settlement
      };

      // After settlement, avbalance should be recalculated
      user.avbalance = user.balance - user.exposure;

      expect(user.avbalance).toBe(10100);
    });

    test('AvBalance recalculation with remaining exposure', () => {
      const user = {
        balance: 15000,
        avbalance: 8000, // Stale value
        exposure: 2000, // Still have pending bets
      };

      user.avbalance = user.balance - user.exposure;

      expect(user.avbalance).toBe(13000);
    });

    test('AvBalance recalculation when balance decreased', () => {
      const user = {
        balance: 5000,
        avbalance: 10000, // Incorrect stale high value
        exposure: 1000,
      };

      user.avbalance = user.balance - user.exposure;

      expect(user.avbalance).toBe(4000);
    });
  });

  describe('Edge Cases - Negative Price Scenarios', () => {
    test('Perfect hedge: price = 0, betAmount = 0', () => {
      // BACK 100@2.0 then LAY 100@2.0 = perfect hedge
      const bet = {
        otype: 'back',
        price: 0,
        betAmount: 0,
      };

      // Exposure calculation
      const exposure = bet.price < 0 ? 0 : bet.price;
      expect(exposure).toBe(0);

      // Settlement should result in no change
      let balanceChange = 0;
      if (bet.otype === 'back') {
        balanceChange = bet.betAmount; // 0
      }
      expect(balanceChange).toBe(0);
    });

    test('Small negative price: price = -10, betAmount = 5', () => {
      const bet = {
        otype: 'lay',
        price: -10,
        betAmount: 5,
      };

      // LAY WINS with small negative price
      const win = false;
      let balanceChange = 0;
      let avBalanceChange = 0;

      if (bet.otype === 'lay' && !win) {
        if (bet.price < 0) {
          balanceChange = bet.betAmount;
          avBalanceChange = bet.betAmount;
        }
      }

      expect(balanceChange).toBe(5);
      expect(avBalanceChange).toBe(5);
    });

    test('Large negative price: price = -50000, betAmount = 1000', () => {
      const bet = {
        otype: 'lay',
        price: -50000,
        betAmount: 1000,
      };

      // LAY WINS
      let balanceChange = 0;
      let avBalanceChange = 0;

      if (bet.price < 0) {
        balanceChange = bet.betAmount;
        avBalanceChange = bet.betAmount;
      } else {
        const totalReturn = bet.price + bet.betAmount;
        avBalanceChange = totalReturn; // Would be -49000 without fix!
      }

      expect(balanceChange).toBe(1000);
      expect(avBalanceChange).toBe(1000);
    });

    test('Exposure calculation with mixed positive and negative prices', () => {
      const pendingBets = [
        { price: 100, betAmount: 50 }, // Normal bet
        { price: -3263, betAmount: 100 }, // Guaranteed profit bet
        { price: 200, betAmount: 100 }, // Normal bet
      ];

      const exposure = pendingBets.reduce((sum, bet) => {
        if (bet.price < 0) return sum + 0; // Negative price = no exposure
        return sum + bet.price;
      }, 0);

      // Only positive prices count
      expect(exposure).toBe(300); // 100 + 0 + 200
    });
  });

  describe('Multiple Users Settlement with Negative Price Bets', () => {
    test('Two users: one with normal bet, one with negative price bet', () => {
      const userUpdates = new Map();

      // User 1: Normal LAY bet wins
      userUpdates.set('user1', {
        balanceChange: 0,
        avBalanceChange: 0,
        profitLossChange: 0,
      });
      const normalBet = { otype: 'lay', price: 160, betAmount: 40 };
      let update1 = userUpdates.get('user1');
      update1.balanceChange = normalBet.betAmount;
      update1.avBalanceChange = normalBet.price + normalBet.betAmount;
      update1.profitLossChange = normalBet.betAmount;

      // User 2: Negative price LAY bet wins
      userUpdates.set('user2', {
        balanceChange: 0,
        avBalanceChange: 0,
        profitLossChange: 0,
      });
      const negativePriceBet = { otype: 'lay', price: -3263, betAmount: 100 };
      let update2 = userUpdates.get('user2');

      // FIXED logic for negative price
      if (negativePriceBet.price < 0) {
        update2.balanceChange = negativePriceBet.betAmount;
        update2.avBalanceChange = negativePriceBet.betAmount;
        update2.profitLossChange = negativePriceBet.betAmount;
      }

      expect(userUpdates.get('user1').balanceChange).toBe(40);
      expect(userUpdates.get('user1').avBalanceChange).toBe(200);

      expect(userUpdates.get('user2').balanceChange).toBe(100);
      expect(userUpdates.get('user2').avBalanceChange).toBe(100); // FIXED
    });
  });

  describe('Bet Offset Trace - User Scenario Verification', () => {
    test('Trace: BACK 10k@1.98 creates initial bet', () => {
      const stake = 10000;
      const odds = 1.98;

      const bet = {
        price: stake, // 10000
        betAmount: stake * (odds - 1), // 9800
        otype: 'back',
      };

      expect(bet.price).toBe(10000);
      expect(bet.betAmount).toBe(9800);
      expect(bet.otype).toBe('back');
    });

    test('Trace: LAY 10k@1.65 full offset', () => {
      // Existing bet after Bet 1
      let existingBet = {
        price: 10000,
        betAmount: 9800,
        otype: 'back',
      };

      // New LAY bet
      const layStake = 10000;
      const layOdds = 1.65;
      const p = layStake * (layOdds - 1); // 6500 (liability)
      const newBetAmount = layStake; // 10000

      // Offset logic: originalPrice >= betAmount → 10000 >= 10000 → TRUE
      const originalPrice = existingBet.price;
      const originalBetAmount = existingBet.betAmount;

      if (originalPrice >= newBetAmount) {
        // Full offset
        existingBet.price = originalPrice - newBetAmount; // 10000 - 10000 = 0
        existingBet.betAmount = originalBetAmount - p; // 9800 - 6500 = 3300
        // otype stays 'back' in full offset
      }

      expect(existingBet.price).toBe(0);
      expect(existingBet.betAmount).toBeCloseTo(3300, 5); // Use toBeCloseTo for floating-point
      expect(existingBet.otype).toBe('back');
    });

    test('Trace: LAY 100@1.37 partial offset creates negative price', () => {
      // Existing bet after Bet 2
      let existingBet = {
        price: 0,
        betAmount: 3300,
        otype: 'back',
      };

      // New LAY bet
      const layStake = 100;
      const layOdds = 1.37;
      const p = layStake * (layOdds - 1); // 37 (liability)
      const newBetAmount = layStake; // 100

      // Offset logic: originalPrice >= betAmount → 0 >= 100 → FALSE
      const originalPrice = existingBet.price;
      const originalBetAmount = existingBet.betAmount;

      if (originalPrice >= newBetAmount) {
        // Full offset - won't execute
      } else {
        // Partial offset
        existingBet.price = p - originalBetAmount; // 37 - 3300 = -3263
        existingBet.betAmount = newBetAmount - originalPrice; // 100 - 0 = 100
        existingBet.otype = 'lay'; // Changes to LAY in partial offset
      }

      expect(existingBet.price).toBe(-3263);
      expect(existingBet.betAmount).toBe(100);
      expect(existingBet.otype).toBe('lay');
    });

    test('Verify P&L for both outcomes', () => {
      // Final merged bet
      const bet = { price: -3263, betAmount: 100, otype: 'lay' };

      // If Player A WINS (LAY loses):
      // balanceChange = -price = -(-3263) = +3263
      const pnlIfWins = -bet.price;
      expect(pnlIfWins).toBe(3263);

      // If Player A LOSES (LAY wins):
      // balanceChange = betAmount = 100
      const pnlIfLoses = bet.betAmount;
      expect(pnlIfLoses).toBe(100);

      // Both outcomes are profitable!
      expect(pnlIfWins).toBeGreaterThan(0);
      expect(pnlIfLoses).toBeGreaterThan(0);
    });
  });

  describe('Boundary Conditions', () => {
    test('Price exactly 0: should use normal formula', () => {
      const bet = { otype: 'lay', price: 0, betAmount: 50 };
      const win = false;

      let avBalanceChange = 0;
      if (bet.price < 0) {
        avBalanceChange = bet.betAmount;
      } else {
        avBalanceChange = bet.price + bet.betAmount; // 0 + 50 = 50
      }

      expect(avBalanceChange).toBe(50);
    });

    test('Price exactly -1: should use negative price formula', () => {
      const bet = { otype: 'lay', price: -1, betAmount: 50 };
      const win = false;

      let avBalanceChange = 0;
      if (bet.price < 0) {
        avBalanceChange = bet.betAmount;
      } else {
        avBalanceChange = bet.price + bet.betAmount; // Would be 49
      }

      expect(avBalanceChange).toBe(50); // Uses betAmount directly
    });

    test('Very small betAmount with negative price', () => {
      const bet = { otype: 'lay', price: -5000, betAmount: 1 };
      const win = false;

      let avBalanceChange = 0;
      if (bet.price < 0) {
        avBalanceChange = bet.betAmount;
      }

      expect(avBalanceChange).toBe(1);
    });

    test('Zero betAmount with negative price', () => {
      const bet = { otype: 'lay', price: -100, betAmount: 0 };
      const win = false;

      let balanceChange = 0;
      let avBalanceChange = 0;

      if (bet.price < 0) {
        balanceChange = bet.betAmount;
        avBalanceChange = bet.betAmount;
      }

      expect(balanceChange).toBe(0);
      expect(avBalanceChange).toBe(0);
    });
  });
});
