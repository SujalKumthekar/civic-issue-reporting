import express from 'express';
import {
  acknowledgeIssue,
  getIssueFullDetails,
  getIssuesByStatus,
  getDashboardStats,
  getIssueBlockchainHistory
} from '../controllers/issueTrackingController.js';
import auth from '../middleware/auth.js';
import { anyAdminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

// Acknowledge an issue (admin only)
router.post('/acknowledge/:issueId', anyAdminAuth, acknowledgeIssue);

// Get full issue details (with timeline, actions, expenses, completion)
router.get('/details/:issueId', auth, getIssueFullDetails);

// Get issues by status
router.get('/status/:status', getIssuesByStatus);

// Get dashboard statistics (admin only)
router.get('/stats/dashboard', anyAdminAuth, getDashboardStats);

// Get blockchain history for an issue
router.get('/blockchain/:issueId', auth, getIssueBlockchainHistory);

export default router;
