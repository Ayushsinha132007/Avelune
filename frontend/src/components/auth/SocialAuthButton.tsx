import React from 'react';
import { motion } from 'framer-motion';

export interface SocialAuthButtonProps {
  provider: 'google' | 'facebook';
  label?: string;
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export const SocialAuthButton: React.FC<SocialAuthButtonProps> = ({
  provider,
  label,
  onClick,
  disabled = false,
  isLoading = false,
}) => {
  const defaultLabel =
    provider === 'google' ? 'Continue with Google' : 'Continue with Facebook';
  const buttonText = label || defaultLabel;

  return (
    <motion.button
      type="button"
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: 0.1 }}
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-label={buttonText}
      className={`w-full py-3 px-4 bg-white border border-[#E4DED4] hover:border-[#D8C6AA] hover:bg-[#F8F6F1] active:bg-[#EFE9DF] text-[#242522] text-xs font-medium tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-3 shadow-xs rounded-none focus:outline-none focus:ring-1 focus:ring-[#242522] ${
        disabled || isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      {/* Official Provider SVG Icons */}
      {provider === 'google' ? (
        <svg
          viewBox="0 0 24 24"
          className="w-4 h-4 shrink-0"
          aria-hidden="true"
        >
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
          />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          className="w-4 h-4 shrink-0 fill-[#1877F2]"
          aria-hidden="true"
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z" />
        </svg>
      )}

      <span>{buttonText}</span>
    </motion.button>
  );
};

