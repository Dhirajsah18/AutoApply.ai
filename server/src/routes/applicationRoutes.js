import express from 'express';
import {
  listApplications,
  getApplication,
  createApplicationDraft,
  sendBatchApplications,
  updateApplicationStatus,
  sendFollowUpEmail,
  deleteApplication,
  getDailyQuota,
  getQueueStatus,
} from '../controllers/applicationController.js';
import { protect } from '../middleware/auth.js';
import { sendLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(protect);

router.get('/quota', getDailyQuota);
router.get('/queue-status', getQueueStatus);

router.get('/', listApplications);
router.post('/draft', createApplicationDraft);
router.post('/send-batch', sendLimiter, sendBatchApplications);
router.get('/:id', getApplication);
router.patch('/:id/status', updateApplicationStatus);
router.post('/:id/follow-up', sendLimiter, sendFollowUpEmail);
router.delete('/:id', deleteApplication);

export default router;
