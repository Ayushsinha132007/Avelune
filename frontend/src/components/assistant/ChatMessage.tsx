import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, User } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../../types/shoppingAssistant';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAssistant = message.sender === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 mb-4 ${isAssistant ? 'justify-start' : 'justify-end'}`}
    >
      {/* Assistant Avatar */}
      {isAssistant && (
        <div className="w-8 h-8 rounded-full bg-[#242522] text-[#D8C6AA] flex items-center justify-center shrink-0 shadow-xs border border-[#D8C6AA]/40 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
      )}

      {/* Message Bubble */}
      <div
        className={`max-w-[85%] sm:max-w-[80%] rounded-xs p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed ${
          isAssistant
            ? 'bg-white text-[#242522] border border-[#E4DED4] shadow-xs'
            : 'bg-[#242522] text-[#F8F6F1] font-light shadow-xs'
        }`}
      >
        {isAssistant && (
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-widest font-medium text-[#777B63]">
              Style Assistant
            </span>
            <span className="text-[10px] text-[#A8A69E]">{message.timestamp}</span>
          </div>
        )}

        <div className="font-sans whitespace-pre-line text-[#242522]/90 leading-relaxed font-light">
          {message.text}
        </div>

        {!isAssistant && (
          <div className="text-[10px] text-right text-[#D8C6AA] mt-1 font-mono">
            {message.timestamp}
          </div>
        )}
      </div>

      {/* User Avatar */}
      {!isAssistant && (
        <div className="w-8 h-8 rounded-full bg-[#EFE9DF] text-[#242522] flex items-center justify-center shrink-0 border border-[#E4DED4] mt-0.5">
          <User className="w-4 h-4 text-[#777B63]" />
        </div>
      )}
    </motion.div>
  );
};

