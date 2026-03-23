import express from 'express';

import {
  executeCashout,
  getCashoutQuote,
} from '../controllers/cashoutController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/user/cashout/quote', authMiddleware, getCashoutQuote);
router.post('/user/cashout/execute', authMiddleware, executeCashout);

export default router;
