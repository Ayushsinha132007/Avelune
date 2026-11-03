import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, AlertCircle, CheckCircle2, X } from 'lucide-react';

export interface AuthFeedbackMessageProps {
  type?: 'info' | 'error' | 'success';
  message?: string | null;
  onDismiss?: () => void;
}

export const AuthFeedbackMessage: React.FC<AuthFeedbackMessageProps> = ({
  type = 'info',
  message,
  onDismiss,
}) => {
  if (!message) return null;

  const getStyle = () => {
    switch (type) {
      case 'error':
        return {
          bg: 'bg-[#FAF0F0]',
          border: 'border-[#E2B7B7]',
          text: 'text-[#873636]',
          icon: <AlertCircle className="w-4 h-4 shrink-0 text-[#873636]" />,
        };
      case 'success':
        return {
          bg: 'bg-[#F4F6F1]',
          border: 'border-[#CBD3BE]',
          text: 'text-[#535941]',
          icon: <CheckCircle2 className="w-4 h-4 shrink-0 text-[#535941]" />,
        };
      case 'info':
      default:
        return {
          bg: 'bg-[#F2EDE4]',
          border: 'border-[#D8C6AA]',
          text: 'text-[#3E3832]',
          icon: <Info className="w-4 h-4 shrink-0 text-[#777B63]" />,
        };
    }
  };

  const style = getStyle();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        className={`p-3.5 border ${style.bg} ${style.border} ${style.text} rounded-none flex items-start justify-between gap-3 text-xs leading-relaxed my-4`}
      >
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5">{style.icon}</span>
          <p className="font-light">{message}</p>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="p-0.5 opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Dismiss message"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

