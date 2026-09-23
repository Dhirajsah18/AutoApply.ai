import mongoose from 'mongoose';
import { Application } from '../models/Application.js';
import { Resume } from '../models/Resume.js';
import { User } from '../models/User.js';
import { sendJobApplicationEmail } from '../services/emailService.js';
import { resolveResumeFilePath } from './resumeController.js';
import {
  calculateScheduledTimes,
  runQueueTick,
  getUserQueueStatus,
  EMAIL_QUEUE_INTERVAL_MS,
} from '../services/emailQueueService.js';

export const DAILY_APPLICATION_LIMIT = 25;

/**
 * Calculate user's daily application quota statistics (UTC-based)
 */
export const getDailyQuotaStats = async (userId) => {
  const now = new Date();
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

  // Count all applications submitted today that were queued, sent, or processed (excluding raw drafts)
  const usedToday = await Application.countDocuments({
    userId,
    createdAt: { $gte: startOfDay },
    status: { $ne: 'DRAFT' },
  });

  const remaining = Math.max(0, DAILY_APPLICATION_LIMIT - usedToday);

  return {
    dailyLimit: DAILY_APPLICATION_LIMIT,
    usedToday,
    remaining,
    resetsAt: endOfDay,
    intervalMinutes: EMAIL_QUEUE_INTERVAL_MS / 60000,
  };
};

/**
 * GET /api/applications/quota
 */
export const getDailyQuota = async (req, res, next) => {
  try {
    const quota = await getDailyQuotaStats(req.user._id);
    res.json({ success: true, quota });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/applications/queue-status
 */
export const getQueueStatus = async (req, res, next) => {
  try {
    const queue = await getUserQueueStatus(req.user._id);
    res.json({ success: true, queue });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/applications
 */
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
      .populate('resumeId', 'title versionTag originalFileName filePath type')
      .lean();

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

/**
 * GET /api/applications/:id
 */
export const getApplication = async (req, res, next) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('resumeId')
      .populate('contactId')
      .lean();

    if (!application) {
      return res.status(404).json({ success: false, error: { message: 'Application not found' } });
    }

    res.json({ success: true, application });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/applications/draft
 */
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
      const r = await Resume.findOne({ _id: resumeId, userId: req.user._id }).lean();
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

/**
 * POST /api/applications/send-batch
 * Paced email queue dispatch: 1 email every 5 minutes (enforces max 25 apps/day)
 */
export const sendBatchApplications = async (req, res, next) => {
  try {
    const { items, resumeId, defaultSubject, defaultBody } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Please provide at least one target contact.' },
      });
    }

    // 1. Validate Daily Quota (Max 25 applications/day)
    const quota = await getDailyQuotaStats(req.user._id);

    if (quota.remaining <= 0) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'DAILY_LIMIT_REACHED',
          message: `Daily limit of ${DAILY_APPLICATION_LIMIT} relevant applications reached for today. Your quota resets at midnight UTC.`,
          quota,
        },
      });
    }

    // Filter valid recipients
    const validItems = items.filter((item) => {
      const email = (item.recipientEmail || item.email || '').trim();
      return email.length > 0;
    });

    if (validItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Please provide contacts with valid email addresses.' },
      });
    }

    if (validItems.length > quota.remaining) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'QUOTA_EXCEEDED',
          message: `You selected ${validItems.length} applications, but you only have ${quota.remaining} remaining for today (Daily Limit: ${DAILY_APPLICATION_LIMIT}). Please select up to ${quota.remaining} contacts.`,
          quota,
        },
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

    // 2. Calculate 5-minute interval scheduled dispatch times for the batch
    const scheduledTimes = await calculateScheduledTimes(user._id, validItems.length);

    const createdApplications = [];

    for (let i = 0; i < validItems.length; i++) {
      const item = validItems[i];
      const scheduledFor = scheduledTimes[i];

      const companyName = item.companyName || 'Company';
      const position = item.position || 'Software Engineer';
      const recipientName = item.recipientName || item.contactName || 'Hiring Manager';
      const recipientEmail = (item.recipientEmail || item.email || '').toLowerCase().trim();

      let subject = item.subject || defaultSubject || `Application for ${position} - ${user.name}`;
      let body = item.body || defaultBody || `Dear ${recipientName},\n\nPlease find my resume attached for the ${position} position at ${companyName}.\n\nBest regards,\n${user.name}`;

      // Personalize placeholders
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
        status: 'QUEUED',
        deliveryStatus: 'PENDING',
        scheduledFor,
        queuedAt: new Date(),
        history: [{
          action: 'Queued for Delivery',
          timestamp: new Date(),
          details: `Scheduled for dispatch at ${scheduledFor.toLocaleTimeString()} (5-min anti-spam pace)`,
        }],
      });

      createdApplications.push(app);
    }

    // 3. Immediately trigger background queue worker (non-blocking)
    runQueueTick().catch((err) => console.error('[Queue Trigger Error]', err));

    const updatedQuota = await getDailyQuotaStats(user._id);

    res.status(201).json({
      success: true,
      queued: true,
      count: createdApplications.length,
      intervalMinutes: EMAIL_QUEUE_INTERVAL_MS / 60000,
      applications: createdApplications,
      quota: updatedQuota,
      message: `Successfully queued ${createdApplications.length} application(s). Dispatching 1 email every 5 minutes in background to prevent spam filters.`,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/applications/:id/status
 */
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

/**
 * POST /api/applications/:id/follow-up
 */
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

    const followUpAttachmentPath = application.resumeId ? await resolveResumeFilePath(application.resumeId) : null;

    const sendResult = await sendJobApplicationEmail({
      user,
      to: application.recipientEmail,
      recipientName: application.recipientName,
      subject: followUpSubject,
      body: followUpBody,
      attachmentPath: followUpAttachmentPath,
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

/**
 * DELETE /api/applications/:id
 */
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
