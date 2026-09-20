import express from 'express';
import {
  listResumes,
  getResume,
  uploadResumeFile,
  createOrUpdateBuilderResume,
  deleteResume,
  downloadResumeFile,
  updateResumeDetails,
} from '../controllers/resumeController.js';
import { protect } from '../middleware/auth.js';
import { uploadResume } from '../services/storageService.js';

const router = express.Router();

router.use(protect);

router.get('/', listResumes);
router.get('/:id', getResume);
router.post('/upload', uploadResume.single('file'), uploadResumeFile);
router.post('/builder', createOrUpdateBuilderResume);
router.patch('/builder/:id', createOrUpdateBuilderResume);
router.patch('/:id', uploadResume.single('file'), updateResumeDetails);
router.delete('/:id', deleteResume);
router.get('/:id/download', downloadResumeFile);


export default router;
