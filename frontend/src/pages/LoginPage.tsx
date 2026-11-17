import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, ArrowRight, Loader2, ArrowLeft, KeyRound, Sparkles, RefreshCw } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthTextField } from '../components/auth/AuthTextField';
import { PasswordField } from '../components/auth/PasswordField';
import { SocialAuthButton } from '../components/auth/SocialAuthButton';
import { AuthDivider } from '../components/auth/AuthDivider';
import { AuthFooter } from '../components/auth/AuthFooter';
import { AuthFeedbackMessage } from '../components/auth/AuthFeedbackMessage';
import { GoogleAuthModal } from '../components/auth/GoogleAuthModal';
import { OtpInput } from '../components/auth/OtpInput';
import { useAuth } from '../hooks/useAuth';
import { useStore } from '../hooks/useStore';
import { authService } from '../services/authService';
import { ADMIN_DESIGNATED_EMAIL } from '../services/adminService';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, sendOtp, verifyOtp, loginWithGoogle, adminLogin } = useAuth();
  const { showToast } = useStore();

  // Mode: 'otp' (Industry Standard Email OTP) or 'password'
  const [authMethod, setAuthMethod] = useState<'otp' | 'password'>('otp');
  // OTP Step: 'request' (enter email) or 'verify' (enter 6-digit code)
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // Timer state for OTP resend
  const [resendCooldown, setResendCooldown] = useState(0);

  // Validation & UI State
  const [errors, setErrors] = useState<{ email?: string; password?: string; otp?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'info' | 'error' | 'success';
    message: string;
  } | null>(null);

  // Countdown timer effect
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const validateEmail = (): boolean => {
    if (!email.trim()) {
      setErrors((prev) => ({ ...prev, email: 'Please enter your email address.' }));
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors((prev) => ({ ...prev, email: 'Please provide a valid personal or official email address.' }));
      return false;
    }
    return true;
  };

  // STEP 1 (OTP): Request 6-digit code to personal or work email
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setErrors({});

    if (!validateEmail()) return;

    // Designated Atelier Administrator: Instant Zero-OTP Direct Entry
    if (email.trim().toLowerCase() === ADMIN_DESIGNATED_EMAIL.toLowerCase()) {
      setIsLoading(true);
      try {
        const adminRes = await adminLogin(ADMIN_DESIGNATED_EMAIL);
        if (adminRes.success) {
          showToast({
            title: 'Welcome Atelier Director',
            description: 'Direct authentication verified. Entering Admin Suite.',
            type: 'info',
          });
          navigate('/admin', { replace: true });
          return;
        } else {
          setFeedback({
            type: 'error',
            message: adminRes.error || 'Administrator login failed.',
          });
        }
      } catch (err: any) {
        setFeedback({
          type: 'error',
          message: err.message || 'Direct admin login error.',
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    try {
      const res = await sendOtp(email.trim());
      if (res.isAdmin || res.bypassOtp) {
        const adminRes = await adminLogin(email.trim());
        if (adminRes.success) {
          showToast({
            title: 'Welcome Atelier Director',
            description: 'Direct authentication verified. Entering Admin Suite.',
            type: 'info',
          });
          navigate('/admin', { replace: true });
          return;
        }
      }

      if (res.success) {
        setOtpStep('verify');
        setResendCooldown(45);
        if (res.devOtp) {
          setDevOtp(res.devOtp);
          showToast({
            title: `Verification Code: ${res.devOtp}`,
            description: `Enter code ${res.devOtp} below or click Auto-fill to sign in.`,
            type: 'info',
          });
        }
        setFeedback({
          type: 'success',
          message: res.devOtp
            ? `Verification code generated: ${res.devOtp}. Enter it below or click Auto-fill.`
            : `Verification code dispatched to ${email.trim()}. Please inspect your inbox.`,
        });
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Unable to send verification code. Please check your email.',
        });
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'A connection error occurred while dispatching verification code.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2 (OTP): Verify 6-digit code
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const finalCode = (codeToVerify || otp).trim();
    if (finalCode.length !== 6) {
      setErrors((prev) => ({ ...prev, otp: 'Please enter the complete 6-digit verification code.' }));
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    try {
      const res = await verifyOtp(email.trim(), finalCode);
      if (res.success) {
        showToast({
          title: `Welcome, ${res.user?.firstName || 'Valued Client'}`,
          description: 'Your atelier session has been securely established.',
          type: 'info',
        });
        const target = (location.state as any)?.from?.pathname || '/account/home';
        navigate(target, { replace: true });
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Invalid or expired verification code. Please try again.',
        });
        setOtp('');
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'Verification could not be processed. Please check your network connection.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Resend code action
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setIsLoading(true);
    setFeedback(null);
    try {
      const res = await sendOtp(email.trim());
      if (res.success) {
        setResendCooldown(45);
        if (res.devOtp) setDevOtp(res.devOtp);
        setFeedback({
          type: 'info',
          message: `A fresh verification code has been dispatched to ${email.trim()}.`,
        });
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Failed to resend code.',
        });
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'Failed to resend code. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Password submission fallback
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setErrors({});

    if (!validateEmail()) return;
    if (!password) {
      setErrors((prev) => ({ ...prev, password: 'Password is required.' }));
      return;
    }

    // Designated Atelier Administrator: Instant Zero-OTP Direct Entry
    if (email.trim().toLowerCase() === ADMIN_DESIGNATED_EMAIL.toLowerCase()) {
      setIsLoading(true);
      try {
        const adminRes = await adminLogin(ADMIN_DESIGNATED_EMAIL);
        if (adminRes.success) {
          showToast({
            title: 'Welcome Atelier Director',
            description: 'Direct authentication verified. Entering Admin Suite.',
            type: 'info',
          });
          navigate('/admin', { replace: true });
          return;
        }
      } catch (err: any) {
        setFeedback({ type: 'error', message: err.message || 'Direct admin login error.' });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        showToast({
          title: `Welcome Back, ${res.user?.firstName || 'Valued Client'}`,
          description: 'Your personal atelier space is ready.',
          type: 'info',
        });
        const target = (location.state as any)?.from?.pathname || '/account/home';
        navigate(target, { replace: true });
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Invalid email or password. Please check your credentials.',
        });
        setPassword('');
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'An unexpected connection error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleClick = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const res = await authService.getGoogleAuthUrl();
      if (res.success && res.authUrl) {
        window.location.href = res.authUrl;
        return;
      }
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
    setIsGoogleModalOpen(true);
  };

  const handleGoogleSuccess = async (data: { email: string; fullName: string }) => {
    const res = await loginWithGoogle(data);
    if (res.success) {
      showToast({
        title: `Welcome, ${res.user?.firstName || 'Valued Client'}`,
        description: 'Successfully authenticated with Google.',
        type: 'info',
      });
      const target = (location.state as any)?.from?.pathname || '/account/home';
      navigate(target, { replace: true });
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Google authentication failed.',
      });
    }
  };

  return (
    <AuthLayout
      editorialHeadline="A more considered way to shop."
      editorialSubtitle="Sign in to access your curated wishlist, tailored recommendations, and atelier order archives."
      editorialPlate="Plate 01 • Fine Outerwear & Gabardine • Autumn 2026"
      imageSrc="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=85&w=1600&auto=format&fit=crop"
    >
      <div className="w-full text-left">
        {/* Headings */}
        <div className="text-center sm:text-left mb-6">
          <div className="flex items-center justify-between">
            <h1 className="font-serif text-3xl sm:text-4xl text-[#242522] font-normal tracking-tight">
              {authMethod === 'otp' && otpStep === 'verify' ? 'Verify Identity' : 'Sign In'}
            </h1>

            {/* Switch between OTP & Password */}
            {otpStep === 'request' && (
              <button
                type="button"
                onClick={() => {
                  setAuthMethod(authMethod === 'otp' ? 'password' : 'otp');
                  setFeedback(null);
                  setErrors({});
                }}
                className="text-[11px] uppercase tracking-wider text-[#777B63] hover:text-[#242522] underline underline-offset-4 font-medium transition-colors cursor-pointer"
              >
                {authMethod === 'otp' ? 'Use Password' : 'Use Email OTP'}
              </button>
            )}
          </div>

          <p className="mt-2 text-xs sm:text-sm text-[#5A5C55] font-light">
            {authMethod === 'otp'
              ? otpStep === 'verify'
                ? `Enter the 6-digit verification code dispatched to ${email}`
                : 'Enter your personal or official email to receive a secure one-time code.'
              : 'Enter your account credentials to access your atelier profile.'}
          </p>
        </div>

        {/* Feedback / Error Message Banner */}
        <AuthFeedbackMessage
          type={feedback?.type}
          message={feedback?.message}
          onDismiss={() => setFeedback(null)}
        />

        {/* ================= FLOW 1: EMAIL OTP (INDUSTRY STANDARD) ================= */}
        {authMethod === 'otp' && otpStep === 'request' && (
          <form onSubmit={handleRequestOtp} noValidate className="space-y-4">
            <AuthTextField
              id="otp-login-email"
              type="email"
              label="Email Address (Personal or Official)"
              placeholder="alexandra@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              error={errors.email}
              icon={<Mail className="w-4 h-4" />}
              autoComplete="email"
              disabled={isLoading}
            />

            {/* Atelier Director Instant Access Indicator */}
            {email.trim().toLowerCase() === ADMIN_DESIGNATED_EMAIL.toLowerCase() && (
              <div className="p-3.5 bg-[#1E1F1C] border border-[#D8C6AA] text-[#F8F6F1] shadow-md space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#D8C6AA] flex items-center gap-1.5 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-[#D8C6AA]" />
                    Atelier Director Recognized
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-[#D8C6AA] text-[#1E1F1C] font-mono font-bold uppercase">
                    Zero OTP Required
                  </span>
                </div>
                <p className="text-[11px] text-[#C4C0B6] leading-relaxed">
                  Authorized Administrator address ({ADMIN_DESIGNATED_EMAIL}) identified. Instant authentication is available with zero code delivery.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      const res = await adminLogin(ADMIN_DESIGNATED_EMAIL);
                      if (res.success) {
                        showToast({
                          title: 'Welcome Atelier Director',
                          description: 'Direct authentication verified. Entering Admin Suite.',
                          type: 'info',
                        });
                        navigate('/admin', { replace: true });
                      } else {
                        setFeedback({ type: 'error', message: res.error || 'Admin login failed.' });
                      }
                    } catch (err: any) {
                      setFeedback({ type: 'error', message: err.message || 'Direct login failed.' });
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                  className="w-full py-2.5 bg-[#D8C6AA] hover:bg-[#EADBC4] text-[#1E1F1C] text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <ArrowRight className="w-4 h-4" />
                  Enter Atelier Admin Suite
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 bg-[#242522] hover:bg-[#383934] active:bg-[#1a1b18] text-[#F8F6F1] text-xs uppercase tracking-widest font-medium transition-all duration-200 flex items-center justify-center gap-2 rounded-none shadow-xs disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#D8C6AA]" />
                  <span>
                    {email.trim().toLowerCase() === ADMIN_DESIGNATED_EMAIL.toLowerCase()
                      ? 'Authenticating Director...'
                      : 'Sending Verification Code...'}
                  </span>
                </>
              ) : (
                <>
                  <span>
                    {email.trim().toLowerCase() === ADMIN_DESIGNATED_EMAIL.toLowerCase()
                      ? 'Enter Admin Suite (Instant • No OTP)'
                      : 'Continue with Email OTP'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#D8C6AA] group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ================= STEP 2: ENTER 6-DIGIT OTP ================= */}
        {authMethod === 'otp' && otpStep === 'verify' && (
          <div className="space-y-5">
            {/* Target Email Info & Edit */}
            <div className="p-3 bg-white border border-[#E4DED4] flex items-center justify-between text-xs">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] uppercase tracking-wider text-[#777B63] block">Dispatched to</span>
                <span className="font-mono text-[#242522] truncate block font-medium">{email}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOtpStep('request');
                  setOtp('');
                  setFeedback(null);
                }}
                className="text-[11px] uppercase tracking-wider text-[#777B63] hover:text-[#242522] underline underline-offset-4 shrink-0 font-medium"
              >
                Change
              </button>
            </div>

            {/* Prominent Verification Code Box */}
            {devOtp && (
              <div className="p-3.5 bg-[#EFE9DF] border border-[#D8C6AA] shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-[#242522]">
                    <Sparkles className="w-3.5 h-3.5 text-[#777B63]" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Your One-Time Code</span>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-[#242522] text-[#F8F6F1] font-mono">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 bg-white p-2 border border-[#D8C6AA]">
                  <span className="font-mono text-xl sm:text-2xl font-bold tracking-widest text-[#242522] pl-1">
                    {devOtp}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setOtp(devOtp);
                      handleVerifyOtp(devOtp);
                    }}
                    className="px-3 py-1.5 text-[11px] uppercase tracking-wider font-semibold bg-[#242522] hover:bg-[#383934] text-[#F8F6F1] transition-colors cursor-pointer"
                  >
                    Auto-Fill Code
                  </button>
                </div>
                <p className="text-[10px] text-[#777B63] mt-2 leading-relaxed">
                  Tip: Code is also printed in your terminal. To deliver emails directly to your Gmail app inbox, configure your Gmail App Password in <code>backend/.env</code>.
                </p>
              </div>
            )}

            {/* 6-box OTP Input */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#777B63] font-medium mb-1">
                Enter 6-Digit Code
              </label>
              <OtpInput
                value={otp}
                onChange={(val) => {
                  setOtp(val);
                  if (errors.otp) setErrors((prev) => ({ ...prev, otp: undefined }));
                }}
                onComplete={(code) => handleVerifyOtp(code)}
                disabled={isLoading}
              />
              {errors.otp && (
                <p className="text-[11px] text-[#A65B5B] font-light mt-1">{errors.otp}</p>
              )}
            </div>

            {/* Resend Cooldown Timer */}
            <div className="flex items-center justify-between text-xs text-[#5A5C55] pt-1">
              <span>Didn&apos;t receive code?</span>
              {resendCooldown > 0 ? (
                <span className="text-[#777B63] font-mono text-[11px]">
                  Resend in 0:{resendCooldown.toString().padStart(2, '0')}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1 text-[#242522] hover:text-[#777B63] font-medium underline underline-offset-4 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Resend Code</span>
                </button>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={() => handleVerifyOtp()}
              disabled={isLoading || otp.length < 6}
              className="w-full py-3.5 bg-[#242522] hover:bg-[#383934] active:bg-[#1a1b18] text-[#F8F6F1] text-xs uppercase tracking-widest font-medium transition-all duration-200 flex items-center justify-center gap-2 rounded-none shadow-xs disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#D8C6AA]" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Verify & Enter Atelier</span>
                  <ArrowRight className="w-4 h-4 text-[#D8C6AA] group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Back button */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setOtpStep('request');
                  setOtp('');
                  setFeedback(null);
                }}
                className="inline-flex items-center gap-1 text-xs text-[#777B63] hover:text-[#242522] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Use a different email address</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= FLOW 2: STANDARD PASSWORD LOGIN ================= */}
        {authMethod === 'password' && (
          <form onSubmit={handlePasswordSubmit} noValidate className="space-y-4">
            <AuthTextField
              id="login-email"
              type="email"
              label="Email Address"
              placeholder="client@avelune.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              error={errors.email}
              icon={<Mail className="w-4 h-4" />}
              autoComplete="email"
              disabled={isLoading}
            />

            <PasswordField
              id="login-password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              error={errors.password}
              autoComplete="current-password"
              disabled={isLoading}
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[#5A5C55] hover:text-[#242522] transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-none border-[#E4DED4] text-[#242522] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#242522]"
                />
                <span className="font-light">Remember me</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-[#777B63] hover:text-[#242522] underline underline-offset-4 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 bg-[#242522] hover:bg-[#383934] active:bg-[#1a1b18] text-[#F8F6F1] text-xs uppercase tracking-widest font-medium transition-all duration-200 flex items-center justify-center gap-2 rounded-none shadow-xs disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#D8C6AA]" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 text-[#D8C6AA] group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Divider & Social Login */}
        <AuthDivider label="OR CONTINUE WITH" />

        <div className="space-y-3">
          <SocialAuthButton
            provider="google"
            label="Continue with Google"
            onClick={handleGoogleClick}
            disabled={isLoading}
          />
        </div>

        {/* Footer Link */}
        <AuthFooter
          promptText="New to AVELUNE?"
          linkText="Create an account."
          linkTo="/signup"
        />

        {/* Google Authentication Dialog */}
        <GoogleAuthModal
          isOpen={isGoogleModalOpen}
          onClose={() => setIsGoogleModalOpen(false)}
          onSuccess={handleGoogleSuccess}
        />
      </div>
    </AuthLayout>
  );
};
