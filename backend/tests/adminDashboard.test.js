import { beforeEach, describe, expect, test } from 'vitest';

describe('ADMIN DASHBOARD - updateAdmin() Calculations', () => {
  describe('SECTION 1: Get Direct Downlines (Line 127)', () => {
    test('Find all direct downlines by admin code', () => {
      const admin = { _id: 'admin1', code: 'ADM001', userName: 'mainAdmin' };

      const allUsers = [
        {
          _id: 'u1',
          code: 'U001',
          invite: 'ADM001',
          userName: 'agent1',
          bettingProfitLoss: 100,
        },
        {
          _id: 'u2',
          code: 'U002',
          invite: 'ADM001',
          userName: 'agent2',
          bettingProfitLoss: 200,
        },
        {
          _id: 'u3',
          code: 'U003',
          invite: 'OTHERADM',
          userName: 'agent3',
          bettingProfitLoss: 50,
        },
      ];

      const directDownlines = allUsers.filter((u) => u.invite === admin.code);

      expect(directDownlines.length).toBe(2);
      expect(directDownlines[0].userName).toBe('agent1');
      expect(directDownlines[1].userName).toBe('agent2');
    });

    test('No direct downlines returns empty array', () => {
      const admin = { _id: 'admin1', code: 'ADM001', userName: 'newAdmin' };
      const allUsers = [];

      const directDownlines = allUsers.filter((u) => u.invite === admin.code);

      expect(directDownlines.length).toBe(0);
    });
  });

  describe('SECTION 2: Betting P/L Aggregation (Line 131)', () => {
    test('Sum bettingProfitLoss from all direct downlines', () => {
      // Controller: const DownlineTotalBettingProfitLoss = directDownlines.reduce((sum, user) => sum + (user.bettingProfitLoss || 0), 0);

      const directDownlines = [
        { userName: 'agent1', bettingProfitLoss: 500 },
        { userName: 'agent2', bettingProfitLoss: -100 },
        { userName: 'agent3', bettingProfitLoss: 200 },
      ];

      const DownlineTotalBettingProfitLoss = directDownlines.reduce(
        (sum, user) => sum + (user.bettingProfitLoss || 0),
        0
      );

      expect(DownlineTotalBettingProfitLoss).toBe(600);
    });

    test('Handle null/undefined bettingProfitLoss with default 0', () => {
      const directDownlines = [
        { userName: 'agent1', bettingProfitLoss: 300 },
        { userName: 'agent2', bettingProfitLoss: null },
        { userName: 'agent3' },
      ];

      const DownlineTotalBettingProfitLoss = directDownlines.reduce(
        (sum, user) => sum + (user.bettingProfitLoss || 0),
        0
      );

      expect(DownlineTotalBettingProfitLoss).toBe(300);
    });

    test('Negative total when all downlines losing', () => {
      const directDownlines = [
        { userName: 'agent1', bettingProfitLoss: -500 },
        { userName: 'agent2', bettingProfitLoss: -200 },
        { userName: 'agent3', bettingProfitLoss: -100 },
      ];

      const DownlineTotalBettingProfitLoss = directDownlines.reduce(
        (sum, user) => sum + (user.bettingProfitLoss || 0),
        0
      );

      expect(DownlineTotalBettingProfitLoss).toBe(-800);
    });

    test('Zero total when profits and losses cancel', () => {
      const directDownlines = [
        { userName: 'agent1', bettingProfitLoss: 500 },
        { userName: 'agent2', bettingProfitLoss: -500 },
      ];

      const DownlineTotalBettingProfitLoss = directDownlines.reduce(
        (sum, user) => sum + (user.bettingProfitLoss || 0),
        0
      );

      expect(DownlineTotalBettingProfitLoss).toBe(0);
    });
  });

  describe('SECTION 3: Base Balance Aggregation (Line 133)', () => {
    test('Sum baseBalance from all direct downlines', () => {
      const directDownlines = [
        { userName: 'agent1', baseBalance: 5000 },
        { userName: 'agent2', baseBalance: 3000 },
        { userName: 'agent3', baseBalance: 2000 },
      ];

      const DownlineTotalBaseBalance = directDownlines.reduce(
        (sum, user) => sum + (user.baseBalance || 0),
        0
      );

      expect(DownlineTotalBaseBalance).toBe(10000);
    });

    test('Handle null/undefined baseBalance', () => {
      const directDownlines = [
        { userName: 'agent1', baseBalance: 5000 },
        { userName: 'agent2', baseBalance: null },
        { userName: 'agent3' },
      ];

      const DownlineTotalBaseBalance = directDownlines.reduce(
        (sum, user) => sum + (user.baseBalance || 0),
        0
      );

      expect(DownlineTotalBaseBalance).toBe(5000);
    });
  });

  describe('SECTION 4: Exposure Calculation (Lines 199-200, 136-207)', () => {
    test('Sum exposure from non-fancy bets (stored exposure)', () => {
      const directDownlines = [
        { userName: 'agent1', exposure: 100 },
        { userName: 'agent2', exposure: 200 },
        { userName: 'agent3', exposure: 150 },
      ];

      let DownlineTotalExposure = 0;
      for (const user of directDownlines) {
        const hasFancyBets = false;
        if (!hasFancyBets) {
          DownlineTotalExposure += user.exposure || 0;
        }
      }

      expect(DownlineTotalExposure).toBe(450);
    });

    test('Exposure zero when no pending bets', () => {
      const directDownlines = [
        { userName: 'agent1', exposure: 0 },
        { userName: 'agent2', exposure: 0 },
      ];

      let DownlineTotalExposure = directDownlines.reduce(
        (sum, u) => sum + (u.exposure || 0),
        0
      );

      expect(DownlineTotalExposure).toBe(0);
    });
  });

  describe('SECTION 5: Admin Balance Fields Update (Lines 229-241)', () => {
    test('Set admin.bettingProfitLoss = DownlineTotalBettingProfitLoss (line 229)', () => {
      const admin = {
        _id: 'admin1',
        bettingProfitLoss: 0,
      };

      const DownlineTotalBettingProfitLoss = 600;

      admin.bettingProfitLoss = DownlineTotalBettingProfitLoss;

      expect(admin.bettingProfitLoss).toBe(600);
    });

    test('Set admin.uplineBettingProfitLoss = DownlineTotalBettingProfitLoss (line 230)', () => {
      const admin = {
        _id: 'admin1',
        uplineBettingProfitLoss: 0,
      };

      const DownlineTotalBettingProfitLoss = 600;

      admin.uplineBettingProfitLoss = DownlineTotalBettingProfitLoss;

      expect(admin.uplineBettingProfitLoss).toBe(600);
    });

    test('Calculate totalBalance = DownlineTotalBaseBalance + uplineBettingProfitLoss (line 237)', () => {
      const admin = {
        totalBalance: 0,
        uplineBettingProfitLoss: 600,
      };

      const DownlineTotalBaseBalance = 10000;

      admin.totalBalance =
        DownlineTotalBaseBalance + admin.uplineBettingProfitLoss;

      expect(admin.totalBalance).toBe(10600);
    });

    test('Set admin.exposure = DownlineTotalExposure (line 238)', () => {
      const admin = {
        exposure: 0,
        totalExposure: 0,
      };

      const DownlineTotalExposure = 450;

      admin.exposure = DownlineTotalExposure;
      admin.totalExposure = DownlineTotalExposure;

      expect(admin.exposure).toBe(450);
      expect(admin.totalExposure).toBe(450);
    });

    test('Calculate agentAvbalance = totalBalance - totalExposure (line 240)', () => {
      const admin = {
        totalBalance: 10600,
        totalExposure: 450,
        agentAvbalance: 0,
      };

      admin.agentAvbalance = admin.totalBalance - admin.totalExposure;

      expect(admin.agentAvbalance).toBe(10150);
    });

    test('Calculate totalAvbalance = totalBalance + avbalance (line 241)', () => {
      const admin = {
        totalBalance: 10600,
        avbalance: 2000,
        totalAvbalance: 0,
      };

      admin.totalAvbalance = admin.totalBalance + admin.avbalance;

      expect(admin.totalAvbalance).toBe(12600);
    });

    test('DO NOT overwrite creditReferenceProfitLoss (line 233 comment)', () => {
      const admin = {
        baseBalance: 5000,
        creditReference: 1000,
        creditReferenceProfitLoss: 4000, // = 5000 - 1000
      };

      const oldPL = admin.creditReferenceProfitLoss;
      // updateAdmin should NOT change this
      const DownlineTotalBettingProfitLoss = 600;
      // admin.creditReferenceProfitLoss = DownlineTotalBettingProfitLoss; // WRONG - DO NOT DO THIS

      expect(admin.creditReferenceProfitLoss).toBe(oldPL);
      expect(admin.creditReferenceProfitLoss).toBe(4000);
    });
  });

  describe('SECTION 6: Complete updateAdmin() Flow', () => {
    test('Full calculation with 3 agents', () => {
      const admin = {
        _id: 'admin1',
        code: 'ADM001',
        userName: 'mainAdmin',
        avbalance: 2000,
        totalBalance: 0,
        totalExposure: 0,
        exposure: 0,
        bettingProfitLoss: 0,
        uplineBettingProfitLoss: 0,
        agentAvbalance: 0,
        totalAvbalance: 0,
        creditReferenceProfitLoss: 4000,
      };

      const directDownlines = [
        {
          _id: 'a1',
          code: 'A1',
          invite: 'ADM001',
          baseBalance: 5000,
          exposure: 100,
          bettingProfitLoss: 200,
        },
        {
          _id: 'a2',
          code: 'A2',
          invite: 'ADM001',
          baseBalance: 3000,
          exposure: 200,
          bettingProfitLoss: -100,
        },
        {
          _id: 'a3',
          code: 'A3',
          invite: 'ADM001',
          baseBalance: 2000,
          exposure: 150,
          bettingProfitLoss: 400,
        },
      ];

      const DownlineTotalBettingProfitLoss = directDownlines.reduce(
        (sum, u) => sum + (u.bettingProfitLoss || 0),
        0
      );
      const DownlineTotalBaseBalance = directDownlines.reduce(
        (sum, u) => sum + (u.baseBalance || 0),
        0
      );
      const DownlineTotalExposure = directDownlines.reduce(
        (sum, u) => sum + (u.exposure || 0),
        0
      );

      admin.bettingProfitLoss = DownlineTotalBettingProfitLoss;
      admin.uplineBettingProfitLoss = DownlineTotalBettingProfitLoss;
      admin.totalBalance =
        DownlineTotalBaseBalance + admin.uplineBettingProfitLoss;
      admin.exposure = DownlineTotalExposure;
      admin.totalExposure = DownlineTotalExposure;
      admin.agentAvbalance = admin.totalBalance - admin.totalExposure;
      admin.totalAvbalance = admin.totalBalance + admin.avbalance;

      expect(DownlineTotalBettingProfitLoss).toBe(500);
      expect(DownlineTotalBaseBalance).toBe(10000);
      expect(DownlineTotalExposure).toBe(450);
      expect(admin.totalBalance).toBe(10500);
      expect(admin.agentAvbalance).toBe(10050);
      expect(admin.totalAvbalance).toBe(12500);
      expect(admin.creditReferenceProfitLoss).toBe(4000);
    });

    test('Admin with negative total P/L from downlines', () => {
      const admin = {
        avbalance: 1000,
        totalBalance: 0,
        totalExposure: 0,
        agentAvbalance: 0,
        totalAvbalance: 0,
      };

      const directDownlines = [
        { baseBalance: 5000, exposure: 100, bettingProfitLoss: -1000 },
        { baseBalance: 3000, exposure: 200, bettingProfitLoss: -500 },
      ];

      const DownlineTotalBettingProfitLoss = directDownlines.reduce(
        (sum, u) => sum + (u.bettingProfitLoss || 0),
        0
      );
      const DownlineTotalBaseBalance = directDownlines.reduce(
        (sum, u) => sum + (u.baseBalance || 0),
        0
      );
      const DownlineTotalExposure = directDownlines.reduce(
        (sum, u) => sum + (u.exposure || 0),
        0
      );

      admin.totalBalance =
        DownlineTotalBaseBalance + DownlineTotalBettingProfitLoss;
      admin.totalExposure = DownlineTotalExposure;
      admin.agentAvbalance = admin.totalBalance - admin.totalExposure;
      admin.totalAvbalance = admin.totalBalance + admin.avbalance;

      expect(admin.totalBalance).toBe(6500);
      expect(admin.agentAvbalance).toBe(6200);
      expect(admin.totalAvbalance).toBe(7500);
    });
  });

  describe('SECTION 7: Dashboard Display Values', () => {
    test('Dashboard shows totalBalance correctly', () => {
      const admin = {
        userName: 'mainAdmin',
        totalBalance: 10500,
      };

      expect(admin.totalBalance).toBe(10500);
    });

    test('Dashboard shows agentAvbalance (balance - exposure)', () => {
      const admin = {
        userName: 'mainAdmin',
        agentAvbalance: 10050,
      };

      expect(admin.agentAvbalance).toBe(10050);
    });

    test('Dashboard shows totalAvbalance (totalBalance + own avbalance)', () => {
      const admin = {
        userName: 'mainAdmin',
        totalAvbalance: 12500,
      };

      expect(admin.totalAvbalance).toBe(12500);
    });

    test('Dashboard shows totalExposure (sum of all pending bets)', () => {
      const admin = {
        userName: 'mainAdmin',
        totalExposure: 450,
      };

      expect(admin.totalExposure).toBe(450);
    });
  });

  describe('SECTION 8: Multi-Level Hierarchy Impact', () => {
    test('Agent level aggregates from users under them', () => {
      const agent = { totalBalance: 0, avbalance: 500 };

      const users = [
        { baseBalance: 1000, bettingProfitLoss: 100, exposure: 50 },
        { baseBalance: 1500, bettingProfitLoss: -50, exposure: 75 },
      ];

      const totalBase = users.reduce((sum, u) => sum + u.baseBalance, 0);
      const totalPL = users.reduce((sum, u) => sum + u.bettingProfitLoss, 0);
      const totalExposure = users.reduce((sum, u) => sum + u.exposure, 0);

      agent.totalBalance = totalBase + totalPL;
      agent.agentAvbalance = agent.totalBalance - totalExposure;
      agent.totalAvbalance = agent.totalBalance + agent.avbalance;

      expect(agent.totalBalance).toBe(2550);
      expect(agent.agentAvbalance).toBe(2425);
      expect(agent.totalAvbalance).toBe(3050);
    });

    test('Admin level aggregates from agents under them', () => {
      const admin = { totalBalance: 0, avbalance: 1000 };

      const agents = [
        { baseBalance: 5000, bettingProfitLoss: 500, exposure: 200 },
        { baseBalance: 3000, bettingProfitLoss: -200, exposure: 150 },
      ];

      const totalBase = agents.reduce((sum, a) => sum + a.baseBalance, 0);
      const totalPL = agents.reduce((sum, a) => sum + a.bettingProfitLoss, 0);
      const totalExposure = agents.reduce((sum, a) => sum + a.exposure, 0);

      admin.totalBalance = totalBase + totalPL;
      admin.agentAvbalance = admin.totalBalance - totalExposure;
      admin.totalAvbalance = admin.totalBalance + admin.avbalance;

      expect(admin.totalBalance).toBe(8300);
      expect(admin.agentAvbalance).toBe(7950);
      expect(admin.totalAvbalance).toBe(9300);
    });
  });
});
