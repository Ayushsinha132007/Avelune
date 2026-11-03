import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface AuthTextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
  icon?: React.ReactNode;
}

export const AuthTextField: React.FC<AuthTextFieldProps> = ({
  label,
  id,
  error,
  icon,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full flex flex-col space-y-1.5 text-left">
      <label
        htmlFor={id}
        className="text-[11px] uppercase tracking-wider font-medium text-[#242522]"
      >
        {label}
      </label>

      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-[#777B63] pointer-events-none flex items-center">
            {icon}
          </div>
        )}

        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full py-3 text-xs sm:text-sm bg-white border text-[#242522] placeholder-[#5A5C55]/50 transition-colors rounded-none focus:outline-none ${
            icon ? 'pl-10 pr-3.5' : 'px-3.5'
          } ${
            error
              ? 'border-[#A65B5B] focus:border-[#A65B5B] focus:ring-1 focus:ring-[#A65B5B]'
              : 'border-[#E4DED4] focus:border-[#242522] focus:ring-1 focus:ring-[#242522]'
          } ${className}`}
          {...props}
        />
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

