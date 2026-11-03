import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, User, ArrowRight, Loader2 } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthTextField } from '../components/auth/AuthTextField';
import { PasswordField } from '../components/auth/PasswordField';
import { PasswordStrengthIndicator } from '../components/auth/PasswordStrengthIndicator';
import { SocialAuthButton } from '../components/auth/SocialAuthButton';
import { AuthDivider } from '../components/auth/AuthDivider';
import { AuthFooter } from '../components/auth/AuthFooter';
import { AuthFeedbackMessage } from '../components/auth/AuthFeedbackMessage';
import { GoogleAuthModal } from '../components/auth/GoogleAuthModal';
import { useAuth } from '../hooks/useAuth';
import { useStore } from '../hooks/useStore';
import { authService } from '../services/authService';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup, loginWithGoogle } = useAuth();
  const { showToast } = useStore();

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Validation & UI State
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    acceptTerms?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'info' | 'error' | 'success';
    message: string;
  } | null>(null);

  // Validation function
  const validate = () => {
    const newErrors: {
      fullName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      acceptTerms?: string;
    } = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please provide a valid email format (e.g. name@domain.com).';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirming your password is required.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!acceptTerms) {
      newErrors.acceptTerms = 'You must accept the Terms and Privacy Policy.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!validate()) return;

    setIsLoading(true);

    try {
      const res = await signup({
        fullName,
        email,
        password,
        confirmPassword,
        acceptTerms,
      });

      if (res.success) {
        showToast({
          title: `Welcome, ${res.user?.firstName || fullName.split(' ')[0]}`,
          description: 'Your atelier account has been created successfully.',
          type: 'info',
        });
        navigate('/account/home', { replace: true });
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Registration failed. An account with this email may already exist.',
        });
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
      navigate('/account/home', { replace: true });
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Google authentication failed.',
      });
    }
  };

  return (
    <AuthLayout
      editorialHeadline="A more considered way to shop starts here."
      editorialSubtitle="Join the AVELUNE atelier ledger for early collection access, private previews, and saved personal curations."
      editorialPlate="Plate 02 • Pure Cashmere & Bespoke Tailoring • Autumn 2026"
      imageSrc="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=85&w=1600&auto=format&fit=crop"
    >
      <div className="w-full text-left">
        {/* Headings */}
        <div className="text-center sm:text-left mb-6">
          <h1 className="font-serif text-3xl sm:text-4xl text-[#242522] font-normal tracking-tight">
            Create your account.
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#5A5C55] font-light">
            Good things begin with the right essentials.
          </p>
        </div>

        {/* Feedback / Notice Banner */}
        <AuthFeedbackMessage
          type={feedback?.type}
          message={feedback?.message}
          onDismiss={() => setFeedback(null)}
        />

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Full Name */}
          <AuthTextField
            id="signup-name"
            type="text"
            label="Full Name"
            placeholder="Alexandra Vance"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
            }}
            error={errors.fullName}
            icon={<User className="w-4 h-4" />}
            autoComplete="name"
            disabled={isLoading}
          />

          {/* Email */}
          <AuthTextField
            id="signup-email"
            type="email"
            label="Email Address"
            placeholder="alexandra@domain.com"
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

          {/* Password */}
          <div>
            <PasswordField
              id="signup-password"
              label="Password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              error={errors.password}
              autoComplete="new-password"
              disabled={isLoading}
            />
            <PasswordStrengthIndicator password={password} />
          </div>

          {/* Confirm Password */}
          <PasswordField
            id="signup-confirm-password"
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
            }}
            error={errors.confirmPassword}
            autoComplete="new-password"
            disabled={isLoading}
          />

          {/* Terms checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-[#5A5C55]">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => {
                  setAcceptTerms(e.target.checked);
                  if (errors.acceptTerms) setErrors((prev) => ({ ...prev, acceptTerms: undefined }));
                }}
                className="w-4 h-4 mt-0.5 rounded-none border-[#E4DED4] text-[#242522] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#242522]"
              />
              <span className="font-light leading-relaxed">
                I agree to the{' '}
                <a
                  href="#terms"
                  onClick={(e) => e.preventDefault()}
                  className="text-[#242522] underline underline-offset-2 hover:text-[#777B63]"
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href="#privacy"
                  onClick={(e) => e.preventDefault()}
                  className="text-[#242522] underline underline-offset-2 hover:text-[#777B63]"
                >
                  Privacy Policy
                </a>
                .
              </span>
            </label>
            {errors.acceptTerms && (
              <p className="text-[11px] text-[#A65B5B] font-light mt-1">
                {errors.acceptTerms}
              </p>
            )}
          </div>

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 bg-[#242522] hover:bg-[#383934] active:bg-[#1a1b18] text-[#F8F6F1] text-xs uppercase tracking-widest font-medium transition-all duration-200 flex items-center justify-center gap-2 rounded-none shadow-xs disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#D8C6AA]" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4 text-[#D8C6AA] group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <AuthDivider label="OR SIGN UP WITH" />

        {/* Social Authentication Buttons */}
        <div className="space-y-3">
          <SocialAuthButton
            provider="google"
            label="Sign up with Google"
            onClick={handleGoogleClick}
            disabled={isLoading}
          />
        </div>

        {/* Footer Link */}
        <AuthFooter
          promptText="Already have an account?"
          linkText="Sign in."
          linkTo="/login"
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
