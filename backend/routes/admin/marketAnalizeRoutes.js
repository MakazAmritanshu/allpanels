import express from 'express';

import {
  getCasinoMasterBook,
  getCasinoMasterBookDownline,
  getDownlinePendingBetsByGame,
  getMasterBook,
  getMasterBookDownline,
  getPendingMarketAmounts,
  parentsDetails,
} from '../../controllers/admin/marketAnalyze.js';
import { adminAuthMiddleware } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.get(
  '/market-analyze',
  adminAuthMiddleware,
  getDownlinePendingBetsByGame
);
router.get(
  '/market/pending-amount',
  adminAuthMiddleware,
  getPendingMarketAmounts
);
router.get('/get/market-bet-perents/:id', adminAuthMiddleware, parentsDetails);
router.get('/get/master-book', adminAuthMiddleware, getMasterBook);
router.get('/get/casino-master-book', adminAuthMiddleware, getCasinoMasterBook);
router.get(
  '/get/master-book-downline',
  adminAuthMiddleware,
  getMasterBookDownline
);
router.get(
  '/get/casino-master-book-downline',
  adminAuthMiddleware,
  getCasinoMasterBookDownline
);

export default router;
