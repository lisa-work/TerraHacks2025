import express from 'express';
import { protect } from '../middleware/auth';
import {
  searchInsuranceProviders,
  getInsuranceProvider,
  createInsuranceProvider,
  updateInsuranceProvider,
  getAllInsuranceProviders
} from '../controllers/insuranceController';

const router = express.Router();

// Public routes
router.get('/search', searchInsuranceProviders);
router.get('/all', getAllInsuranceProviders);
router.get('/:id', getInsuranceProvider);

// Protected routes
router.use(protect);
router.post('/', createInsuranceProvider);
router.put('/:id', updateInsuranceProvider);

export default router;