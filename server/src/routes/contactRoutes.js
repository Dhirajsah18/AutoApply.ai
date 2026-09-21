import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  listContacts,
  createContact,
  bulkCreateContacts,
  bulkDeleteContacts,
  updateContact,
  deleteContact,
  extractContactsFromFile,
} from '../controllers/contactController.js';
import { protect } from '../middleware/auth.js';

const contactFileFilter = (req, file, cb) => {
  const allowedExts = ['.pdf', '.csv', '.tsv', '.txt'];
  const ext = path.extname(file.originalname || '').toLowerCase();
  if (allowedExts.includes(ext) || file.mimetype === 'application/pdf' || file.mimetype.includes('csv') || file.mimetype.includes('text')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, CSV, and TXT files are accepted for contact extraction.'), false);
  }
};

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max limit
  fileFilter: contactFileFilter,
});

const handleUploadWithLimit = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: { code: 'FILE_TOO_LARGE', message: 'File size exceeds the 2MB limit. Please upload a smaller file.' },
        });
      }
      return res.status(400).json({
        success: false,
        error: { code: 'UPLOAD_ERROR', message: err.message || 'File upload failed.' },
      });
    }
    next();
  });
};

// /ai-extract parses multipart first so stream is consumed before auth validation
router.post('/ai-extract', handleUploadWithLimit, protect, extractContactsFromFile);


// All other contact routes require auth directly
router.use(protect);

router.get('/', listContacts);
router.post('/', createContact);
router.post('/bulk', bulkCreateContacts);
router.post('/bulk-delete', bulkDeleteContacts);
router.patch('/:id', updateContact);
router.delete('/:id', deleteContact);



export default router;
