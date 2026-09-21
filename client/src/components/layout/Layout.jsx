import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const isBuilder = location.pathname.startsWith('/resumes/builder');

  return (
    <div className="h-screen h-[100dvh] w-full flex bg-[#F8FAFC] text-slate-900 overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Sidebar (Desktop Pinned + Mobile Slide-over Drawer) */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content View with Top Navbar */}
      <div className="flex-1 flex flex-col min-w-0 h-screen h-[100dvh] overflow-hidden">
        <Navbar onMenuToggle={() => setIsSidebarOpen((prev) => !prev)} />
        <main
          className={`flex-1 px-3 sm:px-6 md:px-8 py-3 sm:py-4 overscroll-y-contain [webkit-overflow-scrolling:touch] ${
            isBuilder ? 'overflow-y-auto lg:overflow-hidden lg:pb-3 lg:flex lg:flex-col' : 'overflow-y-auto pb-24 sm:pb-16'
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};


