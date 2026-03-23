// Test void fancy bet function
import { describe, expect, it } from 'vitest';

import { voidFancyBet } from '../services/fancyBetSettlementService.js';

describe('voidFancyBet - Void Fancy Bet Function', () => {
  describe('Normal Fancy Bet Void', () => {
    it('should return void bet updates with status 3 for fancy bet', async () => {
      const mockBet = {
        _id: 'fancybet123',
        price: 100,
        betAmount: 80,
        otype: 'back',
        fancyScore: '45',
        gameType: 'Normal',
      };

      const result = await voidFancyBet(mockBet);

      expect(result.success).toBe(true);
      expect(result.betUpdates.status).toBe(3);
      expect(result.betUpdates.betResult).toBe('VOID');
      expect(result.betUpdates.resultAmount).toBe(100);
      expect(result.betUpdates.settledBy).toBe('api');
      expect(result.betUpdates.settledAt).toBeInstanceOf(Date);
    });
  });

  describe('Different Fancy Game Types', () => {
    it('should void meter type fancy bet correctly', async () => {
      const mockBet = {
        _id: 'fancybet456',
        price: 200,
        betAmount: 150,
        otype: 'back',
        fancyScore: '30',
        gameType: 'meter',
      };

      const result = await voidFancyBet(mockBet);

      expect(result.success).toBe(true);
      expect(result.betUpdates.status).toBe(3);
      expect(result.betUpdates.resultAmount).toBe(200);
    });

    it('should void line type fancy bet correctly', async () => {
      const mockBet = {
        _id: 'fancybet789',
        price: 150,
        betAmount: 120,
        otype: 'lay',
        fancyScore: '55',
        gameType: 'line',
      };

      const result = await voidFancyBet(mockBet);

      expect(result.success).toBe(true);
      expect(result.betUpdates.status).toBe(3);
      expect(result.betUpdates.resultAmount).toBe(150); // Returns liability
    });

    it('should void ball type fancy bet correctly', async () => {
      const mockBet = {
        _id: 'fancybet101',
        price: 75,
        betAmount: 60,
        otype: 'back',
        fancyScore: '12',
        gameType: 'ball',
      };

      const result = await voidFancyBet(mockBet);

      expect(result.success).toBe(true);
      expect(result.betUpdates.status).toBe(3);
      expect(result.betUpdates.resultAmount).toBe(75);
    });

    it('should void khado type fancy bet correctly', async () => {
      const mockBet = {
        _id: 'fancybet202',
        price: 100,
        betAmount: 85,
        otype: 'back',
        fancyScore: '8',
        gameType: 'khado',
      };

      const result = await voidFancyBet(mockBet);

      expect(result.success).toBe(true);
      expect(result.betUpdates.status).toBe(3);
      expect(result.betUpdates.resultAmount).toBe(100);
    });
  });

  describe('Lay Bet Void', () => {
    it('should return correct resultAmount for lay fancy bet', async () => {
      const mockLayBet = {
        _id: 'fancybet303',
        price: 80, // Liability for lay
        betAmount: 100,
        otype: 'lay',
        fancyScore: '40',
        gameType: 'Normal',
      };

      const result = await voidFancyBet(mockLayBet);

      expect(result.success).toBe(true);
      expect(result.betUpdates.status).toBe(3);
      expect(result.betUpdates.resultAmount).toBe(80); // Returns liability
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative price', async () => {
      const mockBet = {
        _id: 'fancybet404',
        price: -25,
        betAmount: 50,
        otype: 'back',
        fancyScore: '35',
        gameType: 'Normal',
      };

      const result = await voidFancyBet(mockBet);

      expect(result.success).toBe(true);
      expect(result.betUpdates.status).toBe(3);
      expect(result.betUpdates.resultAmount).toBe(25); // Absolute value
    });
  });
});
