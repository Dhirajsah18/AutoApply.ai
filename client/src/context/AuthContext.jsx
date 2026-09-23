import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Synchronous Instant Hydration from localStorage (0ms load time)
  const initialToken = () => {
    try {
      const raw = localStorage.getItem('job_auto_token');
      if (!raw || raw === 'null' || raw === 'undefined') return null;
      return raw.replace(/^"(.*)"$/, '$1').trim();
    } catch {
      return null;
    }
  };

  const initialUser = () => {
    try {
      const raw = localStorage.getItem('job_auto_user');
      if (!raw || raw === 'null' || raw === 'undefined') return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const [token, setToken] = useState(initialToken);
  const [user, setUser] = useState(initialUser);
  // If user is already cached OR no token exists, we don't need to block UI with a loader
  const [loading, setLoading] = useState(() => !initialUser() && Boolean(initialToken()));
  const [serverWakingUp, setServerWakingUp] = useState(false);
  const hasMounted = useRef(false);

  // Background token revalidation (Stale-While-Revalidate)
  useEffect(() => {
    let isCancelled = false;
    let wakeTimer = null;

    const validateAuthSession = async () => {
      if (!token) {
        setLoading(false);
        setServerWakingUp(false);
        return;
      }

      // If waiting on first-time token validation without cache, notify if backend cold-start takes > 3s
      if (!user) {
        wakeTimer = setTimeout(() => {
          if (!isCancelled) setServerWakingUp(true);
        }, 3000);
      }

      try {
        const res = await api.get('/auth/me');
        if (isCancelled) return;

        if (res.data.success && res.data.user) {
          setUser(res.data.user);
          localStorage.setItem('job_auto_user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        if (isCancelled) return;
        console.warn('Session verification notice:', err.message);

        // Only log out if specifically 401 Unauthorized (expired or invalid token)
        if (err.response && err.response.status === 401) {
          logout();
        }
        // If network error (backend asleep / offline), do NOT force-logout if cached user exists
      } finally {
        if (!isCancelled) {
          if (wakeTimer) clearTimeout(wakeTimer);
          setLoading(false);
          setServerWakingUp(false);
        }
      }
    };

    validateAuthSession();

    return () => {
      isCancelled = true;
      if (wakeTimer) clearTimeout(wakeTimer);
    };
  }, [token]);

  // Keep-Alive Heartbeat: Pings backend every 10 minutes to prevent Render free-tier sleep
  useEffect(() => {
    const keepAlivePing = () => {
      api.get('/health').catch(() => {
        // Silent catch for background heartbeat
      });
    };

    // Pre-warm ping immediately on first load
    keepAlivePing();

    const interval = setInterval(keepAlivePing, 10 * 60 * 1000); // 10 minutes
    return () => clearInterval(interval);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const cleanToken = (res.data.token || '').replace(/^"(.*)"$/, '$1').trim();
      localStorage.setItem('job_auto_token', cleanToken);
      localStorage.setItem('job_auto_user', JSON.stringify(res.data.user));
      setToken(cleanToken);
      setUser(res.data.user);
      return res.data;
    }
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      const cleanToken = (res.data.token || '').replace(/^"(.*)"$/, '$1').trim();
      localStorage.setItem('job_auto_token', cleanToken);
      localStorage.setItem('job_auto_user', JSON.stringify(res.data.user));
      setToken(cleanToken);
      setUser(res.data.user);
      return res.data;
    }
  };

  const updateUserProfile = async (updatedData) => {
    const res = await api.patch('/auth/profile', updatedData);
    if (res.data.success) {
      setUser(res.data.user);
      localStorage.setItem('job_auto_user', JSON.stringify(res.data.user));
      return res.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('job_auto_token');
    localStorage.removeItem('job_auto_user');
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        serverWakingUp,
        login,
        register,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
