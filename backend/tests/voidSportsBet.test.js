// Test void sports bet function
import { describe, expect, it } from 'vitest';

import { voidSportsBet } from '../services/sportsSettlementService.js';

describe('voidSportsBet - Void Sports Bet Function', () => {
  describe('Back Bet Void', () => {
    it('should return void bet updates with status 3 for back bet', async () => {
      const mockBet = {
        _id: 'bet123',
        price: 100,
        betAmount: 95,
        otype: 'back',
        teamName: 'Team A',
      };

      const result = await voidSportsBet(mockBet);

      expect(result.success).toBe(true);
      expect(result.betUpdates.status).toBe(3);
      expect(result.betUpdates.betResult).toBe('VOID');
      expect(result.betUpdates.resultAmount).toBe(100);
      expect(result.betUpdates.settledBy).toBe('api');
      expect(result.betUpdates.settledAt).toBeInstanceOf(Date);
    });

    it('should return correct resultAmount (price) for back bet void', async () => {
      const mockBet = {
        _id: 'bet456',
        price: 250,
        betAmount: 200,
        otype: 'back',
        teamName: 'Team B',
      };

      const result = await voidSportsBet(mockBet);

      expect(result.success).toBe(true);
      expect(result.betUpdates.resultAmount).toBe(250); // Returns stake (price)
    });
  });

  describe('Lay Bet Void', () => {
    it('should return void bet updates with status 3 for lay bet', async () => {
      const mockLayBet = {
        _id: 'bet789',
        price: 95, // Liability for lay bet
        betAmount: 100,
        otype: 'lay',
        teamName: 'Team C',
      };

      const result = await voidSportsBet(mockLayBet);

      expect(result.success).toBe(true);
      expect(result.betUpdates.status).toBe(3);
      expect(result.betUpdates.betResult).toBe('VOID');
      expect(result.betUpdates.resultAmount).toBe(95); // Returns liability (price)
    });

    it('should return correct resultAmount (liability) for lay bet void', async () => {
      const mockLayBet = {
        _id: 'bet101',
        price: 150, // Liability
        betAmount: 100,
        otype: 'lay',
        teamName: 'Team D',
      };

      const result = await voidSportsBet(mockLayBet);

      expect(result.success).toBe(true);
      expect(result.betUpdates.resultAmount).toBe(150); // Returns liability
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative price (guaranteed profit scenario)', async () => {
      const mockBet = {
        _id: 'bet202',
        price: -50, // Negative price (guaranteed profit)
        betAmount: 100,
        otype: 'back',
        teamName: 'Team E',
      };

      const result = await voidSportsBet(mockBet);

      expect(result.success).toBe(true);
      expect(result.betUpdates.status).toBe(3);
      expect(result.betUpdates.resultAmount).toBe(50); // Absolute value
    });

    it('should handle zero price', async () => {
      const mockBet = {
        _id: 'bet303',
        price: 0,
        betAmount: 50,
        otype: 'back',
        teamName: 'Team F',
      };

      const result = await voidSportsBet(mockBet);

      expect(result.success).toBe(true);
      expect(result.betUpdates.status).toBe(3);
      expect(result.betUpdates.resultAmount).toBe(0);
    });
  });
});
