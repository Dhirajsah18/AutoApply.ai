import express from 'express';
import { generateEmail, personalizeTemplate, checkResumeAts } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/generate-email', generateEmail);
router.post('/personalize-template', personalizeTemplate);
router.post('/ats-check', checkResumeAts);


export default router;
