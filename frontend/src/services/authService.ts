import { apiRequest, setAuthToken } from './api';
import { DemoUser } from '../types/auth';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupCredentials {
  fullName: string;
  email: string;
  password: string;
  confirmPassword?: string;
  acceptTerms?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: DemoUser;
  error?: string;
  isNewUser?: boolean;
  devOtp?: string;
}

export const authService = {
  /**
   * Industry-Standard Email OTP Dispatch
   */
  async sendOtp(email: string, purpose: string = 'login'): Promise<{
    success: boolean;
    message: string;
    expiresIn?: number;
    devOtp?: string;
    error?: string;
  }> {
    if (!email || !email.includes('@')) {
      return {
        success: false,
        message: 'Please provide a valid personal or official email address.',
        error: 'Please provide a valid personal or official email address.',
      };
    }

    try {
      const data = await apiRequest<{
        success: boolean;
        message: string;
        email: string;
        expiresIn: number;
        devOtp?: string;
        error?: string;
      }>('/auth/send-otp/', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase(), purpose }),
      });

      return {
        success: true,
        message: data.message || `Verification code sent to ${email}.`,
        expiresIn: data.expiresIn || 600,
        devOtp: data.devOtp,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Unable to send verification code. Please check your email.',
        error: err.message || 'Unable to send verification code. Please check your email.',
      };
    }
  },

  /**
   * Verify Email OTP & Sign In / Provision Account
   */
  async verifyOtp(email: string, otp: string, fullName?: string): Promise<AuthResponse> {
    if (!email || !otp) {
      return {
        success: false,
        message: 'Please provide both your email and the 6-digit code.',
        error: 'Please provide both your email and the 6-digit code.',
      };
    }

    try {
      const data = await apiRequest<{
        success: boolean;
        message: string;
        token: string;
        user: DemoUser;
        isNewUser?: boolean;
        error?: string;
      }>('/auth/verify-otp/', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
          fullName: fullName?.trim(),
        }),
      });

      if (data.token) {
        setAuthToken(data.token);
      }

      return {
        success: true,
        message: data.message || 'Email verified successfully.',
        token: data.token,
        user: data.user,
        isNewUser: data.isNewUser,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Invalid or expired code. Please request a new one.',
        error: err.message || 'Invalid or expired code. Please request a new one.',
      };
    }
  },

  /**
   * Real Django API Sign In with Password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (!credentials.email || !credentials.password) {
      return {
        success: false,
        message: 'Please provide both email and password.',
        error: 'Please provide both email and password.',
      };
    }

    try {
      const data = await apiRequest<{
        success: boolean;
        message?: string;
        token: string;
        user: DemoUser;
        error?: string;
      }>('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({
          email: credentials.email.trim(),
          password: credentials.password,
        }),
      });

      if (data.token) {
        setAuthToken(data.token);
      }

      return {
        success: true,
        message: data.message || `Welcome back, ${data.user?.firstName || 'Valued Client'}.`,
        token: data.token,
        user: data.user,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Invalid email or password. Please try again.',
        error: err.message || 'Invalid email or password. Please try again.',
      };
    }
  },

  /**
   * Real Django API Sign Up (New ID Creation)
   */
  async signup(data: SignupCredentials): Promise<AuthResponse> {
    if (!data.fullName || !data.email || !data.password) {
      return {
        success: false,
        message: 'Full name, email, and password are required.',
        error: 'Full name, email, and password are required.',
      };
    }

    if (data.confirmPassword && data.password !== data.confirmPassword) {
      return {
        success: false,
        message: 'Passwords do not match.',
        error: 'Passwords do not match.',
      };
    }

    try {
      const resData = await apiRequest<{
        success: boolean;
        token: string;
        user: DemoUser;
        message?: string;
        error?: string;
      }>('/auth/register/', {
        method: 'POST',
        body: JSON.stringify({
          fullName: data.fullName.trim(),
          email: data.email.trim(),
          password: data.password,
          confirmPassword: data.confirmPassword || data.password,
        }),
      });

      if (resData.token) {
        setAuthToken(resData.token);
      }

      return {
        success: true,
        message: resData.message || 'Account created successfully. Welcome to AVELUNE.',
        token: resData.token,
        user: resData.user,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Registration failed. An account with this email may already exist.',
        error: err.message || 'Registration failed. An account with this email may already exist.',
      };
    }
  },

  /**
   * Real Google OAuth Sign In / Sign Up
   */
  async loginWithGoogle(payload: {
    credential?: string;
    email?: string;
    fullName?: string;
  }): Promise<AuthResponse> {
    try {
      const resData = await apiRequest<{
        success: boolean;
        token: string;
        user: DemoUser;
        message?: string;
        error?: string;
      }>('/auth/google/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (resData.token) {
        setAuthToken(resData.token);
      }

      return {
        success: true,
        message: resData.message || `Signed in with Google as ${resData.user?.fullName || resData.user?.email}.`,
        token: resData.token,
        user: resData.user,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Google authentication failed. Please try again.',
        error: err.message || 'Google authentication failed. Please try again.',
      };
    }
  },

  /**
   * Fetch current authenticated user
   */
  async getCurrentUser(): Promise<DemoUser | null> {
    try {
      const data = await apiRequest<{ success: boolean; user: DemoUser }>('/auth/me/');
      return data.user || null;
    } catch {
      return null;
    }
  },

  /**
   * Update Profile
   */
  async updateProfile(updates: Partial<DemoUser>): Promise<DemoUser | null> {
    try {
      const data = await apiRequest<{ success: boolean; user: DemoUser }>('/auth/profile/', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      return data.user || null;
    } catch (err) {
      console.warn('Profile update failed:', err);
      return null;
    }
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      await apiRequest('/auth/logout/', { method: 'POST' });
    } catch {
      // Ignore if offline
    } finally {
      setAuthToken(null);
    }
  },

  /**
   * Get Official Google OAuth Consent Screen URL
   */
  async getGoogleAuthUrl(): Promise<{ success: boolean; authUrl?: string; error?: string }> {
    try {
      const data = await apiRequest<{ success: boolean; authUrl: string; state: string }>('/auth/google/');
      return { success: true, authUrl: data.authUrl };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Unable to initialize Google OAuth.',
      };
    }
  },

  /**
   * Request Password Reset OTP
   */
  async requestPasswordResetOtp(email: string): Promise<{ success: boolean; message: string; expiresIn?: number; error?: string }> {
    if (!email || !email.includes('@')) {
      return {
        success: false,
        message: 'Please provide a valid account email address.',
        error: 'Please provide a valid account email address.',
      };
    }

    try {
      const data = await apiRequest<{ success: boolean; message: string; expiresIn: number }>('/auth/password-reset-otp/', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      return {
        success: true,
        message: data.message,
        expiresIn: data.expiresIn,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Unable to request password reset code.',
        error: err.message || 'Unable to request password reset code.',
      };
    }
  },

  /**
   * Confirm Password Reset with OTP
   */
  async confirmPasswordResetOtp(
    email: string,
    otp: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<AuthResponse> {
    if (!email || !otp || !newPassword) {
      return {
        success: false,
        message: 'Email, verification code, and new password are required.',
        error: 'Email, verification code, and new password are required.',
      };
    }

    if (newPassword !== confirmPassword) {
      return {
        success: false,
        message: 'Passwords do not match.',
        error: 'Passwords do not match.',
      };
    }

    try {
      const data = await apiRequest<{
        success: boolean;
        message: string;
        token: string;
        user: DemoUser;
      }>('/auth/password-reset-confirm/', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
          newPassword,
          confirmPassword,
        }),
      });

      if (data.token) {
        setAuthToken(data.token);
      }

      return {
        success: true,
        message: data.message,
        token: data.token,
        user: data.user,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to update password. Code may be invalid or expired.',
        error: err.message || 'Failed to update password. Code may be invalid or expired.',
      };
    }
  },

  /**
   * Password Reset Request (backwards-compatible alias)
   */
  async forgotPassword(email: string): Promise<AuthResponse> {
    const res = await this.requestPasswordResetOtp(email);
    return {
      success: res.success,
      message: res.message,
      error: res.error,
    };
  },
};
