// routes/horseRacingRoutes.js
import express from 'express';

import {
  fetchHorseRacingBettingData,
  fetchHorseRacingData,
} from '../controllers/horseRacingController.js';

const router = express.Router();

router.get('/horse-racing', fetchHorseRacingData); // GET /api/horse-racing
router.get('/horse-racing/betting', fetchHorseRacingBettingData); // GET /api/horse-racing/betting?gameid=123

export default router;
