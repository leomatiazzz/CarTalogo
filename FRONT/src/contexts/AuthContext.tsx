import React, { createContext, useContext, useState, useEffect } from 'react';
import type { LoginRequest, UserSession, ProfileRole } from '../types/auth';
import { authService } from '../api/authService';

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  hasRole: (roles: ProfileRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'cartalogo_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const session: UserSession = JSON.parse(saved);
        setUser(session);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    const response = await authService.login(credentials);
    const session: UserSession = {
      email: response.email,
      profile: response.profile,
      token: response.token,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setUser(session);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const hasRole = (roles: ProfileRole[]) => {
    if (!user) return false;
    return roles.includes(user.profile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.profile === 'Admin',
        isEditor: user?.profile === 'Editor',
        loading,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
