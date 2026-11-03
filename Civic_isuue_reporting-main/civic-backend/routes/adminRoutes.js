import express from 'express';
import {
  registerDistrictAuthority,
  loginDistrictAuthority,
  addNagarpalika,
  getNagarpalikas,
  loginNagarpalika,
} from '../controllers/adminController.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// District Authority
router.post('/register', registerDistrictAuthority);
router.post('/login', loginDistrictAuthority);

// Nagarpalika management (protected)
router.post('/nagarpalikas', adminAuth, addNagarpalika);
router.get('/nagarpalikas', adminAuth, getNagarpalikas);

// Nagarpalika login
router.post('/nagarpalika/login', loginNagarpalika);

export default router;
