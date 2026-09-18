import { CompanyContact } from '../models/CompanyContact.js';

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
