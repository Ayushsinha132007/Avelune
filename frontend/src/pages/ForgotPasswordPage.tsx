import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, Loader2, CheckCircle2, Lock, KeyRound, RotateCcw } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthTextField } from '../components/auth/AuthTextField';
import { AuthFeedbackMessage } from '../components/auth/AuthFeedbackMessage';
import { authService } from '../services/authService';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'request' | 'confirm' | 'success'>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'info' | 'error' | 'success';
    message: string;
  } | null>(null);

  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrors({});
    setFeedback(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setErrors({ email: 'Registered email address is required.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrors({ email: 'Please provide a valid email format (e.g. name@domain.com).' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.requestPasswordResetOtp(trimmedEmail);
      if (res.success) {
        setStep('confirm');
        setCooldown(45);
        setFeedback({
          type: 'success',
          message: res.message || `A 6-digit password reset code has been dispatched to ${trimmedEmail}.`,
        });
      } else {
        setFeedback({
          type: 'error',
          message: res.message || res.error || 'Unable to request password reset code.',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'An unexpected connection error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setFeedback(null);

    const newErrors: Record<string, string> = {};
    if (!otp.trim() || otp.trim().length !== 6) {
      newErrors.otp = 'Please enter the complete 6-digit code sent to your email.';
    }
    if (!newPassword || newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long.';
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.confirmPasswordResetOtp(
        email.trim().toLowerCase(),
        otp.trim(),
        newPassword,
        confirmPassword
      );

      if (res.success) {
        setStep('success');
        setFeedback({
          type: 'success',
          message: 'Your password has been successfully updated.',
        });
      } else {
        setFeedback({
          type: 'error',
          message: res.message || res.error || 'Failed to reset password. Code may be invalid or expired.',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'An unexpected error occurred while resetting your password.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      editorialHeadline="Recovery & Account Access."
      editorialSubtitle="Discreet, secure password renewal and identity protection for AVELUNE clientele."
      editorialPlate="Plate 05 • Atelier Archive & Security • Autumn 2026"
      imageSrc="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=85&w=1600&auto=format&fit=crop"
    >
      <div className="w-full text-left">
        {/* Headings */}
        <div className="text-center sm:text-left mb-6">
          <h1 className="font-serif text-3xl sm:text-4xl text-[#242522] font-normal tracking-tight">
            {step === 'request' && 'Reset your password'}
            {step === 'confirm' && 'Verify & Set Password'}
            {step === 'success' && 'Password Updated'}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#5A5C55] font-light leading-relaxed">
            {step === 'request' && "Enter your registered email address to receive a secure 6-digit verification code."}
            {step === 'confirm' && `Enter the 6-digit code dispatched to ${email} and create your new secure password.`}
            {step === 'success' && "Your account credentials have been securely renewed. You may now proceed."}
          </p>
        </div>

        {/* Feedback / Notice Banner */}
        <AuthFeedbackMessage
          type={feedback?.type}
          message={feedback?.message}
          onDismiss={() => setFeedback(null)}
        />

        {/* Step 1: Request OTP */}
        {step === 'request' && (
          <form onSubmit={handleRequestOtp} noValidate className="space-y-5">
            <AuthTextField
              id="reset-email"
              type="email"
              label="Account Email Address"
              placeholder="name@domain.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
              }}
              error={errors.email}
              icon={<Mail className="w-4 h-4" />}
              autoComplete="email"
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#242522] hover:bg-[#383934] active:bg-[#1a1b18] text-[#F8F6F1] text-xs uppercase tracking-widest font-medium transition-all duration-200 flex items-center justify-center gap-2 rounded-none shadow-xs disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#D8C6AA]" />
                  <span>Dispatching Code...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Code</span>
                  <ArrowRight className="w-4 h-4 text-[#D8C6AA] group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs text-[#5A5C55] hover:text-[#242522] font-light transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#777B63]" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}

        {/* Step 2: Confirm OTP & New Password */}
        {step === 'confirm' && (
          <form onSubmit={handleConfirmReset} noValidate className="space-y-4">
            <div>
              <label htmlFor="reset-otp" className="block text-xs uppercase tracking-wider text-[#777B63] mb-1.5 font-medium">
                6-Digit Verification Code
              </label>
              <div className="relative">
                <input
                  id="reset-otp"
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(clean);
                    if (errors.otp) setErrors((prev) => ({ ...prev, otp: '' }));
                  }}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 bg-white border text-center tracking-[0.5em] text-lg font-mono font-medium text-[#242522] rounded-none focus:outline-hidden transition-all ${
                    errors.otp ? 'border-red-400 focus:border-red-500' : 'border-[#E4DED4] focus:border-[#242522]'
                  }`}
                />
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777B63]" />
              </div>
              {errors.otp && <p className="text-xs text-red-600 mt-1">{errors.otp}</p>}
            </div>

            <AuthTextField
              id="new-password"
              type="password"
              label="New Password"
              placeholder="••••••••••••"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: '' }));
              }}
              error={errors.newPassword}
              icon={<Lock className="w-4 h-4" />}
              autoComplete="new-password"
              disabled={isLoading}
            />

            <AuthTextField
              id="confirm-password"
              type="password"
              label="Confirm New Password"
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
              }}
              error={errors.confirmPassword}
              icon={<Lock className="w-4 h-4" />}
              autoComplete="new-password"
              disabled={isLoading}
            />

            <div className="flex items-center justify-between text-xs text-[#777B63] pt-1">
              <span>Code expires in 5 minutes</span>
              {cooldown > 0 ? (
                <span className="font-mono text-[#5A5C55]">Resend in {cooldown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleRequestOtp()}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1 font-medium text-[#242522] hover:text-[#777B63] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Resend Code</span>
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 bg-[#242522] hover:bg-[#383934] active:bg-[#1a1b18] text-[#F8F6F1] text-xs uppercase tracking-widest font-medium transition-all duration-200 flex items-center justify-center gap-2 rounded-none shadow-xs disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#D8C6AA]" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <span>Confirm New Password</span>
                  <ArrowRight className="w-4 h-4 text-[#D8C6AA] group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setStep('request')}
                className="inline-flex items-center gap-2 text-xs text-[#5A5C55] hover:text-[#242522] font-light transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#777B63]" />
                <span>Change Email Address</span>
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Success Screen */}
        {step === 'success' && (
          <div className="p-6 bg-white border border-[#D8C6AA] rounded-none text-left space-y-4 my-6">
            <div className="w-10 h-10 rounded-full bg-[#EFE9DF] text-[#777B63] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl text-[#242522]">
              Password Reset Complete
            </h3>
            <p className="text-xs text-[#5A5C55] font-light leading-relaxed">
              Your password has been securely renewed in the AVELUNE database. You are now logged in and may continue shopping or explore your client dashboard.
            </p>
            <div className="pt-3 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => navigate('/account')}
                className="w-full py-3 bg-[#242522] text-[#F8F6F1] text-xs uppercase tracking-widest font-medium text-center hover:bg-[#383934] transition-colors"
              >
                Go to Account Dashboard
              </button>
              <Link
                to="/collections"
                className="w-full py-3 border border-[#E4DED4] text-[#242522] text-xs uppercase tracking-widest font-medium text-center hover:bg-[#F8F6F1] transition-colors"
              >
                Explore Catalogue
              </Link>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};
