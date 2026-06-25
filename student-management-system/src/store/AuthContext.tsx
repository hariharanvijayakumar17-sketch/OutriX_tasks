import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Department, SystemSetting } from '../types';
import { api } from '../api/client';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  departments: Department[];
  settings: Record<string, string>;
  toasts: Toast[];
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  showToast: (message: string, type?: Toast['type']) => void;
  dismissToast: (id: string) => void;
  refreshSettings: () => Promise<void>;
  refreshDepartments: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('sms_session_token'));
  const [departments, setDepartments] = useState<Department[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Show dynamic system notification toast
  const showToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const logout = () => {
    localStorage.removeItem('sms_session_token');
    setToken(null);
    setUser(null);
    showToast('Logged out of system portal securely.', 'success');
  };

  // Fetch departments data
  const refreshDepartments = async () => {
    if (!token) return;
    try {
      const data = await api.get<Department[]>('/api/departments');
      setDepartments(data);
    } catch (err) {
      console.error('Failed to load departments', err);
    }
  };

  // Fetch system wide settings
  const refreshSettings = async () => {
    try {
      const list = await api.get<SystemSetting[]>('/api/system/settings');
      const mapped = list.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {} as Record<string, string>);
      setSettings(mapped);
    } catch (err) {
      console.error('Failed to load settings', err);
    }
  };

  // Login handler
  const login = async (email: string, password: string) => {
    try {
      const data = await api.post<{ token: string; user: User }>('/api/auth/login', { email, password });
      localStorage.setItem('sms_session_token', data.token);
      setToken(data.token);
      setUser(data.user);
      showToast(`Welcome back, ${data.user.fullName}!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Authentication failed', 'error');
      throw err;
    }
  };

  // Validate session on app initialization
  useEffect(() => {
    const initialize = async () => {
      if (token) {
        try {
          const data = await api.get<{ user: User }>('/api/auth/me');
          setUser(data.user);
          await Promise.all([refreshDepartments(), refreshSettings()]);
        } catch (err) {
          console.error('Session validation failed. Clearing state.', err);
          localStorage.removeItem('sms_session_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    initialize();
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        departments,
        settings,
        toasts,
        login,
        logout,
        showToast,
        dismissToast,
        refreshSettings,
        refreshDepartments,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
