// routes/soccerRoutes.js
import express from 'express';

import {
  fetchsoccerBettingData,
  fetchSoccerData,
} from '../controllers/soccerController.js';

const router = express.Router();

router.get('/soccer', fetchSoccerData);
router.get('/soccer/betting', fetchsoccerBettingData); // /api/betting?gameid=123

export default router;
