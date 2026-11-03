import express from 'express';
import {
  addActionPoint,
  getActionPoints,
  getActionPointById,
  updateActionPoint
} from '../controllers/actionPointController.js';
import auth from '../middleware/auth.js';
import { anyAdminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

// Add action point (protected)
router.post('/', auth, addActionPoint);

// Get action points for an issue
router.get('/issue/:issueId', getActionPoints);

// Get specific action point
router.get('/:actionPointId', getActionPointById);

// Update action point (admin only)
router.put('/:actionPointId', anyAdminAuth, updateActionPoint);

export default router;
