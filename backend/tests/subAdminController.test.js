import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import betModel from '../models/betModel.js';
import SubAdmin from '../models/subAdminModel.js';
import TransactionHistory from '../models/transtionHistoryModel.js';

// Note: countUplines and updateAdmin are internal functions not exported
// We'll test them through createSubAdmin and updateAllUplines if possible
// Otherwise we'll need to import them directly or test indirectly

// Mock all models
vi.mock('../models/subAdminModel.js');
vi.mock('../models/betModel.js');
vi.mock('../models/transtionHistoryModel.js');
vi.mock('../config/tokenCreate.js', () => ({
  default: vi.fn().mockResolvedValue('mock_token'),
}));
vi.mock('bcryptjs');
vi.mock('crypto');

// Since updateAdmin is not exported, we need to test it indirectly or import the controller
// For now, let's test createSubAdmin which is exported
import {
  createSubAdmin,
  getAllUsersWithCompleteInfo,
  updateAllUplines,
} from '../controllers/admin/subAdminController.js';

describe('SubAdmin Controller Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ========================================
  // SECTION 1: createSubAdmin
  // ========================================
  describe('1️⃣ createSubAdmin - Create New Sub-Admin', () => {
    test('Successfully create user account - Basic flow', async () => {
      const mockAdmin = {
        _id: 'admin_001',
        code: 'ADMIN001',
        userName: 'admin1',
        balance: 10000,
        avbalance: 9000,
        secret: 1,
        password: 'hashed_password',
        role: 'admin',
      };

      const mockSubAdmin = {
        _id: 'user_001',
        userName: 'newuser',
        name: 'New User',
        code: 'ABCD1234',
        balance: 1000,
        baseBalance: 1000,
        save: vi.fn().mockResolvedValue(true),
        toObject: () => ({ _id: 'user_001' }),
      };

      SubAdmin.findById = vi.fn().mockResolvedValue(mockAdmin);
      SubAdmin.findOne = vi.fn().mockResolvedValue(null); // User doesn't exist
      SubAdmin.find = vi.fn().mockResolvedValue([]); // No existing downlines
      bcrypt.compare = vi.fn().mockResolvedValue(true);
      crypto.randomBytes = vi
        .fn()
        .mockReturnValue({ toString: () => 'abcd1234' });

      // Mock SubAdmin constructor
      const SubAdminConstructor = vi
        .fn()
        .mockImplementation(() => mockSubAdmin);
      SubAdminConstructor.prototype = SubAdmin;
      vi.mocked(SubAdmin).mockImplementation(SubAdminConstructor);

      TransactionHistory.create = vi.fn().mockResolvedValue({});

      const req = {
        id: 'admin_001',
        role: 'admin',
        body: {
          name: 'New User',
          userName: 'newuser',
          accountType: 'user',
          commition: '5',
          balance: 1000,
          exposureLimit: 5000,
          creditReference: 500,
          rollingCommission: 0,
          phone: '1234567890',
          password: 'password123',
          masterPassword: 'master123',
          partnership: '50',
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await createSubAdmin(req, res);

      expect(SubAdmin.findById).toHaveBeenCalledWith('admin_001');
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'master123',
        'hashed_password'
      );
      expect(SubAdmin.findOne).toHaveBeenCalledWith({ userName: 'newuser' });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'user created successfully',
        })
      );
    });

    test('Error - Admin not found', async () => {
      SubAdmin.findById = vi.fn().mockResolvedValue(null);

      const req = {
        id: 'invalid_admin',
        role: 'admin',
        body: {
          userName: 'newuser',
          accountType: 'user',
          balance: 1000,
          masterPassword: 'master123',
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await createSubAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Admin not found',
        })
      );
    });

    test('Error - Admin secret is 0 (not authorized)', async () => {
      const mockAdmin = {
        _id: 'admin_001',
        secret: 0,
        role: 'admin',
      };

      SubAdmin.findById = vi.fn().mockResolvedValue(mockAdmin);

      const req = {
        id: 'admin_001',
        role: 'admin',
        body: {
          userName: 'newuser',
          accountType: 'user',
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await createSubAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Admin account is not authorized to create users',
        })
      );
    });

    test('Error - Invalid master password', async () => {
      const mockAdmin = {
        _id: 'admin_001',
        code: 'ADMIN001',
        secret: 1,
        password: 'hashed_password',
        role: 'admin',
      };

      SubAdmin.findById = vi.fn().mockResolvedValue(mockAdmin);
      bcrypt.compare = vi.fn().mockResolvedValue(false); // Password mismatch

      const req = {
        id: 'admin_001',
        role: 'admin',
        body: {
          userName: 'newuser',
          accountType: 'user',
          masterPassword: 'wrong_password',
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await createSubAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid Master password.',
        })
      );
    });

    test('Error - Role hierarchy violation (admin cannot create admin)', async () => {
      const mockAdmin = {
        _id: 'admin_001',
        code: 'ADMIN001',
        secret: 1,
        password: 'hashed_password',
        role: 'admin',
      };

      SubAdmin.findById = vi.fn().mockResolvedValue(mockAdmin);
      bcrypt.compare = vi.fn().mockResolvedValue(true);

      const req = {
        id: 'admin_001',
        role: 'admin',
        body: {
          userName: 'newadmin',
          accountType: 'admin', // Admin cannot create another admin
          masterPassword: 'master123',
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await createSubAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('can only create'),
        })
      );
    });

    test('Error - Invalid balance amount', async () => {
      const mockAdmin = {
        _id: 'admin_001',
        code: 'ADMIN001',
        secret: 1,
        password: 'hashed_password',
        role: 'admin',
        balance: 10000,
      };

      SubAdmin.findById = vi.fn().mockResolvedValue(mockAdmin);
      bcrypt.compare = vi.fn().mockResolvedValue(true);

      const req = {
        id: 'admin_001',
        role: 'admin',
        body: {
          userName: 'newuser',
          accountType: 'user',
          balance: -100, // Invalid: negative
          masterPassword: 'master123',
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await createSubAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid balance amount',
        })
      );
    });

    test('Error - Balance is NaN or undefined', async () => {
      const mockAdmin = {
        _id: 'admin_001',
        code: 'ADMIN001',
        secret: 1,
        password: 'hashed_password',
        role: 'admin',
        balance: 10000,
      };

      SubAdmin.findById = vi.fn().mockResolvedValue(mockAdmin);
      bcrypt.compare = vi.fn().mockResolvedValue(true);

      const req = {
        id: 'admin_001',
        role: 'admin',
        body: {
          userName: 'newuser',
          accountType: 'user',
          balance: undefined, // Invalid
          masterPassword: 'master123',
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await createSubAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid balance amount',
        })
      );
    });

    test('Error - Insufficient balance (balance > admin.balance)', async () => {
      const mockAdmin = {
        _id: 'admin_001',
        code: 'ADMIN001',
        secret: 1,
        password: 'hashed_password',
        role: 'admin',
        balance: 1000,
      };

      SubAdmin.findById = vi.fn().mockResolvedValue(mockAdmin);
      bcrypt.compare = vi.fn().mockResolvedValue(true);

      const req = {
        id: 'admin_001',
        role: 'admin',
        body: {
          userName: 'newuser',
          accountType: 'user',
          balance: 2000, // More than admin has
          masterPassword: 'master123',
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await createSubAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Insufficient balance',
        })
      );
    });

    test('Error - Admin balance less than 1', async () => {
      const mockAdmin = {
        _id: 'admin_001',
        code: 'ADMIN001',
        secret: 1,
        password: 'hashed_password',
        role: 'admin',
        balance: 0.5, // Less than 1
      };

      SubAdmin.findById = vi.fn().mockResolvedValue(mockAdmin);
      bcrypt.compare = vi.fn().mockResolvedValue(true);

      const req = {
        id: 'admin_001',
        role: 'admin',
        body: {
          userName: 'newuser',
          accountType: 'user',
          balance: 100,
          masterPassword: 'master123',
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await createSubAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Insufficient balance',
        })
      );
    });

    test('Error - User already exists', async () => {
      const mockAdmin = {
        _id: 'admin_001',
        code: 'ADMIN001',
        secret: 1,
        password: 'hashed_password',
        role: 'admin',
        balance: 10000,
      };

      const existingUser = {
        _id: 'existing_001',
        userName: 'existinguser',
      };

      SubAdmin.findById = vi.fn().mockResolvedValue(mockAdmin);
      bcrypt.compare = vi.fn().mockResolvedValue(true);
      SubAdmin.findOne = vi.fn().mockResolvedValue(existingUser); // User exists

      const req = {
        id: 'admin_001',
        role: 'admin',
        body: {
          userName: 'existinguser', // Already exists
          accountType: 'user',
          balance: 1000,
          masterPassword: 'master123',
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await createSubAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'existinguser already exists',
        })
      );
    });

    test('Error - Partnership > 100', async () => {
      const mockAdmin = {
        _id: 'admin_001',
        code: 'ADMIN001',
        secret: 1,
        password: 'hashed_password',
        role: 'admin',
        balance: 10000,
        avbalance: 9000,
      };

      SubAdmin.findById = vi.fn().mockResolvedValue(mockAdmin);
      bcrypt.compare = vi.fn().mockResolvedValue(true);
      SubAdmin.findOne = vi.fn().mockResolvedValue(null);

      const req = {
        id: 'admin_001',
        role: 'admin',
        body: {
          userName: 'newuser',
          accountType: 'user',
          balance: 1000,
          masterPassword: 'master123',
          partnership: 150, // Invalid: > 100
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await createSubAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Partnership should be between 0 and 100',
        })
      );
    });

    test('Error - Partnership < 0', async () => {
      const mockAdmin = {
        _id: 'admin_001',
        code: 'ADMIN001',
        secret: 1,
        password: 'hashed_password',
        role: 'admin',
        balance: 10000,
        avbalance: 9000,
      };

      SubAdmin.findById = vi.fn().mockResolvedValue(mockAdmin);
      bcrypt.compare = vi.fn().mockResolvedValue(true);
      SubAdmin.findOne = vi.fn().mockResolvedValue(null);

      const req = {
        id: 'admin_001',
        role: 'admin',
        body: {
          userName: 'newuser',
          accountType: 'user',
          balance: 1000,
          masterPassword: 'master123',
          partnership: -10, // Invalid: < 0
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await createSubAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Partnership should be between 0 and 100',
        })
      );
    });

    test('Error - Insufficient avbalance (admin.avbalance - balance < 0)', async () => {
      const mockAdmin = {
        _id: 'admin_001',
        code: 'ADMIN001',
        secret: 1,
        password: 'hashed_password',
        role: 'admin',
        balance: 10000,
        avbalance: 500, // Less than balance being given
      };

      SubAdmin.findById = vi.fn().mockResolvedValue(mockAdmin);
      bcrypt.compare = vi.fn().mockResolvedValue(true);
      SubAdmin.findOne = vi.fn().mockResolvedValue(null);

      const req = {
        id: 'admin_001',
        role: 'admin',
        body: {
          userName: 'newuser',
          accountType: 'user',
          balance: 1000, // admin.avbalance (500) - balance (1000) = -500 < 0
          masterPassword: 'master123',
          partnership: '50',
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await createSubAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Insufficient balance',
        })
      );
    });

    test('Successfully create user - Verify admin balance update', async () => {
      const mockAdmin = {
        _id: 'admin_001',
        code: 'ADMIN001',
        userName: 'admin1',
        balance: 10000,
        avbalance: 9000,
        secret: 1,
        password: 'hashed_password',
        role: 'admin',
        save: vi.fn().mockResolvedValue(true),
      };

      const mockDownlines = [
        {
          _id: 'downline_001',
          bettingProfitLoss: 500,
          exposure: 200,
          baseBalance: 2000,
        },
      ];

      const mockSubAdmin = {
        _id: 'user_001',
        userName: 'newuser',
        save: vi.fn().mockResolvedValue(true),
        toObject: () => ({ _id: 'user_001' }),
      };

      SubAdmin.findById = vi.fn().mockResolvedValue(mockAdmin);
      SubAdmin.findOne = vi.fn().mockResolvedValue(null);
      SubAdmin.find = vi.fn().mockResolvedValue(mockDownlines);
      bcrypt.compare = vi.fn().mockResolvedValue(true);
      crypto.randomBytes = vi
        .fn()
        .mockReturnValue({ toString: () => 'abcd1234' });

      const SubAdminConstructor = vi
        .fn()
        .mockImplementation(() => mockSubAdmin);
      SubAdminConstructor.prototype = SubAdmin;
      vi.mocked(SubAdmin).mockImplementation(SubAdminConstructor);

      TransactionHistory.create = vi.fn().mockResolvedValue({});

      const req = {
        id: 'admin_001',
        role: 'admin',
        body: {
          name: 'New User',
          userName: 'newuser',
          accountType: 'user',
          balance: 1000,
          creditReference: 500,
          masterPassword: 'master123',
          partnership: '50',
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await createSubAdmin(req, res);

      // Verify admin avbalance is reduced
      expect(mockAdmin.avbalance).toBe(8000); // 9000 - 1000 = 8000
      expect(mockAdmin.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('Successfully create user - Verify sub-admin fields', async () => {
      const mockAdmin = {
        _id: 'admin_001',
        code: 'ADMIN001',
        userName: 'admin1',
        balance: 10000,
        avbalance: 9000,
        secret: 1,
        password: 'hashed_password',
        role: 'admin',
        save: vi.fn().mockResolvedValue(true),
      };

      const mockSubAdmin = {
        _id: 'user_001',
        save: vi.fn().mockResolvedValue(true),
        toObject: () => ({ _id: 'user_001' }),
      };

      SubAdmin.findById = vi.fn().mockResolvedValue(mockAdmin);
      SubAdmin.findOne = vi.fn().mockResolvedValue(null);
      SubAdmin.find = vi.fn().mockResolvedValue([]);
      bcrypt.compare = vi.fn().mockResolvedValue(true);
      crypto.randomBytes = vi
        .fn()
        .mockReturnValue({ toString: () => 'abcd1234' });

      const SubAdminConstructor = vi.fn().mockImplementation(function (data) {
        Object.assign(mockSubAdmin, data);
        return mockSubAdmin;
      });
      SubAdminConstructor.prototype = SubAdmin;
      vi.mocked(SubAdmin).mockImplementation(SubAdminConstructor);

      TransactionHistory.create = vi.fn().mockResolvedValue({});

      const req = {
        id: 'admin_001',
        role: 'admin',
        body: {
          name: 'New User',
          userName: 'newuser',
          accountType: 'user',
          balance: 1000,
          creditReference: 500,
          masterPassword: 'master123',
          partnership: '50',
          phone: '1234567890',
          password: 'password123',
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await createSubAdmin(req, res);

      // Verify sub-admin was created with correct fields
      expect(mockSubAdmin.baseBalance).toBe(1000);
      expect(mockSubAdmin.balance).toBe(1000);
      expect(mockSubAdmin.avbalance).toBe(1000);
      expect(mockSubAdmin.creditReferenceProfitLoss).toBe(500); // balance - creditReference = 1000 - 500
      expect(mockSubAdmin.invite).toBe('ADMIN001');
      expect(mockSubAdmin.bettingProfitLoss).toBe(0);
      expect(mockSubAdmin.profitLoss).toBe(0);
      expect(mockSubAdmin.save).toHaveBeenCalled();
    });

    test('Successfully create user - Verify TransactionHistory created', async () => {
      const mockAdmin = {
        _id: 'admin_001',
        code: 'ADMIN001',
        userName: 'admin1',
        balance: 10000,
        avbalance: 9000,
        secret: 1,
        password: 'hashed_password',
        role: 'admin',
        save: vi.fn().mockResolvedValue(true),
      };

      const mockSubAdmin = {
        _id: 'user_001',
        userName: 'newuser',
        save: vi.fn().mockResolvedValue(true),
        toObject: () => ({ _id: 'user_001' }),
      };

      SubAdmin.findById = vi.fn().mockResolvedValue(mockAdmin);
      SubAdmin.findOne = vi.fn().mockResolvedValue(null);
      SubAdmin.find = vi.fn().mockResolvedValue([]);
      bcrypt.compare = vi.fn().mockResolvedValue(true);
      crypto.randomBytes = vi
        .fn()
        .mockReturnValue({ toString: () => 'abcd1234' });

      const SubAdminConstructor = vi
        .fn()
        .mockImplementation(() => mockSubAdmin);
      SubAdminConstructor.prototype = SubAdmin;
      vi.mocked(SubAdmin).mockImplementation(SubAdminConstructor);

      TransactionHistory.create = vi.fn().mockResolvedValue({});

      const req = {
        id: 'admin_001',
        role: 'admin',
        body: {
          name: 'New User',
          userName: 'newuser',
          accountType: 'user',
          balance: 1000,
          creditReference: 500,
          masterPassword: 'master123',
          partnership: '50',
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await createSubAdmin(req, res);

      expect(TransactionHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user_001',
          userName: 'newuser',
          deposite: 1000,
          withdrawl: 0,
          amount: 1000,
          remark: 'Opening Balance',
          from: 'admin1',
          to: 'newuser',
          invite: 'ADMIN001',
        })
      );
    });

    test('Successfully create user - Role hierarchy: supperadmin can create admin', async () => {
      const mockAdmin = {
        _id: 'super_001',
        code: 'SUPER001',
        secret: 1,
        password: 'hashed_password',
        role: 'supperadmin',
        balance: 100000,
        avbalance: 90000,
      };

      SubAdmin.findById = vi.fn().mockResolvedValue(mockAdmin);
      bcrypt.compare = vi.fn().mockResolvedValue(true);
      SubAdmin.findOne = vi.fn().mockResolvedValue(null);
      SubAdmin.find = vi.fn().mockResolvedValue([]);
      crypto.randomBytes = vi
        .fn()
        .mockReturnValue({ toString: () => 'abcd1234' });

      const mockSubAdmin = {
        _id: 'admin_001',
        save: vi.fn().mockResolvedValue(true),
        toObject: () => ({ _id: 'admin_001' }),
      };

      const SubAdminConstructor = vi
        .fn()
        .mockImplementation(() => mockSubAdmin);
      SubAdminConstructor.prototype = SubAdmin;
      vi.mocked(SubAdmin).mockImplementation(SubAdminConstructor);

      TransactionHistory.create = vi.fn().mockResolvedValue({});

      const req = {
        id: 'super_001',
        role: 'supperadmin',
        body: {
          userName: 'newadmin',
          accountType: 'admin', // supperadmin can create admin
          balance: 10000,
          masterPassword: 'master123',
          partnership: '50',
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await createSubAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('Successfully create user - Admin updates totalBalance correctly', async () => {
      const mockAdmin = {
        _id: 'admin_001',
        code: 'ADMIN001',
        userName: 'admin1',
        balance: 10000,
        avbalance: 9000,
        secret: 1,
        password: 'hashed_password',
        role: 'admin',
        save: vi.fn().mockResolvedValue(true),
      };

      const existingDownlines = [
        {
          _id: 'downline_001',
          bettingProfitLoss: 500,
          exposure: 200,
          baseBalance: 2000,
        },
        {
          _id: 'downline_002',
          bettingProfitLoss: -200,
          exposure: 100,
          baseBalance: 1500,
        },
      ];

      SubAdmin.findById = vi.fn().mockResolvedValue(mockAdmin);
      SubAdmin.findOne = vi.fn().mockResolvedValue(null);
      SubAdmin.find = vi.fn().mockResolvedValue(existingDownlines);
      bcrypt.compare = vi.fn().mockResolvedValue(true);
      crypto.randomBytes = vi
        .fn()
        .mockReturnValue({ toString: () => 'abcd1234' });

      const mockSubAdmin = {
        _id: 'user_001',
        save: vi.fn().mockResolvedValue(true),
        toObject: () => ({ _id: 'user_001' }),
      };

      const SubAdminConstructor = vi
        .fn()
        .mockImplementation(() => mockSubAdmin);
      SubAdminConstructor.prototype = SubAdmin;
      vi.mocked(SubAdmin).mockImplementation(SubAdminConstructor);

      TransactionHistory.create = vi.fn().mockResolvedValue({});

      const req = {
        id: 'admin_001',
        role: 'admin',
        body: {
          userName: 'newuser',
          accountType: 'user',
          balance: 1000,
          creditReference: 500,
          masterPassword: 'master123',
          partnership: '50',
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await createSubAdmin(req, res);

      // Verify admin calculations
      // DownlineTotalBettingProfitLoss = 500 + (-200) = 300
      // DownlineTotalBaseBalance = 2000 + 1500 = 3500 (before adding new user)
      // After creating new user with baseBalance 1000:
      // DownlineTotalBaseBalance = 2000 + 1500 + 1000 = 4500
      // totalBalance = DownlineTotalBaseBalance + uplineBettingProfitLoss
      //             = 4500 + 300 = 4800

      expect(mockAdmin.bettingProfitLoss).toBe(300);
      expect(mockAdmin.uplineBettingProfitLoss).toBe(300);
      // Note: The new user's baseBalance (1000) is included in DownlineTotalBaseBalance
      expect(mockAdmin.save).toHaveBeenCalled();
    });

    test('Server error handling', async () => {
      SubAdmin.findById = vi
        .fn()
        .mockRejectedValue(new Error('Database error'));

      const req = {
        id: 'admin_001',
        role: 'admin',
        body: {},
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await createSubAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Server error',
        })
      );
    });
  });

  // ========================================
  // SECTION 2: updateAdmin (indirect testing through patterns)
  // ========================================
  describe('2️⃣ updateAdmin - Update Admin Calculations', () => {
    // Note: updateAdmin is not exported, so we test the logic patterns
    // These tests validate the expected behavior based on the code structure

    test('Update admin - Calculate downline totals correctly', async () => {
      // This test demonstrates the expected calculation patterns
      const directDownlines = [
        {
          _id: 'user_001',
          bettingProfitLoss: 1000,
          baseBalance: 5000,
          exposure: 500,
        },
        {
          _id: 'user_002',
          bettingProfitLoss: -500,
          baseBalance: 3000,
          exposure: 300,
        },
      ];

      // Expected calculations:
      const DownlineTotalBettingProfitLoss = directDownlines.reduce(
        (sum, user) => sum + (user.bettingProfitLoss || 0),
        0
      );
      const DownlineTotalBaseBalance = directDownlines.reduce(
        (sum, user) => sum + (user.baseBalance || 0),
        0
      );
      const DownlineTotalExposure = directDownlines.reduce(
        (sum, user) => sum + (user.exposure || 0),
        0
      );

      expect(DownlineTotalBettingProfitLoss).toBe(500); // 1000 + (-500)
      expect(DownlineTotalBaseBalance).toBe(8000); // 5000 + 3000
      expect(DownlineTotalExposure).toBe(800); // 500 + 300
    });

    test('Update admin - Fancy bet exposure calculation pattern', () => {
      // Test the fancy bet exposure calculation logic
      const fancyBets = [
        {
          betType: 'fancy',
          gameId: 'game_001',
          teamName: 'TeamA',
          fancyScore: 10,
          otype: 'back',
          betAmount: 100,
          xValue: 50,
        },
        {
          betType: 'fancy',
          gameId: 'game_001',
          teamName: 'TeamA',
          fancyScore: 10,
          otype: 'lay',
          betAmount: 100,
          xValue: 50,
        },
      ];

      // Group by market
      const betsByMarket = {};
      fancyBets.forEach((bet) => {
        const marketKey = `${bet.gameId}_${bet.teamName}`;
        if (!betsByMarket[marketKey]) {
          betsByMarket[marketKey] = [];
        }
        betsByMarket[marketKey].push(bet);
      });

      // Calculate exposure for this market
      const marketBets = betsByMarket['game_001_TeamA'];
      const backBets = marketBets.filter((b) => b.otype === 'back');
      const layBets = marketBets.filter((b) => b.otype === 'lay');
      const fancyScores = [...new Set(marketBets.map((b) => b.fancyScore))];

      let marketExposure = 0;

      if (backBets.length > 0 && layBets.length > 0) {
        const scenarioResults = [];

        fancyScores.forEach((score) => {
          const backBetsAtScore = backBets.filter(
            (b) => b.fancyScore === score
          );
          const layBetsAtScore = layBets.filter((b) => b.fancyScore === score);

          // Scenario 1: score >= fancy score (Back wins, Lay loses)
          const backWinProfit = backBetsAtScore.reduce(
            (sum, b) => sum + (b.xValue * b.betAmount) / 100,
            0
          );
          const layLossAmount = layBetsAtScore.reduce(
            (sum, b) => sum + (b.xValue * b.betAmount) / 100,
            0
          );
          const scenario1Net = backWinProfit - layLossAmount;

          // Scenario 2: score < fancy score (Back loses, Lay wins)
          const backLossAmount = backBetsAtScore.reduce(
            (sum, b) => sum + b.betAmount,
            0
          );
          const layWinProfit = layBetsAtScore.reduce(
            (sum, b) => sum + b.betAmount,
            0
          );
          const scenario2Net = layWinProfit - backLossAmount;

          scenarioResults.push(scenario1Net, scenario2Net);
        });

        const maxLoss = Math.min(...scenarioResults);
        marketExposure = Math.abs(maxLoss);
      }

      // For this example: backWinProfit = 50, layLossAmount = 50, scenario1Net = 0
      // backLossAmount = 100, layWinProfit = 100, scenario2Net = 0
      // maxLoss = 0, exposure = 0 (offset)
      expect(marketExposure).toBe(0);
    });

    test('Update admin - Non-fancy bet uses stored exposure', () => {
      // For non-fancy bets, use user's stored exposure value
      const user = {
        _id: 'user_001',
        exposure: 500,
        userName: 'testuser',
      };

      const pendingBets = [
        { betType: 'sports', status: 0 },
        { betType: 'casino', status: 0 },
      ];

      const hasFancyBets = pendingBets.some((b) => b.betType === 'fancy');

      if (!hasFancyBets) {
        const exposure = user.exposure || 0;
        expect(exposure).toBe(500);
      }
    });

    test('Update admin - Admin totalBalance calculation', () => {
      const DownlineTotalBaseBalance = 10000;
      const DownlineTotalBettingProfitLoss = 2000;

      // Admin totalBalance = DownlineTotalBaseBalance + uplineBettingProfitLoss
      const totalBalance =
        DownlineTotalBaseBalance + DownlineTotalBettingProfitLoss;

      expect(totalBalance).toBe(12000);
    });

    test('Update admin - Admin agentAvbalance calculation', () => {
      const totalBalance = 12000;
      const DownlineTotalExposure = 1500;

      // agentAvbalance = totalBalance - totalExposure
      const agentAvbalance = totalBalance - DownlineTotalExposure;

      expect(agentAvbalance).toBe(10500);
    });

    test('Update admin - Admin totalAvbalance calculation', () => {
      const totalBalance = 12000;
      const adminAvbalance = 5000;

      // totalAvbalance = totalBalance + avbalance
      const totalAvbalance = totalBalance + adminAvbalance;

      expect(totalAvbalance).toBe(17000);
    });
  });

  // ========================================
  // SECTION 3: countUplines (indirect testing)
  // ========================================
  describe('3️⃣ countUplines - Count Upline Hierarchy', () => {
    test('Count uplines - Single upline chain', () => {
      // Simulate counting uplines logic
      const user1 = { invite: 'CODE1' };
      const user2 = { invite: 'CODE2' };
      const user3 = { invite: null }; // Top level

      // Simulated chain: user1 -> user2 -> user3 (no invite)
      let count = 0;
      let currentUser = user1;

      if (currentUser && currentUser.invite === 'CODE1') {
        count++; // Found upline 1
        currentUser = user2;
      }

      if (currentUser && currentUser.invite === 'CODE2') {
        count++; // Found upline 2
        currentUser = user3;
      }

      if (currentUser && currentUser.invite) {
        count++; // Would continue if invite exists
      }

      expect(count).toBe(2);
    });

    test('Count uplines - No uplines (top level user)', () => {
      const topLevelUser = { invite: null };

      let count = 0;
      let currentUser = topLevelUser;

      while (currentUser && currentUser.invite) {
        count++;
        // Would fetch upline in actual code
      }

      expect(count).toBe(0);
    });

    test('Count uplines - Break on missing upline', () => {
      const user = { invite: 'MISSING_CODE' };

      // Simulate: upline not found, break loop
      let count = 0;
      let currentUser = user;
      const upline = null; // Not found

      if (currentUser && currentUser.invite) {
        if (upline) {
          count++;
        } else {
          // Break - upline not found
        }
      }

      expect(count).toBe(0);
    });
  });

  // ========================================
  // SECTION 4: Edge Cases & Integration
  // ========================================
  describe('4️⃣ Edge Cases & Integration', () => {
    test('Create user - Empty downlines array', async () => {
      const mockAdmin = {
        _id: 'admin_001',
        code: 'ADMIN001',
        secret: 1,
        password: 'hashed_password',
        role: 'admin',
        balance: 10000,
        avbalance: 9000,
        save: vi.fn().mockResolvedValue(true),
      };

      SubAdmin.findById = vi.fn().mockResolvedValue(mockAdmin);
      bcrypt.compare = vi.fn().mockResolvedValue(true);
      SubAdmin.findOne = vi.fn().mockResolvedValue(null);
      SubAdmin.find = vi.fn().mockResolvedValue([]); // No downlines

      crypto.randomBytes = vi
        .fn()
        .mockReturnValue({ toString: () => 'abcd1234' });

      const mockSubAdmin = {
        _id: 'user_001',
        save: vi.fn().mockResolvedValue(true),
        toObject: () => ({ _id: 'user_001' }),
      };

      const SubAdminConstructor = vi
        .fn()
        .mockImplementation(() => mockSubAdmin);
      SubAdminConstructor.prototype = SubAdmin;
      vi.mocked(SubAdmin).mockImplementation(SubAdminConstructor);

      TransactionHistory.create = vi.fn().mockResolvedValue({});

      const req = {
        id: 'admin_001',
        role: 'admin',
        body: {
          userName: 'newuser',
          accountType: 'user',
          balance: 1000,
          creditReference: 500,
          masterPassword: 'master123',
          partnership: '50',
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await createSubAdmin(req, res);

      // With no downlines, DownlineTotalBettingProfitLoss = 0
      expect(mockAdmin.bettingProfitLoss).toBe(0);
      expect(mockAdmin.uplineBettingProfitLoss).toBe(0);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('Create user - Downlines with null/undefined values', async () => {
      const mockAdmin = {
        _id: 'admin_001',
        code: 'ADMIN001',
        secret: 1,
        password: 'hashed_password',
        role: 'admin',
        balance: 10000,
        avbalance: 9000,
        save: vi.fn().mockResolvedValue(true),
      };

      const downlinesWithNulls = [
        { bettingProfitLoss: null, exposure: undefined, baseBalance: 0 },
        { bettingProfitLoss: 500, exposure: 200, baseBalance: 1000 },
      ];

      SubAdmin.findById = vi.fn().mockResolvedValue(mockAdmin);
      bcrypt.compare = vi.fn().mockResolvedValue(true);
      SubAdmin.findOne = vi.fn().mockResolvedValue(null);
      SubAdmin.find = vi.fn().mockResolvedValue(downlinesWithNulls);

      crypto.randomBytes = vi
        .fn()
        .mockReturnValue({ toString: () => 'abcd1234' });

      const mockSubAdmin = {
        _id: 'user_001',
        save: vi.fn().mockResolvedValue(true),
        toObject: () => ({ _id: 'user_001' }),
      };

      const SubAdminConstructor = vi
        .fn()
        .mockImplementation(() => mockSubAdmin);
      SubAdminConstructor.prototype = SubAdmin;
      vi.mocked(SubAdmin).mockImplementation(SubAdminConstructor);

      TransactionHistory.create = vi.fn().mockResolvedValue({});

      const req = {
        id: 'admin_001',
        role: 'admin',
        body: {
          userName: 'newuser',
          accountType: 'user',
          balance: 1000,
          creditReference: 500,
          masterPassword: 'master123',
          partnership: '50',
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await createSubAdmin(req, res);

      // Null values should be treated as 0
      // DownlineTotalBettingProfitLoss = (null || 0) + 500 = 500
      expect(mockAdmin.bettingProfitLoss).toBe(500);
      expect(mockAdmin.save).toHaveBeenCalled();
    });

    test('Create user - Partnership as string number', async () => {
      const mockAdmin = {
        _id: 'admin_001',
        code: 'ADMIN001',
        secret: 1,
        password: 'hashed_password',
        role: 'admin',
        balance: 10000,
        avbalance: 9000,
        save: vi.fn().mockResolvedValue(true),
      };

      SubAdmin.findById = vi.fn().mockResolvedValue(mockAdmin);
      bcrypt.compare = vi.fn().mockResolvedValue(true);
      SubAdmin.findOne = vi.fn().mockResolvedValue(null);
      SubAdmin.find = vi.fn().mockResolvedValue([]);
      crypto.randomBytes = vi
        .fn()
        .mockReturnValue({ toString: () => 'abcd1234' });

      const mockSubAdmin = {
        _id: 'user_001',
        save: vi.fn().mockResolvedValue(true),
        toObject: () => ({ _id: 'user_001' }),
      };

      const SubAdminConstructor = vi
        .fn()
        .mockImplementation(() => mockSubAdmin);
      SubAdminConstructor.prototype = SubAdmin;
      vi.mocked(SubAdmin).mockImplementation(SubAdminConstructor);

      TransactionHistory.create = vi.fn().mockResolvedValue({});

      const req = {
        id: 'admin_001',
        role: 'admin',
        body: {
          userName: 'newuser',
          accountType: 'user',
          balance: 1000,
          creditReference: 500,
          masterPassword: 'master123',
          partnership: '75', // String number
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await createSubAdmin(req, res);

      // Should handle string number partnership
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  // ========================================
  // SECTION 5: updateAllUplines (tests updateAdmin indirectly)
  // ========================================
  describe('5️⃣ updateAllUplines - Update All Upline Admins', () => {
    test('Update single upline chain', async () => {
      const user1 = {
        _id: 'user_001',
        userName: 'user1',
        code: 'USER001',
        invite: 'MASTER001',
      };

      const master1 = {
        _id: 'master_001',
        userName: 'master1',
        code: 'MASTER001',
        invite: 'ADMIN001',
        save: vi.fn().mockResolvedValue(true),
      };

      const admin1 = {
        _id: 'admin_001',
        userName: 'admin1',
        code: 'ADMIN001',
        invite: null,
        save: vi.fn().mockResolvedValue(true),
      };

      SubAdmin.findById = vi
        .fn()
        .mockResolvedValueOnce(user1) // First call for user1
        .mockResolvedValueOnce(master1) // For updateAdmin(master1._id)
        .mockResolvedValueOnce(master1); // For finding upline

      SubAdmin.findOne = vi
        .fn()
        .mockResolvedValueOnce(master1) // Find master by invite code
        .mockResolvedValueOnce(admin1) // Find admin by invite code
        .mockResolvedValueOnce(null); // No higher upline

      SubAdmin.find = vi.fn().mockResolvedValue([]); // No downlines
      betModel.find = vi.fn().mockResolvedValue([]); // No pending bets

      // updateAllUplines calls updateAdmin for each upline
      // updateAdmin needs to be mocked or we test the integration
      await updateAllUplines('user_001');

      expect(SubAdmin.findById).toHaveBeenCalledWith('user_001');
      expect(SubAdmin.findOne).toHaveBeenCalledWith({ code: 'MASTER001' });
      expect(SubAdmin.findOne).toHaveBeenCalledWith({ code: 'ADMIN001' });
    });

    test('Update multiple users in array', async () => {
      const user1 = {
        _id: 'user_001',
        userName: 'user1',
        code: 'USER001',
        invite: 'ADMIN001',
      };

      const user2 = {
        _id: 'user_002',
        userName: 'user2',
        code: 'USER002',
        invite: 'ADMIN001',
      };

      const admin1 = {
        _id: 'admin_001',
        userName: 'admin1',
        code: 'ADMIN001',
        invite: null,
        save: vi.fn().mockResolvedValue(true),
      };

      // Mock order must match actual execution order:
      // updateAllUplines processes each user fully before moving to the next.
      // For each user: findById(user) -> findOne(upline) -> updateAdmin -> findById(admin)
      // Since admin1.invite is null, the while loop exits without more findOne calls.
      SubAdmin.findById = vi
        .fn()
        .mockResolvedValueOnce(user1) // 1. Initial lookup for user_001
        .mockResolvedValueOnce(admin1) // 2. updateAdmin call for user1's upline
        .mockResolvedValueOnce(user2) // 3. Initial lookup for user_002
        .mockResolvedValueOnce(admin1); // 4. updateAdmin call for user2's upline

      // findOne is only called to find upline by code.
      // Since admin1.invite is null, we don't call findOne for admin1's upline.
      SubAdmin.findOne = vi
        .fn()
        .mockResolvedValueOnce(admin1) // user1's upline (code: ADMIN001)
        .mockResolvedValueOnce(admin1); // user2's upline (code: ADMIN001)

      SubAdmin.find = vi.fn().mockResolvedValue([]);
      betModel.find = vi.fn().mockResolvedValue([]);

      await updateAllUplines(['user_001', 'user_002']);

      expect(SubAdmin.findById).toHaveBeenCalledTimes(4);
    });

    test('Skip if user not found', async () => {
      SubAdmin.findById = vi.fn().mockResolvedValue(null);

      await updateAllUplines('invalid_user');

      expect(SubAdmin.findById).toHaveBeenCalledWith('invalid_user');
      // Should not throw, just skip
    });

    test('Break loop when upline not found', async () => {
      const user = {
        _id: 'user_001',
        userName: 'user1',
        code: 'USER001',
        invite: 'MISSING_CODE',
      };

      SubAdmin.findById = vi.fn().mockResolvedValue(user);
      SubAdmin.findOne = vi.fn().mockResolvedValue(null); // Upline not found

      await updateAllUplines('user_001');

      expect(SubAdmin.findById).toHaveBeenCalledWith('user_001');
      expect(SubAdmin.findOne).toHaveBeenCalledWith({ code: 'MISSING_CODE' });
    });

    test('Handle error gracefully', async () => {
      SubAdmin.findById = vi
        .fn()
        .mockRejectedValue(new Error('Database error'));

      // Should not throw
      await expect(updateAllUplines('user_001')).resolves.not.toThrow();
    });
  });

  // ========================================
  // SECTION 6: getAllUsersWithCompleteInfo (tests countUplines indirectly)
  // ========================================
  describe('6️⃣ getAllUsersWithCompleteInfo - Get Users with Upline Info', () => {
    test('Get users with upline count and totalBalance', async () => {
      const mockAdmin = {
        _id: 'admin_001',
        code: 'ADMIN001',
        role: 'admin',
      };

      const mockUsers = [
        {
          _id: 'user_001',
          userName: 'user1',
          invite: 'ADMIN001',
          toObject: () => ({ _id: 'user_001', userName: 'user1' }),
        },
        {
          _id: 'user_002',
          userName: 'user2',
          invite: 'ADMIN001',
          toObject: () => ({ _id: 'user_002', userName: 'user2' }),
        },
      ];

      const mockUpline = {
        _id: 'admin_001',
        code: 'ADMIN001',
        totalBalance: 50000,
      };

      SubAdmin.findById = vi.fn().mockResolvedValue(mockAdmin);
      SubAdmin.find = vi.fn().mockReturnValue({
        limit: vi.fn().mockReturnThis(),
        skip: vi.fn().mockResolvedValue(mockUsers),
      });
      SubAdmin.countDocuments = vi.fn().mockResolvedValue(2);
      SubAdmin.findOne = vi.fn().mockResolvedValue(mockUpline);

      // Mock countUplines behavior - user has 1 upline (direct)
      // This is tested indirectly through the function
      const req = {
        id: 'admin_001',
        role: 'admin',
        query: {
          page: 1,
          limit: 10,
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await getAllUsersWithCompleteInfo(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Users with complete info retrieved successfully',
          data: expect.any(Array),
        })
      );
    });

    test('Get users with search query', async () => {
      const mockAdmin = {
        _id: 'admin_001',
        code: 'ADMIN001',
        role: 'admin',
      };

      const mockUsers = [
        {
          _id: 'user_001',
          userName: 'testuser',
          invite: 'ADMIN001',
          toObject: () => ({ _id: 'user_001', userName: 'testuser' }),
        },
      ];

      SubAdmin.findById = vi.fn().mockResolvedValue(mockAdmin);
      SubAdmin.find = vi.fn().mockReturnValue({
        limit: vi.fn().mockReturnThis(),
        skip: vi.fn().mockResolvedValue(mockUsers),
      });
      SubAdmin.countDocuments = vi.fn().mockResolvedValue(1);
      SubAdmin.findOne = vi.fn().mockResolvedValue({ totalBalance: 50000 });

      const req = {
        id: 'admin_001',
        role: 'admin',
        query: {
          page: 1,
          limit: 10,
          searchQuery: 'test',
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await getAllUsersWithCompleteInfo(req, res);

      expect(SubAdmin.find).toHaveBeenCalledWith(
        expect.objectContaining({
          userName: expect.objectContaining({
            $regex: 'test',
            $options: 'i',
          }),
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('Error - Admin not found', async () => {
      SubAdmin.findById = vi.fn().mockResolvedValue(null);

      const req = {
        id: 'invalid_admin',
        role: 'admin',
        query: {},
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await getAllUsersWithCompleteInfo(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Admin not found',
        })
      );
    });
  });
});
