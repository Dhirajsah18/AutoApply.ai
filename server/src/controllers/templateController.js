import { EmailTemplate } from '../models/EmailTemplate.js';

const DEFAULT_TEMPLATES = [
  {
    name: 'High-Impact Cold Outreach',
    category: 'cold_outreach',
    subject: 'Application for {{position}} - {{userName}}',
    body: `Dear {{recipientName}},\n\nI hope you are doing well.\n\nI am writing to express my strong interest in the {{position}} role at {{companyName}}. With hands-on expertise in {{skills}}, I have built and scaled high-performance web applications and resilient backend architectures.\n\nI admire {{companyName}}'s mission and would love the opportunity to bring my technical experience to your engineering team.\n\nAttached is my resume for your consideration. You can also view my projects here:\n• Portfolio: {{portfolio}}\n• GitHub: {{github}}\n• LinkedIn: {{linkedin}}\n\nCould we schedule a quick 10-minute call this week to discuss how I can contribute to {{companyName}}?\n\nThank you for your time,\n{{userName}}`,
  },
  {
    name: 'Gentle Follow-Up (After 5 Days)',
    category: 'follow_up',
    subject: 'Following up: Application for {{position}} - {{userName}}',
    body: `Hi {{recipientName}},\n\nI hope you are having a productive week.\n\nI am following up on my application sent last week for the {{position}} position at {{companyName}}. I remain very enthusiastic about the opportunity to contribute to your engineering goals.\n\nPlease let me know if you need any additional details, code samples, or references.\n\nLooking forward to hearing from you!\n\nBest regards,\n{{userName}}`,
  },
  {
    name: 'Referral & Engineering Intro',
    category: 'referral_request',
    subject: 'Exploring {{position}} opportunities at {{companyName}} - {{userName}}',
    body: `Hi {{recipientName}},\n\nI came across your profile while researching {{companyName}}'s engineering team and was really impressed by the work your team is delivering.\n\nI am currently looking for {{position}} roles where I can leverage my experience in {{skills}}. I would love to connect and learn more about your engineering culture and open roles.\n\nAttached is my resume. Thank you so much for your time and guidance!\n\nBest,\n{{userName}}`,
  },
];

export const listTemplates = async (req, res, next) => {
  try {
    let templates = await EmailTemplate.find({ userId: req.user._id }).sort({ createdAt: -1 });

    // If user has no templates yet, seed default templates
    if (templates.length === 0) {
      const seeded = await EmailTemplate.insertMany(
        DEFAULT_TEMPLATES.map(t => ({ ...t, userId: req.user._id }))
      );
      templates = seeded;
    }

    res.json({ success: true, templates });
  } catch (err) {
    next(err);
  }
};

export const createTemplate = async (req, res, next) => {
  try {
    const { name, category, subject, body, isDefault } = req.body;

    if (!name || !subject || !body) {
      return res.status(400).json({
        success: false,
        error: { message: 'Name, subject, and body are required.' },
      });
    }

    const template = await EmailTemplate.create({
      userId: req.user._id,
      name,
      category: category || 'custom',
      subject,
      body,
      isDefault: !!isDefault,
    });

    res.status(201).json({ success: true, template });
  } catch (err) {
    next(err);
  }
};

export const updateTemplate = async (req, res, next) => {
  try {
    const template = await EmailTemplate.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );

    if (!template) {
      return res.status(404).json({ success: false, error: { message: 'Template not found' } });
    }

    res.json({ success: true, template });
  } catch (err) {
    next(err);
  }
};

export const deleteTemplate = async (req, res, next) => {
  try {
    const template = await EmailTemplate.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!template) {
      return res.status(404).json({ success: false, error: { message: 'Template not found' } });
    }

    res.json({ success: true, message: 'Template deleted' });
  } catch (err) {
    next(err);
  }
};
