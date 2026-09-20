import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Upload,
  Plus,
  Trash2,
  Download,
  CheckCircle,
  Star,
  FileCode,
  Layers,
  Sparkles,
  Eye,
  FileUp,
  X,
  Edit3,
} from 'lucide-react';
import api from '../../api/client';

export const ResumeHub = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    versionTag: 'Full Stack',
    isDefault: false,
    file: null,
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Edit Resume State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingResume, setEditingResume] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    versionTag: 'Full Stack',
    isDefault: false,
    file: null,
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const fetchResumes = async () => {
    try {
      const res = await api.get('/resumes');
      if (res.data.success) {
        setResumes(res.data.resumes);
      }
    } catch (err) {
      console.error('Failed to fetch resumes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleOpenEditModal = (resume) => {
    setEditingResume(resume);
    setEditFormData({
      title: resume.title || '',
      versionTag: resume.versionTag || 'Full Stack',
      isDefault: resume.isDefault || false,
      file: null,
    });
    setEditError('');
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingResume) return;

    setEditSaving(true);
    setEditError('');

    try {
      const formData = new FormData();
      formData.append('title', editFormData.title);
      formData.append('versionTag', editFormData.versionTag);
      formData.append('isDefault', editFormData.isDefault);
      if (editFormData.file) {
        formData.append('file', editFormData.file);
      }

      const res = await api.patch(`/resumes/${editingResume._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setShowEditModal(false);
        setEditingResume(null);
        fetchResumes();
      }
    } catch (err) {
      setEditError(err.response?.data?.error?.message || 'Failed to update resume.');
    } finally {
      setEditSaving(false);
    }
  };


  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setUploadData({
        ...uploadData,
        file: selected,
        title: uploadData.title || selected.name.replace(/\.[^/.]+$/, ''),
      });
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadData.file) {
      setError('Please select a PDF or DOCX file to upload.');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', uploadData.file);
    formData.append('title', uploadData.title);
    formData.append('versionTag', uploadData.versionTag);
    formData.append('isDefault', uploadData.isDefault);

    try {
      const res = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setShowUploadModal(false);
        setUploadData({ title: '', versionTag: 'Full Stack', isDefault: false, file: null });
        fetchResumes();
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to upload resume.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this resume version?')) {
      try {
        await api.delete(`/resumes/${id}`);
        fetchResumes();
      } catch (err) {
        alert('Failed to delete resume');
      }
    }
  };

  const handleDownload = async (resume) => {
    try {
      const response = await api.get(`/resumes/${resume._id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', resume.originalFileName || `${(resume.title || 'Resume').replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (err) {
      alert('Could not download file.');
    }
  };

  const handleViewResume = async (resume) => {
    try {
      const response = await api.get(`/resumes/${resume._id}/download?inline=true`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = window.URL.createObjectURL(blob);
      const pdfWindow = window.open(fileURL, '_blank');
      if (!pdfWindow || pdfWindow.closed || typeof pdfWindow.closed === 'undefined') {
        const link = document.createElement('a');
        link.href = fileURL;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (err) {
      alert('Could not open preview for this file. ' + (err.response?.data?.error?.message || ''));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5 shadow-sm">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              My Resumes
            </h1>
            <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">
              Upload or create role-specific resumes to attach to your applications.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link
            to="/resumes/builder"
            className="neo-btn-secondary text-xs flex-1 sm:flex-none justify-center"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            Create Resume
          </Link>
          <button
            onClick={() => setShowUploadModal(true)}
            className="neo-btn-primary text-xs font-bold flex-1 sm:flex-none justify-center"
          >
            <Upload className="w-4 h-4" />
            Upload Resume
          </button>
        </div>
      </div>

      {/* Resumes Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 text-sm font-medium">Loading resumes...</div>
      ) : resumes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {resumes.map((resume) => (
            <div
              key={resume._id}
              className={`neo-card p-5 relative flex flex-col justify-between transition-all duration-200 hover:border-indigo-400 hover:shadow-lg ${
                resume.isDefault ? 'border-t-4 border-t-indigo-600 shadow-md' : ''
              }`}
            >
              {/* Default Badge */}
              {resume.isDefault && (
                <span className="absolute top-4 right-4 inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-extrabold shadow-sm">
                  <Star className="w-3 h-3 fill-indigo-600 text-indigo-600" /> Default
                </span>
              )}

              <div>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 pr-12">
                    <h3 className="text-sm font-extrabold text-slate-900 truncate">{resume.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                        {resume.versionTag || 'General'}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                        {resume.type === 'builder' ? 'Built Online' : 'Uploaded PDF'}
                      </span>
                    </div>
                  </div>
                </div>

                {resume.builderData?.summary && (
                  <p className="text-xs text-slate-600 line-clamp-2 my-2.5 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/70 font-medium">
                    {resume.builderData.summary}
                  </p>
                )}

                {resume.builderData?.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 my-2">
                    {resume.builderData.skills.slice(0, 5).map((s, idx) => (
                      <span key={idx} className="text-[10px] px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                        {s}
                      </span>
                    ))}
                    {resume.builderData.skills.length > 5 && (
                      <span className="text-[10px] px-1.5 py-0.5 text-slate-400 font-bold">
                        +{resume.builderData.skills.length - 5}
                      </span>
                    )}
                  </div>
                )}

                <div className="text-[11px] text-slate-500 space-y-0.5 mt-3 pt-3 border-t border-slate-100 font-medium">
                  <p>Filename: <span className="text-slate-800 font-mono text-[10.5px] font-bold">{resume.originalFileName || 'resume.pdf'}</span></p>
                  <p>Updated: <span className="text-slate-600">{new Date(resume.updatedAt).toLocaleDateString()}</span></p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleViewResume(resume)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 transition-colors px-2.5 py-1.5 rounded-xl hover:bg-indigo-50 border border-indigo-100"
                  >
                    <Eye className="w-3.5 h-3.5" /> View PDF
                  </button>

                  {resume.type === 'builder' ? (
                    <Link
                      to={`/resumes/builder/${resume._id}`}
                      className="text-xs font-bold text-slate-700 hover:text-indigo-600 flex items-center gap-1.5 transition-colors px-2.5 py-1.5 rounded-xl hover:bg-slate-100 border border-slate-200"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-indigo-600" /> Edit Resume
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(resume)}
                      className="text-xs font-bold text-slate-700 hover:text-indigo-600 flex items-center gap-1.5 transition-colors px-2.5 py-1.5 rounded-xl hover:bg-slate-100 border border-slate-200"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-indigo-600" /> Edit Details
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleDownload(resume)}
                    title="Download PDF"
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(resume._id)}
                    title="Delete"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-slate-200 rounded-3xl neo-card bg-white/40">
          <FileUp className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Resumes Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5 font-medium">
            Upload your resume or use our online builder to create one.
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="neo-btn-primary text-xs font-bold"
          >
            <Upload className="w-4 h-4" /> Upload Resume
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FileUp className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">Upload Resume</h2>
                  <p className="text-[11px] text-slate-500 font-medium">Supported formats: PDF, DOCX (Max 10MB)</p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Resume Title</label>
                <input
                  type="text"
                  required
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  placeholder="e.g. Full Stack Developer Resume"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Category</label>
                <select
                  value={uploadData.versionTag}
                  onChange={(e) => setUploadData({ ...uploadData, versionTag: e.target.value })}
                  className="neo-select text-xs font-semibold"
                >
                  <option value="Full Stack">Full Stack Developer</option>
                  <option value="Backend">Backend Engineer</option>
                  <option value="Frontend">Frontend Developer</option>
                  <option value="Data Science">Data & AI</option>
                  <option value="Internship">Internship / Entry Level</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Select File</label>
                <div className="border border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-slate-50/70">
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={handleFileChange}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3.5 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={uploadData.isDefault}
                  onChange={(e) => setUploadData({ ...uploadData, isDefault: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <label htmlFor="isDefault" className="text-xs text-slate-700 font-bold cursor-pointer">
                  Set as default resume
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="neo-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="neo-btn-primary text-xs font-bold disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Save Resume'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Resume Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="neo-card p-6 max-w-md w-full bg-white/95 border border-slate-200/90 relative shadow-2xl">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-base font-extrabold text-slate-900 mb-1">
              Edit Resume Details
            </h2>
            <p className="text-xs text-slate-500 mb-4 font-medium">
              Update role title, category tag, or replace with an updated document.
            </p>

            {editError && (
              <div className="p-3 mb-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Resume Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Full Stack Engineer"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Role / Version Tag</label>
                <select
                  value={editFormData.versionTag}
                  onChange={(e) => setEditFormData({ ...editFormData, versionTag: e.target.value })}
                  className="neo-select text-xs font-bold"
                >
                  <option value="Full Stack">Full Stack Engineer</option>
                  <option value="Frontend">Frontend Developer</option>
                  <option value="Backend">Backend Engineer</option>
                  <option value="Data Science">Data & AI</option>
                  <option value="Internship">Internship / Entry Level</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Replace File <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="border border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-3.5 text-center cursor-pointer transition-colors bg-slate-50/70">
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setEditFormData({ ...editFormData, file: e.target.files[0] });
                      }
                    }}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3.5 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editIsDefault"
                  checked={editFormData.isDefault}
                  onChange={(e) => setEditFormData({ ...editFormData, isDefault: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                />
                <label htmlFor="editIsDefault" className="text-xs text-slate-700 font-bold cursor-pointer">
                  Set as default resume
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="neo-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="neo-btn-primary text-xs font-bold disabled:opacity-50"
                >
                  {editSaving ? 'Updating...' : 'Update Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


