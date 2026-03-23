import express from 'express';

import {
  getCasinoBettingData,
  getCasinoData,
  getCasinoResultData,
  getCasinoResultDetailData,
} from '../controllers/casinoController.js';

const router = express.Router();

router.get('/casino-data', getCasinoData);
router.get('/casino-betting-data', getCasinoBettingData);
router.get('/casino-betting-result', getCasinoResultData);
router.get('/casino-betting-result-detail', getCasinoResultDetailData);

export default router;
