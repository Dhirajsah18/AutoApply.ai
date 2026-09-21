import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Search, Send, Sparkles, Mail, ChevronRight, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = ({ onMenuToggle = () => {} }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getPageInfo = () => {
    const path = location.pathname;
    if (path.startsWith('/resumes/builder')) {
      return { category: 'App', title: 'Resume Builder' };
    }
    if (path.startsWith('/resumes')) {
      return { category: 'App', title: 'Resumes' };
    }
    if (path.startsWith('/dashboard')) {
      return { category: 'App', title: 'Dashboard' };
    }
    if (path.startsWith('/send')) {
      return { category: 'App', title: 'Send Emails' };
    }
    if (path.startsWith('/applications')) {
      return { category: 'App', title: 'Applications' };
    }
    if (path.startsWith('/contacts')) {
      return { category: 'App', title: 'HR Contacts' };
    }
    if (path.startsWith('/templates')) {
      return { category: 'App', title: 'Templates' };
    }
    if (path.startsWith('/settings')) {
      return { category: 'App', title: 'Settings' };
    }
    return { category: 'App', title: 'Dashboard' };
  };

  const pageInfo = getPageInfo();
  const provider = user?.emailConfig?.provider || 'mock';

  const geminiKey = user?.emailConfig?.geminiApiKey?.trim();
  const openaiKey = user?.emailConfig?.openaiApiKey?.trim();
  const preferredAi = user?.emailConfig?.aiProvider || 'auto';

  let activeAiBadge = null;
  if (preferredAi === 'openai' && openaiKey) {
    activeAiBadge = { label: 'ChatGPT Active', badgeClass: 'badge-lime', iconColor: 'text-emerald-600' };
  } else if (preferredAi === 'gemini' && geminiKey) {
    activeAiBadge = { label: 'Gemini Active', badgeClass: 'badge-cyan', iconColor: 'text-cyan-600' };
  } else if (openaiKey) {
    activeAiBadge = { label: 'ChatGPT Active', badgeClass: 'badge-lime', iconColor: 'text-emerald-600' };
  } else if (geminiKey) {
    activeAiBadge = { label: 'Gemini Active', badgeClass: 'badge-cyan', iconColor: 'text-cyan-600' };
  }

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-2xl px-4 sm:px-6 md:px-8 flex items-center justify-between shrink-0 z-20 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      {/* Left: Mobile Menu Button & Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs min-w-0">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl transition-colors shrink-0"
          title="Open navigation menu"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="hidden sm:inline text-slate-400 font-semibold">{pageInfo.category}</span>
        <ChevronRight className="hidden sm:inline w-3.5 h-3.5 text-slate-300" />
        <span className="text-slate-900 font-extrabold truncate">{pageInfo.title}</span>
      </div>

      {/* Right: Actions and Status Badges */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/90 border border-slate-200/90 shadow-inner">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate('/applications');
            }}
            className="bg-transparent text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none w-28 lg:w-36"
          />
        </div>

        {/* Engine Status Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 border border-slate-200/90 text-[11px] text-slate-600 font-medium">
          <Mail className="w-3.5 h-3.5 text-indigo-600" />
          <span>Engine: <strong className="text-indigo-700 uppercase font-bold">{provider}</strong></span>
        </div>

        {/* Dynamic AI Status Badge */}
        {activeAiBadge ? (
          <Link
            to="/settings"
            title={`Active Engine: ${activeAiBadge.label}. Click to manage settings.`}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full ${activeAiBadge.badgeClass} text-[11px] transition-all hover:opacity-90`}
          >
            <Sparkles className={`w-3 h-3 ${activeAiBadge.iconColor}`} />
            <span>{activeAiBadge.label}</span>
          </Link>
        ) : (
          <Link
            to="/settings"
            title="No AI API key configured. Click to configure in Settings."
            className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 border border-slate-200/90 text-[11px] text-slate-400 font-medium hover:text-slate-600 hover:border-slate-300 transition-colors"
          >
            <Sparkles className="w-3 h-3 text-slate-400" />
            <span>AI Inactive</span>
          </Link>
        )}

        {/* Launch Outreach Pill */}
        <Link
          to="/send"
          className="neo-btn-primary text-xs py-2 px-3 sm:px-4 shadow-sm shrink-0 whitespace-nowrap"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Send Outreach</span>
          <span className="xs:hidden">Send</span>
        </Link>
      </div>
    </header>
  );
};


