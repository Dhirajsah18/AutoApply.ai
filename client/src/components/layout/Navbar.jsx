import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Search, Send, Sparkles, Mail, ChevronRight, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = ({ onMenuToggle = () => {} }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getPageInfo = () => {
    switch (location.pathname) {
      case '/dashboard':
        return { category: 'App', title: 'Dashboard' };
      case '/send':
        return { category: 'App', title: 'Send Emails' };
      case '/applications':
        return { category: 'App', title: 'Applications' };
      case '/resumes':
        return { category: 'App', title: 'Resumes' };
      case '/resumes/builder':
        return { category: 'App', title: 'Resume Builder' };
      case '/contacts':
        return { category: 'App', title: 'HR Contacts' };
      case '/templates':
        return { category: 'App', title: 'Templates' };
      case '/settings':
        return { category: 'App', title: 'Settings' };
      default:
        return { category: 'App', title: 'Dashboard' };
    }
  };

  const pageInfo = getPageInfo();
  const provider = user?.emailConfig?.provider || 'mock';

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

        {/* AI Active Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full badge-lime text-[11px]">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          <span>AI Active</span>
        </div>

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


