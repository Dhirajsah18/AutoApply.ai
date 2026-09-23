import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';

const Login = lazy(() => import('./pages/Auth/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Auth/Register').then(m => ({ default: m.Register })));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard').then(m => ({ default: m.Dashboard })));
const ResumeHub = lazy(() => import('./pages/Resumes/ResumeHub').then(m => ({ default: m.ResumeHub })));
const ResumeBuilder = lazy(() => import('./pages/Resumes/ResumeBuilder').then(m => ({ default: m.ResumeBuilder })));
const ContactsDirectory = lazy(() => import('./pages/Contacts/ContactsDirectory').then(m => ({ default: m.ContactsDirectory })));
const EmailTemplates = lazy(() => import('./pages/Templates/EmailTemplates').then(m => ({ default: m.EmailTemplates })));
const SendWizard = lazy(() => import('./pages/SendApplication/SendWizard').then(m => ({ default: m.SendWizard })));
const ApplicationTracker = lazy(() => import('./pages/Applications/ApplicationTracker').then(m => ({ default: m.ApplicationTracker })));
const ProfileSettings = lazy(() => import('./pages/Profile/ProfileSettings').then(m => ({ default: m.ProfileSettings })));

const PageLoader = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 gap-3">
    <div className="w-8 h-8 rounded-full border-2 border-[#06969C] border-t-transparent animate-spin" />
    <span className="text-xs font-semibold text-slate-400">Loading view...</span>
  </div>
);

// High-speed, branded App Loader
const AppSuiteLoader = ({ message = 'Initializing AutoApply AI...', serverWakingUp = false }) => (
  <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
    {/* Ambient Glow Orbs */}
    <div className="absolute w-96 h-96 bg-[#06969C]/15 rounded-full blur-[120px] pointer-events-none" />
    <div className="relative z-10 flex flex-col items-center max-w-sm text-center">
      <div className="relative mb-5 flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#06969C] to-[#3eb8bf] p-0.5 shadow-xl shadow-[#06969C]/30 animate-pulse">
          <div className="w-full h-full bg-[#0B0F19] rounded-2xl flex items-center justify-center">
            <span className="text-xl font-black text-[#06969C]">AA</span>
          </div>
        </div>
        <div className="absolute -inset-1 rounded-2xl border border-[#06969C]/40 animate-ping pointer-events-none opacity-40" />
      </div>

      <h2 className="text-base font-bold text-slate-100 mb-1 tracking-tight">AutoApply<span className="text-[#06969C]">AI</span></h2>
      <p className="text-xs text-slate-400 font-medium mb-3">{message}</p>

      {serverWakingUp && (
        <div className="mt-3 px-3.5 py-2 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-cyan-300 text-xs font-medium animate-fadeIn">
          ⚡ Waking up secure cloud server (takes ~15s on first cold start)...
        </div>
      )}
    </div>
  </div>
);

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { user, loading, serverWakingUp } = useAuth();

  if (loading) {
    return <AppSuiteLoader message="Loading Application Suite..." serverWakingUp={serverWakingUp} />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Guard (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading, serverWakingUp } = useAuth();

  if (loading) {
    return <AppSuiteLoader message="Authenticating..." serverWakingUp={serverWakingUp} />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Auth Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Authenticated Dashboard Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="send" element={<SendWizard />} />
              <Route path="applications" element={<ApplicationTracker />} />
              <Route path="resumes" element={<ResumeHub />} />
              <Route path="resumes/builder" element={<ResumeBuilder />} />
              <Route path="resumes/builder/:id" element={<ResumeBuilder />} />
              <Route path="contacts" element={<ContactsDirectory />} />
              <Route path="templates" element={<EmailTemplates />} />
              <Route path="settings" element={<ProfileSettings />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
