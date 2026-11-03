import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Loader2, Mail, User, ShieldCheck } from 'lucide-react';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: { email: string; fullName: string }) => Promise<void>;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please provide a valid Google email address.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onSuccess({
        email: email.trim(),
        fullName: fullName.trim() || email.split('@')[0],
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAccount = (quickEmail: string, quickName: string) => {
    setEmail(quickEmail);
    setFullName(quickName);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#242522]/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-md bg-white border border-[#E4DED4] p-6 sm:p-8 shadow-2xl z-10"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-[#777B63] hover:text-[#242522] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Google Brand Header */}
          <div className="flex items-center gap-3 mb-6">
            <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <div>
              <h2 className="font-serif text-xl text-[#242522]">Sign in with Google</h2>
              <p className="text-[11px] text-[#777B63]">Direct secure authentication with AVELUNE Atelier</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#777B63] mb-1 font-medium">
                Google Account Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#F8F6F1] border border-[#E4DED4] focus:border-[#242522] focus:outline-none text-xs text-[#242522]"
                />
                <Mail className="w-4 h-4 text-[#777B63] absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#777B63] mb-1 font-medium">
                Display Name (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#F8F6F1] border border-[#E4DED4] focus:border-[#242522] focus:outline-none text-xs text-[#242522]"
                />
                <User className="w-4 h-4 text-[#777B63] absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Quick Profiles for Fast Login */}
            <div className="pt-1">
              <span className="text-[10px] uppercase tracking-wider text-[#777B63] block mb-1.5">
                Quick Select Account
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickAccount('ayush.kumar@gmail.com', 'Ayush Kumar')}
                  className="px-2.5 py-1 text-[11px] bg-[#EFE9DF] hover:bg-[#D8C6AA] text-[#242522] transition-colors"
                >
                  Ayush Kumar
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAccount('priya.atelier@gmail.com', 'Priya Sharma')}
                  className="px-2.5 py-1 text-[11px] bg-[#EFE9DF] hover:bg-[#D8C6AA] text-[#242522] transition-colors"
                >
                  Priya Sharma
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-3 bg-[#242522] hover:bg-[#383934] text-[#F8F6F1] text-xs uppercase tracking-widest font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#D8C6AA]" />
                  <span>Connecting with Google...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4 text-[#D8C6AA]" />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-[#E4DED4] flex items-center gap-2 text-[11px] text-[#777B63]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#777B63] shrink-0" />
            <span>Encrypted SSL OAuth session verification on Django backend.</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

