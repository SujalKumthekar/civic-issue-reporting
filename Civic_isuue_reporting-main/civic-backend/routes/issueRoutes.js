import express from 'express';
import {
  reportCivicIssue,
  getMyCivicIssues,
  getAllIssues,
  getIssueById,
  updateIssueStatus,
  getIssuesByNagarpalika,
  supportIssue,
  checkDuplicate,
} from '../controllers/issueController.js';
import auth from '../middleware/auth.js';
import { anyAdminAuth } from '../middleware/adminAuth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Order matters — specific routes before :id
router.get('/check-duplicate', auth, checkDuplicate);
router.get('/nagarpalika', auth, getIssuesByNagarpalika);
router.get('/my', auth, getMyCivicIssues);
router.get('/admin/all', anyAdminAuth, getAllIssues);
router.get('/admin/:id', anyAdminAuth, getIssueById);
router.put('/admin/:id/status', anyAdminAuth, updateIssueStatus);
router.get('/', getAllIssues);
router.get('/:id', getIssueById);

router.post('/civic', auth, upload.array('media', 5), reportCivicIssue);
router.post('/:id/support', auth, supportIssue);
router.put('/:id/status', updateIssueStatus);

export default router;
