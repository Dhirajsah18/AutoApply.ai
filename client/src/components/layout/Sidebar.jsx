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
  PanelLeftClose,
  PanelLeftOpen,
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

export const Sidebar = ({ isOpen, isCollapsed = false, onClose, onToggleCollapse }) => {
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

      {/* Sidebar Drawer: Full (w-64) or Slim Icon Rail (w-[68px]) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 h-screen h-[100dvh] shrink-0 bg-white/95 lg:bg-white/90 backdrop-blur-2xl border-r border-slate-200/80 flex flex-col justify-between select-none shadow-2xl lg:shadow-[4px_0_24px_rgba(15,23,42,0.03)] transition-all duration-300 ease-in-out lg:static ${
          isOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${
          isCollapsed ? 'lg:w-[68px]' : 'lg:w-64'
        }`}
      >
        {/* Top Section: Header & Navigation */}
        <div className="flex flex-col min-h-0 flex-1">
          {/* Brand Header */}
          <div
            className={`h-16 flex items-center border-b border-slate-200/70 shrink-0 transition-all ${
              isCollapsed ? 'lg:justify-center px-2' : 'justify-between px-4 sm:px-5'
            }`}
          >
            {/* Desktop Collapsed Brand & Expand Button */}
            {isCollapsed && (
              <div className="hidden lg:flex items-center justify-center">
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="group relative w-10 h-10 rounded-xl bg-gradient-to-tr from-[#06969C] via-[#058288] to-[#3eb8bf] flex items-center justify-center text-white shadow-md shadow-[#06969C]/25 hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
                  title="Expand sidebar"
                  aria-label="Expand sidebar"
                >
                  <Mail className="w-5 h-5 group-hover:hidden transition-transform" />
                  <PanelLeftOpen className="w-5 h-5 hidden group-hover:block transition-transform" />

                  {/* Floating Tooltip */}
                  <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50 flex items-center gap-1.5">
                    <PanelLeftOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Expand Sidebar</span>
                  </div>
                </button>
              </div>
            )}

            {/* Expanded Brand Header (and mobile view) */}
            <div className={`flex items-center justify-between w-full ${isCollapsed ? 'lg:hidden' : 'flex'}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#06969C] via-[#058288] to-[#3eb8bf] flex items-center justify-center text-white shadow-md shadow-[#06969C]/25">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="font-extrabold text-sm text-slate-900 tracking-tight flex items-center gap-1">
                    AutoApply<span className="text-[#06969C]">.ai</span>
                  </h1>
                  <p className="text-[10px] text-slate-500 font-medium">Job Outreach</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Desktop Collapse Button */}
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Collapse sidebar to icon rail"
                  aria-label="Collapse sidebar"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>

                {/* Mobile Close Button */}
                <button
                  type="button"
                  onClick={onClose}
                  className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav
            className={`p-2 space-y-1.5 overflow-y-auto flex-1 scrollbar-none ${
              isCollapsed ? 'lg:p-2 lg:space-y-2.5' : 'p-3.5 space-y-1.5'
            }`}
          >
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <div key={item.name} className="relative group">
                  <NavLink
                    to={item.href}
                    onClick={onClose}
                    className={`relative flex items-center transition-all duration-200 ${
                      isCollapsed
                        ? 'lg:w-10 lg:h-10 lg:justify-center lg:rounded-xl lg:mx-auto px-4 py-2.5 rounded-full text-xs font-semibold justify-between'
                        : 'px-4 py-2.5 rounded-full text-xs font-semibold justify-between'
                    } ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/25'
                        : item.highlight
                        ? 'bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100/80 border border-indigo-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`transition-transform duration-200 ${
                          isCollapsed ? 'w-4 h-4 lg:w-5 lg:h-5' : 'w-4 h-4'
                        } ${
                          isActive ? 'text-white' : item.highlight ? 'text-indigo-600' : 'text-slate-500'
                        }`}
                      />
                      <span className={isCollapsed ? 'lg:hidden' : ''}>{item.name}</span>
                    </div>

                    {/* Badges for expanded / mobile view */}
                    {item.badge && (
                      <span
                        className={`${isCollapsed ? 'lg:hidden' : ''} ${
                          isActive ? 'bg-white/20 text-white border border-white/30' : 'badge-lime'
                        } text-[9px] py-0 px-2 rounded-full font-bold flex items-center gap-1`}
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        {item.badge}
                      </span>
                    )}

                    {/* Small badge dot for collapsed desktop view */}
                    {isCollapsed && item.badge && !isActive && (
                      <span className="hidden lg:block absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                    )}
                  </NavLink>

                  {/* Floating Tooltip in collapsed desktop mode */}
                  {isCollapsed && (
                    <div className="hidden lg:flex absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50 items-center gap-1.5">
                      <span>{item.name}</span>
                      {item.badge && (
                        <span className="text-[10px] text-amber-300 font-bold">({item.badge})</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* User Footer Profile */}
        <div
          className={`border-t border-slate-200/70 bg-slate-50/50 shrink-0 transition-all ${
            isCollapsed ? 'p-2 lg:flex lg:flex-col lg:items-center lg:gap-2' : 'p-3.5'
          }`}
        >
          {/* Desktop Collapsed Profile & Sign Out */}
          {isCollapsed && (
            <div className="hidden lg:flex flex-col items-center gap-2 w-full">
              <div className="group relative w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white font-bold flex items-center justify-center text-xs shadow-sm cursor-pointer">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50">
                  <p className="font-bold">{user?.name || 'Candidate'}</p>
                  <p className="text-[10px] text-slate-400">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  logout();
                }}
                className="group relative w-10 h-10 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                aria-label="Sign Out"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
                <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50">
                  Sign Out
                </span>
              </button>
            </div>
          )}

          {/* Expanded Profile (and mobile) */}
          <div
            className={`items-center justify-between p-2.5 rounded-2xl neo-inner bg-white/80 border border-slate-200/80 shadow-sm ${
              isCollapsed ? 'lg:hidden flex' : 'flex'
            }`}
          >
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
