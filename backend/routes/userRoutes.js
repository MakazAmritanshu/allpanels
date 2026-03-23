import express from 'express';

import {
  changePasswordByFirstLogin,
  changePasswordByUserSelf,
  getLoginHistory,
  getPasswordHistoryByUserId,
  getUserById,
  loginUser,
  updateQuickStakes,
  updateTheme,
  user_logout,
} from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// router.post("/register", registerUser);
router.post('/user/login', loginUser);

router.get('/get/user-details', authMiddleware, getUserById);
router.get('/customer/logout', user_logout);
router.post(
  '/change/password-self/user',
  authMiddleware,
  changePasswordByUserSelf
);
router.post(
  '/change/password/first-login',
  authMiddleware,
  changePasswordByFirstLogin
);
router.get('/password/history', authMiddleware, getPasswordHistoryByUserId);
router.get('/get/user-login-history/:userId', authMiddleware, getLoginHistory);
router.put('/update/quick-stakes', authMiddleware, updateQuickStakes);
router.put('/update/theme', authMiddleware, updateTheme);
export default router;
