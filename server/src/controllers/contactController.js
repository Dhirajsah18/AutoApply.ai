import { CompanyContact } from '../models/CompanyContact.js';
import { ENV } from '../config/env.js';
import { decryptSecret } from '../services/cryptoService.js';
import {
  parseCsvOrDelimited,
  aiExtractFromPdfGemini,
  aiExtractFromText,
  extractPdfText,
} from '../services/contactExtractorService.js';

export const listContacts = async (req, res, next) => {
  try {
    const { search, tag } = req.query;
    const query = { userId: req.user._id };

    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { contactName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } },
      ];
    }

    if (tag) {
      query.tags = tag;
    }

    const contacts = await CompanyContact.find(query).sort({ createdAt: -1 });
    res.json({ success: true, contacts });
  } catch (err) {
    next(err);
  }
};

export const createContact = async (req, res, next) => {
  try {
    const { companyName, contactName, email, position, location, sourceUrl, notes, tags } = req.body;

    if (!companyName || !email) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'Company Name and Email are required.' },
      });
    }

    const contact = await CompanyContact.create({
      userId: req.user._id,
      companyName,
      contactName: contactName || 'Hiring Manager',
      email: email.toLowerCase().trim(),
      position: position || 'Software Engineer',
      location: location || 'Remote',
      sourceUrl: sourceUrl || '',
      notes: notes || '',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
    });

    res.status(201).json({ success: true, contact });
  } catch (err) {
    next(err);
  }
};

export const bulkCreateContacts = async (req, res, next) => {
  try {
    const { contacts } = req.body;

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_DATA', message: 'Please provide an array of contacts.' },
      });
    }

    const formatted = contacts
      .filter(c => c.companyName && c.email)
      .map(c => ({
        userId: req.user._id,
        companyName: c.companyName.trim(),
        contactName: c.contactName ? c.contactName.trim() : 'Hiring Manager',
        email: c.email.toLowerCase().trim(),
        position: c.position ? c.position.trim() : 'Software Engineer',
        location: c.location || 'Remote',
        sourceUrl: c.sourceUrl || '',
        notes: c.notes || '',
        tags: Array.isArray(c.tags) ? c.tags : [],
      }));

    const created = await CompanyContact.insertMany(formatted);
    res.status(201).json({ success: true, count: created.length, contacts: created });
  } catch (err) {
    next(err);
  }
};

export const updateContact = async (req, res, next) => {
  try {
    const contact = await CompanyContact.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ success: false, error: { message: 'Contact not found' } });
    }

    res.json({ success: true, contact });
  } catch (err) {
    next(err);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const contact = await CompanyContact.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!contact) {
      return res.status(404).json({ success: false, error: { message: 'Contact not found' } });
    }

    res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export const bulkDeleteContacts = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Please provide an array of contact IDs to delete.' },
      });
    }

    const result = await CompanyContact.deleteMany({
      _id: { $in: ids },
      userId: req.user._id,
    });

    res.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `Successfully deleted ${result.deletedCount} contacts.`,
    });
  } catch (err) {
    next(err);
  }
};


export const extractContactsFromFile = async (req, res, next) => {
  try {
    if (!req.file && !req.body?.text) {
      return res.status(400).json({
        success: false,
        error: { message: 'Please upload a PDF or CSV file.' },
      });
    }

    const file = req.file;
    const user = req.user;
    const geminiApiKey = decryptSecret(user?.emailConfig?.geminiApiKey) || ENV.GEMINI_API_KEY;
    const openaiApiKey = decryptSecret(user?.emailConfig?.openaiApiKey) || ENV.OPENAI_API_KEY;

    let rawExtracted = [];

    if (file) {
      const isCsv = file.mimetype === 'text/csv' || 
                    file.originalname.toLowerCase().endsWith('.csv') || 
                    file.mimetype.includes('csv') || 
                    file.mimetype.includes('text');
      const isPdf = file.mimetype === 'application/pdf' || 
                    file.originalname.toLowerCase().endsWith('.pdf');

      if (isCsv) {
        const text = file.buffer.toString('utf-8');
        rawExtracted = parseCsvOrDelimited(text);
        if (rawExtracted.length === 0 && (geminiApiKey || openaiApiKey)) {
          rawExtracted = await aiExtractFromText(text, { geminiApiKey, openaiApiKey });
        }
      } else if (isPdf) {
        if (!geminiApiKey && !openaiApiKey) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'AI API Key is required to extract contacts from PDF documents. Please configure your Gemini or OpenAI API Key in Settings.',
            },
          });
        }

        const preferredProvider = user?.emailConfig?.aiProvider || (openaiApiKey ? 'openai' : 'gemini');

        if (preferredProvider === 'openai' && openaiApiKey) {
          try {
            const pdfText = await extractPdfText(file.buffer);
            rawExtracted = await aiExtractFromText(pdfText, { openaiApiKey });
          } catch (pdfErr) {
            console.warn('[PDF OpenAI extraction failed, trying Gemini if available]:', pdfErr.message);
            if (geminiApiKey) {
              rawExtracted = await aiExtractFromPdfGemini(file.buffer, geminiApiKey);
            } else {
              throw pdfErr;
            }
          }
        } else if (geminiApiKey) {
          try {
            rawExtracted = await aiExtractFromPdfGemini(file.buffer, geminiApiKey);
          } catch (geminiErr) {
            console.warn('[Gemini PDF extraction failed, trying OpenAI fallback]:', geminiErr.message);
            if (openaiApiKey) {
              const pdfText = await extractPdfText(file.buffer);
              rawExtracted = await aiExtractFromText(pdfText, { openaiApiKey });
            } else {
              throw geminiErr;
            }
          }
        } else if (openaiApiKey) {
          const pdfText = await extractPdfText(file.buffer);
          rawExtracted = await aiExtractFromText(pdfText, { openaiApiKey });
        }
      } else {
        return res.status(400).json({
          success: false,
          error: { message: 'Unsupported file format. Please upload a PDF or CSV file.' },
        });
      }
    } else if (req.body?.text) {
      rawExtracted = parseCsvOrDelimited(req.body.text);
      if (rawExtracted.length === 0 && (geminiApiKey || openaiApiKey)) {
        rawExtracted = await aiExtractFromText(req.body.text, { geminiApiKey, openaiApiKey });
      }
    }

    // Deduplicate and filter valid emails
    const seenEmails = new Set();
    const cleanContacts = [];

    for (const item of rawExtracted) {
      const email = (item.email || '').toLowerCase().trim();
      if (!email || !email.includes('@') || seenEmails.has(email)) continue;
      seenEmails.add(email);

      cleanContacts.push({
        companyName: (item.companyName || 'Hiring Company').trim(),
        email,
        contactName: (item.contactName || 'Hiring Manager').trim(),
        position: (item.position || 'Software Engineer').trim(),
        notes: (item.notes || '').trim(),
        tags: ['Extracted Lead'],
      });
    }

    if (cleanContacts.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'No valid company email contacts could be found in the uploaded file.' },
      });
    }

    res.json({
      success: true,
      count: cleanContacts.length,
      contacts: cleanContacts,
    });
  } catch (err) {
    console.error('[extractContactsFromFile Error]:', err.message);
    let cleanMsg = err.message || 'Failed to extract contacts from file.';
    if (cleanMsg.includes('API key not valid') || cleanMsg.includes('API_KEY_INVALID')) {
      cleanMsg = 'Invalid AI API Key. Please verify your OpenAI or Gemini key in Settings.';
    } else if (cleanMsg.includes('quota') || cleanMsg.includes('RESOURCE_EXHAUSTED')) {
      cleanMsg = 'AI API quota exceeded. Please check your account balance.';
    }
    res.status(400).json({
      success: false,
      error: { message: cleanMsg },
    });
  }
};

