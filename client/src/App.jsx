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
  <div className="flex items-center justify-center p-12 text-indigo-600 text-xs font-bold gap-2">
    <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
    Loading...
  </div>
);


// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-indigo-600 text-sm font-bold">
        Loading Application Suite...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Guard (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-indigo-600 text-sm font-bold">
        Loading...
      </div>
    );
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

