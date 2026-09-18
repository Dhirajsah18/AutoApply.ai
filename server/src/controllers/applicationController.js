import mongoose from 'mongoose';
import { Application } from '../models/Application.js';
import { Resume } from '../models/Resume.js';
import { User } from '../models/User.js';
import { sendJobApplicationEmail } from '../services/emailService.js';

export const listApplications = async (req, res, next) => {
  try {
    const { status, search, limit = 50, page = 1 } = req.query;
    const query = { userId: req.user._id };

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } },
        { recipientEmail: { $regex: search, $options: 'i' } },
        { recipientName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Application.countDocuments(query);
    const applications = await Application.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .populate('resumeId', 'title versionTag originalFileName filePath type');

    res.json({
      success: true,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10)),
      applications,
    });
  } catch (err) {
    next(err);
  }
};

export const getApplication = async (req, res, next) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('resumeId')
      .populate('contactId');

    if (!application) {
      return res.status(404).json({ success: false, error: { message: 'Application not found' } });
    }

    res.json({ success: true, application });
  } catch (err) {
    next(err);
  }
};

export const createApplicationDraft = async (req, res, next) => {
  try {
    const {
      companyName,
      position,
      recipientName,
      recipientEmail,
      jobUrl,
      jobDescription,
      resumeId,
      subject,
      body,
      contactId,
    } = req.body;

    let resumeTitle = '';
    if (resumeId && mongoose.Types.ObjectId.isValid(resumeId)) {
      const r = await Resume.findOne({ _id: resumeId, userId: req.user._id });
      if (r) resumeTitle = r.title;
    }

    const application = await Application.create({
      userId: req.user._id,
      contactId: (contactId && mongoose.Types.ObjectId.isValid(contactId)) ? contactId : undefined,
      companyName,
      position,
      recipientName: recipientName || 'Hiring Manager',
      recipientEmail: recipientEmail.toLowerCase().trim(),
      jobUrl: jobUrl || '',
      jobDescription: jobDescription || '',
      resumeId: (resumeId && mongoose.Types.ObjectId.isValid(resumeId)) ? resumeId : undefined,
      resumeTitle,
      subject,
      body,
      status: 'DRAFT',
      history: [{ action: 'Draft Created', timestamp: new Date() }],
    });

    res.status(201).json({ success: true, application });
  } catch (err) {
    next(err);
  }
};

export const sendBatchApplications = async (req, res, next) => {
  try {
    const { items, resumeId, defaultSubject, defaultBody } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Please provide at least one target contact.' },
      });
    }

    const user = await User.findById(req.user._id);
    let selectedResume = null;

    if (resumeId && mongoose.Types.ObjectId.isValid(resumeId)) {
      selectedResume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    } else {
      selectedResume = await Resume.findOne({ userId: req.user._id, isDefault: true }) ||
                       await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    }

    const results = [];

    for (const item of items) {
      const companyName = item.companyName || 'Company';
      const position = item.position || 'Software Engineer';
      const recipientName = item.recipientName || item.contactName || 'Hiring Manager';
      const recipientEmail = (item.recipientEmail || item.email || '').toLowerCase().trim();

      if (!recipientEmail) continue;

      let subject = item.subject || defaultSubject || `Application for ${position} - ${user.name}`;
      let body = item.body || defaultBody || `Dear ${recipientName},\n\nPlease find my resume attached for the ${position} position at ${companyName}.\n\nBest regards,\n${user.name}`;

      // Personalize placeholders if present
      subject = subject
        .replaceAll('{{companyName}}', companyName)
        .replaceAll('{{position}}', position)
        .replaceAll('{{recipientName}}', recipientName)
        .replaceAll('{{userName}}', user.name);

      body = body
        .replaceAll('{{companyName}}', companyName)
        .replaceAll('{{position}}', position)
        .replaceAll('{{recipientName}}', recipientName)
        .replaceAll('{{userName}}', user.name)
        .replaceAll('{{portfolio}}', user.links?.portfolio || '')
        .replaceAll('{{github}}', user.links?.github || '')
        .replaceAll('{{linkedin}}', user.links?.linkedin || '');

      let deliveryResult;
      let deliveryStatus = 'PENDING';
      let messageId = '';

      try {
        deliveryResult = await sendJobApplicationEmail({
          user,
          to: recipientEmail,
          recipientName,
          subject,
          body,
          attachmentPath: selectedResume?.filePath,
          attachmentName: selectedResume?.originalFileName || `${user.name.replace(/\s+/g, '_')}_Resume.pdf`,
        });

        deliveryStatus = deliveryResult.success ? 'DELIVERED' : 'FAILED';
        messageId = deliveryResult.messageId;
      } catch (sendErr) {
        console.error(`Failed sending to ${recipientEmail}:`, sendErr.message);
        deliveryStatus = 'FAILED';
      }

      // Calculate follow-up reminder date (+5 business days)
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + 5);

      const app = await Application.create({
        userId: user._id,
        contactId: (item.contactId && mongoose.Types.ObjectId.isValid(item.contactId)) ? item.contactId : undefined,
        companyName,
        position,
        recipientName,
        recipientEmail,
        jobUrl: item.jobUrl || '',
        jobDescription: item.jobDescription || '',
        resumeId: (selectedResume?._id && mongoose.Types.ObjectId.isValid(selectedResume._id)) ? selectedResume._id : undefined,
        resumeTitle: selectedResume?.title || 'Default Resume',
        subject,
        body,
        status: deliveryStatus === 'DELIVERED' ? 'SENT' : 'DRAFT',
        deliveryStatus,
        sentAt: deliveryStatus === 'DELIVERED' ? new Date() : undefined,
        followUpAt: deliveryStatus === 'DELIVERED' ? followUpDate : undefined,
        providerMessageId: messageId,
        history: [{
          action: deliveryStatus === 'DELIVERED' ? 'Application Sent' : 'Send Failed',
          timestamp: new Date(),
          details: `Sent to ${recipientEmail} with attachment: ${selectedResume?.title || 'None'}`,
        }],
      });

      results.push(app);
    }

    res.status(201).json({
      success: true,
      count: results.length,
      applications: results,
    });
  } catch (err) {
    next(err);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, notes, followUpAt } = req.body;
    const application = await Application.findOne({ _id: req.params.id, userId: req.user._id });

    if (!application) {
      return res.status(404).json({ success: false, error: { message: 'Application not found' } });
    }

    if (status) {
      application.status = status;
      application.history.push({
        action: `Status changed to ${status}`,
        timestamp: new Date(),
      });
    }

    if (notes !== undefined) application.notes = notes;
    if (followUpAt !== undefined) application.followUpAt = followUpAt ? new Date(followUpAt) : null;

    await application.save();

    res.json({ success: true, application });
  } catch (err) {
    next(err);
  }
};

export const sendFollowUpEmail = async (req, res, next) => {
  try {
    const { subject, body } = req.body;
    const application = await Application.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('resumeId');

    if (!application) {
      return res.status(404).json({ success: false, error: { message: 'Application not found' } });
    }

    const user = await User.findById(req.user._id);

    const followUpSubject = subject || `Following up: Application for ${application.position} - ${user.name}`;
    const followUpBody = body || `Hi ${application.recipientName},\n\nI hope you are doing well. I wanted to follow up on my application for the ${application.position} role at ${application.companyName}.\n\nPlease let me know if you need any additional information.\n\nBest regards,\n${user.name}`;

    const sendResult = await sendJobApplicationEmail({
      user,
      to: application.recipientEmail,
      recipientName: application.recipientName,
      subject: followUpSubject,
      body: followUpBody,
      attachmentPath: application.resumeId?.filePath,
      attachmentName: application.resumeId?.originalFileName || 'Resume.pdf',
    });

    application.followUpCount = (application.followUpCount || 0) + 1;
    application.lastFollowUpAt = new Date();
    application.status = 'SENT';
    
    // Set next follow-up in 4 days
    const nextFollowUp = new Date();
    nextFollowUp.setDate(nextFollowUp.getDate() + 4);
    application.followUpAt = nextFollowUp;

    application.history.push({
      action: `Follow-up #${application.followUpCount} Sent`,
      timestamp: new Date(),
      details: `Message ID: ${sendResult.messageId}`,
    });

    await application.save();

    res.json({ success: true, application, message: 'Follow-up sent successfully' });
  } catch (err) {
    next(err);
  }
};

export const deleteApplication = async (req, res, next) => {
  try {
    const application = await Application.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!application) {
      return res.status(404).json({ success: false, error: { message: 'Application not found' } });
    }

    res.json({ success: true, message: 'Application record deleted' });
  } catch (err) {
    next(err);
  }
};
