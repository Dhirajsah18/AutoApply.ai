import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Kanban,
  Search,
  Clock,
  Send,
  FileText,
  Trash2,
  ExternalLink,
  X,
  Paperclip,
} from 'lucide-react';
import api from '../../api/client';

const STATUS_TABS = [
  { id: 'ALL', label: 'All' },
  { id: 'SENT', label: 'Sent' },
  { id: 'FOLLOW_UP_DUE', label: 'Follow-up Due' },
  { id: 'REPLIED', label: 'Replied' },
  { id: 'INTERVIEW', label: 'Interview' },
  { id: 'OFFER', label: 'Offer' },
  { id: 'REJECTED', label: 'Rejected' },
];

const STATUS_BADGES = {
  DRAFT: 'bg-slate-100 text-slate-700 border-slate-300',
  SENT: 'bg-sky-50 text-sky-700 border-sky-300',
  FOLLOW_UP_DUE: 'bg-amber-50 text-amber-700 border-amber-300',
  REPLIED: 'bg-blue-50 text-blue-700 border-blue-300',
  INTERVIEW: 'bg-emerald-50 text-emerald-700 border-emerald-300',
  OFFER: 'bg-purple-50 text-purple-700 border-purple-300',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-300',
};

export const ApplicationTracker = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const [viewApp, setViewApp] = useState(null);
  const [followUpApp, setFollowUpApp] = useState(null);
  const [followUpSubject, setFollowUpSubject] = useState('');
  const [followUpBody, setFollowUpBody] = useState('');
  const [sendingFollowUp, setSendingFollowUp] = useState(false);

  const fetchApplications = async () => {
    try {
      let url = `/applications?status=${statusFilter}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;

      const res = await api.get(url);
      if (res.data.success) {
        setApplications(res.data.applications);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, search]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const res = await api.patch(`/applications/${appId}/status`, { status: newStatus });
      if (res.data.success) {
        fetchApplications();
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleOpenFollowUp = (app) => {
    setFollowUpApp(app);
    setFollowUpSubject(`Following up: Application for ${app.position} at ${app.companyName}`);
    setFollowUpBody(
      `Hi ${app.recipientName},\n\nI hope you are having a great week.\n\nI am writing to follow up on my application for the ${app.position} role at ${app.companyName}. I remain very interested in the position.\n\nI have re-attached my resume for your convenience. Please let me know if you would like to connect for a brief call.\n\nThank you for your time.\n\nBest regards,\nApplicant`
    );
  };

  const handleSendFollowUpSubmit = async (e) => {
    e.preventDefault();
    setSendingFollowUp(true);
    try {
      const res = await api.post(`/applications/${followUpApp._id}/follow-up`, {
        subject: followUpSubject,
        body: followUpBody,
      });

      if (res.data.success) {
        alert('Follow-up email sent successfully!');
        setFollowUpApp(null);
        fetchApplications();
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to send follow up');
    } finally {
      setSendingFollowUp(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this application record?')) {
      try {
        await api.delete(`/applications/${id}`);
        fetchApplications();
      } catch (err) {
        alert('Failed to delete application');
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5 shadow-sm">
            <Kanban className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Applications
            </h1>
            <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">
              Track your sent applications, responses, and follow-ups.
            </p>
          </div>
        </div>

        <Link
          to="/send"
          className="neo-btn-primary text-xs font-bold shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          Send Application
        </Link>
      </div>

      {/* Clean Filters & Search */}
      <div className="neo-card p-4 space-y-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-white/80 text-slate-600 border border-slate-200/80 hover:text-slate-900 hover:bg-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company, recruiter name, or email..."
            className="neo-input !pl-10 pr-4 py-2 text-xs"
          />
        </div>
      </div>

      {/* Applications Table */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 text-sm">Loading applications...</div>
      ) : applications.length > 0 ? (
        <div className="neo-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/90 text-slate-600 uppercase tracking-wider border-b border-slate-200/80 font-bold">
                <tr>
                  <th className="px-5 py-3.5">Company & Role</th>
                  <th className="px-5 py-3.5">Recruiter</th>
                  <th className="px-5 py-3.5">Resume</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-bold text-slate-900">{app.companyName}</p>
                        <p className="text-slate-500 text-[11px] font-medium">{app.position}</p>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="text-slate-800 font-semibold">{app.recipientName}</p>
                      <p className="text-slate-500 text-[10px] font-mono font-medium">{app.recipientEmail}</p>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="text-slate-600 text-[11px] font-medium">
                        {app.resumeId?.title || app.resumeTitle || 'Attached'}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                        className={`inline-flex items-center text-left pl-3 pr-6 py-1 rounded-full text-xs font-bold border cursor-pointer focus:outline-none transition-all shadow-sm ${
                          STATUS_BADGES[app.status] || 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569' stroke-width='2.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 0.45rem center',
                          backgroundSize: '0.75rem',
                          appearance: 'none',
                          WebkitAppearance: 'none',
                        }}
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="SENT">Sent</option>
                        <option value="FOLLOW_UP_DUE">Follow-up Due</option>
                        <option value="REPLIED">Replied</option>
                        <option value="INTERVIEW">Interview</option>
                        <option value="OFFER">Offer</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </td>

                    <td className="px-5 py-3.5 text-slate-500 text-[11px] font-medium">
                      {app.sentAt ? new Date(app.sentAt).toLocaleDateString() : 'Draft'}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenFollowUp(app)}
                          title="Send Follow-Up"
                          className="px-3 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 text-xs font-bold flex items-center gap-1 transition-colors shadow-sm"
                        >
                          <Clock className="w-3 h-3" /> Follow-Up
                        </button>
                        <button
                          onClick={() => setViewApp(app)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-full hover:bg-indigo-50 transition-colors"
                          title="Details"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(app._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="neo-card text-center py-12 border-dashed">
          <Kanban className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-900">No Applications Yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4 font-medium">Send your first job outreach to start tracking.</p>
          <Link
            to="/send"
            className="neo-btn-primary text-xs font-bold"
          >
            <Send className="w-3.5 h-3.5" /> Send Application
          </Link>
        </div>
      )}

      {/* Details Modal */}
      {viewApp && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="neo-card p-6 max-w-xl w-full bg-white/95 border border-slate-200/90 relative max-h-[85vh] overflow-y-auto shadow-2xl">
            <button
              onClick={() => setViewApp(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-base font-extrabold text-slate-900 mb-0.5">{viewApp.companyName}</h2>
            <p className="text-xs text-slate-500 mb-4 font-medium">{viewApp.position} • {viewApp.recipientEmail}</p>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3 text-xs mb-4">
              <div>
                <span className="text-slate-500 font-bold block mb-0.5 uppercase text-[10px]">Subject:</span>
                <p className="text-slate-900 font-bold text-sm">{viewApp.subject}</p>
              </div>
              <div>
                <span className="text-slate-500 font-bold block mb-0.5 uppercase text-[10px]">Body:</span>
                <p className="text-slate-700 whitespace-pre-line leading-relaxed font-mono">{viewApp.body}</p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setViewApp(null)}
                className="neo-btn-secondary text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Follow-up Modal */}
      {followUpApp && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="neo-card p-6 max-w-lg w-full bg-white/95 border border-slate-200/90 relative shadow-2xl">
            <button
              onClick={() => setFollowUpApp(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-base font-extrabold text-slate-900 mb-1 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" /> Send Follow-Up
            </h2>
            <p className="text-xs text-slate-500 mb-4 font-medium">
              To: <strong className="text-indigo-600">{followUpApp.recipientName}</strong> ({followUpApp.recipientEmail}) at {followUpApp.companyName}
            </p>

            <form onSubmit={handleSendFollowUpSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1 font-semibold">Subject</label>
                <input
                  type="text"
                  required
                  value={followUpSubject}
                  onChange={(e) => setFollowUpSubject(e.target.value)}
                  className="neo-input font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 mb-1 font-semibold">Message Body</label>
                <textarea
                  rows={6}
                  required
                  value={followUpBody}
                  onChange={(e) => setFollowUpBody(e.target.value)}
                  className="neo-input leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setFollowUpApp(null)}
                  className="neo-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingFollowUp}
                  className="neo-btn-primary text-xs font-bold disabled:opacity-50"
                >
                  {sendingFollowUp ? 'Sending...' : 'Send Follow-Up'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
