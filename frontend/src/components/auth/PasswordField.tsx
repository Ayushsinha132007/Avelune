import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock } from 'lucide-react';

export interface PasswordFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  id: string;
  error?: string;
  showIcon?: boolean;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  id,
  error,
  showIcon = true,
  className = '',
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="w-full flex flex-col space-y-1.5 text-left">
      <label
        htmlFor={id}
        className="text-[11px] uppercase tracking-wider font-medium text-[#242522]"
      >
        {label}
      </label>

      <div className="relative flex items-center">
        {showIcon && (
          <div className="absolute left-3.5 text-[#777B63] pointer-events-none flex items-center">
            <Lock className="w-4 h-4" />
          </div>
        )}

        <input
          id={id}
          type={isVisible ? 'text' : 'password'}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full py-3 text-xs sm:text-sm bg-white border text-[#242522] placeholder-[#5A5C55]/50 transition-colors rounded-none focus:outline-none ${
            showIcon ? 'pl-10 pr-11' : 'pl-3.5 pr-11'
          } ${
            error
              ? 'border-[#A65B5B] focus:border-[#A65B5B] focus:ring-1 focus:ring-[#A65B5B]'
              : 'border-[#E4DED4] focus:border-[#242522] focus:ring-1 focus:ring-[#242522]'
          } ${className}`}
          {...props}
        />

        {/* Visibility Toggle Button */}
        <button
          type="button"
          onClick={() => setIsVisible((prev) => !prev)}
          className="absolute right-3 p-1 text-[#5A5C55] hover:text-[#242522] transition-colors focus:outline-none"
          aria-label={isVisible ? 'Hide password' : 'Show password'}
        >
          {isVisible ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            id={`${id}-error`}
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-[11px] text-[#A65B5B] font-light mt-0.5"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

