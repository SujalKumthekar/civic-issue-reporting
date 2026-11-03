import express from 'express';
import {
  completeIssue,
  getCompletion,
  getCompletedIssues,
  updateCompletion,
  getCompletionStats
} from '../controllers/completionController.js';
import auth from '../middleware/auth.js';
import { anyAdminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

// Complete an issue (admin only)
router.post('/', anyAdminAuth, completeIssue);

// Get completion details
router.get('/issue/:issueId', getCompletion);

// Get all completed issues
router.get('/all', getCompletedIssues);

// Get completion statistics
router.get('/stats', anyAdminAuth, getCompletionStats);

// Update completion (admin only)
router.put('/:issueId', anyAdminAuth, updateCompletion);

export default router;
