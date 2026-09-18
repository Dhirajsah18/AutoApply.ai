import React, { useState, useEffect } from 'react';
import {
  FileCode2,
  Plus,
  Trash2,
  Edit3,
  Copy,
  Check,
  Sparkles,
  X,
  Tag,
  Layers,
} from 'lucide-react';
import api from '../../api/client';

const VARIABLE_TAGS = [
  { tag: '{{companyName}}', desc: 'Target Company' },
  { tag: '{{position}}', desc: 'Job Position' },
  { tag: '{{recipientName}}', desc: 'Recruiter / HR Name' },
  { tag: '{{userName}}', desc: 'Your Full Name' },
  { tag: '{{skills}}', desc: 'Your Core Skills' },
  { tag: '{{portfolio}}', desc: 'Portfolio URL' },
  { tag: '{{github}}', desc: 'GitHub URL' },
  { tag: '{{linkedin}}', desc: 'LinkedIn URL' },
];

export const EmailTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'cold_outreach',
    subject: 'Application for {{position}} - {{userName}}',
    body: '',
  });

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/templates');
      if (res.data.success) {
        setTemplates(res.data.templates);
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      category: 'cold_outreach',
      subject: 'Application for {{position}} - {{userName}}',
      body: `Dear {{recipientName}},\n\nI am writing to express my strong interest in the {{position}} role at {{companyName}}.\n\nWith my background in {{skills}}, I am confident in my ability to make an immediate impact on your team.\n\nI have attached my resume for your review.\n\nBest regards,\n{{userName}}`,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (tmpl) => {
    setEditingId(tmpl._id);
    setFormData({
      name: tmpl.name,
      category: tmpl.category,
      subject: tmpl.subject,
      body: tmpl.body,
    });
    setShowModal(true);
  };

  const handleInsertTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      body: prev.body + ` ${tag} `,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.patch(`/templates/${editingId}`, formData);
      } else {
        await api.post('/templates', formData);
      }
      setShowModal(false);
      fetchTemplates();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to save template');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this template?')) {
      try {
        await api.delete(`/templates/${id}`);
        fetchTemplates();
      } catch (err) {
        alert('Failed to delete template');
      }
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5 shadow-sm">
            <FileCode2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Email Templates
            </h1>
            <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">
              Create reusable email templates with custom placeholders.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="neo-btn-primary text-xs font-bold shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Template
        </button>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 text-sm font-medium">Loading email templates...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((tmpl) => (
            <div
              key={tmpl._id}
              className="neo-card p-5 flex flex-col justify-between hover:border-indigo-400 hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold shadow-sm">
                      <FileCode2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {tmpl.name}
                      </h3>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        {tmpl.category.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(tmpl)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-full hover:bg-indigo-50"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(tmpl._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-full hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 bg-slate-50/90 p-3 rounded-2xl border border-slate-200/80 space-y-2">
                  <p className="text-[11px] font-semibold text-slate-700">
                    <strong className="text-indigo-600 font-bold">Subject:</strong> {tmpl.subject}
                  </p>
                  <p className="text-[11px] text-slate-600 whitespace-pre-line line-clamp-4 font-mono leading-relaxed">
                    {tmpl.body}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">Personalized Fields</span>
                <button
                  onClick={() => handleCopy(tmpl._id, tmpl.body)}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1"
                >
                  {copiedId === tmpl._id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Text
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="neo-card p-6 max-w-xl w-full bg-white/95 border border-slate-200/90 relative max-h-[90vh] overflow-y-auto shadow-2xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-extrabold text-slate-900 mb-1">
              {editingId ? 'Edit Template' : 'New Template'}
            </h2>
            <p className="text-xs text-slate-500 mb-4 font-medium">Click any placeholder chip below to insert it</p>

            {/* Variable Tags Selector */}
            <div className="mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Click to Insert:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {VARIABLE_TAGS.map((v) => (
                  <button
                    key={v.tag}
                    type="button"
                    onClick={() => handleInsertTag(v.tag)}
                    title={v.desc}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-mono font-bold transition-colors shadow-sm"
                  >
                    + {v.tag}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Template Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cold Outreach Template"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="neo-input font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="neo-select font-semibold"
                  >
                    <option value="cold_outreach">Cold Outreach</option>
                    <option value="follow_up">Follow Up</option>
                    <option value="referral_request">Referral Request</option>
                    <option value="post_interview">Post-Interview</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Subject Line *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Application for {{position}} - {{userName}}"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="neo-input font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Email Body Text *</label>
                <textarea
                  rows={8}
                  required
                  placeholder="Write email template text..."
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="neo-input font-mono leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="neo-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="neo-btn-primary text-xs font-bold"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

