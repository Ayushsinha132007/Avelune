import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { DemoUser } from '../types/auth';
import { authService, SignupCredentials } from '../services/authService';
import { adminService, ADMIN_DESIGNATED_EMAIL } from '../services/adminService';
import { getAuthToken, setAuthToken } from '../services/api';

interface AuthContextType {
  user: DemoUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: DemoUser; error?: string }>;
  signup: (data: SignupCredentials) => Promise<{ success: boolean; user?: DemoUser; error?: string }>;
  sendOtp: (email: string, purpose?: string) => Promise<{ success: boolean; message: string; expiresIn?: number; devOtp?: string; error?: string; isAdmin?: boolean; bypassOtp?: boolean }>;
  verifyOtp: (email: string, otp: string, fullName?: string) => Promise<{ success: boolean; user?: DemoUser; error?: string; isNewUser?: boolean }>;
  adminLogin: (email?: string) => Promise<{ success: boolean; user?: DemoUser; error?: string }>;
  loginWithGoogle: (payload?: { credential?: string; email?: string; fullName?: string }) => Promise<{ success: boolean; user?: DemoUser; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<DemoUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_BACKUP_KEY = 'avelune_active_client_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from Django API via Token or stored user profile
  useEffect(() => {
    let isMounted = true;
    async function restoreSession() {
      try {
        const token = getAuthToken();
        if (token) {
          const apiUser = await authService.getCurrentUser();
          if (apiUser && isMounted) {
            setUser(apiUser);
            localStorage.setItem(LOCAL_USER_BACKUP_KEY, JSON.stringify(apiUser));
            setIsLoading(false);
            return;
          }
        }

        // Restore cached authenticated user if offline
        const cached = localStorage.getItem(LOCAL_USER_BACKUP_KEY);
        if (cached && token && isMounted) {
          setUser(JSON.parse(cached));
        }
      } catch (err) {
        console.warn('Failed to restore active session:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    restoreSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const sendOtp = useCallback(async (email: string, purpose: string = 'login') => {
    return await authService.sendOtp(email, purpose);
  }, []);

  const verifyOtp = useCallback(async (email: string, otp: string, fullName?: string) => {
    const res = await authService.verifyOtp(email, otp, fullName);
    if (res.success && res.user) {
      setUser(res.user);
      localStorage.setItem(LOCAL_USER_BACKUP_KEY, JSON.stringify(res.user));
      return { success: true, user: res.user, isNewUser: res.isNewUser };
    }
    return { success: false, error: res.error || 'Verification failed' };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authService.login({ email, password });
    if (res.success && res.user) {
      setUser(res.user);
      localStorage.setItem(LOCAL_USER_BACKUP_KEY, JSON.stringify(res.user));
      return { success: true, user: res.user };
    }
    return { success: false, error: res.error || 'Invalid credentials' };
  }, []);

  const signup = useCallback(async (data: SignupCredentials) => {
    const res = await authService.signup(data);
    if (res.success && res.user) {
      setUser(res.user);
      localStorage.setItem(LOCAL_USER_BACKUP_KEY, JSON.stringify(res.user));
      return { success: true, user: res.user };
    }
    return { success: false, error: res.error || 'Registration failed' };
  }, []);

  const adminLogin = useCallback(async (email: string = ADMIN_DESIGNATED_EMAIL) => {
    const res = await adminService.directLogin(email);
    if (res.success && res.user) {
      setUser(res.user);
      localStorage.setItem(LOCAL_USER_BACKUP_KEY, JSON.stringify(res.user));
      return { success: true, user: res.user };
    }
    return { success: false, error: res.error || 'Admin authentication failed.' };
  }, []);

  const loginWithGoogle = useCallback(async (payload?: { credential?: string; email?: string; fullName?: string }) => {
    const res = await authService.loginWithGoogle(payload || {});
    if (res.success && res.user) {
      setUser(res.user);
      localStorage.setItem(LOCAL_USER_BACKUP_KEY, JSON.stringify(res.user));
      return { success: true, user: res.user };
    }
    return { success: false, error: res.error || 'Google authentication failed' };
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setAuthToken(null);
    localStorage.removeItem(LOCAL_USER_BACKUP_KEY);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<DemoUser>) => {
    try {
      const updatedApi = await authService.updateProfile(updates);
      if (updatedApi) {
        setUser(updatedApi);
        localStorage.setItem(LOCAL_USER_BACKUP_KEY, JSON.stringify(updatedApi));
        return;
      }
    } catch {
      // fallback local update
    }
    setUser((prev) => {
      if (!prev) return null;
      const merged = { ...prev, ...updates };
      localStorage.setItem(LOCAL_USER_BACKUP_KEY, JSON.stringify(merged));
      return merged;
    });
  }, []);

  const isAdmin = Boolean(
    user && (user.email?.trim().toLowerCase() === ADMIN_DESIGNATED_EMAIL.toLowerCase() || (user as any).isAdmin)
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isAdmin,
        isLoading,
        sendOtp,
        verifyOtp,
        adminLogin,
        login,
        signup,
        loginWithGoogle,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
