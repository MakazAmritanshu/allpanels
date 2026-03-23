/**
 * Mock Data Factory for End-to-End Testing
 *
 * This file provides comprehensive mock data generators for all models
 * to enable realistic end-to-end testing scenarios.
 */

// Simple generator functions (no external dependencies)
const generateId = () => Math.random().toString(36).substring(7);
const generateCode = () =>
  Math.random().toString(36).substring(2, 10).toUpperCase();
const generatePhone = () => Math.floor(1000000000 + Math.random() * 9000000000);

/**
 * ========================================
 * SubAdmin/User Mock Data Generators
 * ========================================
 */

export const mockSubAdmin = (overrides = {}) => {
  const roles = [
    'supperadmin',
    'admin',
    'white',
    'super',
    'master',
    'agent',
    'user',
  ];
  const defaultBalance =
    overrides.role === 'user'
      ? Math.floor(Math.random() * 10000)
      : Math.floor(Math.random() * 100000);
  const baseBalance = overrides.baseBalance || defaultBalance;
  const creditReference =
    overrides.creditReference || Math.floor(baseBalance * 0.5);

  return {
    _id: overrides._id || generateId(),
    name: overrides.name || `Test User ${Math.floor(Math.random() * 1000)}`,
    userName: overrides.userName || `user_${generateId()}`,
    account: overrides.account || 'user',
    code: overrides.code || generateCode(),
    commition: overrides.commition || '5',
    balance: overrides.balance !== undefined ? overrides.balance : baseBalance,
    baseBalance: baseBalance,
    totalBalance: overrides.totalBalance || 0,
    profitLoss: overrides.profitLoss || 0,
    bettingProfitLoss: overrides.bettingProfitLoss || 0,
    creditReferenceProfitLoss:
      overrides.creditReferenceProfitLoss || baseBalance - creditReference,
    uplineProfitLoss: overrides.uplineProfitLoss || 0,
    uplineBettingProfitLoss: overrides.uplineBettingProfitLoss || 0,
    avbalance:
      overrides.avbalance !== undefined ? overrides.avbalance : baseBalance,
    agentAvbalance: overrides.agentAvbalance || 0,
    totalAvbalance: overrides.totalAvbalance || baseBalance,
    exposure: overrides.exposure || 0,
    totalExposure: overrides.totalExposure || 0,
    exposureLimit: overrides.exposureLimit || 50000,
    creditReference: creditReference,
    rollingCommission: overrides.rollingCommission || 0,
    phone: overrides.phone || generatePhone(),
    isPasswordChanged: overrides.isPasswordChanged || false,
    password: overrides.password || '$2a$10$hashedPasswordExample',
    secret: overrides.secret !== undefined ? overrides.secret : 1,
    partnership: overrides.partnership || 50,
    invite: overrides.invite || null,
    masterPassword: overrides.masterPassword || '$2a$10$hashedMasterPassword',
    status: overrides.status || 'active',
    role: overrides.role || 'user',
    gamelock: overrides.gamelock || [
      { game: 'cricket', lock: false },
      { game: 'tennis', lock: false },
      { game: 'soccer', lock: false },
      { game: 'Casino', lock: false },
      { game: 'Greyhound Racing', lock: true },
      { game: 'Horse Racing', lock: true },
      { game: 'Basketball', lock: false },
      { game: 'Lottery', lock: true },
    ],
    sessionToken: overrides.sessionToken || null,
    lastLogin: overrides.lastLogin || null,
    lastDevice: overrides.lastDevice || null,
    lastIP: overrides.lastIP || null,
    createdAt: overrides.createdAt || new Date(),
    updatedAt: overrides.updatedAt || new Date(),
    // Mock methods
    save: async function () {
      return this;
    },
    toObject: function () {
      return { ...this };
    },
    comparePassword: async function (password) {
      return password === 'password123';
    },
  };
};

export const mockSubAdminHierarchy = () => {
  const supperadmin = mockSubAdmin({
    role: 'supperadmin',
    code: 'SUPER001',
    userName: 'superadmin',
    balance: 1000000,
    avbalance: 900000,
    invite: null,
  });

  const admin = mockSubAdmin({
    role: 'admin',
    code: 'ADMIN001',
    userName: 'admin1',
    balance: 500000,
    avbalance: 450000,
    invite: supperadmin.code,
  });

  const master = mockSubAdmin({
    role: 'master',
    code: 'MASTER001',
    userName: 'master1',
    balance: 200000,
    avbalance: 180000,
    invite: admin.code,
  });

  const agent = mockSubAdmin({
    role: 'agent',
    code: 'AGENT001',
    userName: 'agent1',
    balance: 100000,
    avbalance: 90000,
    invite: master.code,
  });

  const user1 = mockSubAdmin({
    role: 'user',
    code: 'USER001',
    userName: 'user1',
    balance: 10000,
    avbalance: 9000,
    invite: agent.code,
  });

  const user2 = mockSubAdmin({
    role: 'user',
    code: 'USER002',
    userName: 'user2',
    balance: 5000,
    avbalance: 4500,
    invite: agent.code,
  });

  return {
    supperadmin,
    admin,
    master,
    agent,
    user1,
    user2,
    allUsers: [supperadmin, admin, master, agent, user1, user2],
  };
};

/**
 * ========================================
 * Bet Mock Data Generators
 * ========================================
 */

export const mockSportsBet = (overrides = {}) => {
  const price = overrides.price || Math.floor(Math.random() * 900 + 100); // 100-1000
  const xValue = overrides.xValue || (Math.random() * 4 + 1).toFixed(2); // 1.0-5.0
  const otype = overrides.otype || (Math.random() > 0.5 ? 'back' : 'lay');

  // Calculate betAmount based on otype
  const betAmount = otype === 'lay' ? price : price * (parseFloat(xValue) - 1);

  // Calculate risk amount (what's deducted)
  const riskAmount = otype === 'lay' ? price * (parseFloat(xValue) - 1) : price;

  const gameTypes = [
    'MATCH_ODDS',
    'TIE_MATCH',
    'WINNER',
    'OVER_UNDER_05',
    'OVER_UNDER_15',
    'OVER_UNDER_25',
    'BOOKMAKER',
    'BOOKMAKER IPL CUP',
    'TOSS',
    '1ST 6 OVER',
  ];

  const gameNames = ['Cricket', 'Tennis', 'Soccer', 'Basketball'];
  const eventNames = [
    'India vs Australia',
    'Team A vs Team B',
    'Match 1',
    'Final',
  ];
  const marketNames = [
    'Match Winner',
    'Total Runs',
    'First Wicket',
    'Man of the Match',
  ];
  const teamNames = [
    'India',
    'Australia',
    'Team A',
    'Team B',
    'Team 1',
    'Team 2',
  ];

  return {
    _id: overrides._id || generateId(),
    userId: overrides.userId || generateId(),
    userName: overrides.userName || `user_${generateId()}`,
    invite: overrides.invite || 'ADMIN001',
    userRole: overrides.userRole || 'user',
    gameId: overrides.gameId || generateId(),
    sid: overrides.sid || generateId(),
    otype: otype,
    price: riskAmount, // This is what's deducted
    xValue: parseFloat(xValue),
    betAmount: betAmount,
    resultAmount: overrides.resultAmount || 0,
    status: overrides.status !== undefined ? overrides.status : 0, // 0=pending, 1=win, 2=loss
    eventName:
      overrides.eventName ||
      eventNames[Math.floor(Math.random() * eventNames.length)],
    marketName:
      overrides.marketName ||
      marketNames[Math.floor(Math.random() * marketNames.length)],
    gameType:
      overrides.gameType ||
      gameTypes[Math.floor(Math.random() * gameTypes.length)],
    gameName:
      overrides.gameName ||
      gameNames[Math.floor(Math.random() * gameNames.length)],
    teamName:
      overrides.teamName ||
      teamNames[Math.floor(Math.random() * teamNames.length)],
    betType: 'sports',
    fancyScore: overrides.fancyScore || '0',
    market_id: overrides.market_id || generateId(),
    betResult: overrides.betResult || null,
    date: overrides.date || new Date(),
    createdAt: overrides.createdAt || new Date(),
    updatedAt: overrides.updatedAt || new Date(),
    // Mock methods
    save: async function () {
      return this;
    },
    toObject: function () {
      return { ...this };
    },
  };
};

export const mockCasinoBet = (overrides = {}) => {
  const price = overrides.price || Math.floor(Math.random() * 900 + 100);
  const xValue = overrides.xValue || (Math.random() * 3 + 1.5).toFixed(2); // 1.5-4.5
  const otype = overrides.otype || (Math.random() > 0.5 ? 'back' : 'lay');

  // Casino bet calculation (same as sports for TeenPatti)
  const betAmount = otype === 'lay' ? price : price * (parseFloat(xValue) - 1);

  const riskAmount = otype === 'lay' ? price * (parseFloat(xValue) - 1) : price;

  const gameTypes = ['TeenPatti', 'Roulette', 'Lucky7', 'AndarBahar'];
  const eventNames = ['Round 1', 'Round 2', 'Game 1', 'Session 1'];
  const marketNames = ['Color', 'Number', 'Suite', 'Joker'];
  const teamNames = ['Red', 'Black', 'A', 'B', 'Team 1', 'Team 2'];

  return {
    ...mockSportsBet({
      ...overrides,
      betType: 'casino',
      gameType:
        overrides.gameType ||
        gameTypes[Math.floor(Math.random() * gameTypes.length)],
      gameName: overrides.gameName || 'Casino',
      eventName:
        overrides.eventName ||
        eventNames[Math.floor(Math.random() * eventNames.length)],
      marketName:
        overrides.marketName ||
        marketNames[Math.floor(Math.random() * marketNames.length)],
      teamName:
        overrides.teamName ||
        teamNames[Math.floor(Math.random() * teamNames.length)],
      price: riskAmount,
      betAmount: betAmount,
      xValue: parseFloat(xValue),
      cid: overrides.cid || Math.floor(Math.random() * 100),
      gid: overrides.gid || Math.floor(Math.random() * 100),
      tabno: overrides.tabno || Math.floor(Math.random() * 10),
      roundId: overrides.roundId || generateId(),
      market_id: overrides.market_id || `casino_${generateId()}`,
    }),
  };
};

export const mockFancyBet = (overrides = {}) => {
  const price = overrides.price || Math.floor(Math.random() * 900 + 100);
  const xValue = overrides.xValue || Math.floor(Math.random() * 50 + 10); // 10-60 (percentage)
  const otype = overrides.otype || (Math.random() > 0.5 ? 'back' : 'lay');
  const fancyScore =
    overrides.fancyScore || String(Math.floor(Math.random() * 100 + 1));

  // Fancy bet calculation
  const betAmount = otype === 'lay' ? price : (xValue * price) / 100;

  const riskAmount = otype === 'lay' ? (xValue * price) / 100 : price;

  return {
    ...mockSportsBet({
      ...overrides,
      betType: 'fancy',
      gameType: overrides.gameType || 'FANCY',
      gameName: overrides.gameName || 'Cricket',
      eventName: overrides.eventName || 'India vs Australia',
      marketName: overrides.marketName || 'Total Runs',
      teamName: overrides.teamName || 'India',
      price: riskAmount,
      betAmount: betAmount,
      xValue: xValue,
      fancyScore: fancyScore,
    }),
  };
};

/**
 * ========================================
 * Transaction History Mock Data
 * ========================================
 */

export const mockTransactionHistory = (overrides = {}) => {
  return {
    _id: overrides._id || generateId(),
    userId: overrides.userId || generateId(),
    userName: overrides.userName || `user_${generateId()}`,
    withdrawl: overrides.withdrawl || 0,
    deposite: overrides.deposite || 0,
    amount:
      overrides.amount ||
      Math.abs(overrides.deposite || overrides.withdrawl || 1000),
    remark: overrides.remark || 'Transaction',
    from: overrides.from || `admin_${generateId()}`,
    to: overrides.to || `user_${generateId()}`,
    invite: overrides.invite || 'ADMIN001',
    date: overrides.date || new Date(),
    createdAt: overrides.createdAt || new Date(),
    updatedAt: overrides.updatedAt || new Date(),
  };
};

/**
 * ========================================
 * Withdrawal/Deposit History Mock Data
 * ========================================
 */

export const mockWithdrawalHistory = (overrides = {}) => {
  return {
    _id: overrides._id || generateId(),
    userId: overrides.userId || generateId(),
    userName: overrides.userName || `user_${generateId()}`,
    amount: overrides.amount || Math.floor(Math.random() * 10000 + 100),
    status: overrides.status || 'pending', // pending, approved, rejected
    remark: overrides.remark || 'Withdrawal request',
    date: overrides.date || new Date(),
    createdAt: overrides.createdAt || new Date(),
    updatedAt: overrides.updatedAt || new Date(),
  };
};

export const mockDepositHistory = (overrides = {}) => {
  return {
    _id: overrides._id || generateId(),
    userId: overrides.userId || generateId(),
    userName: overrides.userName || `user_${generateId()}`,
    amount: overrides.amount || Math.floor(Math.random() * 10000 + 100),
    status: overrides.status || 'approved',
    remark: overrides.remark || 'Deposit',
    from: overrides.from || `admin_${generateId()}`,
    date: overrides.date || new Date(),
    createdAt: overrides.createdAt || new Date(),
    updatedAt: overrides.updatedAt || new Date(),
  };
};

/**
 * ========================================
 * End-to-End Test Scenarios
 * ========================================
 */

export const mockCompleteBettingScenario = () => {
  const hierarchy = mockSubAdminHierarchy();
  const user = hierarchy.user1;

  // Create first bet
  const firstBet = mockSportsBet({
    userId: user._id,
    userName: user.userName,
    invite: user.invite,
    otype: 'back',
    price: 100,
    xValue: 2.5,
    status: 0, // pending
  });

  // Create sequence of bets
  const bets = [
    // First bet: Sports back bet
    firstBet,
    // Second bet: Sports lay bet (offset)
    mockSportsBet({
      userId: user._id,
      userName: user.userName,
      invite: user.invite,
      teamName: firstBet.teamName || 'Team A',
      gameId: firstBet.gameId || generateId(),
      otype: 'lay',
      price: 50,
      xValue: 2.5,
      status: 0,
    }),
    // Third bet: Casino bet
    mockCasinoBet({
      userId: user._id,
      userName: user.userName,
      invite: user.invite,
      otype: 'back',
      price: 200,
      xValue: 3.0,
      status: 0,
    }),
    // Fourth bet: Fancy bet
    mockFancyBet({
      userId: user._id,
      userName: user.userName,
      invite: user.invite,
      otype: 'back',
      price: 150,
      xValue: 25, // 25%
      fancyScore: '50',
      status: 0,
    }),
  ];

  // Calculate updated user state after bets
  const totalExposure = bets.reduce((sum, bet) => sum + bet.price, 0);
  const updatedUser = {
    ...user,
    avbalance: user.avbalance - totalExposure,
    exposure: totalExposure,
    totalExposure: totalExposure,
  };

  return {
    user,
    updatedUser,
    bets,
    hierarchy,
  };
};

export const mockBetSettlementScenario = () => {
  const scenario = mockCompleteBettingScenario();

  // Settle bets with different outcomes
  const settledBets = scenario.bets.map((bet, index) => {
    let status, resultAmount;

    if (index === 0) {
      // First bet: WIN
      status = 1;
      resultAmount = bet.betAmount + bet.price;
    } else if (index === 1) {
      // Second bet: LOSS
      status = 2;
      resultAmount = bet.price;
    } else if (index === 2) {
      // Third bet: WIN
      status = 1;
      resultAmount = bet.betAmount + bet.price;
    } else {
      // Fourth bet: LOSS
      status = 2;
      resultAmount = bet.price;
    }

    return {
      ...bet,
      status,
      resultAmount,
    };
  });

  // Calculate final user state
  const totalWin = settledBets
    .filter((b) => b.status === 1)
    .reduce((sum, b) => sum + b.resultAmount, 0);

  const totalLoss = settledBets
    .filter((b) => b.status === 2)
    .reduce((sum, b) => sum + b.resultAmount, 0);

  const netProfit = totalWin - totalLoss;
  const finalUser = {
    ...scenario.updatedUser,
    balance: scenario.user.balance + netProfit,
    avbalance: scenario.user.avbalance + netProfit, // Exposure cleared
    exposure: 0,
    totalExposure: 0,
    bettingProfitLoss: netProfit,
  };

  return {
    ...scenario,
    settledBets,
    totalWin,
    totalLoss,
    netProfit,
    finalUser,
  };
};

export const mockDownlineReportScenario = () => {
  const hierarchy = mockSubAdminHierarchy();

  // Create bets for multiple downline users
  const downlineBets = [
    // User 1 bets
    mockSportsBet({
      userId: hierarchy.user1._id,
      userName: hierarchy.user1.userName,
      status: 1, // win
      resultAmount: 250,
    }),
    mockSportsBet({
      userId: hierarchy.user1._id,
      userName: hierarchy.user1.userName,
      status: 2, // loss
      resultAmount: 100,
    }),
    // User 2 bets
    mockCasinoBet({
      userId: hierarchy.user2._id,
      userName: hierarchy.user2.userName,
      status: 1, // win
      resultAmount: 500,
    }),
    mockFancyBet({
      userId: hierarchy.user2._id,
      userName: hierarchy.user2.userName,
      status: 1, // win
      resultAmount: 200,
    }),
  ];

  // Calculate admin totals
  const totalWin = downlineBets
    .filter((b) => b.status === 1)
    .reduce((sum, b) => sum + b.resultAmount, 0);

  const totalLoss = downlineBets
    .filter((b) => b.status === 2)
    .reduce((sum, b) => sum + b.resultAmount, 0);

  const adminProfit = totalWin - totalLoss;

  return {
    hierarchy,
    downlineBets,
    report: {
      totalWin,
      totalLoss,
      adminProfit,
      totalBets: downlineBets.length,
      byGame: {
        Cricket: {
          win: 250,
          loss: 100,
          profit: 150,
        },
        Casino: {
          win: 500,
          loss: 0,
          profit: 500,
        },
        Fancy: {
          win: 200,
          loss: 0,
          profit: 200,
        },
      },
    },
  };
};

/**
 * ========================================
 * Mock Result Generators
 * ========================================
 */

export const generateMockBetResults = (bets) => {
  return bets.map((bet) => {
    const isWin = Math.random() > 0.5;

    if (bet.betType === 'fancy') {
      // Fancy bet settlement logic
      const actualScore = Math.floor(Math.random() * 200);
      const fancyScore = parseInt(bet.fancyScore);

      let status, resultAmount;
      if (bet.otype === 'back') {
        status = actualScore >= fancyScore ? 1 : 2;
        resultAmount =
          status === 1 ? (bet.xValue * bet.price) / 100 : bet.price;
      } else {
        status = actualScore < fancyScore ? 1 : 2;
        resultAmount =
          status === 1 ? bet.price : (bet.xValue * bet.price) / 100;
      }

      return {
        ...bet,
        status,
        resultAmount,
        betResult: `${actualScore}`,
        actualScore,
      };
    } else {
      // Sports/Casino bet settlement
      let status, resultAmount;
      if (bet.otype === 'back') {
        status = isWin ? 1 : 2;
        resultAmount = isWin ? bet.betAmount + bet.price : bet.price;
      } else {
        status = isWin ? 1 : 2;
        resultAmount = isWin ? bet.price : bet.betAmount + bet.price;
      }

      return {
        ...bet,
        status,
        resultAmount,
        betResult: isWin ? 'win' : 'loss',
      };
    }
  });
};

/**
 * ========================================
 * Export All Mock Generators
 * ========================================
 */

export default {
  // User/Admin
  mockSubAdmin,
  mockSubAdminHierarchy,

  // Bets
  mockSportsBet,
  mockCasinoBet,
  mockFancyBet,

  // History
  mockTransactionHistory,
  mockWithdrawalHistory,
  mockDepositHistory,

  // Scenarios
  mockCompleteBettingScenario,
  mockBetSettlementScenario,
  mockDownlineReportScenario,

  // Results
  generateMockBetResults,
};
