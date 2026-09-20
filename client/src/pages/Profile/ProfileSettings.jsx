import React, { useState } from 'react';
import {
  Settings,
  User,
  Mail,
  Key,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Server,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ProfileSettings = () => {
  const { user, updateUserProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    title: user?.title || 'Full Stack Engineer',
    skills: user?.skills ? user.skills.join(', ') : '',
    links: {
      portfolio: user?.links?.portfolio || '',
      github: user?.links?.github || '',
      linkedin: user?.links?.linkedin || '',
    },
    emailConfig: {
      provider: user?.emailConfig?.provider || 'mock',
      senderName: user?.emailConfig?.senderName || user?.name || '',
      senderEmail: user?.emailConfig?.senderEmail || user?.email || '',
      smtpHost: user?.emailConfig?.smtpHost || 'smtp.gmail.com',
      smtpPort: user?.emailConfig?.smtpPort || 587,
      smtpUser: user?.emailConfig?.smtpUser || '',
      smtpPass: user?.emailConfig?.smtpPass || '',
      resendApiKey: user?.emailConfig?.resendApiKey || '',
      geminiApiKey: user?.emailConfig?.geminiApiKey || '',
      openaiApiKey: user?.emailConfig?.openaiApiKey || '',
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await updateUserProfile(formData);
      setSuccessMsg('Settings and credentials updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5 shadow-sm">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Settings
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">
            Manage your candidate profile, AI settings, and email account.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 shadow-sm">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" /> {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Candidate Profile Info */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Personal Information
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Used to fill your resumes and personalize your email applications.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Alex Johnson"
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Job Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Full Stack Engineer"
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Skills (Comma separated)</label>
            <input
              type="text"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              placeholder="React, Node.js, Express, MongoDB, Tailwind CSS, TypeScript"
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Portfolio Link</label>
              <input
                type="text"
                value={formData.links.portfolio}
                onChange={(e) => setFormData({ ...formData, links: { ...formData.links, portfolio: e.target.value } })}
                placeholder="https://myportfolio.com"
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">GitHub Link</label>
              <input
                type="text"
                value={formData.links.github}
                onChange={(e) => setFormData({ ...formData, links: { ...formData.links, github: e.target.value } })}
                placeholder="https://github.com/username"
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">LinkedIn Link</label>
              <input
                type="text"
                value={formData.links.linkedin}
                onChange={(e) => setFormData({ ...formData, links: { ...formData.links, linkedin: e.target.value } })}
                placeholder="https://linkedin.com/in/username"
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition-all"
              />
            </div>
          </div>
        </div>

        {/* Card 2: AI Configuration */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  AI Outreach Settings
                </h2>
                <p className="text-[11px] text-slate-500 font-medium">
                  Provide your personal API key to generate tailored cold outreach emails.
                </p>
              </div>
            </div>
            {(formData.emailConfig.geminiApiKey || formData.emailConfig.openaiApiKey) ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Ready
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Key Required
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Gemini API Key <span className="text-emerald-600 font-semibold">(Recommended - 100% Free)</span>
                </label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline inline-flex items-center gap-1"
                >
                  Get Free Key ↗
                </a>
              </div>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={formData.emailConfig.geminiApiKey || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emailConfig: { ...formData.emailConfig, geminiApiKey: e.target.value },
                  })
                }
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  OpenAI API Key
                </label>
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-700 hover:underline inline-flex items-center gap-1"
                >
                  OpenAI Console ↗
                </a>
              </div>
              <input
                type="password"
                placeholder="sk-proj-..."
                value={formData.emailConfig.openaiApiKey || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emailConfig: { ...formData.emailConfig, openaiApiKey: e.target.value },
                  })
                }
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition-all"
              />
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 font-medium leading-relaxed flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Mandatory for AI features:</strong> Each user must provide their own Gemini or OpenAI key. Your key is stored securely in your private profile and is never shared with or used by anyone else.
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Email Delivery Provider */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Email Service
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Choose how you want to send your emails.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Active Email Service</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'mock', name: 'Test Mode (Sandbox)', desc: 'Test without sending real emails' },
                { id: 'smtp', name: 'Gmail / Custom SMTP', desc: 'Send from your personal Gmail or email' },
                { id: 'resend', name: 'Resend API', desc: 'Send via Resend API key' },
              ].map((p) => {
                const isActive = formData.emailConfig.provider === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        emailConfig: { ...formData.emailConfig, provider: p.id },
                      })
                    }
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      isActive
                        ? 'bg-indigo-50/90 border-2 border-indigo-600 shadow-sm ring-2 ring-indigo-500/10'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                    }`}
                  >
                    <p className={`text-xs font-extrabold ${isActive ? 'text-indigo-700' : 'text-slate-800'}`}>
                      {p.name}
                    </p>
                    <p className={`text-[10px] mt-0.5 font-medium ${isActive ? 'text-indigo-600' : 'text-slate-500'}`}>
                      {p.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {formData.emailConfig.provider === 'smtp' && (
            <div className="bg-slate-50/90 p-5 rounded-2xl border border-slate-200/80 space-y-3.5">
              <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-indigo-600" />
                SMTP Server Credentials (e.g. Gmail)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] text-slate-700 mb-1 font-bold">SMTP Host</label>
                  <input
                    type="text"
                    placeholder="smtp.gmail.com"
                    value={formData.emailConfig.smtpHost}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emailConfig: { ...formData.emailConfig, smtpHost: e.target.value },
                      })
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-700 mb-1 font-bold">SMTP Port</label>
                  <input
                    type="number"
                    value={formData.emailConfig.smtpPort}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emailConfig: { ...formData.emailConfig, smtpPort: parseInt(e.target.value, 10) },
                      })
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-700 mb-1 font-bold">Sender Email / User</label>
                  <input
                    type="email"
                    placeholder="your-email@gmail.com"
                    value={formData.emailConfig.smtpUser}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emailConfig: { ...formData.emailConfig, smtpUser: e.target.value },
                      })
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-700 mb-1 font-bold">SMTP / Gmail App Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={formData.emailConfig.smtpPass}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emailConfig: { ...formData.emailConfig, smtpPass: e.target.value },
                      })
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.emailConfig.provider === 'resend' && (
            <div className="bg-slate-50/90 p-5 rounded-2xl border border-slate-200/80 space-y-2">
              <label className="block text-xs text-slate-700 font-bold">Resend API Key</label>
              <input
                type="password"
                placeholder="re_123456789"
                value={formData.emailConfig.resendApiKey}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emailConfig: { ...formData.emailConfig, resendApiKey: e.target.value },
                  })
                }
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Save CTA */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="neo-btn-primary text-xs font-bold py-3 px-8 shadow-lg shadow-indigo-500/25 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Settings...' : 'Save All Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};


