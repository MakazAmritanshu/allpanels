import express from 'express';

import {
  getBetHistory,
  getGraphBackupData,
  getGraphLiveData,
  getMyReportByDownline,
  getMyReportByEvents,
} from '../../controllers/admin/downlineController.js';
import { adminAuthMiddleware } from '../../middleware/authMiddleware.js';

const router = express.Router();

//These two routes are used to get the reports by event and by downlines
router.get(
  '/get/my-reports/by-events',
  adminAuthMiddleware,
  getMyReportByEvents
);
router.get(
  '/get/my-reports/by-downline',
  adminAuthMiddleware,
  getMyReportByDownline
);
router.get('/get/user/bet-history', adminAuthMiddleware, getBetHistory);
router.get('/get/graph-backup', adminAuthMiddleware, getGraphBackupData);
router.get('/get/graph-live', adminAuthMiddleware, getGraphLiveData);

export default router;
