import express from 'express';

import { updateResultOfBets } from '../controllers/betController.js';
import { adminAuthMiddleware } from '../middleware/authMiddleware.js';
import DevGame from '../models/devGameModel.js';

const router = express.Router();

const isEnabled = () => process.env.DEV_TEST_GAMES_ENABLED === '1';

router.get('/games', async (req, res) => {
  if (!isEnabled()) return res.status(404).json({ message: 'Disabled' });
  const games = await DevGame.find().sort({ createdAt: -1 });
  res.json({ success: true, games });
});

router.post('/games', async (req, res) => {
  if (!isEnabled()) return res.status(404).json({ message: 'Disabled' });
  const {
    gameId: providedId,
    eventName,
    teamA,
    teamB,
    gameType = 'Match Odds',
    gameName = 'Tennis',
    marketName = 'Match Odds',
  } = req.body;
  const sid = 2;
  const gameId = providedId || `dev-${Date.now()}`;

  const game = await DevGame.findOneAndUpdate(
    { gameId },
    { gameId, eventName, teamA, teamB, gameType, gameName, marketName, sid },
    { new: true, upsert: true }
  );
  res.status(201).json({ success: true, game });
});

router.post('/games/:gameId/result', async (req, res) => {
  if (!isEnabled()) return res.status(404).json({ message: 'Disabled' });
  const { winner } = req.body; // must equal a bet's teamName
  const game = await DevGame.findOneAndUpdate(
    { gameId: req.params.gameId },
    { result: winner },
    { new: true }
  );
  res.json({ success: true, game });
});

// optional: trigger the normal bet settlement loop immediately
router.post('/settle-now', async (req, res) => {
  if (!isEnabled()) return res.status(404).json({ message: 'Disabled' });
  return updateResultOfBets(req, res);
});

export default router;
