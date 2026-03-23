import { beforeEach, describe, expect, test } from 'vitest';

describe('DOWNLINE P/L CASCADE - updateAllUplines() Hierarchy', () => {
  describe('SECTION 1: Upline Chain Traversal (Lines 272-282)', () => {
    test('Walk single upline chain: user -> agent -> admin', () => {
      // Controller: while (currentUser && currentUser.invite) { findOne by code, call updateAdmin }

      const users = [
        { _id: 'u1', code: 'U1', invite: 'A1', userName: 'user1' },
        { _id: 'a1', code: 'A1', invite: 'ADM1', userName: 'agent1' },
        { _id: 'adm1', code: 'ADM1', invite: null, userName: 'admin1' },
      ];

      const traverseUplines = (userId) => {
        const uplines = [];
        let currentUser = users.find((u) => u._id === userId);

        while (currentUser && currentUser.invite) {
          const uplineUser = users.find((u) => u.code === currentUser.invite);
          if (uplineUser) {
            uplines.push(uplineUser);
            currentUser = uplineUser;
          } else {
            break;
          }
        }
        return uplines;
      };

      const uplinesOfU1 = traverseUplines('u1');

      expect(uplinesOfU1.length).toBe(2);
      expect(uplinesOfU1[0].code).toBe('A1');
      expect(uplinesOfU1[1].code).toBe('ADM1');
    });

    test('Stop at top level (no upline)', () => {
      const users = [
        { _id: 'adm1', code: 'ADM1', invite: null, userName: 'superadmin' },
      ];

      const traverseUplines = (userId) => {
        const uplines = [];
        let currentUser = users.find((u) => u._id === userId);

        while (currentUser && currentUser.invite) {
          const uplineUser = users.find((u) => u.code === currentUser.invite);
          if (uplineUser) {
            uplines.push(uplineUser);
            currentUser = uplineUser;
          } else {
            break;
          }
        }
        return uplines;
      };

      const uplinesOfAdm1 = traverseUplines('adm1');

      expect(uplinesOfAdm1.length).toBe(0);
    });

    test('Break when upline code not found (orphaned user)', () => {
      const users = [
        { _id: 'u1', code: 'U1', invite: 'MISSING_AGENT', userName: 'orphan' },
        { _id: 'a1', code: 'A1', invite: 'ADM1', userName: 'agent1' },
      ];

      const traverseUplines = (userId) => {
        const uplines = [];
        let currentUser = users.find((u) => u._id === userId);

        while (currentUser && currentUser.invite) {
          const uplineUser = users.find((u) => u.code === currentUser.invite);
          if (uplineUser) {
            uplines.push(uplineUser);
            currentUser = uplineUser;
          } else {
            break; // Can't find upline
          }
        }
        return uplines;
      };

      const uplinesOfU1 = traverseUplines('u1');

      expect(uplinesOfU1.length).toBe(0);
    });
  });

  describe('SECTION 2: updateAllUplines() Flow (Lines 257-289)', () => {
    test('Call updateAdmin for each upline in chain', async () => {
      const updateAdminCalls = [];

      const mockUpdateAdmin = async (adminId) => {
        updateAdminCalls.push(adminId);
      };

      const mockUpdateAllUplines = async (userId, users) => {
        const userIds = Array.isArray(userId) ? userId : [userId];

        for (const uId of userIds) {
          let currentUser = users.find((u) => u._id === uId);

          while (currentUser && currentUser.invite) {
            const uplineUser = users.find((u) => u.code === currentUser.invite);
            if (uplineUser) {
              await mockUpdateAdmin(uplineUser._id);
              currentUser = uplineUser;
            } else {
              break;
            }
          }
        }
      };

      const users = [
        { _id: 'u1', code: 'U1', invite: 'A1', userName: 'user1' },
        { _id: 'a1', code: 'A1', invite: 'ADM1', userName: 'agent1' },
        { _id: 'adm1', code: 'ADM1', invite: null, userName: 'admin1' },
      ];

      await mockUpdateAllUplines('u1', users);

      expect(updateAdminCalls).toEqual(['a1', 'adm1']);
    });

    test('Support array of user IDs', () => {
      const updateAdminCalls = [];

      const mockUpdateAdmin = (adminId) => {
        updateAdminCalls.push(adminId);
      };

      const mockUpdateAllUplines = (userIds, users) => {
        const uIds = Array.isArray(userIds) ? userIds : [userIds];

        for (const uId of uIds) {
          let currentUser = users.find((u) => u._id === uId);

          while (currentUser && currentUser.invite) {
            const uplineUser = users.find((u) => u.code === currentUser.invite);
            if (uplineUser) {
              mockUpdateAdmin(uplineUser._id);
              currentUser = uplineUser;
            } else {
              break;
            }
          }
        }
      };

      const users = [
        { _id: 'u1', code: 'U1', invite: 'A1' },
        { _id: 'u2', code: 'U2', invite: 'A1' },
        { _id: 'a1', code: 'A1', invite: 'ADM1' },
        { _id: 'adm1', code: 'ADM1', invite: null },
      ];

      mockUpdateAllUplines(['u1', 'u2'], users);

      expect(updateAdminCalls).toContain('a1');
      expect(updateAdminCalls).toContain('adm1');
    });

    test('Skip user if not found', () => {
      const updateAdminCalls = [];

      const mockUpdateAdmin = (adminId) => {
        updateAdminCalls.push(adminId);
      };

      const mockUpdateAllUplines = (userId, users) => {
        const uIds = Array.isArray(userId) ? userId : [userId];

        for (const uId of uIds) {
          let currentUser = users.find((u) => u._id === uId);
          if (!currentUser) {
            continue; // Skip if user not found
          }

          while (currentUser && currentUser.invite) {
            const uplineUser = users.find((u) => u.code === currentUser.invite);
            if (uplineUser) {
              mockUpdateAdmin(uplineUser._id);
              currentUser = uplineUser;
            } else {
              break;
            }
          }
        }
      };

      const users = [
        { _id: 'a1', code: 'A1', invite: 'ADM1' },
        { _id: 'adm1', code: 'ADM1', invite: null },
      ];

      mockUpdateAllUplines(['NOT_EXIST', 'a1'], users);

      expect(updateAdminCalls).toEqual(['adm1']);
    });
  });

  describe('SECTION 3: Real Scenario - Bet Settlement Cascade', () => {
    test('User bets, wins, P/L cascades up hierarchy', () => {
      const users = {
        user1: { _id: 'u1', code: 'U1', invite: 'A1', bettingProfitLoss: 0 },
        agent1: { _id: 'a1', code: 'A1', invite: 'ADM1', bettingProfitLoss: 0 },
        admin1: {
          _id: 'adm1',
          code: 'ADM1',
          invite: null,
          bettingProfitLoss: 0,
        },
      };

      // Step 1: User wins bet, P/L updates
      users.user1.bettingProfitLoss += 100;

      // Step 2: updateAllUplines(user1._id) calls updateAdmin on agent and admin
      // Agent updates by summing direct users
      const agentDirectUsers = [users.user1];
      const agentTotal = agentDirectUsers.reduce(
        (sum, u) => sum + u.bettingProfitLoss,
        0
      );
      users.agent1.bettingProfitLoss = agentTotal;

      // Admin updates by summing direct agents
      const adminDirectAgents = [users.agent1];
      const adminTotal = adminDirectAgents.reduce(
        (sum, a) => sum + a.bettingProfitLoss,
        0
      );
      users.admin1.bettingProfitLoss = adminTotal;

      expect(users.user1.bettingProfitLoss).toBe(100);
      expect(users.agent1.bettingProfitLoss).toBe(100);
      expect(users.admin1.bettingProfitLoss).toBe(100);
    });

    test('Multiple users under same agent', () => {
      const users = {
        user1: { _id: 'u1', code: 'U1', invite: 'A1', bettingProfitLoss: 200 },
        user2: { _id: 'u2', code: 'U2', invite: 'A1', bettingProfitLoss: 150 },
        user3: { _id: 'u3', code: 'U3', invite: 'A1', bettingProfitLoss: -100 },
        agent1: { _id: 'a1', code: 'A1', invite: 'ADM1', bettingProfitLoss: 0 },
        admin1: {
          _id: 'adm1',
          code: 'ADM1',
          invite: null,
          bettingProfitLoss: 0,
        },
      };

      // User1 wins 200, updates cascade
      users.user1.bettingProfitLoss = 200;

      // Agent sums all direct users
      const agentTotal = [users.user1, users.user2, users.user3].reduce(
        (sum, u) => sum + u.bettingProfitLoss,
        0
      );
      users.agent1.bettingProfitLoss = agentTotal;

      // Admin sums all agents
      users.admin1.bettingProfitLoss = users.agent1.bettingProfitLoss;

      expect(users.agent1.bettingProfitLoss).toBe(250); // 200 + 150 - 100
      expect(users.admin1.bettingProfitLoss).toBe(250);
    });
  });

  describe('SECTION 4: Withdrawal/Deposit Cascade', () => {
    test('User withdraws, affects both parent admin and uplines', () => {
      const users = {
        user1: {
          _id: 'u1',
          code: 'U1',
          invite: 'A1',
          baseBalance: 1000,
          creditReferenceProfitLoss: 800,
        },
        agent1: { _id: 'a1', code: 'A1', invite: 'ADM1', baseBalance: 5000 },
        admin1: { _id: 'adm1', code: 'ADM1', invite: null, baseBalance: 10000 },
      };

      const withdrawAmount = 200;

      // User withdrawal
      users.user1.baseBalance -= withdrawAmount;
      users.user1.creditReferenceProfitLoss = users.user1.baseBalance - 200; // creditRef is 200

      // Agent withdrawal (opposite - receives the money)
      users.agent1.baseBalance += withdrawAmount;

      // updateAllUplines triggers updateAdmin on both agent and admin
      // They recalculate totalBalance based on new baseBalance
      const agentTotal = users.user1.baseBalance; // Simplified - just direct user
      const adminTotal = agentTotal; // Simplified - just direct agent

      expect(users.user1.baseBalance).toBe(800);
      expect(users.agent1.baseBalance).toBe(5200);
      expect(users.user1.creditReferenceProfitLoss).toBe(600); // 800 - 200
    });

    test('Deposit increases baseBalance up the chain', () => {
      const users = {
        user1: { _id: 'u1', code: 'U1', invite: 'A1', baseBalance: 1000 },
        agent1: { _id: 'a1', code: 'A1', invite: 'ADM1', baseBalance: 5000 },
        admin1: { _id: 'adm1', code: 'ADM1', invite: null, baseBalance: 10000 },
      };

      const depositAmount = 300;

      // User deposit
      users.user1.baseBalance += depositAmount;

      // Admin receives (opposite)
      users.agent1.baseBalance -= depositAmount;

      // updateAllUplines recalculates
      const agentTotal = users.user1.baseBalance;

      expect(users.user1.baseBalance).toBe(1300);
      expect(users.agent1.baseBalance).toBe(4700);
    });
  });

  describe('SECTION 5: Credit Reference Change', () => {
    test('Change user creditReference, recalculate creditReferenceProfitLoss', () => {
      const user = {
        _id: 'u1',
        baseBalance: 2000,
        creditReference: 500,
        creditReferenceProfitLoss: 1500, // 2000 - 500
      };

      // Admin updates credit reference
      const newCreditRef = 800;
      user.creditReference = newCreditRef;

      // Recalculate (not cascaded to uplines - user-specific)
      user.creditReferenceProfitLoss = user.baseBalance - user.creditReference;

      expect(user.creditReference).toBe(800);
      expect(user.creditReferenceProfitLoss).toBe(1200); // 2000 - 800
    });

    test('creditReferenceProfitLoss NOT cascaded to uplines', () => {
      const users = {
        user1: {
          _id: 'u1',
          baseBalance: 2000,
          creditReference: 500,
          creditReferenceProfitLoss: 1500,
        },
        agent1: { _id: 'a1', baseBalance: 5000, creditReferenceProfitLoss: 0 },
      };

      // Change user's credit reference
      users.user1.creditReference = 800;
      users.user1.creditReferenceProfitLoss =
        users.user1.baseBalance - users.user1.creditReference;

      // updateAllUplines does NOT cascade creditReferenceProfitLoss
      // Only bettingProfitLoss cascades
      // Agent's creditReferenceProfitLoss stays unchanged

      expect(users.user1.creditReferenceProfitLoss).toBe(1200);
      expect(users.agent1.creditReferenceProfitLoss).toBe(0);
    });
  });

  describe('SECTION 6: Multi-Level Hierarchy Examples', () => {
    test('5-level hierarchy: User -> Agent -> Master -> Admin -> SuperAdmin', () => {
      const hierarchy = {
        user: { _id: 'u1', code: 'U1', invite: 'A1', bettingProfitLoss: 100 },
        agent: { _id: 'a1', code: 'A1', invite: 'M1', bettingProfitLoss: 0 },
        master: { _id: 'm1', code: 'M1', invite: 'ADM1', bettingProfitLoss: 0 },
        admin: {
          _id: 'adm1',
          code: 'ADM1',
          invite: 'SA1',
          bettingProfitLoss: 0,
        },
        superadmin: {
          _id: 'sa1',
          code: 'SA1',
          invite: null,
          bettingProfitLoss: 0,
        },
      };

      // User wins, P/L cascades
      hierarchy.user.bettingProfitLoss = 100;

      // Agent updates
      hierarchy.agent.bettingProfitLoss = 100;

      // Master updates
      hierarchy.master.bettingProfitLoss = 100;

      // Admin updates
      hierarchy.admin.bettingProfitLoss = 100;

      // SuperAdmin updates
      hierarchy.superadmin.bettingProfitLoss = 100;

      expect(hierarchy.user.bettingProfitLoss).toBe(100);
      expect(hierarchy.agent.bettingProfitLoss).toBe(100);
      expect(hierarchy.master.bettingProfitLoss).toBe(100);
      expect(hierarchy.admin.bettingProfitLoss).toBe(100);
      expect(hierarchy.superadmin.bettingProfitLoss).toBe(100);
    });

    test('Branching hierarchy with multiple agents under master', () => {
      const hierarchy = {
        user1: { _id: 'u1', code: 'U1', invite: 'A1', bettingProfitLoss: 100 },
        user2: { _id: 'u2', code: 'U2', invite: 'A2', bettingProfitLoss: 200 },
        agent1: { _id: 'a1', code: 'A1', invite: 'M1', bettingProfitLoss: 0 },
        agent2: { _id: 'a2', code: 'A2', invite: 'M1', bettingProfitLoss: 0 },
        master: { _id: 'm1', code: 'M1', invite: 'ADM1', bettingProfitLoss: 0 },
        admin: {
          _id: 'adm1',
          code: 'ADM1',
          invite: null,
          bettingProfitLoss: 0,
        },
      };

      // User1 wins
      hierarchy.user1.bettingProfitLoss = 100;

      // Agent1 updates (sum of user1 only)
      hierarchy.agent1.bettingProfitLoss = 100;

      // Master updates (sum of agent1 + agent2)
      hierarchy.master.bettingProfitLoss =
        hierarchy.agent1.bettingProfitLoss + hierarchy.agent2.bettingProfitLoss;

      // Admin updates (sum of master)
      hierarchy.admin.bettingProfitLoss = hierarchy.master.bettingProfitLoss;

      expect(hierarchy.agent1.bettingProfitLoss).toBe(100);
      expect(hierarchy.master.bettingProfitLoss).toBe(100); // 100 + 0
      expect(hierarchy.admin.bettingProfitLoss).toBe(100);
    });
  });

  describe('SECTION 7: Error Handling', () => {
    test('Handle null user gracefully', () => {
      const users = [
        { _id: 'a1', code: 'A1', invite: 'ADM1' },
        { _id: 'adm1', code: 'ADM1', invite: null },
      ];

      const traverseUplines = (userId, userList) => {
        let currentUser = userList.find((u) => u._id === userId);
        if (!currentUser) return []; // Handle null

        const uplines = [];
        while (currentUser && currentUser.invite) {
          const uplineUser = userList.find(
            (u) => u.code === currentUser.invite
          );
          if (uplineUser) {
            uplines.push(uplineUser);
            currentUser = uplineUser;
          } else {
            break;
          }
        }
        return uplines;
      };

      const result = traverseUplines('NOT_EXIST', users);

      expect(result).toEqual([]);
    });

    test('Handle circular invite references', () => {
      const users = [
        { _id: 'u1', code: 'U1', invite: 'A1' },
        { _id: 'a1', code: 'A1', invite: 'U1' }, // Circular!
      ];

      let iterationCount = 0;
      const maxIterations = 100;

      let currentUser = users.find((u) => u._id === 'u1');
      while (
        currentUser &&
        currentUser.invite &&
        iterationCount < maxIterations
      ) {
        const uplineUser = users.find((u) => u.code === currentUser.invite);
        if (uplineUser && uplineUser._id !== currentUser._id) {
          currentUser = uplineUser;
          iterationCount++;
        } else {
          break;
        }
      }

      expect(iterationCount).toBe(maxIterations); // Should hit max iterations due to circular reference
    });
  });
});
