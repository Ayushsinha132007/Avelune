import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  RotateCcw,
  Send,
  Minimize2,
  ChevronRight,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { useAssistant } from '../../context/AssistantContext';
import { ChatMessage } from './ChatMessage';
import { PreferenceStep } from './PreferenceStep';
import { RecommendationResults } from './RecommendationResults';

export const ShoppingAssistantDrawer: React.FC = () => {
  const {
    isOpen,
    closeAssistant,
    resetConversation,
    messages,
    currentStep,
    recommendations,
    isTyping,
    handleUserTextMessage,
  } = useAssistant();

  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat when new messages or steps appear
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, currentStep, isTyping, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      handleUserTextMessage(inputText.trim());
      setInputText('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAssistant}
            className="fixed inset-0 bg-[#242522]/50 backdrop-blur-xs transition-opacity"
          />

          {/* Assistant Slide-in Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full sm:w-[480px] lg:w-[520px] bg-[#F8F6F1] h-[100dvh] max-h-screen shadow-2xl flex flex-col z-10 border-l border-[#E4DED4] overflow-hidden"
          >
            {/* 1. Header */}
            <div className="p-4 sm:p-5 bg-white border-b border-[#E4DED4] flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#242522] text-[#D8C6AA] flex items-center justify-center shrink-0 border border-[#D8C6AA]/40 shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-base sm:text-lg text-[#242522] font-normal tracking-tight">
                      Avelune Style Assistant
                    </h3>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  </div>
                  <p className="text-[11px] text-[#777B63] font-light">
                    Your personal shopping companion.
                  </p>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={resetConversation}
                  title="Reset conversation"
                  aria-label="Reset conversation"
                  className="p-2 text-[#5A5C55] hover:text-[#242522] hover:bg-[#EFE9DF] rounded-xs transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={closeAssistant}
                  title="Close assistant"
                  aria-label="Close assistant"
                  className="p-2 text-[#5A5C55] hover:text-[#242522] hover:bg-[#EFE9DF] rounded-xs transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 2. Scrollable Chat History & Interactive Preference Steps */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* Message History */}
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}

              {/* Interactive Questionnaire Steps (shown below message prompt) */}
              {currentStep !== 'recommendations' && <PreferenceStep />}

              {/* Recommendations Display */}
              {currentStep === 'recommendations' && <RecommendationResults />}

              {/* Scroll Anchor */}
              <div ref={messagesEndRef} />
            </div>

            {/* 3. Text Input Bar & Disclaimer */}
            <div className="p-3 sm:p-4 bg-white border-t border-[#E4DED4] shrink-0">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. 'Men, Party, ₹2,000' or 'Party shirts under 2000'..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-[#F8F6F1] border border-[#E4DED4] px-3.5 py-2.5 text-xs sm:text-sm text-[#242522] placeholder-[#A8A69E] focus:outline-none focus:border-[#242522] rounded-none"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  aria-label="Send message to assistant"
                  className="p-2.5 bg-[#242522] hover:bg-[#383934] disabled:opacity-40 text-[#F8F6F1] rounded-none transition-colors shrink-0"
                >
                  <Send className="w-4 h-4 text-[#D8C6AA]" />
                </button>
              </form>

              <div className="mt-2 text-center text-[10px] text-[#A8A69E]">
                Personalized stylist recommendations using curated local catalogue data.
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

