import express from 'express';
import { protect } from '../middleware/auth';

const router = express.Router();

// Placeholder routes - these would be implemented with notification functionality
router.get('/', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Notification routes - to be implemented'
  });
});

export default router;