import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Send,
  Sparkles,
  FileText,
  Users,
  CheckCircle2,
  Paperclip,
  RefreshCw,
  Building2,
  Edit3,
  CheckSquare,
  Square,
  Layers,
  Zap,
  Info,
  ChevronRight,
  ArrowRight,
  FileSpreadsheet,
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export const SendWizard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [contacts, setContacts] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Outreach Mode: 'single' | 'multi'
  const [outreachMode, setOutreachMode] = useState('multi');

  // Single HR Target Form
  const [singleTarget, setSingleTarget] = useState({
    companyName: '',
    contactName: 'Hiring Manager',
    email: '',
    position: 'Full Stack Engineer',
  });
  const [selectedSingleContactId, setSelectedSingleContactId] = useState('');

  // Multi-HR Target State
  const [selectedContactIds, setSelectedContactIds] = useState([]);
  const [contactSearch, setContactSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [bulkManualText, setBulkManualText] = useState('');
  const [multiTargetTab, setMultiTargetTab] = useState('saved'); // 'saved' | 'manual'

  // Resume Selection
  const [selectedResumeId, setSelectedResumeId] = useState('');

  // Email Content & AI
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState('professional');
  const [generatingAi, setGeneratingAi] = useState(false);
  const [subject, setSubject] = useState('Application for {{position}} - {{userName}}');
  const [body, setBody] = useState(
    `Hi {{recipientName}},\n\nI hope you are doing well.\n\nI am writing to apply for the {{position}} role at {{companyName}}. With experience in {{skills}}, I build clean, reliable, and user-friendly web applications.\n\nI have attached my resume for your review. You can also view my portfolio and projects at {{portfolio}} and {{github}}.\n\nI would love the chance to discuss how I can help the team at {{companyName}}. Please let me know if you are available for a quick chat this week.\n\nThank you for your time.\n\nBest regards,\n{{userName}}`
  );

  // Sending & Results State
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sentResults, setSentResults] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, rRes, tRes] = await Promise.all([
          api.get('/contacts'),
          api.get('/resumes'),
          api.get('/templates'),
        ]);

        if (cRes.data.success) {
          setContacts(cRes.data.contacts);
          // Pre-select all contacts by default for convenience in multi-mode
          if (cRes.data.contacts.length > 0) {
            setSelectedContactIds(cRes.data.contacts.map((c) => c._id));
          }
        }

        if (rRes.data.success) {
          setResumes(rRes.data.resumes);
          const defaultResume = rRes.data.resumes.find((r) => r.isDefault) || rRes.data.resumes[0];
          if (defaultResume) {
            setSelectedResumeId(defaultResume._id);
          }
        }

        if (tRes.data.success) setTemplates(tRes.data.templates);

        // Check if navigated with prefill contacts
        if (location.state?.prefillContacts && Array.isArray(location.state.prefillContacts)) {
          setOutreachMode('multi');
          setSelectedContactIds(location.state.prefillContacts.map((c) => c._id));
        } else if (location.state?.prefillContact) {
          const c = location.state.prefillContact;
          setOutreachMode('single');
          setSingleTarget({
            companyName: c.companyName,
            contactName: c.contactName || 'Hiring Manager',
            email: c.email,
            position: c.position || 'Software Engineer',
          });
          setSelectedSingleContactId(c._id);
        }
      } catch (err) {
        console.error('Failed to load outreach data:', err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [location.state]);

  const handleSelectSingleSavedContact = (contactId) => {
    setSelectedSingleContactId(contactId);
    if (!contactId) return;
    const c = contacts.find((item) => item._id === contactId);
    if (c) {
      setSingleTarget({
        companyName: c.companyName,
        contactName: c.contactName || 'Hiring Manager',
        email: c.email,
        position: c.position || 'Software Engineer',
      });
    }
  };

  // Toggle single contact selection in Multi-mode
  const handleToggleContact = (id) => {
    if (selectedContactIds.includes(id)) {
      setSelectedContactIds(selectedContactIds.filter((item) => item !== id));
    } else {
      setSelectedContactIds([...selectedContactIds, id]);
    }
  };

  // Toggle select all contacts
  const handleSelectAll = (filteredList) => {
    const filteredIds = filteredList.map((c) => c._id);
    const allSelected = filteredIds.every((id) => selectedContactIds.includes(id));
    if (allSelected) {
      setSelectedContactIds(selectedContactIds.filter((id) => !filteredIds.includes(id)));
    } else {
      const merged = Array.from(new Set([...selectedContactIds, ...filteredIds]));
      setSelectedContactIds(merged);
    }
  };

  // Insert dynamic variable into body
  const handleInsertVariable = (variableName) => {
    setBody((prev) => `${prev} ${variableName}`);
  };

  // Filter contacts
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.companyName.toLowerCase().includes(contactSearch.toLowerCase()) ||
      (c.contactName && c.contactName.toLowerCase().includes(contactSearch.toLowerCase())) ||
      c.email.toLowerCase().includes(contactSearch.toLowerCase()) ||
      (c.position && c.position.toLowerCase().includes(contactSearch.toLowerCase()));
    const matchesCategory = selectedCategory ? (c.tags || []).includes(selectedCategory) : true;
    return matchesSearch && matchesCategory;
  });

  const handleGenerateAi = async () => {
    const hasAiKey = Boolean(user?.emailConfig?.geminiApiKey || user?.emailConfig?.openaiApiKey);
    if (!hasAiKey) {
      alert('AI API Key is required! Please go to Settings and configure your personal Gemini (Free) or OpenAI API Key to generate AI emails.');
      return;
    }

    const sampleCompany = outreachMode === 'single'
      ? singleTarget.companyName
      : (contacts.find((c) => selectedContactIds.includes(c._id))?.companyName || 'Target Company');
    
    const samplePosition = outreachMode === 'single'
      ? singleTarget.position
      : (contacts.find((c) => selectedContactIds.includes(c._id))?.position || 'Full Stack Engineer');

    setGeneratingAi(true);
    try {
      const res = await api.post('/ai/generate-email', {
        companyName: sampleCompany,
        position: samplePosition,
        recipientName: 'Hiring Manager',
        jobDescription,
        tone,
        resumeId: selectedResumeId,
      });

      if (res.data.success) {
        if (outreachMode === 'multi') {
          // Convert specific sample name back to dynamic placeholder for batch blast
          let s = res.data.subject
            .replaceAll(sampleCompany, '{{companyName}}')
            .replaceAll(samplePosition, '{{position}}');
          let b = res.data.body
            .replaceAll(sampleCompany, '{{companyName}}')
            .replaceAll(samplePosition, '{{position}}')
            .replaceAll(user?.name || '', '{{userName}}');
          setSubject(s);
          setBody(b);
        } else {
          setSubject(res.data.subject);
          setBody(res.data.body);
        }
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to generate AI email');
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleSelectTemplate = (tmplId) => {
    if (!tmplId) return;
    const tmpl = templates.find((t) => t._id === tmplId);
    if (!tmpl) return;

    if (outreachMode === 'single') {
      let s = tmpl.subject
        .replaceAll('{{companyName}}', singleTarget.companyName || '{{companyName}}')
        .replaceAll('{{position}}', singleTarget.position || '{{position}}')
        .replaceAll('{{recipientName}}', singleTarget.contactName || '{{recipientName}}')
        .replaceAll('{{userName}}', user?.name || 'Applicant');

      let b = tmpl.body
        .replaceAll('{{companyName}}', singleTarget.companyName || '{{companyName}}')
        .replaceAll('{{position}}', singleTarget.position || '{{position}}')
        .replaceAll('{{recipientName}}', singleTarget.contactName || '{{recipientName}}')
        .replaceAll('{{userName}}', user?.name || 'Applicant')
        .replaceAll('{{skills}}', user?.skills?.join(', ') || 'Full Stack Development')
        .replaceAll('{{portfolio}}', user?.links?.portfolio || '')
        .replaceAll('{{github}}', user?.links?.github || '')
        .replaceAll('{{linkedin}}', user?.links?.linkedin || '');

      setSubject(s);
      setBody(b);
    } else {
      setSubject(tmpl.subject);
      setBody(tmpl.body);
    }
  };

  const handleSendBatch = async (e) => {
    e.preventDefault();

    let itemsToSend = [];

    if (outreachMode === 'single') {
      if (!singleTarget.companyName || !singleTarget.email) {
        alert('Please provide Company Name and HR Email.');
        return;
      }
      itemsToSend = [
        {
          companyName: singleTarget.companyName,
          position: singleTarget.position || 'Full Stack Engineer',
          recipientName: singleTarget.contactName || 'Hiring Manager',
          recipientEmail: singleTarget.email,
        },
      ];
    } else {
      if (multiTargetTab === 'saved') {
        const selectedList = contacts.filter((c) => selectedContactIds.includes(c._id));
        if (selectedList.length === 0) {
          alert('Please select at least 1 HR contact from the list.');
          return;
        }
        itemsToSend = selectedList.map((c) => ({
          contactId: c._id,
          companyName: c.companyName,
          position: c.position || 'Software Engineer',
          recipientName: c.contactName || 'Hiring Manager',
          recipientEmail: c.email,
        }));
      } else {
        // Manual Bulk Text Parsing
        const lines = bulkManualText
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean);
        if (lines.length === 0) {
          alert('Please enter at least one HR contact line.');
          return;
        }
        itemsToSend = lines.map((line) => {
          const parts = line.split(',').map((p) => p.trim());
          return {
            companyName: parts[0] || 'Company',
            recipientName: parts[1] || 'Hiring Manager',
            recipientEmail: parts[2] || parts[0],
            position: parts[3] || 'Software Engineer',
          };
        });
      }
    }

    if (!subject.trim() || !body.trim()) {
      alert('Please provide an email Subject and Body.');
      return;
    }

    setSending(true);
    try {
      const payload = {
        items: itemsToSend,
        resumeId: selectedResumeId || undefined,
        defaultSubject: subject,
        defaultBody: body,
      };

      const res = await api.post('/applications/send-batch', payload);
      if (res.data.success) {
        setSentResults(res.data.applications || itemsToSend);
        setSendSuccess(true);

        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to dispatch email batch');
    } finally {
      setSending(false);
    }
  };

  const selectedResume = resumes.find((r) => r._id === selectedResumeId);

  // Live preview for first target recipient
  const sampleRecipient = outreachMode === 'single'
    ? singleTarget
    : contacts.find((c) => selectedContactIds.includes(c._id)) || {
        companyName: 'Sample Company',
        contactName: 'Hiring Manager',
        position: 'Software Engineer',
        email: 'hr@sample.com',
      };

  const previewSubject = subject
    .replaceAll('{{companyName}}', sampleRecipient.companyName || 'Company')
    .replaceAll('{{position}}', sampleRecipient.position || 'Position')
    .replaceAll('{{recipientName}}', sampleRecipient.contactName || 'Hiring Manager')
    .replaceAll('{{userName}}', user?.name || 'Applicant');

  const previewBody = body
    .replaceAll('{{companyName}}', sampleRecipient.companyName || 'Company')
    .replaceAll('{{position}}', sampleRecipient.position || 'Position')
    .replaceAll('{{recipientName}}', sampleRecipient.contactName || 'Hiring Manager')
    .replaceAll('{{userName}}', user?.name || 'Applicant')
    .replaceAll('{{skills}}', user?.skills?.join(', ') || 'Full Stack Web Development')
    .replaceAll('{{portfolio}}', user?.links?.portfolio || 'https://myportfolio.com')
    .replaceAll('{{github}}', user?.links?.github || 'https://github.com/profile')
    .replaceAll('{{linkedin}}', user?.links?.linkedin || 'https://linkedin.com/in/profile');

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5 shadow-sm">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Send Applications
            </h1>
            <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">
              Send personalized job applications with your resume attached.
            </p>
          </div>
        </div>

        {/* Outreach Mode Switcher Pill */}
        <div className="flex items-center p-1 rounded-full bg-white/90 border border-slate-200/90 shadow-sm shrink-0">
          <button
            type="button"
            onClick={() => setOutreachMode('multi')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              outreachMode === 'multi'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Send to Multiple
          </button>
          <button
            type="button"
            onClick={() => setOutreachMode('single')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              outreachMode === 'single'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Send to One
          </button>
        </div>
      </div>

      {sendSuccess ? (
        /* Sent Confirmation Screen */
        <div className="neo-card p-8 md:p-10 text-center space-y-5 border-t-4 border-t-emerald-500">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900">
              Emails Sent Successfully!
            </h2>
            <p className="text-xs md:text-sm text-slate-600 mt-1 font-medium max-w-lg mx-auto">
              Your application was sent to{' '}
              <strong className="text-indigo-600 font-extrabold">{sentResults.length} contact(s)</strong> with your attached resume.
            </p>
          </div>

          {/* List of Sent HRs */}
          <div className="max-w-xl mx-auto bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 text-left space-y-2 max-h-48 overflow-y-auto">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Sent To:
            </span>
            {sentResults.map((r, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60 last:border-0 font-medium">
                <span className="font-bold text-slate-900">{r.companyName} ({r.recipientName || r.position})</span>
                <span className="text-indigo-600 font-mono text-[11px]">{r.recipientEmail || r.email}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 pt-3">
            <Link to="/applications" className="neo-btn-primary text-xs font-bold py-2.5 px-6">
              View Applications
            </Link>
            <button
              onClick={() => {
                setSendSuccess(false);
                setSentResults([]);
              }}
              className="neo-btn-secondary text-xs font-semibold py-2.5 px-6"
            >
              Send More Emails
            </button>
          </div>
        </div>
      ) : (
        /* Main 2-Column Composer */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Target Selection & Resume (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* 1. Target Recipients Section */}
            <div className="neo-card p-5 space-y-4">
              {outreachMode === 'single' ? (
                /* SINGLE TARGET FORM */
                <>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-indigo-600" />
                      1. Recruiter Information
                    </span>

                    {contacts.length > 0 && (
                      <select
                        value={selectedSingleContactId}
                        onChange={(e) => handleSelectSingleSavedContact(e.target.value)}
                        className="neo-select neo-select-sm text-indigo-700 font-bold max-w-[210px]"
                      >
                        <option value="">Choose Saved Contact</option>
                        {contacts.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.companyName} ({c.contactName})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Company Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Google"
                        value={singleTarget.companyName}
                        onChange={(e) => setSingleTarget({ ...singleTarget, companyName: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Job Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Frontend Engineer"
                        value={singleTarget.position}
                        onChange={(e) => setSingleTarget({ ...singleTarget, position: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Recruiter Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Sarah Connor"
                        value={singleTarget.contactName}
                        onChange={(e) => setSingleTarget({ ...singleTarget, contactName: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Recruiter Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="recruiter@company.com"
                        value={singleTarget.email}
                        onChange={(e) => setSingleTarget({ ...singleTarget, email: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* MULTI-HR RECIPIENT PICKER */
                <>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-indigo-600" />
                      1. Select Contacts ({selectedContactIds.length} Selected)
                    </span>

                    <div className="flex gap-1.5 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setMultiTargetTab('saved')}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                          multiTargetTab === 'saved'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Saved ({contacts.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setMultiTargetTab('manual')}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                          multiTargetTab === 'manual'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Paste List
                      </button>
                    </div>
                  </div>

                  {multiTargetTab === 'saved' ? (
                    <div className="space-y-3">
                      {/* Search & Select All Bar */}
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          placeholder="Search by company or role..."
                          value={contactSearch}
                          onChange={(e) => setContactSearch(e.target.value)}
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => handleSelectAll(filteredContacts)}
                          className="neo-btn-secondary text-[11px] py-1.5 px-3 font-bold shrink-0"
                        >
                          {filteredContacts.every((c) => selectedContactIds.includes(c._id)) && filteredContacts.length > 0
                            ? 'Deselect All'
                            : 'Select All'}
                        </button>
                      </div>

                      {/* Contacts Checklist Box */}
                      {filteredContacts.length > 0 ? (
                        <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 border border-slate-200/80 rounded-2xl p-2 bg-slate-50/50">
                          {filteredContacts.map((c) => {
                            const isChecked = selectedContactIds.includes(c._id);
                            return (
                              <div
                                key={c._id}
                                onClick={() => handleToggleContact(c._id)}
                                className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                                  isChecked
                                    ? 'bg-indigo-50/90 border-indigo-300 shadow-sm'
                                    : 'bg-white border-slate-200/80 hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {}}
                                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 pointer-events-none"
                                  />
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-900 truncate">
                                      {c.companyName} <span className="text-slate-500 font-normal">({c.contactName})</span>
                                    </p>
                                    <p className="text-[10px] text-indigo-600 font-mono truncate">{c.email}</p>
                                  </div>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0 ml-2">
                                  {c.position || 'Engineer'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl text-xs text-slate-500 font-medium">
                          No contacts found.{' '}
                          <Link to="/contacts" className="text-indigo-600 font-bold underline">
                            Add contacts here
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Manual Paste Area */
                    <div className="space-y-2">
                      <label className="block text-[11px] text-slate-600 font-semibold">
                        Paste list (Format: <code>Company, Recruiter Name, Email, Job Title</code> per line):
                      </label>
                      <textarea
                        rows={4}
                        placeholder={`Google, Sarah Connor, hr@google.com, Frontend Engineer\nStripe, Alex Recruiter, recruiting@stripe.com, Full Stack Engineer`}
                        value={bulkManualText}
                        onChange={(e) => setBulkManualText(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 2. Resume Selector */}
            <div className="neo-card p-5 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  2. Attach Resume
                </span>
                <Link to="/resumes" className="text-[11px] text-indigo-600 font-bold hover:underline">
                  Manage Resumes
                </Link>
              </div>

              {resumes.length > 0 ? (
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="neo-select text-xs font-bold"
                >
                  {resumes.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.title} ({r.versionTag || 'General'}) {r.isDefault ? '★ Default' : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center justify-between">
                  <span>No resume uploaded yet.</span>
                  <Link to="/resumes" className="underline text-indigo-600">Upload PDF</Link>
                </div>
              )}
            </div>

            {/* 3. AI Generator & Template Shortcuts */}
            <div className="neo-card p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  3. Write with AI
                </span>

                {templates.length > 0 && (
                  <select
                    onChange={(e) => handleSelectTemplate(e.target.value)}
                    className="neo-select neo-select-sm text-slate-700 font-semibold max-w-[180px]"
                  >
                    <option value="">Choose Template</option>
                    {templates.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {!user?.emailConfig?.geminiApiKey && !user?.emailConfig?.openaiApiKey && (
                <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-[11px] font-medium flex items-center justify-between">
                  <span>⚠️ AI key needed to generate emails.</span>
                  <Link to="/settings" className="font-bold underline text-indigo-600 hover:text-indigo-700">
                    Add Free Key in Settings →
                  </Link>
                </div>
              )}

              <div>
                <label className="block text-[11px] text-slate-600 mb-1 font-semibold">Job Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Paste job details or requirements to personalize the email..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full sm:w-1/2 neo-select text-xs font-bold"
                >
                  <option value="professional">Professional</option>
                  <option value="confident">Confident & Direct</option>
                  <option value="concise">Short & Concise</option>
                  <option value="enthusiastic">Enthusiastic</option>
                </select>

                <button
                  type="button"
                  onClick={handleGenerateAi}
                  disabled={generatingAi}
                  className="w-full sm:w-1/2 neo-btn-primary text-xs py-2.5 font-bold shadow-sm justify-center"
                >
                  {generatingAi ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" /> Generate Email
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Email Editor & Send CTA (7 cols) */}
          <div className="lg:col-span-7 neo-card p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-indigo-600" />
                  Email Message
                </span>
                <span className="badge-lime text-[11px]">
                  {outreachMode === 'multi' ? `Ready (${selectedContactIds.length} Contacts)` : 'Single Send'}
                </span>
              </div>

              {/* Dynamic Variables Pill Bar */}
              {outreachMode === 'multi' && (
                <div className="bg-slate-50/90 p-3 rounded-2xl border border-slate-200/80 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Click to insert personalized fields:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: 'Company Name', tag: '{{companyName}}' },
                      { label: 'Recruiter Name', tag: '{{recipientName}}' },
                      { label: 'Job Title', tag: '{{position}}' },
                      { label: 'My Skills', tag: '{{skills}}' },
                      { label: 'Portfolio Link', tag: '{{portfolio}}' },
                      { label: 'GitHub Link', tag: '{{github}}' },
                    ].map((v) => (
                      <button
                        key={v.tag}
                        type="button"
                        onClick={() => handleInsertVariable(v.tag)}
                        className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 shadow-sm transition-all"
                      >
                        + {v.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Subject Line</label>
                <input
                  type="text"
                  required
                  placeholder="Application for {{position}} - {{userName}}"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Body</label>
                <textarea
                  rows={9}
                  required
                  placeholder="Write your email body..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 font-medium leading-relaxed placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm font-sans"
                />
              </div>

              {/* Sample Live Output Preview */}
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                  Preview (First Recipient):
                </span>
                <p className="text-xs font-bold text-slate-900">{previewSubject}</p>
                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed mt-0.5 whitespace-pre-line">
                  {previewBody}
                </p>
              </div>
            </div>

            {/* Bottom Send CTA Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-indigo-600" />
                <span>
                  Attached:{' '}
                  <strong className="text-slate-900 font-bold">
                    {selectedResume?.title || 'Default Resume'}
                  </strong>
                </span>
              </div>

              <button
                type="button"
                onClick={handleSendBatch}
                disabled={sending || (outreachMode === 'multi' && selectedContactIds.length === 0)}
                className="neo-btn-primary w-full sm:w-auto text-xs font-extrabold py-3.5 px-8 shadow-xl shadow-indigo-500/25 disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Sending Emails...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {outreachMode === 'multi'
                      ? `Send to All (${selectedContactIds.length})`
                      : 'Send Email'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
