import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useAssistant } from '../../context/AssistantContext';
import { useRequireAuth } from '../../hooks/useRequireAuth';

export const ShoppingAssistantButton: React.FC = () => {
  const { toggleAssistant, isOpen } = useAssistant();
  const { requireAuth } = useRequireAuth();

  // Hide the floating button while assistant drawer is open
  if (isOpen) return null;

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40">
      <motion.button
        type="button"
        onClick={() =>
          requireAuth(
            toggleAssistant,
            undefined,
            'Please sign in to consult your personal AI Style Consultant.'
          )
        }
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        aria-label="Open Avelune Style Assistant"
        className="flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full bg-[#242522] text-[#F8F6F1] shadow-xl border border-[#D8C6AA] cursor-pointer hover:bg-[#383934] transition-all group"
      >
        <div className="relative flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-[#D8C6AA] group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#242522]" />
        </div>
        <span className="text-xs uppercase tracking-wider font-medium text-[#F8F6F1] pr-0.5 whitespace-nowrap">
          Style Assistant
        </span>
      </motion.button>
    </div>
  );
};
