import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  Send,
  Kanban,
  FileCode2,
  Settings,
  Mail,
  LogOut,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Send Emails', href: '/send', icon: Send, highlight: true },
  { name: 'Applications', href: '/applications', icon: Kanban },
  { name: 'Resumes', href: '/resumes', icon: FileText },
  { name: 'HR Contacts', href: '/contacts', icon: Users },
  { name: 'Templates', href: '/templates', icon: FileCode2 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 h-screen h-[100dvh] shrink-0 bg-white/95 lg:bg-white/75 backdrop-blur-2xl border-r border-slate-200/80 flex flex-col justify-between select-none overflow-hidden shadow-2xl lg:shadow-[4px_0_24px_rgba(15,23,42,0.03)] transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:static lg:translate-x-0`}
      >
        {/* Brand Header */}
        <div>
          <div className="h-16 flex items-center justify-between px-5 sm:px-6 border-b border-slate-200/70">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#06969C] via-[#058288] to-[#3eb8bf] flex items-center justify-center text-white shadow-md shadow-[#06969C]/25">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-extrabold text-sm text-slate-900 tracking-tight flex items-center gap-1">
                  AutoApply<span className="text-[#06969C]">.ai</span>
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">Job Outreach</p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3.5 space-y-1.5 overflow-y-auto max-h-[calc(100vh-8.5rem)]">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`relative flex items-center justify-between px-4 py-2.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/25'
                      : item.highlight
                      ? 'bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100/80 border border-indigo-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-white' : item.highlight ? 'text-indigo-600' : 'text-slate-500'
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>

                  {item.badge && !isActive && (
                    <span className="badge-lime text-[9px] py-0 px-2 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      {item.badge}
                    </span>
                  )}

                  {item.badge && isActive && (
                    <span className="bg-white/20 text-white border border-white/30 text-[9px] py-0 px-2 rounded-full font-bold flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Footer Profile */}
        <div className="p-3.5 border-t border-slate-200/70 bg-slate-50/50">
          <div className="flex items-center justify-between p-2.5 rounded-2xl neo-inner bg-white/80 border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Candidate'}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                logout();
              }}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

