import express from 'express';
import {
  listApplications,
  getApplication,
  createApplicationDraft,
  sendBatchApplications,
  updateApplicationStatus,
  sendFollowUpEmail,
  deleteApplication,
} from '../controllers/applicationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', listApplications);
router.post('/draft', createApplicationDraft);
router.post('/send-batch', sendBatchApplications);
router.get('/:id', getApplication);
router.patch('/:id/status', updateApplicationStatus);
router.post('/:id/follow-up', sendFollowUpEmail);
router.delete('/:id', deleteApplication);

export default router;
