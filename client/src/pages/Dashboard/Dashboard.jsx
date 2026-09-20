import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Send,
  FileText,
  Users,
  Clock,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Building2,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/dashboard/summary');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = data?.stats || {
    totalApplications: 0,
    totalResumes: 0,
    totalContacts: 0,
    sentCount: 0,
    followUpDueCount: 0,
    interviewCount: 0,
    offerCount: 0,
    responseRate: 0,
  };

  const currentDayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
  const trends = data?.applicationTrends || [
    { date: 'Mon', sent: 0 },
    { date: 'Tue', sent: 0 },
    { date: 'Wed', sent: 0 },
    { date: 'Thu', sent: 0 },
    { date: 'Fri', sent: 0 },
    { date: 'Sat', sent: 0 },
    { date: 'Sun', sent: 0 },
  ];

  const sentThisWeek = trends.reduce((sum, item) => sum + (item.sent || 0), 0);
  const maxWeeklySent = Math.max(...trends.map((t) => t.sent || 0), 4);

  const totalTracked = stats.totalApplications || 0;
  const sentWidth = totalTracked > 0 ? Math.max(10, Math.round((stats.sentCount / totalTracked) * 100)) : 0;
  const interviewWidth = totalTracked > 0 ? Math.round((stats.interviewCount / totalTracked) * 100) : 0;
  const followUpWidth = totalTracked > 0 ? Math.round((stats.followUpDueCount / totalTracked) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top 3-Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Card 1: Overview Statistics (4 cols) */}
        <div className="lg:col-span-4 neo-card p-6 flex flex-col justify-between space-y-6">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overview</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">
                {stats.totalApplications > 0 ? `${stats.responseRate}%` : '0%'}
              </span>
              <span className="text-xs font-semibold text-slate-500">Response Rate</span>
            </div>

            {/* Dynamic Progress Line */}
            {totalTracked > 0 ? (
              <div className="mt-4 flex items-center gap-1.5 h-2 w-full rounded-full overflow-hidden bg-slate-200/80 p-0.5">
                {sentWidth > 0 && (
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${sentWidth}%` }} title={`Sent: ${stats.sentCount}`} />
                )}
                {interviewWidth > 0 && (
                  <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${interviewWidth}%` }} title={`Interviews: ${stats.interviewCount}`} />
                )}
                {followUpWidth > 0 && (
                  <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${followUpWidth}%` }} title={`Follow-up Due: ${stats.followUpDueCount}`} />
                )}
              </div>
            ) : (
              <div className="mt-4 flex items-center h-2 w-full rounded-full overflow-hidden bg-slate-100 p-0.5">
                <div className="h-full w-full bg-slate-200/50 rounded-full" />
              </div>
            )}
            <p className="text-[11px] text-slate-400 font-medium mt-2">
              {totalTracked > 0 ? `${totalTracked} applications in outreach pipeline` : 'No applications sent yet'}
            </p>
          </div>

          {/* Stat Pills */}
          <div className="neo-inner p-4 grid grid-cols-3 gap-2 text-center bg-white/70 border border-slate-200/70 shadow-sm">
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-1.5 shadow-sm">
                <Send className="w-4 h-4" />
              </div>
              <span className="text-sm font-extrabold text-slate-900">{stats.sentCount}</span>
              <span className="text-[11px] font-semibold text-slate-500">Sent</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-1.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-sm font-extrabold text-slate-900">{stats.interviewCount}</span>
              <span className="text-[11px] font-semibold text-slate-500">Interviews</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-1.5 shadow-sm">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-sm font-extrabold text-slate-900">{stats.followUpDueCount}</span>
              <span className="text-[11px] font-semibold text-slate-500">Follow-up</span>
            </div>
          </div>
        </div>

        {/* Card 2: Send Applications (4 cols) */}
        <div className="lg:col-span-4 neo-card p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="badge-lime">Direct Send</span>
              <span className="badge-cyan">AI Powered</span>
            </div>

            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Send Job Applications
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Write personalized emails with AI, attach your resume, and reach recruiters directly.
            </p>
          </div>

          <div className="neo-inner p-3.5 flex items-center justify-between bg-white/70 border border-slate-200/70 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="flex -space-x-2 overflow-hidden">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-600 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                  HR
                </div>
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                  AI
                </div>
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-600 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                  PDF
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-800 font-bold block">
                  {stats.totalContacts} Contacts • {stats.totalResumes} Resumes
                </span>
                <span className="text-[10.5px] text-slate-400 font-medium">
                  {stats.totalContacts > 0 ? 'Ready for email dispatch' : 'Add contacts to begin'}
                </span>
              </div>
            </div>

            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
              stats.totalContacts > 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-500'
            }`}>
              <span className={`w-2 h-2 rounded-full ${stats.totalContacts > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <span className="text-[10px] font-extrabold">{stats.totalContacts > 0 ? 'Ready' : 'Setup'}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/send')}
            className="neo-btn-primary w-full text-xs py-3 font-bold"
          >
            <Send className="w-4 h-4" />
            Send Emails
          </button>
        </div>

        {/* Card 3: Activity (4 cols) */}
        <div className="lg:col-span-4 neo-card p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Activity</span>
            <span className="badge-cyan text-[10px] py-0.5 px-2.5 flex items-center gap-1 font-bold">
              <Calendar className="w-3 h-3" /> Last 7 days
            </span>
          </div>

          <div>
            <span className="text-3xl font-black text-slate-900">{sentThisWeek}</span>
            <span className="text-xs font-semibold text-slate-500 ml-1.5">Sent this week</span>
          </div>

          {/* Dynamic Real Capsule Bar Chart */}
          <div className="flex items-end justify-between gap-2 h-24 pt-2">
            {trends.map((item, idx) => {
              const isToday = item.date === currentDayName;
              const hasActivity = (item.sent || 0) > 0;
              const barPct = hasActivity ? Math.max(18, Math.round(((item.sent || 0) / maxWeeklySent) * 100)) : 8;

              return (
                <div key={idx} className="flex flex-col items-center gap-1.5 flex-1" title={`${item.date}: ${item.sent || 0} sent`}>
                  <div className="w-full flex items-end justify-center h-16">
                    <div
                      className={`capsule-bar w-3 sm:w-3.5 transition-all duration-300 ${
                        isToday ? 'active' : ''
                      } ${!hasActivity ? '!bg-slate-200/80 !opacity-50' : ''}`}
                      style={{ height: `${barPct}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-semibold ${isToday ? 'text-indigo-600 font-extrabold' : 'text-slate-500'}`}>
                    {item.date}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Status Box */}
          <div className="neo-inner p-3 text-[11px] space-y-1.5 bg-white/70 border border-slate-200/70 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">AI Outreach:</span>
              <span className={`font-bold ${user?.emailConfig?.geminiApiKey || user?.emailConfig?.openaiApiKey ? 'text-emerald-600' : 'text-amber-600'}`}>
                {user?.emailConfig?.geminiApiKey || user?.emailConfig?.openaiApiKey ? 'Configured' : 'Key Needed'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Email Dispatch:</span>
              <span className="text-indigo-600 font-bold uppercase">{user?.emailConfig?.provider || 'Test Mode'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 4: Bottom Pipeline */}
      <div className="neo-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
            Recent Applications
          </h3>
          <Link
            to="/applications"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            View All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {data?.recentApplications && data.recentApplications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.recentApplications.slice(0, 3).map((app, idx) => (
              <div
                key={app._id}
                className="neo-inner p-4 flex flex-col justify-between space-y-3 bg-white/75 border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer rounded-2xl"
                onClick={() => navigate('/applications')}
              >
                <div>
                  <span className="text-[10px] text-slate-400 font-mono font-medium">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1 truncate">{app.position}</h4>
                  <p className="text-xs text-slate-600 font-medium truncate">{app.companyName}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className={idx === 0 ? 'badge-lime' : idx === 1 ? 'badge-cyan' : 'badge-amber'}>
                    {app.status}
                  </span>
                  <span className="text-[11px] text-slate-600 font-medium truncate max-w-[120px]">
                    {app.recipientName}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl bg-white/40">
            <p className="text-xs text-slate-500 font-medium">No applications sent yet.</p>
            <Link to="/send" className="neo-btn-primary text-xs mt-3">
              Send First Application
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

