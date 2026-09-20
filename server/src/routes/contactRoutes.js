import express from 'express';
import multer from 'multer';
import {
  listContacts,
  createContact,
  bulkCreateContacts,
  updateContact,
  deleteContact,
  extractContactsFromFile,
} from '../controllers/contactController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
});

router.use(protect);

router.get('/', listContacts);
router.post('/', createContact);
router.post('/bulk', bulkCreateContacts);
router.post('/ai-extract', upload.single('file'), extractContactsFromFile);
router.patch('/:id', updateContact);
router.delete('/:id', deleteContact);


export default router;
