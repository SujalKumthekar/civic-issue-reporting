import express from 'express';
import {
  submitIllegalReport,
  getMyIllegalReports,
  getAllIllegalReports,
  getIllegalReportById,
  updateIllegalStatus,
  getIllegalByNagarpalika,
  supportIllegalReport,
} from '../controllers/illegalController.js';
import auth from '../middleware/auth.js';
import { anyAdminAuth } from '../middleware/adminAuth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Citizen routes
router.post('/', auth, upload.array('media', 5), submitIllegalReport);
router.get('/my', auth, getMyIllegalReports);
router.get('/nagarpalika', auth, getIllegalByNagarpalika);
router.post('/:id/support', auth, supportIllegalReport);

// Admin routes (Nagarpalika)
router.get('/admin/all', anyAdminAuth, getAllIllegalReports);
router.get('/admin/:id', anyAdminAuth, getIllegalReportById);
router.put('/admin/:id/status', anyAdminAuth, updateIllegalStatus);

export default router;
