import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  Mail,
  Building2,
  Trash2,
  Send,
  FileSpreadsheet,
  X,
  MapPin,
  Briefcase,
} from 'lucide-react';
import api from '../../api/client';

export const ContactsDirectory = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    position: 'Software Engineer',
    location: 'Remote',
    sourceUrl: '',
    notes: '',
    tags: 'Frontend, React',
  });

  const [bulkText, setBulkText] = useState('');
  const [bulkSaving, setBulkSaving] = useState(false);

  const fetchContacts = async () => {
    try {
      let url = '/contacts?';
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (selectedTag) url += `tag=${encodeURIComponent(selectedTag)}&`;

      const res = await api.get(url);
      if (res.data.success) {
        setContacts(res.data.contacts);
      }
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [search, selectedTag]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/contacts', formData);
      if (res.data.success) {
        setShowAddModal(false);
        setFormData({
          companyName: '',
          contactName: '',
          email: '',
          position: 'Software Engineer',
          location: 'Remote',
          sourceUrl: '',
          notes: '',
          tags: '',
        });
        fetchContacts();
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to add contact');
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!bulkText.trim()) return;

    setBulkSaving(true);
    try {
      const lines = bulkText.trim().split('\n');
      const parsedContacts = [];

      lines.forEach((line) => {
        const parts = line.split(',').map((p) => p.trim());
        if (parts.length >= 2) {
          let companyName = parts[0];
          let contactName = 'Hiring Manager';
          let email = '';
          let position = 'Software Engineer';

          if (parts.length === 2) {
            email = parts[1];
          } else if (parts.length === 3) {
            contactName = parts[1];
            email = parts[2];
          } else if (parts.length >= 4) {
            contactName = parts[1];
            email = parts[2];
            position = parts[3];
          }

          if (email.includes('@')) {
            parsedContacts.push({ companyName, contactName, email, position });
          }
        }
      });

      if (parsedContacts.length === 0) {
        alert('Please format lines as: Company, HR Name, Email, Position');
        setBulkSaving(false);
        return;
      }

      const res = await api.post('/contacts/bulk', { contacts: parsedContacts });
      if (res.data.success) {
        setShowBulkModal(false);
        setBulkText('');
        fetchContacts();
      }
    } catch (err) {
      alert('Failed to import contacts');
    } finally {
      setBulkSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this HR contact?')) {
      try {
        await api.delete(`/contacts/${id}`);
        fetchContacts();
      } catch (err) {
        alert('Failed to delete contact');
      }
    }
  };

  const [selectedIds, setSelectedIds] = useState([]);

  const handleToggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === contacts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(contacts.map((c) => c._id));
    }
  };

  const handleLaunchBatch = () => {
    const selectedContacts = contacts.filter((c) => selectedIds.includes(c._id));
    navigate('/send', {
      state: {
        prefillContacts: selectedContacts,
      },
    });
  };

  const handleLaunchToContact = (contact) => {
    navigate('/send', {
      state: {
        prefillContact: contact,
      },
    });
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5 shadow-sm">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              HR Contacts
            </h1>
            <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">
              Manage recruiters, HR emails, and company contacts
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <button
            onClick={() => setShowBulkModal(true)}
            className="neo-btn-secondary text-xs flex-1 sm:flex-none justify-center"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Import List
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="neo-btn-primary text-xs font-bold flex-1 sm:flex-none justify-center"
          >
            <Plus className="w-4 h-4" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Clean Search & Actions Bar */}
      <div className="neo-card p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company, recruiter name, job title, or email..."
            className="neo-input !pl-10 pr-4 py-2 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="neo-select !py-2.5 text-xs w-full sm:w-44 font-bold"
          >
            <option value="">All Categories</option>
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="Full Stack">Full Stack</option>
            <option value="Startup">Startup</option>
            <option value="Enterprise">Enterprise</option>
          </select>

          {contacts.length > 0 && (
            <button
              onClick={handleSelectAll}
              className="neo-btn-secondary text-xs !py-2.5 px-3.5 font-bold whitespace-nowrap shrink-0"
            >
              {selectedIds.length === contacts.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>
      </div>

      {/* Floating Batch Outreach Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-xl text-white px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl sm:rounded-full shadow-2xl flex flex-col xs:flex-row items-center justify-between gap-3 sm:gap-4 border border-slate-700 w-[92%] sm:w-auto max-w-md animate-in fade-in slide-in-from-bottom-5">
          <span className="text-xs font-bold text-indigo-300 whitespace-nowrap">
            ✓ {selectedIds.length} Selected
          </span>
          <button
            onClick={handleLaunchBatch}
            className="neo-btn-primary w-full xs:w-auto text-xs py-2 px-5 font-black shadow-lg shadow-indigo-500/40 justify-center"
          >
            <Send className="w-3.5 h-3.5" />
            Send Emails ({selectedIds.length})
          </button>
        </div>
      )}

      {/* Contacts List Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 text-sm font-medium">Loading contacts...</div>
      ) : contacts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((c) => {
            const isSelected = selectedIds.includes(c._id);
            return (
              <div
                key={c._id}
                className={`neo-card p-5 flex flex-col justify-between transition-all group ${
                  isSelected ? 'border-2 border-indigo-600 bg-indigo-50/20 shadow-md ring-2 ring-indigo-500/10' : 'hover:border-indigo-400 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(c._id)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                      />
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-extrabold text-sm shadow-sm shrink-0">
                        {c.companyName[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                          {c.companyName}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium truncate">{c.contactName}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-full hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs bg-slate-50/90 p-3 rounded-2xl border border-slate-200/80 mb-3 font-medium">
                    <div className="flex items-center gap-2 text-indigo-600 font-mono text-[11px] font-bold">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{c.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 text-[11px]">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{c.position}</span>
                    </div>
                    {c.location && (
                      <div className="flex items-center gap-2 text-slate-500 text-[10px]">
                        <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                        <span>{c.location}</span>
                      </div>
                    )}
                  </div>

                  {c.tags && c.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {c.tags.map((t, i) => (
                        <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 mt-2">
                  <button
                    onClick={() => handleLaunchToContact(c)}
                    className="neo-btn-primary w-full text-xs py-2 font-bold"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send Email
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-slate-200 rounded-3xl neo-card bg-white/40">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-900">No Contacts Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-0.5 mb-4 font-medium">
            Add recruiter contacts to send job applications.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="neo-btn-primary text-xs font-bold"
          >
            <Plus className="w-3.5 h-3.5" /> Add Contact
          </button>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="neo-card p-6 max-w-md w-full bg-white/95 border border-slate-200/90 relative shadow-2xl">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-base font-extrabold text-slate-900 mb-1">Add Contact</h2>
            <p className="text-xs text-slate-500 mb-4 font-medium">Enter company and recruiter details</p>

            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1 font-semibold">Company *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stripe"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="neo-input font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1 font-semibold">Recruiter Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Connor"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="neo-input"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1 font-semibold">Job Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Full Stack Developer"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="neo-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 mb-1 font-semibold">Email *</label>
                <input
                  type="email"
                  required
                  placeholder="recruiter@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="neo-input font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 mb-1 font-semibold">Tags (Optional)</label>
                <input
                  type="text"
                  placeholder="Frontend, React, Startup"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="neo-input"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="neo-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="neo-btn-primary text-xs font-bold"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="neo-card p-6 max-w-lg w-full bg-white/95 border border-slate-200/90 relative shadow-2xl">
            <button
              onClick={() => setShowBulkModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-base font-extrabold text-slate-900 mb-1">Import Contacts</h2>
            <p className="text-xs text-slate-500 mb-3 font-medium">
              Format: <code className="text-indigo-600 font-bold">Company, Recruiter Name, Email, Job Title</code>
            </p>

            <form onSubmit={handleBulkSubmit} className="space-y-3.5">
              <textarea
                rows={6}
                required
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={`Google, Sundar Team, hr@google.com, Full Stack Engineer\nStripe, Alice Recruiter, recruiting@stripe.com, Frontend Engineer`}
                className="neo-input font-mono text-xs leading-relaxed"
              />

              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="neo-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bulkSaving}
                  className="neo-btn-primary text-xs font-bold disabled:opacity-50"
                >
                  {bulkSaving ? 'Importing...' : 'Import List'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

