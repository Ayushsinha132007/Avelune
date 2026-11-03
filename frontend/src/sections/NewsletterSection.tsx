import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setStatus('error');
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!validateEmail(email)) {
      setStatus('error');
      setErrorMessage('Please provide a valid email format (e.g. name@domain.com).');
      return;
    }

    // Success state
    setStatus('success');
    setErrorMessage('');
  };

  return (
    <section id="newsletter-section" className="scroll-mt-24 py-20 sm:py-28 bg-[#EFE9DF]/60 px-4 sm:px-6 lg:px-8 border-t border-[#E4DED4]">
      <div className="max-w-3xl mx-auto text-center">
        <span className="text-xs uppercase tracking-widest-luxury text-[#777B63] font-medium block mb-2">
          Atelier Letters
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#242522] font-normal tracking-tight">
          A little inspiration, occasionally.
        </h2>
        <p className="mt-4 text-sm sm:text-base text-[#5A5C55] font-light max-w-lg mx-auto leading-relaxed">
          New collections, considered stories, and early access to what comes next. Delivered with discretion and zero noise.
        </p>

        {/* Subscription Form */}
        <div className="mt-8 max-w-md mx-auto">
          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-white border border-[#D8C6AA] rounded-xs text-center"
            >
              <div className="w-8 h-8 rounded-full bg-[#EFE9DF] text-[#777B63] flex items-center justify-center mx-auto mb-2">
                <Check className="w-4 h-4" />
              </div>
              <h4 className="font-serif text-lg text-[#242522]">Thank you for subscribing</h4>
              <p className="text-xs text-[#5A5C55] font-light mt-1">
                We have added <span className="text-[#242522] font-medium">{email}</span> to our private atelier ledger.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === 'error') setStatus('idle');
                }}
                className={`flex-1 px-4 py-3.5 text-xs sm:text-sm bg-white border text-[#242522] placeholder-[#5A5C55]/60 focus:outline-none transition-colors rounded-none ${
                  status === 'error'
                    ? 'border-[#A65B5B]'
                    : 'border-[#E4DED4] focus:border-[#242522]'
                }`}
              />
              <button
                type="submit"
                className="px-6 py-3.5 bg-[#242522] hover:bg-[#383934] text-[#F8F6F1] text-xs font-medium uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shrink-0 group"
              >
                <span>Subscribe</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#D8C6AA] group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )}

          {status === 'error' && (
            <p className="text-xs text-[#A65B5B] text-left mt-2">{errorMessage}</p>
          )}

          <p className="text-[11px] text-[#5A5C55]/70 mt-3 font-light">
            By subscribing, you agree to receive editorial correspondence. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
};

