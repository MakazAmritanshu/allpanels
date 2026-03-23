import express from 'express';

import {
  deleteManualResult,
  getManualResults,
  getPendingGamesForManualResult,
  getUnsettledBetsForManualResult,
  settleManualResult,
  voidManualBets,
} from '../../controllers/admin/manualResultController.js';
import { adminAuthMiddleware } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Dashboard: Get all games with pending bets (use this first)
router.get(
  '/manual-result/pending-games',
  adminAuthMiddleware,
  getPendingGamesForManualResult
);

// Dashboard: Get bet details for a specific game
router.get(
  '/manual-result/unsettled-bets',
  adminAuthMiddleware,
  getUnsettledBetsForManualResult
);

// MAIN ACTION: Settle result + all bets in one call
router.post('/manual-result/settle', adminAuthMiddleware, settleManualResult);

// VOID ACTION: Void all unsettled bets for a game/market (match cancelled)
router.post('/manual-result/void', adminAuthMiddleware, voidManualBets);

// History: Get all past manual results
router.get('/manual-result/history', adminAuthMiddleware, getManualResults);

// Delete a manual result record
router.delete(
  '/manual-result/delete/:manualResultId',
  adminAuthMiddleware,
  deleteManualResult
);

export default router;
