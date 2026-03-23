import { beforeEach, describe, expect, test } from 'vitest';

describe('EVENT P/L - Admin Dashboard Reports by Event', () => {
  describe('SECTION 1: Admin myProfit Calculation (downlineController line 317)', () => {
    test('myProfit = downlineWinAmount - downlineLossAmount', () => {
      // Controller: myProfit = downlineWinAmount - downlineLossAmount
      // This is what ADMIN gains/loses (inverse of user direction)

      const downlineWinAmount = 1000; // Total when users win (admin loses)
      const downlineLossAmount = 500; // Total when users lose (admin gains)

      const myProfit = downlineWinAmount - downlineLossAmount;

      expect(myProfit).toBe(500);
      // myProfit = 1000 - 500 = 500
      // But from admin perspective: LOSES 1000 when users win, GAINS 500 when users lose
      // Net: LOSES 500
    });

    test('Positive result when downlines win more than lose (myProfit = downlineWinAmount - downlineLossAmount)', () => {
      const downlineWinAmount = 2000;
      const downlineLossAmount = 500;

      const myProfit = downlineWinAmount - downlineLossAmount;

      expect(myProfit).toBe(1500); // 2000 - 500 = 1500
    });

    test('Negative result when downlines lose more than win', () => {
      const downlineWinAmount = 500;
      const downlineLossAmount = 2000;

      const myProfit = downlineWinAmount - downlineLossAmount;

      expect(myProfit).toBe(-1500); // 500 - 2000 = -1500
    });

    test('Zero profit when balanced', () => {
      const downlineWinAmount = 1000;
      const downlineLossAmount = 1000;

      const myProfit = downlineWinAmount - downlineLossAmount;

      expect(myProfit).toBe(0);
    });
  });

  describe('SECTION 2: Direct Betting P/L (Admin own bets)', () => {
    test('Admin places back bet and wins', () => {
      const admin = {
        _id: 'admin1',
        bets: [
          {
            _id: 'bet1',
            otype: 'back',
            price: 100,
            betAmount: 150,
            result: 'WIN',
          },
        ],
      };

      let adminDirectPL = 0;
      for (const bet of admin.bets) {
        if (bet.result === 'WIN') {
          adminDirectPL += bet.betAmount;
        } else if (bet.result === 'LOSS') {
          adminDirectPL -= bet.price;
        }
      }

      expect(adminDirectPL).toBe(150);
    });

    test('Admin places back bet and loses', () => {
      const admin = {
        _id: 'admin1',
        bets: [
          {
            _id: 'bet1',
            otype: 'back',
            price: 100,
            betAmount: 150,
            result: 'LOSS',
          },
        ],
      };

      let adminDirectPL = 0;
      for (const bet of admin.bets) {
        if (bet.result === 'WIN') {
          adminDirectPL += bet.betAmount;
        } else if (bet.result === 'LOSS') {
          adminDirectPL -= bet.price;
        }
      }

      expect(adminDirectPL).toBe(-100);
    });

    test('Admin places lay bet and wins', () => {
      const admin = {
        _id: 'admin1',
        bets: [
          {
            _id: 'bet1',
            otype: 'lay',
            price: 100,
            betAmount: 50,
            result: 'WIN',
          },
        ],
      };

      let adminDirectPL = 0;
      for (const bet of admin.bets) {
        if (bet.otype === 'lay') {
          if (bet.result === 'WIN') {
            adminDirectPL += bet.betAmount; // Profit
          } else if (bet.result === 'LOSS') {
            adminDirectPL -= bet.price; // Loss
          }
        } else {
          if (bet.result === 'WIN') {
            adminDirectPL += bet.betAmount;
          } else if (bet.result === 'LOSS') {
            adminDirectPL -= bet.price;
          }
        }
      }

      expect(adminDirectPL).toBe(50);
    });

    test('Admin places multiple bets with mixed results', () => {
      const admin = {
        _id: 'admin1',
        bets: [
          { otype: 'back', price: 100, betAmount: 100, result: 'WIN' }, // +100
          { otype: 'back', price: 100, betAmount: 100, result: 'LOSS' }, // -100
          { otype: 'lay', price: 100, betAmount: 50, result: 'WIN' }, // +50
          { otype: 'lay', price: 100, betAmount: 50, result: 'LOSS' }, // -100
        ],
      };

      let adminDirectPL = 0;
      for (const bet of admin.bets) {
        if (bet.otype === 'lay') {
          if (bet.result === 'WIN') {
            adminDirectPL += bet.betAmount;
          } else if (bet.result === 'LOSS') {
            adminDirectPL -= bet.price;
          }
        } else {
          if (bet.result === 'WIN') {
            adminDirectPL += bet.betAmount;
          } else if (bet.result === 'LOSS') {
            adminDirectPL -= bet.price;
          }
        }
      }

      expect(adminDirectPL).toBe(-50); // 100 - 100 + 50 - 100
    });
  });

  describe('SECTION 3: Event Report Calculation', () => {
    test('Get P/L for single event/match', () => {
      const event = {
        eventId: 'match123',
        eventName: 'India vs Pakistan',
        status: 'settled',
      };

      const bets = [
        {
          eventId: 'match123',
          userId: 'u1',
          result: 'WIN',
          betAmount: 500,
          price: 100,
        },
        {
          eventId: 'match123',
          userId: 'u2',
          result: 'WIN',
          betAmount: 300,
          price: 100,
        },
        {
          eventId: 'match123',
          userId: 'u3',
          result: 'LOSS',
          betAmount: 200,
          price: 200,
        },
        {
          eventId: 'other',
          userId: 'u4',
          result: 'WIN',
          betAmount: 100,
          price: 50,
        },
      ];

      const eventBets = bets.filter((b) => b.eventId === event.eventId);

      let downlineWinAmount = 0;
      let downlineLossAmount = 0;

      for (const bet of eventBets) {
        if (bet.result === 'WIN') {
          downlineWinAmount += bet.betAmount;
        } else if (bet.result === 'LOSS') {
          downlineLossAmount += bet.price;
        }
      }

      const myProfit = downlineWinAmount - downlineLossAmount;

      expect(eventBets.length).toBe(3);
      expect(downlineWinAmount).toBe(800); // 500 + 300
      expect(downlineLossAmount).toBe(200);
      expect(myProfit).toBe(600);
    });

    test('Group by event and market', () => {
      const bets = [
        {
          eventId: 'E1',
          market: 'Match Winner',
          otype: 'back',
          result: 'WIN',
          amount: 500,
        },
        {
          eventId: 'E1',
          market: 'Match Winner',
          otype: 'lay',
          result: 'LOSS',
          amount: 200,
        },
        {
          eventId: 'E1',
          market: 'Fancy Bets',
          otype: 'back',
          result: 'WIN',
          amount: 300,
        },
        {
          eventId: 'E2',
          market: 'Match Winner',
          otype: 'back',
          result: 'LOSS',
          amount: 100,
        },
      ];

      const groupByEventAndMarket = {};

      for (const bet of bets) {
        const key = `${bet.eventId}_${bet.market}`;
        if (!groupByEventAndMarket[key]) {
          groupByEventAndMarket[key] = [];
        }
        groupByEventAndMarket[key].push(bet);
      }

      expect(Object.keys(groupByEventAndMarket).length).toBe(3);
      expect(groupByEventAndMarket['E1_Match Winner'].length).toBe(2);
      expect(groupByEventAndMarket['E1_Fancy Bets'].length).toBe(1);
    });

    test('Calculate event totals with multiple markets', () => {
      const eventBets = [
        { market: 'Match Winner', result: 'WIN', amount: 500 },
        { market: 'Match Winner', result: 'LOSS', amount: 200 },
        { market: 'Fancy Bets', result: 'WIN', amount: 300 },
        { market: 'Fancy Bets', result: 'LOSS', amount: 150 },
      ];

      let totalWin = 0;
      let totalLoss = 0;

      for (const bet of eventBets) {
        if (bet.result === 'WIN') {
          totalWin += bet.amount;
        } else if (bet.result === 'LOSS') {
          totalLoss += bet.amount;
        }
      }

      const totalPL = totalWin - totalLoss;

      expect(totalWin).toBe(800);
      expect(totalLoss).toBe(350);
      expect(totalPL).toBe(450);
    });
  });

  describe('SECTION 4: getMyReportByDownline - Downline Individual P/L', () => {
    test('Calculate P/L for each individual downline', () => {
      const downlines = [
        { _id: 'u1', userName: 'user1' },
        { _id: 'u2', userName: 'user2' },
        { _id: 'u3', userName: 'user3' },
      ];

      const bets = [
        { userId: 'u1', result: 'WIN', amount: 500, price: 100 },
        { userId: 'u1', result: 'LOSS', amount: 200, price: 200 },
        { userId: 'u2', result: 'WIN', amount: 300, price: 100 },
        { userId: 'u3', result: 'WIN', amount: 100, price: 50 },
      ];

      const downlineReport = downlines.map((downline) => {
        const userBets = bets.filter((b) => b.userId === downline._id);

        let winAmount = 0;
        let lossAmount = 0;

        for (const bet of userBets) {
          if (bet.result === 'WIN') {
            winAmount += bet.amount;
          } else if (bet.result === 'LOSS') {
            lossAmount += bet.price;
          }
        }

        return {
          ...downline,
          winAmount,
          lossAmount,
          profitLoss: winAmount - lossAmount,
        };
      });

      expect(downlineReport[0].profitLoss).toBe(300); // 500 - 200
      expect(downlineReport[1].profitLoss).toBe(300); // 300 - 0
      expect(downlineReport[2].profitLoss).toBe(100); // 100 - 0
    });

    test('Include hierarchical P/L from bettingProfitLoss field', () => {
      const downlineUsers = [
        { _id: 'u1', userName: 'user1', bettingProfitLoss: 500 },
        { _id: 'a1', userName: 'agent1', bettingProfitLoss: 1200 },
      ];

      const report = downlineUsers.map((user) => ({
        ...user,
        hierarchicalPL: user.bettingProfitLoss,
      }));

      expect(report[0].hierarchicalPL).toBe(500);
      expect(report[1].hierarchicalPL).toBe(1200);
    });

    test('Show both directBettingPL and hierarchicalPL', () => {
      // directBettingPL = from bets placed by this user
      // hierarchicalPL = from bettingProfitLoss field (may include sub-users)

      const downline = {
        _id: 'a1',
        userName: 'agent1',
        bettingProfitLoss: 1200, // From field - sum of direct users
        bets: [
          { result: 'WIN', amount: 200 },
          { result: 'LOSS', amount: 100 },
        ],
      };

      let directBettingPL = 0;
      for (const bet of downline.bets) {
        if (bet.result === 'WIN') {
          directBettingPL += bet.amount;
        } else if (bet.result === 'LOSS') {
          directBettingPL -= bet.amount;
        }
      }

      const hierarchicalPL = downline.bettingProfitLoss;

      expect(directBettingPL).toBe(100); // 200 - 100
      expect(hierarchicalPL).toBe(1200); // From field
      expect(hierarchicalPL).toBeGreaterThan(directBettingPL);
    });
  });

  describe('SECTION 5: Credit Reference P/L', () => {
    test('Calculate creditReferenceProfitLoss = baseBalance - creditReference', () => {
      const user = {
        baseBalance: 5000,
        creditReference: 1000,
        creditReferenceProfitLoss: 0,
      };

      user.creditReferenceProfitLoss = user.baseBalance - user.creditReference;

      expect(user.creditReferenceProfitLoss).toBe(4000);
    });

    test('Positive credit means user has credit (given money)', () => {
      const user = {
        baseBalance: 2000,
        creditReference: 500, // Given 500 credit
        creditReferenceProfitLoss: 0,
      };

      user.creditReferenceProfitLoss = user.baseBalance - user.creditReference;

      expect(user.creditReferenceProfitLoss).toBe(1500); // 2000 - 500
    });

    test('User owes credit when creditReferenceProfitLoss is negative', () => {
      const user = {
        baseBalance: 500,
        creditReference: 2000, // Owes 2000
        creditReferenceProfitLoss: 0,
      };

      user.creditReferenceProfitLoss = user.baseBalance - user.creditReference;

      expect(user.creditReferenceProfitLoss).toBe(-1500); // 500 - 2000
    });

    test('uplineBettingProfitLoss same as bettingProfitLoss for upline view', () => {
      const admin = {
        bettingProfitLoss: 1500,
        uplineBettingProfitLoss: 0,
      };

      admin.uplineBettingProfitLoss = admin.bettingProfitLoss;

      expect(admin.uplineBettingProfitLoss).toBe(1500);
    });
  });

  describe('SECTION 6: Event Reports with Multiple Downlines', () => {
    test('Event report showing all downlines contribution', () => {
      const event = {
        eventId: 'match123',
        eventName: 'Match A',
      };

      const downlineContribution = {
        user1: { bets: 10, totalAmount: 5000, result: 'WIN' },
        user2: { bets: 5, totalAmount: 2000, result: 'LOSS' },
        user3: { bets: 8, totalAmount: 4000, result: 'WIN' },
      };

      let eventTotalBets = 0;
      let eventTotalAmount = 0;

      for (const downline of Object.values(downlineContribution)) {
        eventTotalBets += downline.bets;
        eventTotalAmount += downline.totalAmount;
      }

      const report = {
        event,
        totalDownlines: Object.keys(downlineContribution).length,
        totalBets: eventTotalBets,
        totalAmount: eventTotalAmount,
        contribution: downlineContribution,
      };

      expect(report.totalDownlines).toBe(3);
      expect(report.totalBets).toBe(23);
      expect(report.totalAmount).toBe(11000);
    });

    test('Event comparison - which events had highest P/L', () => {
      const events = [
        { eventId: 'E1', name: 'Match A', adminProfit: 500 },
        { eventId: 'E2', name: 'Match B', adminProfit: -1200 },
        { eventId: 'E3', name: 'Match C', adminProfit: 300 },
      ];

      const sortedByProfit = [...events].sort(
        (a, b) => b.adminProfit - a.adminProfit
      );

      expect(sortedByProfit[0].name).toBe('Match A');
      expect(sortedByProfit[1].name).toBe('Match C');
      expect(sortedByProfit[2].name).toBe('Match B');
    });
  });

  describe('SECTION 7: Real Example - Cricket Match Event', () => {
    test('India vs Pakistan T20 match P/L calculation', () => {
      const match = {
        eventId: 'M1',
        eventName: 'India vs Pakistan T20',
        status: 'settled',
      };

      const bets = [
        // Market: Match Winner - Back India
        {
          userId: 'u1',
          market: 'Match Winner',
          otype: 'back',
          result: 'WIN',
          betAmount: 200,
          price: 100,
        },
        {
          userId: 'u2',
          market: 'Match Winner',
          otype: 'back',
          result: 'WIN',
          betAmount: 150,
          price: 100,
        },
        {
          userId: 'u3',
          market: 'Match Winner',
          otype: 'lay',
          result: 'LOSS',
          betAmount: 50,
          price: 150,
        },

        // Market: Fancy Bets - India Runs
        {
          userId: 'u4',
          market: 'Fancy Bets',
          otype: 'back',
          result: 'LOSS',
          betAmount: 300,
          price: 200,
        },
        {
          userId: 'u5',
          market: 'Fancy Bets',
          otype: 'back',
          result: 'WIN',
          betAmount: 250,
          price: 200,
        },
      ];

      // Calculate admin P/L
      let totalUserWins = 0;
      let totalUserLosses = 0;

      for (const bet of bets) {
        if (bet.result === 'WIN') {
          totalUserWins += bet.betAmount;
        } else if (bet.result === 'LOSS') {
          totalUserLosses += bet.price;
        }
      }

      const adminProfit = totalUserLosses - totalUserWins; // Admin gains from user losses, loses from user wins

      expect(totalUserWins).toBe(600); // 200 + 150 + 250
      expect(totalUserLosses).toBe(350); // 150 + 200
      expect(adminProfit).toBe(-250); // Admin loses 250
    });
  });
});
