import express from 'express';
import {
  requestFunds,
  approveFundRequest,
  getFundRequest,
  getFundRequestsByIssue,
  getPendingFundRequests,
  getFundApproval
} from '../controllers/fundRequestController.js';
import auth from '../middleware/auth.js';
import adminAuth, { anyAdminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

// Request funds (protected - any admin can request)
router.post('/', anyAdminAuth, requestFunds);

// Get fund request by ID
router.get('/request/:fundRequestId', getFundRequest);

// Get all fund requests by issue
router.get('/issue/:issueId', getFundRequestsByIssue);

// Get all pending fund requests (admin only)
router.get('/pending/all', anyAdminAuth, getPendingFundRequests);

// Approve fund request (district authority only)
router.post('/approve/:fundRequestId', adminAuth, approveFundRequest);

// Get fund approval details
router.get('/approval/:fundApprovalId', getFundApproval);

export default router;
