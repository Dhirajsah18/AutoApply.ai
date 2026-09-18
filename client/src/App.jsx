import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { ResumeHub } from './pages/Resumes/ResumeHub';
import { ResumeBuilder } from './pages/Resumes/ResumeBuilder';
import { ContactsDirectory } from './pages/Contacts/ContactsDirectory';
import { EmailTemplates } from './pages/Templates/EmailTemplates';
import { SendWizard } from './pages/SendApplication/SendWizard';
import { ApplicationTracker } from './pages/Applications/ApplicationTracker';
import { ProfileSettings } from './pages/Profile/ProfileSettings';

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
      </BrowserRouter>
    </AuthProvider>
  );
}
