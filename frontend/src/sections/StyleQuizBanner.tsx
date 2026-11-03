import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAssistant } from '../context/AssistantContext';

export const StyleQuizBanner: React.FC = () => {
  const { openAssistant } = useAssistant();

  return (
    <section className="py-20 sm:py-24 bg-[#EFE9DF]/40 border-t border-b border-[#E4DED4] px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white border border-[#E4DED4] p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-subtle-luxury">
          {/* Subtle Ambient Decorative Glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-[#D8C6AA]/20 blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Editorial Copy */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#777B63]" />
                <span className="text-xs uppercase tracking-widest-luxury text-[#777B63] font-medium">
                  Avelune Personal Stylist
                </span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#242522] font-normal tracking-tight">
                Your Style, Thoughtfully Curated
              </h2>

              <p className="text-sm sm:text-base text-[#5A5C55] font-light max-w-2xl leading-relaxed">
                Tell us the occasion, your budget, and what you love. We’ll help you find the right pieces from our permanent collection and archival drops.
              </p>

              {/* Value Badges */}
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-[#242522]/80">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#777B63]" />
                  <span>Occasion-ready recommendations</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#777B63]" />
                  <span>Strict budget alignment</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#777B63]" />
                  <span>Curated to your personal aesthetic</span>
                </div>
              </div>
            </div>

            {/* Right Action Card */}
            <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openAssistant()}
                className="w-full sm:w-auto px-8 py-4 bg-[#242522] hover:bg-[#383934] text-[#F8F6F1] text-xs uppercase tracking-widest font-medium transition-all duration-300 flex items-center justify-center gap-2.5 shadow-md group"
              >
                <Sparkles className="w-4 h-4 text-[#D8C6AA] group-hover:rotate-12 transition-transform" />
                <span>Find My Style</span>
                <ArrowRight className="w-4 h-4 text-[#D8C6AA] group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <span className="text-[11px] text-[#A8A69E] font-light mt-3 text-left lg:text-right">
                Free, instant conversational curation in 4 steps.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

