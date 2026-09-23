import { Application } from '../models/Application.js';
import { User } from '../models/User.js';
import { Resume } from '../models/Resume.js';
import { sendJobApplicationEmail } from './emailService.js';
import { resolveResumeFilePath } from '../controllers/resumeController.js';

// Default interval: 5 minutes (300,000 milliseconds)
export const EMAIL_QUEUE_INTERVAL_MS = process.env.EMAIL_QUEUE_INTERVAL_MS
  ? parseInt(process.env.EMAIL_QUEUE_INTERVAL_MS, 10)
  : 5 * 60 * 1000;

let queueWorkerInterval = null;
let isProcessingTick = false;

/**
 * Calculate scheduled dispatch timestamps for a list of new applications for a user
 * Guarantees a minimum 5-minute interval between consecutive emails for the user.
 */
export const calculateScheduledTimes = async (userId, count) => {
  const now = Date.now();
  
  // Find the latest scheduled application for this user that is still QUEUED or in the future
  const latestQueued = await Application.findOne({
    userId,
    status: { $in: ['QUEUED', 'PROCESSING'] },
    scheduledFor: { $gt: new Date(now) },
  }).sort({ scheduledFor: -1 });

  let nextStartTime;
  if (latestQueued && latestQueued.scheduledFor) {
    // If user already has queued items, start 5 minutes after the latest queued email
    nextStartTime = new Date(latestQueued.scheduledFor).getTime() + EMAIL_QUEUE_INTERVAL_MS;
  } else {
    // First email dispatches in 5 seconds (immediate feel), subsequent emails every 5 minutes
    nextStartTime = now + 5000;
  }

  const scheduleList = [];
  for (let i = 0; i < count; i++) {
    scheduleList.push(new Date(nextStartTime + i * EMAIL_QUEUE_INTERVAL_MS));
  }

  return scheduleList;
};

/**
 * Process a single due application
 */
const processApplicationJob = async (appDoc) => {
  const appId = appDoc._id;
  console.log(`[Email Queue] Processing application ${appId} for ${appDoc.recipientEmail}...`);

  try {
    const user = await User.findById(appDoc.userId);
    if (!user) {
      throw new Error(`User not found for application ${appId}`);
    }

    let validAttachmentPath = null;
    let resumeFileName = `${user.name.replace(/\s+/g, '_')}_Resume.pdf`;

    if (appDoc.resumeId) {
      const resume = await Resume.findById(appDoc.resumeId);
      if (resume) {
        validAttachmentPath = await resolveResumeFilePath(resume);
        if (resume.originalFileName) resumeFileName = resume.originalFileName;
      }
    }

    // Dispatch via email service
    const deliveryResult = await sendJobApplicationEmail({
      user,
      to: appDoc.recipientEmail,
      recipientName: appDoc.recipientName,
      subject: appDoc.subject,
      body: appDoc.body,
      attachmentPath: validAttachmentPath,
      attachmentName: resumeFileName,
    });

    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() + 5);

    await Application.findByIdAndUpdate(appId, {
      status: 'SENT',
      deliveryStatus: deliveryResult.success ? 'DELIVERED' : 'FAILED',
      sentAt: new Date(),
      followUpAt: followUpDate,
      providerMessageId: deliveryResult.messageId || '',
      $push: {
        history: {
          action: 'Queued Application Sent',
          timestamp: new Date(),
          details: `Sent to ${appDoc.recipientEmail} via 5-min paced queue. Message ID: ${deliveryResult.messageId || 'N/A'}`,
        },
      },
    });

    console.log(`[Email Queue] ✓ Successfully dispatched application ${appId} to ${appDoc.recipientEmail}`);
  } catch (err) {
    console.error(`[Email Queue] ✗ Error processing application ${appId}:`, err.message);

    const updatedApp = await Application.findById(appId);
    const retryCount = (updatedApp?.retryCount || 0) + 1;

    if (retryCount < 3) {
      // Retry in 5 minutes
      const retryTime = new Date(Date.now() + EMAIL_QUEUE_INTERVAL_MS);
      await Application.findByIdAndUpdate(appId, {
        status: 'QUEUED',
        scheduledFor: retryTime,
        retryCount,
        $push: {
          history: {
            action: `Send Retry #${retryCount} Scheduled`,
            timestamp: new Date(),
            details: `Failed: ${err.message}. Retrying at ${retryTime.toISOString()}`,
          },
        },
      });
      console.log(`[Email Queue] Rescheduled ${appId} for retry #${retryCount} at ${retryTime.toISOString()}`);
    } else {
      // Max retries reached
      await Application.findByIdAndUpdate(appId, {
        status: 'DRAFT',
        deliveryStatus: 'FAILED',
        retryCount,
        $push: {
          history: {
            action: 'Send Failed (Max Retries)',
            timestamp: new Date(),
            details: `Failed after 3 attempts: ${err.message}`,
          },
        },
      });
      console.error(`[Email Queue] Application ${appId} marked FAILED after ${retryCount} attempts.`);
    }
  }
};

/**
 * Worker tick: checks for any pending applications ready for dispatch
 */
export const runQueueTick = async () => {
  if (isProcessingTick) return;
  isProcessingTick = true;

  try {
    const now = new Date();

    // Find up to 5 due applications that are ready to send
    const dueApplications = await Application.find({
      status: 'QUEUED',
      scheduledFor: { $lte: now },
    })
      .sort({ scheduledFor: 1 })
      .limit(5);

    if (dueApplications.length === 0) {
      isProcessingTick = false;
      return;
    }

    for (const app of dueApplications) {
      // Atomically mark as PROCESSING to prevent duplicate sends across clusters or workers
      const locked = await Application.findOneAndUpdate(
        { _id: app._id, status: 'QUEUED' },
        { status: 'PROCESSING' },
        { new: true }
      );

      if (locked) {
        await processApplicationJob(locked);
      }
    }
  } catch (err) {
    console.error('[Email Queue] Error during queue tick:', err.message);
  } finally {
    isProcessingTick = false;
  }
};

/**
 * Start the background queue worker timer
 */
export const startQueueWorker = () => {
  if (queueWorkerInterval) return;

  console.log(`[Email Queue] Starting background email queue worker (Check interval: 15s, Send interval: ${EMAIL_QUEUE_INTERVAL_MS / 60000} minutes)...`);
  // Run immediately on boot
  runQueueTick();
  // Poll every 15 seconds for due applications
  queueWorkerInterval = setInterval(runQueueTick, 15000);
};

/**
 * Stop queue worker
 */
export const stopQueueWorker = () => {
  if (queueWorkerInterval) {
    clearInterval(queueWorkerInterval);
    queueWorkerInterval = null;
    console.log('[Email Queue] Stopped background email queue worker.');
  }
};

/**
 * Get queue status for a specific user
 */
export const getUserQueueStatus = async (userId) => {
  const now = new Date();

  const [queuedCount, processingCount, upcoming] = await Promise.all([
    Application.countDocuments({ userId, status: 'QUEUED' }),
    Application.countDocuments({ userId, status: 'PROCESSING' }),
    Application.find({
      userId,
      status: { $in: ['QUEUED', 'PROCESSING'] },
    })
      .sort({ scheduledFor: 1 })
      .limit(10)
      .select('companyName position recipientEmail recipientName scheduledFor status retryCount')
      .lean(),
  ]);

  const nextItem = upcoming[0] || null;
  const nextScheduledAt = nextItem ? nextItem.scheduledFor : null;
  const secondsToNext = nextScheduledAt ? Math.max(0, Math.round((new Date(nextScheduledAt) - now) / 1000)) : null;

  return {
    queuedCount,
    processingCount,
    activeCount: queuedCount + processingCount,
    intervalMinutes: EMAIL_QUEUE_INTERVAL_MS / 60000,
    nextScheduledAt,
    secondsToNext,
    upcoming,
  };
};
