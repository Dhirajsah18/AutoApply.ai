import express from 'express';
import {
  listContacts,
  createContact,
  bulkCreateContacts,
  updateContact,
  deleteContact,
} from '../controllers/contactController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', listContacts);
router.post('/', createContact);
router.post('/bulk', bulkCreateContacts);
router.patch('/:id', updateContact);
router.delete('/:id', deleteContact);

export default router;
