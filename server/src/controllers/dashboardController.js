import { Application } from '../models/Application.js';
import { Resume } from '../models/Resume.js';
import { CompanyContact } from '../models/CompanyContact.js';
import { getDailyQuotaStats } from './applicationController.js';
import { getUserQueueStatus } from '../services/emailQueueService.js';

export const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [
      totalApplications,
      totalResumes,
      totalContacts,
      sentCount,
      queuedCount,
      followUpDueCount,
      repliedCount,
      interviewCount,
      offerCount,
      rejectedCount,
      recentApplications,
      dailyQuota,
      queueStatus,
    ] = await Promise.all([
      Application.countDocuments({ userId }),
      Resume.countDocuments({ userId }),
      CompanyContact.countDocuments({ userId }),
      Application.countDocuments({ userId, status: 'SENT' }),
      Application.countDocuments({ userId, status: { $in: ['QUEUED', 'PROCESSING'] } }),
      Application.countDocuments({
        userId,
        $or: [
          { status: 'FOLLOW_UP_DUE' },
          { status: 'SENT', followUpAt: { $lte: new Date() } },
        ],
      }),
      Application.countDocuments({ userId, status: 'REPLIED' }),
      Application.countDocuments({ userId, status: 'INTERVIEW' }),
      Application.countDocuments({ userId, status: 'OFFER' }),
      Application.countDocuments({ userId, status: 'REJECTED' }),
      Application.find({ userId })
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('resumeId', 'title versionTag originalFileName')
        .lean(),
      getDailyQuotaStats(userId),
      getUserQueueStatus(userId),
    ]);

    const activeOutreach = sentCount + queuedCount + followUpDueCount + repliedCount + interviewCount;
    const responseCount = repliedCount + interviewCount + offerCount + rejectedCount;
    const responseRate = totalApplications > 0 ? Math.round((responseCount / totalApplications) * 100) : 0;
    const interviewRate = totalApplications > 0 ? Math.round((interviewCount / totalApplications) * 100) : 0;

    // Status Distribution
    const statusDistribution = [
      { name: 'Sent', value: sentCount, color: '#6366F1' },
      { name: 'Queued', value: queuedCount, color: '#38BDF8' },
      { name: 'Follow-up Due', value: followUpDueCount, color: '#F59E0B' },
      { name: 'Replied', value: repliedCount, color: '#3B82F6' },
      { name: 'Interview', value: interviewCount, color: '#10B981' },
      { name: 'Offer', value: offerCount, color: '#8B5CF6' },
      { name: 'Rejected', value: rejectedCount, color: '#EF4444' },
    ].filter((item) => item.value > 0 || totalApplications === 0);

    // Last 7 days applications trend
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const appsPastWeek = await Application.find({
      userId,
      createdAt: { $gte: sevenDaysAgo },
    }).lean();

    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const trendMap = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      const dayName = dayLabels[d.getDay()];
      trendMap[key] = { date: dayName, sent: 0, drafts: 0, queued: 0 };
    }

    appsPastWeek.forEach((app) => {
      const d = new Date(app.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      if (trendMap[key]) {
        if (app.status === 'DRAFT') {
          trendMap[key].drafts += 1;
        } else if (app.status === 'QUEUED' || app.status === 'PROCESSING') {
          trendMap[key].queued += 1;
        } else {
          trendMap[key].sent += 1;
        }
      }
    });

    const applicationTrends = Object.values(trendMap);

    res.json({
      success: true,
      stats: {
        totalApplications,
        totalResumes,
        totalContacts,
        sentCount,
        queuedCount,
        followUpDueCount,
        interviewCount,
        offerCount,
        responseRate,
        interviewRate,
      },
      dailyQuota,
      queueStatus,
      statusDistribution,
      applicationTrends,
      recentApplications,
    });
  } catch (err) {
    next(err);
  }
};
