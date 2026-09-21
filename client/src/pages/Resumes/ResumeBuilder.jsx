import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Save,
  Download,
  Plus,
  Trash2,
  ArrowLeft,
  Briefcase,
  GraduationCap,
  FolderGit2,
  User,
  CheckCircle2,
  Eye,
  ExternalLink,
  Globe,
  Mail,
  Phone,
  Code2,
  BookOpen,
  Award,
  Layers,
  Printer,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Send,
  RotateCcw,
  FilePlus2,
  Check,
  Copy,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Target,
  Edit3,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const DRAFT_STORAGE_KEY = 'autoapply_resume_builder_draft';

// Crisp GitHub SVG Icon
const GithubIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

// Crisp LinkedIn SVG Icon
const LinkedinIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// Helper to format names to Title Case (First letter capitalized)
const formatCapitalize = (str) => {
  if (!str) return '';
  if (str === str.toUpperCase() || str === str.toLowerCase()) {
    return str
      .toLowerCase()
      .split(' ')
      .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ''))
      .join(' ');
  }
  return str;
};

const getInitialResumeData = (user) => ({
  personalInfo: {
    fullName: user?.name || 'Alex Morgan',
    email: user?.email || 'alex.morgan@example.com',
    phone: '+1 (555) 019-2834',
    location: 'New York, NY',
    portfolio: user?.links?.portfolio || 'https://alexmorgan.dev',
    github: user?.links?.github || 'https://github.com/alexmorgan',
    linkedin: user?.links?.linkedin || 'https://linkedin.com/in/alexmorgan',
  },
  summary:
    'Computer Science undergraduate with experience in building secure, scalable, and data-driven software applications. Hands-on experience in building and integrating secure authentication systems, REST APIs, and scalable backend architectures. Seeking opportunities to design, build, and maintain scalable, production-ready software systems.',
  education: [
    {
      institution: 'Brainware University',
      degree: 'B.Tech in Computer Science and Engineering (AI & ML)',
      gpa: '8.9',
      dates: '2022 – 2026',
      location: 'Kolkata, West Bengal',
    },
    {
      institution: 'Kendriya Vidyalaya (CBSE)',
      degree: 'Senior Secondary Examination',
      gpa: '81%',
      dates: '2021',
      location: 'Siliguri, West Bengal',
    },
  ],
  experience: [
    {
      company: 'YBI Foundation',
      role: 'Internship in Artificial Intelligence & Generative AI',
      dates: 'Nov. 2025 – Dec. 2025',
      location: 'Kolkata, West Bengal',
      bullets: [
        'Developed a natural language to SQL system enabling non-technical users to query relational databases, supporting 100+ test queries.',
        'Analyzed schemas and relationships across 10+ structured datasets, improving SQL generation accuracy.',
        'Enhanced SQL output reliability through prompt engineering, improving query correctness by 25%.',
      ],
    },
  ],
  projects: [
    {
      name: 'V-Tube – Video Streaming Platform',
      liveUrl: 'https://vtube-stream.app',
      repoUrl: 'https://github.com/Dhirajsah18/vtube',
      technologies: 'React.js, Node.js, Express.js, MongoDB',
      dates: 'Oct. 2025 – Dec. 2025',
      bullets: [
        'Architected a scalable video sharing platform supporting user authentication and role-based access for multiple users.',
        'Integrated JWT-based authentication with protected routes across 10+ backend API endpoints.',
        'Engineered and consumed RESTful APIs for video uploads, likes, comments, playlists, and subscriptions.',
        'Applied modular backend architecture and responsive UI principles to support maintainability and future scalability.',
      ],
    },
    {
      name: 'Creative Showcase – Image Gallery Platform',
      liveUrl: 'https://creativeshowcase.app',
      repoUrl: 'https://github.com/Dhirajsah18/creative-showcase',
      technologies: 'React.js, Node.js, MongoDB',
      dates: 'Dec. 2025',
      bullets: [
        'Created a secure image gallery platform enabling user-specific media uploads and personalized dashboards.',
        'Integrated backend APIs to manage media data and enforce access control for authenticated users.',
        'Designed a responsive frontend with a dynamic masonry layout to improve user experience and usability.',
      ],
    },
    {
      name: 'Smart TODO API – Task Management Backend',
      liveUrl: 'https://smart-todo-api.app',
      repoUrl: 'https://github.com/Dhirajsah18/smart-todo-api',
      technologies: 'Node.js, Express.js, MongoDB',
      dates: 'Sep. 2025 – Oct. 2025',
      bullets: [
        'Built RESTful APIs to manage user-specific tasks, supporting CRUD operations for authenticated users.',
        'Secured 8+ API endpoints using JWT-based authentication and authorization checks.',
        'Established validation and centralized error-handling to ensure data consistency and reliable API responses.',
      ],
    },
  ],
  skillsCategories: {
    languages: 'C++, Python, HTML, CSS, JavaScript, SQL',
    frameworks: 'React.js, Node.js, Express.js',
    databases: 'MongoDB, MySQL',
    tools: 'GitHub, VS Code, Postman',
    softSkills: 'Problem Solving, Analytical Thinking, Team Collaboration, Time Management, Adaptability',
  },
  coursework: [
    'Data Structures',
    'Operating Systems',
    'Artificial Intelligence',
    'Computer Networks',
    'Algorithms',
    'DBMS',
    'Web Technologies',
    'Machine Learning',
  ],
  certifications: [
    'Intel Machine Learning and Deep Learning',
    'Internship Certificate',
    'Infosys Object Oriented Programming',
    'Infosys Programming Fundamentals',
  ],
});

export const ResumeBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentId, setCurrentId] = useState(id || null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [successToast, setSuccessToast] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState('Autosaved');
  const [zoomScale, setZoomScale] = useState(1);
  const [mobileTab, setMobileTab] = useState('edit'); // 'edit' | 'preview'
  const [autoFit, setAutoFit] = useState(true);
  const [previewWidth, setPreviewWidth] = useState(800);
  const previewScrollRef = useRef(null);

  useEffect(() => {
    if (!previewScrollRef.current) return;
    const updateWidth = () => {
      if (previewScrollRef.current) {
        setPreviewWidth(previewScrollRef.current.clientWidth);
      }
    };
    updateWidth();
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setPreviewWidth(entry.contentRect.width);
        }
      }
    });
    observer.observe(previewScrollRef.current);
    return () => observer.disconnect();
  }, []);

  const fitScale = Math.min(1, Math.max(0.35, (previewWidth - 36) / 800));
  const effectiveScale = autoFit ? Number((fitScale * zoomScale).toFixed(2)) : zoomScale;

  const [title, setTitle] = useState('Full Stack Engineer Resume');
  const [versionTag, setVersionTag] = useState('Full Stack');
  const [isDefault, setIsDefault] = useState(false);
  const [builderData, setBuilderData] = useState(() => getInitialResumeData(user));

  // AI ATS Audit State
  const [showAtsModal, setShowAtsModal] = useState(false);
  const [atsTargetRole, setAtsTargetRole] = useState('');
  const [atsJobDesc, setAtsJobDesc] = useState('');
  const [showJobDescInput, setShowJobDescInput] = useState(false);
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsError, setAtsError] = useState('');
  const [atsResult, setAtsResult] = useState(null);
  const [atsActiveTab, setAtsActiveTab] = useState('overview'); // 'overview' | 'summary' | 'bullets'
  const [copiedBulletIdx, setCopiedBulletIdx] = useState(null);
  const [addedKeywords, setAddedKeywords] = useState([]);

  const handleOpenAtsModal = () => {
    setShowAtsModal(true);
    setAtsError('');
    if (!atsTargetRole) {
      setAtsTargetRole(versionTag || title || 'Software Engineer');
    }
  };

  const handleRunAtsCheck = async () => {
    setAtsLoading(true);
    setAtsError('');
    try {
      const userKey = user?.emailConfig?.geminiApiKey || user?.emailConfig?.openaiApiKey || '';
      const res = await api.post('/ai/ats-check', {
        resumeData: builderData,
        targetRole: atsTargetRole.trim() || 'Software Engineer',
        jobDescription: atsJobDesc.trim(),
        apiKey: userKey,
      });
      if (res.data.success) {
        setAtsResult(res.data);
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Failed to analyze resume ATS.';
      setAtsError(msg);
    } finally {
      setAtsLoading(false);
    }
  };

  const handleApplyImprovedSummary = () => {
    if (!atsResult?.improvedSummary) return;
    setBuilderData((prev) => ({
      ...prev,
      summary: atsResult.improvedSummary,
    }));
    try {
      confetti({ particleCount: 60, spread: 55, origin: { y: 0.5 } });
    } catch (e) {}
    setSuccessToast('AI Enhanced Summary applied to your resume!');
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleAddMissingKeyword = (keyword) => {
    if (!keyword) return;
    setBuilderData((prev) => {
      const existingTools = prev.skillsCategories?.tools || '';
      const updatedTools = existingTools ? `${existingTools}, ${keyword}` : keyword;
      return {
        ...prev,
        skillsCategories: {
          ...prev.skillsCategories,
          tools: updatedTools,
        },
      };
    });
    setAddedKeywords((prev) => [...prev, keyword]);
  };

  const handleCopyBullet = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedBulletIdx(idx);
    setTimeout(() => setCopiedBulletIdx(null), 2500);
  };


  // Initial Data & Draft Loading
  useEffect(() => {
    if (id) {
      const fetchResume = async () => {
        setLoading(true);
        try {
          const res = await api.get(`/resumes/${id}`);
          if (res.data.success && res.data.resume) {
            const r = res.data.resume;
            setCurrentId(r._id);
            setTitle(r.title);
            setVersionTag(r.versionTag || 'Full Stack');
            setIsDefault(r.isDefault || false);
            if (r.builderData) {
              setBuilderData((prev) => ({
                ...prev,
                ...r.builderData,
                personalInfo: { ...prev.personalInfo, ...(r.builderData.personalInfo || {}) },
                skillsCategories: { ...prev.skillsCategories, ...(r.builderData.skillsCategories || {}) },
                education: r.builderData.education?.length ? r.builderData.education : prev.education,
                experience: r.builderData.experience?.length ? r.builderData.experience : prev.experience,
                projects: r.builderData.projects?.length ? r.builderData.projects : prev.projects,
                coursework: r.builderData.coursework?.length ? r.builderData.coursework : prev.coursework,
                certifications: r.builderData.certifications?.length ? r.builderData.certifications : prev.certifications,
              }));
            }
          }
        } catch (err) {
          console.error('Failed to load resume:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchResume();
    } else {
      // Check for saved local draft
      try {
        const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (parsed.builderData) {
            setTitle(parsed.title || 'Full Stack Engineer Resume');
            setVersionTag(parsed.versionTag || 'Full Stack');
            setIsDefault(parsed.isDefault || false);
            setBuilderData(parsed.builderData);
            setSuccessToast('Restored unsaved draft from your last session!');
            setTimeout(() => setSuccessToast(''), 4000);
          }
        }
      } catch (e) {
        console.error('Could not restore draft:', e);
      }
    }
  }, [id]);

  // Automatic Debounced Draft Autosave to LocalStorage
  useEffect(() => {
    if (!id) {
      const timer = setTimeout(() => {
        try {
          const draftPayload = {
            title,
            versionTag,
            isDefault,
            builderData,
            savedAt: Date.now(),
          };
          localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftPayload));
          setAutoSaveStatus('Autosaved');
        } catch (e) {
          console.error('Failed to autosave draft:', e);
        }
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [title, versionTag, isDefault, builderData, id]);

  const handleStartFresh = () => {
    if (window.confirm('Start a fresh new resume? Any unsaved edits in current draft will be reset.')) {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setCurrentId(null);
      setTitle('Full Stack Engineer Resume');
      setVersionTag('Full Stack');
      setIsDefault(false);
      setBuilderData(getInitialResumeData(user));
      setSuccessToast('Started a fresh new resume template!');
      if (id) {
        navigate('/resumes/builder');
      }
      setTimeout(() => setSuccessToast(''), 3000);
    }
  };

  const handleAddExperience = () => {
    setBuilderData({
      ...builderData,
      experience: [
        ...builderData.experience,
        {
          company: '',
          role: '',
          location: '',
          dates: '',
          bullets: [''],
        },
      ],
    });
  };

  const handleAddProject = () => {
    setBuilderData({
      ...builderData,
      projects: [
        ...builderData.projects,
        {
          name: '',
          liveUrl: '',
          repoUrl: '',
          technologies: '',
          dates: '',
          bullets: [''],
        },
      ],
    });
  };

  const handleAddEducation = () => {
    setBuilderData({
      ...builderData,
      education: [
        ...builderData.education,
        {
          institution: '',
          degree: '',
          gpa: '',
          dates: '',
          location: '',
        },
      ],
    });
  };

  // Save to database
  const saveResumeToDatabase = async () => {
    const payload = {
      title,
      versionTag,
      isDefault,
      builderData,
    };

    if (currentId) {
      const res = await api.patch(`/resumes/builder/${currentId}`, payload);
      return res.data.resume;
    } else {
      const res = await api.post('/resumes/builder', payload);
      if (res.data.resume?._id) {
        setCurrentId(res.data.resume._id);
      }
      return res.data.resume;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessToast('');
    try {
      const savedResume = await saveResumeToDatabase();
      setSuccessToast('Resume saved successfully to your Resumes Hub!');
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  // Direct Download PDF
  const handleDownloadPdf = async () => {
    setDownloading(true);
    setSuccessToast('');
    try {
      const savedResume = await saveResumeToDatabase();
      const resumeIdToDownload = savedResume?._id || currentId;

      if (!resumeIdToDownload) {
        throw new Error('Resume ID not found');
      }

      const response = await api.get(`/resumes/${resumeIdToDownload}/download`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccessToast('PDF generated and downloaded successfully!');
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      console.error('Download error:', err);
      alert('Could not download PDF. Please try saving first.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500 font-medium">Loading Resume Builder...</div>;
  }

  const p = builderData.personalInfo || {};
  const sc = builderData.skillsCategories || {};

  return (
    <div className="space-y-3 lg:space-y-4 pb-20 lg:pb-0 lg:flex-1 lg:flex lg:flex-col lg:min-h-0 lg:overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/resumes"
            className="p-2.5 rounded-full bg-white/80 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 leading-tight">
                Resume Builder
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Create and edit your resume with live preview.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons: Start Fresh, Download PDF, Save Resume */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleStartFresh}
            title="Clear all fields and start a fresh new resume"
            className="neo-btn-secondary text-xs font-semibold py-2 px-3 flex items-center gap-1.5 text-slate-600 hover:text-slate-900 flex-1 sm:flex-none justify-center"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Start Fresh</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAtsModal}
            className="neo-btn-ai text-xs font-bold py-2.5 px-3.5 shadow-md shadow-indigo-500/20 flex items-center gap-1.5 flex-1 sm:flex-none justify-center"
            title="Analyze ATS Score, fix critical gaps, and auto-optimize summary with AI"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI ATS Check</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloading || saving}
            className="neo-btn-secondary text-xs font-bold py-2.5 px-3.5 shadow-sm text-indigo-700 bg-indigo-50/80 border-indigo-200 hover:bg-indigo-100 flex items-center gap-1.5 flex-1 sm:flex-none justify-center"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            {downloading ? 'PDF...' : 'Download PDF'}
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || downloading}
            className="neo-btn-primary text-xs font-extrabold py-2.5 px-4 shadow-lg shadow-indigo-500/25 disabled:opacity-50 flex items-center gap-1.5 flex-1 sm:flex-none justify-center"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save & Add Resume'}
          </button>
        </div>
      </div>

      {/* Mobile Segmented Tab Bar: 1. Edit Details vs 2. Live Preview (Visible on screens < 1024px) */}
      <div className="lg:hidden shrink-0 flex items-center p-1 bg-slate-200/90 rounded-2xl border border-slate-300/70 shadow-inner">
        <button
          type="button"
          onClick={() => setMobileTab('edit')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
            mobileTab === 'edit'
              ? 'bg-white text-indigo-700 shadow-md shadow-slate-900/5'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Edit3 className="w-4 h-4 text-indigo-600" />
          <span>Edit Resume</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
            mobileTab === 'preview'
              ? 'bg-white text-indigo-700 shadow-md shadow-slate-900/5'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Eye className="w-4 h-4 text-indigo-600" />
          <span>Live Preview</span>
        </button>
      </div>

      {/* Success Notification Banner */}
      {successToast && (
        <div className="shrink-0 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/resumes" className="underline text-indigo-600 hover:text-indigo-800">
              View Resumes Hub
            </Link>
            <Link to="/send" className="neo-btn-primary text-[11px] py-1 px-3">
              Send in Application
            </Link>
          </div>
        </div>
      )}

      {/* Main Split Layout: Left Form (Scrollable) + Right Preview (Stationary) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start lg:items-stretch lg:flex-1 lg:min-h-0">
        {/* LEFT COLUMN: Input Form Controls (Scrollable independently) */}
        <div className={`lg:col-span-6 space-y-4 lg:h-full lg:overflow-y-auto lg:pr-2.5 pb-12 scrollbar-thin [webkit-overflow-scrolling:touch] ${mobileTab === 'edit' ? 'block' : 'hidden lg:block'}`}>
          {/* 1. Metadata Settings Card */}
          <div className="neo-card p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Resume Settings</h3>
              <button
                type="button"
                onClick={handleStartFresh}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
              >
                <FilePlus2 className="w-3.5 h-3.5" /> Start New Resume
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Resume Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="neo-input font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Version Tag</label>
                <input
                  type="text"
                  value={versionTag}
                  onChange={(e) => setVersionTag(e.target.value)}
                  className="neo-input font-bold"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="def"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
              />
              <label htmlFor="def" className="text-xs text-slate-700 font-medium cursor-pointer">
                Set as default application resume
              </label>
            </div>
          </div>

          {/* 2. Personal Information Card */}
          <div className="neo-card p-4 sm:p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" /> Header & Contact Info
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1 font-semibold">Full Name</label>
                <input
                  type="text"
                  value={p.fullName}
                  onChange={(e) => setBuilderData({ ...builderData, personalInfo: { ...p, fullName: e.target.value } })}
                  className="neo-input font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1 font-semibold">Email</label>
                <input
                  type="email"
                  value={p.email}
                  onChange={(e) => setBuilderData({ ...builderData, personalInfo: { ...p, email: e.target.value } })}
                  className="neo-input font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1 font-semibold">Phone</label>
                <input
                  type="text"
                  value={p.phone}
                  onChange={(e) => setBuilderData({ ...builderData, personalInfo: { ...p, phone: e.target.value } })}
                  className="neo-input"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1 font-semibold">Location</label>
                <input
                  type="text"
                  value={p.location}
                  onChange={(e) => setBuilderData({ ...builderData, personalInfo: { ...p, location: e.target.value } })}
                  className="neo-input"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1 font-semibold">LinkedIn Profile URL</label>
                <input
                  type="text"
                  value={p.linkedin}
                  placeholder="https://linkedin.com/in/dhiraj-kumar-sah"
                  onChange={(e) => setBuilderData({ ...builderData, personalInfo: { ...p, linkedin: e.target.value } })}
                  className="neo-input"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1 font-semibold">GitHub Profile URL</label>
                <input
                  type="text"
                  value={p.github}
                  placeholder="https://github.com/Dhirajsah18"
                  onChange={(e) => setBuilderData({ ...builderData, personalInfo: { ...p, github: e.target.value } })}
                  className="neo-input"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-slate-600 mb-1 font-semibold">Portfolio URL</label>
                <input
                  type="text"
                  value={p.portfolio}
                  placeholder="https://personal-portfolio.dev"
                  onChange={(e) => setBuilderData({ ...builderData, personalInfo: { ...p, portfolio: e.target.value } })}
                  className="neo-input"
                />
              </div>
            </div>
          </div>

          {/* 3. Professional Summary */}
          <div className="neo-card p-4 sm:p-5 space-y-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Professional Summary</h3>
            <textarea
              rows={3}
              value={builderData.summary}
              onChange={(e) => setBuilderData({ ...builderData, summary: e.target.value })}
              className="neo-input leading-relaxed font-serif text-xs"
            />
          </div>

          {/* 4. Education */}
          <div className="neo-card p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-600" /> Education
              </h3>
              <button
                type="button"
                onClick={handleAddEducation}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Education
              </button>
            </div>

            {builderData.education.map((edu, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-2.5 relative">
                <button
                  type="button"
                  onClick={() => setBuilderData({ ...builderData, education: builderData.education.filter((_, i) => i !== idx) })}
                  className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 text-xs p-1 rounded-full hover:bg-rose-50"
                  title="Delete education"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-6">
                  <input
                    type="text"
                    placeholder="Institution (e.g. Brainware University)"
                    value={edu.institution}
                    onChange={(e) => {
                      const updated = [...builderData.education];
                      updated[idx].institution = e.target.value;
                      setBuilderData({ ...builderData, education: updated });
                    }}
                    className="neo-input font-bold"
                  />
                  <input
                    type="text"
                    placeholder="Dates (e.g. 2022 – 2026)"
                    value={edu.dates}
                    onChange={(e) => {
                      const updated = [...builderData.education];
                      updated[idx].dates = e.target.value;
                      setBuilderData({ ...builderData, education: updated });
                    }}
                    className="neo-input"
                  />
                  <input
                    type="text"
                    placeholder="Degree (e.g. B.Tech in CSE)"
                    value={edu.degree}
                    onChange={(e) => {
                      const updated = [...builderData.education];
                      updated[idx].degree = e.target.value;
                      setBuilderData({ ...builderData, education: updated });
                    }}
                    className="neo-input"
                  />
                  <input
                    type="text"
                    placeholder="CGPA / Percentage (e.g. 8.9)"
                    value={edu.gpa}
                    onChange={(e) => {
                      const updated = [...builderData.education];
                      updated[idx].gpa = e.target.value;
                      setBuilderData({ ...builderData, education: updated });
                    }}
                    className="neo-input"
                  />
                  <input
                    type="text"
                    placeholder="Location (e.g. Kolkata, West Bengal)"
                    value={edu.location}
                    onChange={(e) => {
                      const updated = [...builderData.education];
                      updated[idx].location = e.target.value;
                      setBuilderData({ ...builderData, education: updated });
                    }}
                    className="neo-input sm:col-span-2"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* 5. Work Experience */}
          <div className="neo-card p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-600" /> Experience
              </h3>
              <button
                type="button"
                onClick={handleAddExperience}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Experience
              </button>
            </div>

            {builderData.experience.map((exp, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-2.5 relative">
                <button
                  type="button"
                  onClick={() => setBuilderData({ ...builderData, experience: builderData.experience.filter((_, i) => i !== idx) })}
                  className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 text-xs p-1 rounded-full hover:bg-rose-50"
                  title="Delete experience"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-6">
                  <input
                    type="text"
                    placeholder="Company (e.g. YBI Foundation)"
                    value={exp.company}
                    onChange={(e) => {
                      const updated = [...builderData.experience];
                      updated[idx].company = e.target.value;
                      setBuilderData({ ...builderData, experience: updated });
                    }}
                    className="neo-input font-bold"
                  />
                  <input
                    type="text"
                    placeholder="Dates (e.g. Nov. 2025 – Dec. 2025)"
                    value={exp.dates}
                    onChange={(e) => {
                      const updated = [...builderData.experience];
                      updated[idx].dates = e.target.value;
                      setBuilderData({ ...builderData, experience: updated });
                    }}
                    className="neo-input"
                  />
                  <input
                    type="text"
                    placeholder="Role (e.g. Internship in AI)"
                    value={exp.role}
                    onChange={(e) => {
                      const updated = [...builderData.experience];
                      updated[idx].role = e.target.value;
                      setBuilderData({ ...builderData, experience: updated });
                    }}
                    className="neo-input"
                  />
                  <input
                    type="text"
                    placeholder="Location (e.g. Kolkata, West Bengal)"
                    value={exp.location}
                    onChange={(e) => {
                      const updated = [...builderData.experience];
                      updated[idx].location = e.target.value;
                      setBuilderData({ ...builderData, experience: updated });
                    }}
                    className="neo-input"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1 font-semibold">
                    Bullet Points (one accomplishment per line):
                  </label>
                  <textarea
                    rows={3}
                    placeholder="– Developed a natural language to SQL system..."
                    value={exp.bullets?.join('\n') || ''}
                    onChange={(e) => {
                      const updated = [...builderData.experience];
                      updated[idx].bullets = e.target.value.split('\n');
                      setBuilderData({ ...builderData, experience: updated });
                    }}
                    className="neo-input text-xs leading-relaxed font-serif"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* 6. Featured Projects (Live Demo Link + GitHub Code Link) */}
          <div className="neo-card p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-indigo-600" /> Featured Projects
              </h3>
              <button
                type="button"
                onClick={handleAddProject}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Project
              </button>
            </div>

            {builderData.projects.map((proj, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-2.5 relative">
                <button
                  type="button"
                  onClick={() => setBuilderData({ ...builderData, projects: builderData.projects.filter((_, i) => i !== idx) })}
                  className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 text-xs p-1 rounded-full hover:bg-rose-50"
                  title="Delete project"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-6">
                  <input
                    type="text"
                    placeholder="Project Name (e.g. V-Tube – Video Streaming Platform)"
                    value={proj.name}
                    onChange={(e) => {
                      const updated = [...builderData.projects];
                      updated[idx].name = e.target.value;
                      setBuilderData({ ...builderData, projects: updated });
                    }}
                    className="neo-input font-bold"
                  />
                  <input
                    type="text"
                    placeholder="Dates (e.g. Oct. 2025 – Dec. 2025)"
                    value={proj.dates}
                    onChange={(e) => {
                      const updated = [...builderData.projects];
                      updated[idx].dates = e.target.value;
                      setBuilderData({ ...builderData, projects: updated });
                    }}
                    className="neo-input"
                  />
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Live Demo URL (generates clickable icon)"
                      value={proj.liveUrl}
                      onChange={(e) => {
                        const updated = [...builderData.projects];
                        updated[idx].liveUrl = e.target.value;
                        setBuilderData({ ...builderData, projects: updated });
                      }}
                      className="neo-input !pl-8 text-xs"
                    />
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-600 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="GitHub Code URL (generates clickable icon)"
                      value={proj.repoUrl || proj.githubUrl || ''}
                      onChange={(e) => {
                        const updated = [...builderData.projects];
                        updated[idx].repoUrl = e.target.value;
                        updated[idx].githubUrl = e.target.value;
                        setBuilderData({ ...builderData, projects: updated });
                      }}
                      className="neo-input !pl-8 text-xs"
                    />
                    <GithubIcon className="w-3.5 h-3.5 text-indigo-600 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <input
                    type="text"
                    placeholder="Tech Stack (e.g. React.js, Node.js, Express.js, MongoDB)"
                    value={proj.technologies || (proj.techStack?.join(', ') || '')}
                    onChange={(e) => {
                      const updated = [...builderData.projects];
                      updated[idx].technologies = e.target.value;
                      setBuilderData({ ...builderData, projects: updated });
                    }}
                    className="neo-input sm:col-span-2"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1 font-semibold">
                    Bullet Points (one feature/achievement per line):
                  </label>
                  <textarea
                    rows={3}
                    placeholder="– Architected a scalable video sharing platform..."
                    value={proj.bullets?.join('\n') || ''}
                    onChange={(e) => {
                      const updated = [...builderData.projects];
                      updated[idx].bullets = e.target.value.split('\n');
                      setBuilderData({ ...builderData, projects: updated });
                    }}
                    className="neo-input text-xs leading-relaxed font-serif"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* 7. Categorized Skills */}
          <div className="neo-card p-4 sm:p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-600" /> Skills & Technologies
            </h3>
            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Languages</label>
                <input
                  type="text"
                  placeholder="C++, Python, HTML, CSS, JavaScript, SQL"
                  value={sc.languages || ''}
                  onChange={(e) => setBuilderData({ ...builderData, skillsCategories: { ...sc, languages: e.target.value } })}
                  className="neo-input"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Frameworks & Libraries</label>
                <input
                  type="text"
                  placeholder="React.js, Node.js, Express.js"
                  value={sc.frameworks || ''}
                  onChange={(e) => setBuilderData({ ...builderData, skillsCategories: { ...sc, frameworks: e.target.value } })}
                  className="neo-input"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Databases</label>
                <input
                  type="text"
                  placeholder="MongoDB, MySQL"
                  value={sc.databases || ''}
                  onChange={(e) => setBuilderData({ ...builderData, skillsCategories: { ...sc, databases: e.target.value } })}
                  className="neo-input"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Developer Tools</label>
                <input
                  type="text"
                  placeholder="GitHub, VS Code, Postman"
                  value={sc.tools || ''}
                  onChange={(e) => setBuilderData({ ...builderData, skillsCategories: { ...sc, tools: e.target.value } })}
                  className="neo-input"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Soft Skills</label>
                <input
                  type="text"
                  placeholder="Problem Solving, Analytical Thinking, Team Collaboration"
                  value={sc.softSkills || ''}
                  onChange={(e) => setBuilderData({ ...builderData, skillsCategories: { ...sc, softSkills: e.target.value } })}
                  className="neo-input"
                />
              </div>
            </div>
          </div>

          {/* 8. Relevant Coursework & Certifications */}
          <div className="neo-card p-4 sm:p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" /> Coursework & Certifications
            </h3>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Relevant Coursework (comma-separated)</label>
              <input
                type="text"
                placeholder="Data Structures, Operating Systems, DBMS, Machine Learning"
                value={builderData.coursework?.join(', ') || ''}
                onChange={(e) => setBuilderData({ ...builderData, coursework: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                className="neo-input"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Certifications (comma-separated)</label>
              <input
                type="text"
                placeholder="Intel Machine Learning, Infosys Programming Fundamentals"
                value={builderData.certifications?.map(c => typeof c === 'string' ? c : c.name).join(', ') || ''}
                onChange={(e) => setBuilderData({ ...builderData, certifications: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                className="neo-input"
              />
            </div>
          </div>

          {/* Bottom Action Bar for Easy Access */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || downloading}
              className="neo-btn-primary flex-1 py-3 text-xs font-extrabold shadow-lg shadow-indigo-500/25 justify-center min-w-[140px]"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save & Add Resume'}
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('preview')}
              className="lg:hidden neo-btn-ai py-3 px-4 text-xs font-bold justify-center flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4" />
              Preview Resume
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloading || saving}
              className="neo-btn-secondary py-3 px-4 text-xs font-bold justify-center"
            >
              <Download className="w-4 h-4 text-indigo-600" />
              Download PDF
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Resume Preview (Stationary, locked on screen) */}
        <div className={`lg:col-span-6 lg:h-full flex flex-col min-h-0 ${mobileTab === 'preview' ? 'block' : 'hidden lg:block'}`}>
          <div className="neo-card p-3 sm:p-4 border border-slate-200/90 shadow-xl flex flex-col min-h-[560px] lg:min-h-0 lg:h-full bg-white/95 overflow-hidden">
            {/* Preview Toolbar */}
            <div className="flex items-center justify-between px-2 pb-2.5 text-xs font-bold text-slate-600 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-indigo-700 font-extrabold">
                  <Eye className="w-4 h-4" /> Live View
                </span>
                {/* Mobile Back to Edit shortcut */}
                <button
                  type="button"
                  onClick={() => setMobileTab('edit')}
                  className="lg:hidden text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Edit Form
                </button>
              </div>

              {/* Zoom and Quick Actions */}
              <div className="flex items-center gap-1.5">
                {/* Fit vs 100% toggle */}
                <button
                  type="button"
                  onClick={() => {
                    setAutoFit(!autoFit);
                    setZoomScale(1);
                  }}
                  className="text-[10px] font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors"
                >
                  {autoFit ? 'Fit Width' : '100%'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAutoFit(false);
                    setZoomScale((prev) => Math.max(0.4, Number((prev - 0.1).toFixed(1))));
                  }}
                  className="p-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] text-slate-500 font-mono w-10 text-center">
                  {Math.round(effectiveScale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAutoFit(false);
                    setZoomScale((prev) => Math.min(1.4, Number((prev + 0.1).toFixed(1))));
                  }}
                  className="p-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Stationary Document Container with smooth scroll for inner paper */}
            <div
              ref={previewScrollRef}
              className="flex-1 overflow-auto mt-2.5 rounded-2xl bg-slate-200/70 p-2 sm:p-4 shadow-inner scrollbar-thin [webkit-overflow-scrolling:touch]"
              style={{ scrollBehavior: 'smooth' }}
            >
              {/* Paper Sheet Representation scaled with zoom */}
              <div
                className="bg-white text-black rounded-sm p-4 sm:p-8 shadow-md border border-slate-300 min-h-[950px] font-serif select-text text-[11px] leading-snug mx-auto origin-top transition-transform duration-150"
                style={{
                  transform: `scale(${effectiveScale})`,
                  width: '800px',
                  marginBottom: effectiveScale < 0.98 ? `-${Math.round((1 - effectiveScale) * 1020)}px` : '0px',
                }}
              >
                {/* 1. Header: Name & Contact Row */}
                <div className="text-center mb-3.5">
                  <h1 className="text-2xl sm:text-[26px] font-bold font-serif text-black tracking-wide">
                    {formatCapitalize(p.fullName || 'Dhiraj Kumar Sah')}
                  </h1>

                  {/* Contact links bar with properly aligned icons */}
                  <div className="text-[11.5px] text-black font-serif mt-1.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
                    {p.phone && (
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-black shrink-0" />
                        <span>{p.phone}</span>
                      </span>
                    )}

                    {p.email && (
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-black shrink-0" />
                        <a href={`mailto:${p.email}`} className="underline underline-offset-2 hover:text-cyan-800 transition-colors">
                          {p.email}
                        </a>
                      </span>
                    )}

                    {p.linkedin && (
                      <span className="inline-flex items-center gap-1.5">
                        <LinkedinIcon className="w-3.5 h-3.5 text-black shrink-0" />
                        <a
                          href={p.linkedin.startsWith('http') ? p.linkedin : `https://${p.linkedin}`}
                          target="_blank"
                          rel="noreferrer"
                          className="underline underline-offset-2 hover:text-cyan-800 transition-colors"
                        >
                          LinkedIn
                        </a>
                      </span>
                    )}

                    {p.github && (
                      <span className="inline-flex items-center gap-1.5">
                        <GithubIcon className="w-3.5 h-3.5 text-black shrink-0" />
                        <a
                          href={p.github.startsWith('http') ? p.github : `https://${p.github}`}
                          target="_blank"
                          rel="noreferrer"
                          className="underline underline-offset-2 hover:text-cyan-800 transition-colors"
                        >
                          GitHub
                        </a>
                      </span>
                    )}

                    {p.portfolio && (
                      <span className="inline-flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-black shrink-0" />
                        <a
                          href={p.portfolio.startsWith('http') ? p.portfolio : `https://${p.portfolio}`}
                          target="_blank"
                          rel="noreferrer"
                          className="underline underline-offset-2 hover:text-cyan-800 transition-colors"
                        >
                          Portfolio
                        </a>
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Summary */}
                {builderData.summary && (
                  <div className="mb-3.5">
                    <h2 className="text-[13px] font-bold font-serif text-black border-b border-black pb-0.5 mb-1.5 tracking-wide">
                      Summary
                    </h2>
                    <p className="text-black text-[11px] leading-relaxed text-justify">
                      {builderData.summary}
                    </p>
                  </div>
                )}

                {/* 3. Education */}
                {builderData.education?.length > 0 && (
                  <div className="mb-3.5">
                    <h2 className="text-[13px] font-bold font-serif text-black border-b border-black pb-0.5 mb-1.5 tracking-wide">
                      Education
                    </h2>
                    <div className="space-y-2">
                      {builderData.education.map((edu, idx) => (
                        <div key={idx} className="text-[11px]">
                          <div className="flex justify-between items-baseline font-serif">
                            <span className="font-bold text-black">{edu.institution || 'University Name'}</span>
                            <span className="text-black">{edu.dates || edu.graduationYear}</span>
                          </div>
                          <div className="flex justify-between items-baseline italic text-black font-serif">
                            <span>{edu.degree || 'Degree'}{edu.gpa ? `, CGPA: ${edu.gpa}` : ''}</span>
                            <span>{edu.location}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Experience */}
                {builderData.experience?.length > 0 && (
                  <div className="mb-3.5">
                    <h2 className="text-[13px] font-bold font-serif text-black border-b border-black pb-0.5 mb-1.5 tracking-wide">
                      Experience
                    </h2>
                    <div className="space-y-2.5">
                      {builderData.experience.map((exp, idx) => (
                        <div key={idx} className="text-[11px]">
                          <div className="flex justify-between items-baseline font-serif">
                            <span className="font-bold text-black">{exp.company || 'Company'}</span>
                            <span className="text-black">{exp.dates || `${exp.startDate || ''} – ${exp.endDate || ''}`}</span>
                          </div>
                          <div className="flex justify-between items-baseline italic text-black font-serif">
                            <span>{exp.role || 'Role'}</span>
                            <span>{exp.location}</span>
                          </div>
                          {exp.bullets?.length > 0 && (
                            <ul className="mt-1 space-y-1 text-[11px] text-black font-serif">
                              {exp.bullets.filter(Boolean).map((b, i) => (
                                <li key={i} className="flex items-start">
                                  <span className="mr-1.5 shrink-0">–</span>
                                  <span className="leading-relaxed text-justify">{b}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Projects with Live Link & GitHub Clickable Icons */}
                {builderData.projects?.length > 0 && (
                  <div className="mb-3.5">
                    <h2 className="text-[13px] font-bold font-serif text-black border-b border-black pb-0.5 mb-1.5 tracking-wide">
                      Projects
                    </h2>
                    <div className="space-y-2.5">
                      {builderData.projects.map((proj, idx) => (
                        <div key={idx} className="text-[11px]">
                          <div className="flex justify-between items-baseline font-serif">
                            <div className="flex items-center flex-wrap gap-1.5">
                              <span className="font-bold text-black">{proj.name || 'Project Name'}</span>
                              
                              {/* Clickable Live Project Icon */}
                              {proj.liveUrl && (
                                <a
                                  href={proj.liveUrl.startsWith('http') ? proj.liveUrl : `https://${proj.liveUrl}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="Live Demo"
                                  className="inline-flex items-center text-black hover:text-indigo-600 transition-colors cursor-pointer"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 inline-block align-middle" />
                                </a>
                              )}

                              {/* Clickable GitHub Code Icon */}
                              {(proj.repoUrl || proj.githubUrl) && (
                                <a
                                  href={(proj.repoUrl || proj.githubUrl).startsWith('http') ? (proj.repoUrl || proj.githubUrl) : `https://${proj.repoUrl || proj.githubUrl}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="GitHub Code"
                                  className="inline-flex items-center text-black hover:text-indigo-600 transition-colors cursor-pointer"
                                >
                                  <GithubIcon className="w-3.5 h-3.5 inline-block align-middle" />
                                </a>
                              )}

                              {(proj.technologies || (proj.techStack?.length > 0)) && (
                                <span className="italic text-black text-[11px] ml-1">
                                  | {proj.technologies || proj.techStack.join(', ')}
                                </span>
                              )}
                            </div>
                            <span className="text-black whitespace-nowrap ml-2 font-serif">{proj.dates}</span>
                          </div>

                          {proj.bullets?.length > 0 && (
                            <ul className="mt-1 space-y-1 text-[11px] text-black font-serif">
                              {proj.bullets.filter(Boolean).map((b, i) => (
                                <li key={i} className="flex items-start">
                                  <span className="mr-1.5 shrink-0">–</span>
                                  <span className="leading-relaxed text-justify">{b}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. Skills */}
                <div className="mb-3.5">
                  <h2 className="text-[13px] font-bold font-serif text-black border-b border-black pb-0.5 mb-1.5 tracking-wide">
                    Skills
                  </h2>
                  <div className="space-y-1 text-[11px] text-black font-serif leading-relaxed">
                    {sc.languages && (
                      <p>
                        <strong className="font-bold">Languages:</strong> {sc.languages}
                      </p>
                    )}
                    {sc.frameworks && (
                      <p>
                        <strong className="font-bold">Frameworks & Libraries:</strong> {sc.frameworks}
                      </p>
                    )}
                    {sc.databases && (
                      <p>
                        <strong className="font-bold">Databases:</strong> {sc.databases}
                      </p>
                    )}
                    {sc.tools && (
                      <p>
                        <strong className="font-bold">Developer Tools:</strong> {sc.tools}
                      </p>
                    )}
                    {sc.softSkills && (
                      <p>
                        <strong className="font-bold">Soft Skills:</strong> {sc.softSkills}
                      </p>
                    )}
                  </div>
                </div>

                {/* 7. Relevant Coursework */}
                {builderData.coursework?.length > 0 && (
                  <div className="mb-3.5">
                    <h2 className="text-[13px] font-bold font-serif text-black border-b border-black pb-0.5 mb-1.5 tracking-wide">
                      Relevant Coursework
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-1 gap-x-2.5 text-[10.5px] text-black font-serif">
                      {builderData.coursework.map((course, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span>•</span>
                          <span>{course}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 8. Certifications */}
                {builderData.certifications?.length > 0 && (
                  <div className="mb-2">
                    <h2 className="text-[13px] font-bold font-serif text-black border-b border-black pb-0.5 mb-1.5 tracking-wide">
                      Certifications
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-2.5 text-[10.5px] text-black font-serif">
                      {builderData.certifications.map((cert, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span>•</span>
                          <span>{typeof cert === 'string' ? cert : cert.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Bottom Action Dock in Preview Mode */}
            <div className="lg:hidden flex items-center gap-2 pt-3 border-t border-slate-200 mt-2 shrink-0">
              <button
                type="button"
                onClick={() => setMobileTab('edit')}
                className="neo-btn-secondary py-2.5 px-3 text-xs font-bold flex items-center gap-1.5 text-slate-600"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Form</span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || downloading}
                className="neo-btn-primary flex-1 py-2.5 text-xs font-bold shadow-md shadow-indigo-500/25 justify-center"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Resume'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={downloading || saving}
                className="neo-btn-secondary py-2.5 px-3 text-xs font-bold justify-center"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI ATS Resume Checker & Optimizer Modal */}
      {showAtsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="neo-card p-4 sm:p-7 w-full max-w-3xl bg-white border border-slate-200/90 relative shadow-2xl transition-all my-auto max-h-[92vh] flex flex-col">
            <button
              onClick={() => setShowAtsModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-start gap-3 mb-5 pr-8 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
                <Sparkles className="w-5 h-5 text-indigo-100" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  AI ATS Resume Auditor & Optimizer
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Evaluate ATS pass rate, uncover missing keywords, and enhance your resume for recruiter screens.
                </p>
              </div>
            </div>

            {/* Target Role & Controls Form */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-4 space-y-3 shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Target Role / Job Title
                  </label>
                  <input
                    type="text"
                    value={atsTargetRole}
                    onChange={(e) => setAtsTargetRole(e.target.value)}
                    placeholder="e.g. Full Stack Developer, Backend Engineer, SDE-1"
                    className="neo-input text-xs font-semibold"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRunAtsCheck}
                  disabled={atsLoading}
                  className="neo-btn-primary text-xs font-bold py-2.5 px-5 flex items-center justify-center gap-2 shadow-md shadow-indigo-500/25 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  {atsLoading ? 'Analyzing ATS Algorithms...' : atsResult ? 'Re-Analyze Resume' : 'Scan ATS Score'}
                </button>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setShowJobDescInput(!showJobDescInput)}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                >
                  {showJobDescInput ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  {showJobDescInput ? 'Hide Job Description' : '+ Compare Against Specific Job Description (Optional)'}
                </button>

                {showJobDescInput && (
                  <div className="mt-2 animate-in fade-in">
                    <textarea
                      rows={3}
                      value={atsJobDesc}
                      onChange={(e) => setAtsJobDesc(e.target.value)}
                      placeholder="Paste target job description or requirements from LinkedIn, Indeed, etc. to get targeted keyword matching..."
                      className="neo-input font-mono text-xs leading-relaxed"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {atsError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 shrink-0">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{atsError}</span>
              </div>
            )}

            {/* Results Section */}
            {atsResult && (
              <div className="flex-1 overflow-y-auto pr-1 space-y-4">
                {/* Score Banner Bento */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="neo-card p-4 bg-gradient-to-br from-indigo-50/50 to-purple-50/30 border border-indigo-100 flex items-center gap-3.5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${
                      atsResult.atsScore >= 80
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                        : atsResult.atsScore >= 65
                        ? 'bg-amber-100 text-amber-700 border border-amber-300'
                        : 'bg-rose-100 text-rose-700 border border-rose-300'
                    }`}>
                      {atsResult.atsScore}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall ATS Score</span>
                      <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                        {atsResult.rating || (atsResult.atsScore >= 80 ? 'Strong Match' : 'Needs Work')}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium">Out of 100 benchmark</p>
                    </div>
                  </div>

                  <div className="neo-card p-4 border border-slate-200 flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-black text-base shadow-sm">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role Relevance</span>
                      <h4 className="text-sm font-extrabold text-slate-900">{atsResult.roleMatchPercentage || 85}% Match</h4>
                      <p className="text-[10px] text-slate-500 font-medium">{atsTargetRole || 'Software Engineering'}</p>
                    </div>
                  </div>

                  <div className="neo-card p-4 border border-slate-200 flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 font-black text-base shadow-sm">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Audited By</span>
                      <h4 className="text-sm font-extrabold text-slate-900 capitalize">{atsResult.provider === 'openai' ? 'OpenAI' : 'Google Gemini AI'}</h4>
                      <p className="text-[10px] text-emerald-600 font-bold">✓ Industry Standard Rules</p>
                    </div>
                  </div>
                </div>

                {/* Sub-Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setAtsActiveTab('overview')}
                    className={`flex-1 py-1.5 px-3 rounded-lg transition-all ${
                      atsActiveTab === 'overview'
                        ? 'bg-white text-slate-900 shadow-sm font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Overview & Keywords
                  </button>
                  <button
                    type="button"
                    onClick={() => setAtsActiveTab('summary')}
                    className={`flex-1 py-1.5 px-3 rounded-lg transition-all ${
                      atsActiveTab === 'summary'
                        ? 'bg-white text-slate-900 shadow-sm font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    AI Summary Optimizer
                  </button>
                  <button
                    type="button"
                    onClick={() => setAtsActiveTab('bullets')}
                    className={`flex-1 py-1.5 px-3 rounded-lg transition-all ${
                      atsActiveTab === 'bullets'
                        ? 'bg-white text-slate-900 shadow-sm font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    STAR Bullet Improver
                  </button>
                </div>

                {/* TAB 1: OVERVIEW & KEYWORDS */}
                {atsActiveTab === 'overview' && (
                  <div className="space-y-4 animate-in fade-in">
                    {/* Strengths & Gaps 2-Col */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="neo-card p-4 border border-emerald-200/80 bg-emerald-50/20 space-y-2">
                        <h4 className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ATS Strengths Found ({atsResult.strengths?.length || 0})
                        </h4>
                        <ul className="space-y-1.5 text-xs text-slate-700">
                          {atsResult.strengths?.map((s, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-emerald-500 font-bold shrink-0 mt-0.5">•</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="neo-card p-4 border border-amber-200/80 bg-amber-50/20 space-y-2">
                        <h4 className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          Critical ATS Gaps to Fix ({atsResult.criticalGaps?.length || 0})
                        </h4>
                        <ul className="space-y-1.5 text-xs text-slate-700">
                          {atsResult.criticalGaps?.map((g, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
                              <span>{g}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Missing Keywords Tag Cloud */}
                    {atsResult.missingKeywords?.length > 0 && (
                      <div className="neo-card p-4 border border-slate-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-extrabold text-slate-900">
                            Missing Keywords ({atsResult.missingKeywords.length})
                          </h4>
                          <span className="text-[10px] text-slate-400 font-medium">
                            Click any keyword to add to your Developer Tools
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {atsResult.missingKeywords.map((kw, idx) => {
                            const isAdded = addedKeywords.includes(kw);
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleAddMissingKeyword(kw)}
                                disabled={isAdded}
                                className={`text-xs px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-all ${
                                  isAdded
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 cursor-default'
                                    : 'bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border-slate-200 hover:border-indigo-300 shadow-sm'
                                }`}
                              >
                                {isAdded ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>{kw} (Added)</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{kw}</span>
                                  </>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Quick Tips */}
                    {atsResult.quickTips?.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium space-y-1">
                        <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">Pro Recruiter Tip:</span>
                        {atsResult.quickTips.map((tip, idx) => (
                          <p key={idx}>💡 {tip}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: AI SUMMARY OPTIMIZER */}
                {atsActiveTab === 'summary' && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Summary</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed font-mono">
                        {builderData.summary || 'No summary currently added.'}
                      </div>
                    </div>

                    {atsResult.improvedSummary && (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            AI ATS-Optimized Summary
                          </span>
                          <button
                            type="button"
                            onClick={handleApplyImprovedSummary}
                            className="neo-btn-primary text-xs font-bold py-1.5 px-3.5 flex items-center gap-1.5 shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Apply to Resume
                          </button>
                        </div>
                        <div className="p-4 rounded-xl bg-indigo-50/50 border-2 border-indigo-200 text-xs text-slate-800 leading-relaxed font-medium shadow-sm">
                          {atsResult.improvedSummary}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: STAR BULLETS OPTIMIZER */}
                {atsActiveTab === 'bullets' && (
                  <div className="space-y-3.5 animate-in fade-in">
                    <p className="text-xs text-slate-500 font-medium">
                      ATS algorithms prioritize bullet points formatted with the <span className="font-bold text-slate-700">STAR method</span> (Situation, Task, Action, Result) with verifiable numbers.
                    </p>

                    {atsResult.bulletImprovements?.map((item, idx) => (
                      <div key={idx} className="neo-card p-4 border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                            Section: {item.section || 'Experience'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyBullet(item.improved, idx)}
                            className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                          >
                            {copiedBulletIdx === idx ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-600 font-bold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Improved</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">Before (Passive / Weak):</span>
                          <p className="text-xs text-slate-500 bg-rose-50/60 p-2.5 rounded-lg border border-rose-100 font-mono">
                            {item.original}
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">After (STAR Method & Quantifiable):</span>
                          <p className="text-xs text-slate-800 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-200 font-medium">
                            {item.improved}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex justify-end gap-2.5 pt-4 mt-4 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setShowAtsModal(false)}
                className="neo-btn-secondary text-xs font-semibold py-2 px-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

