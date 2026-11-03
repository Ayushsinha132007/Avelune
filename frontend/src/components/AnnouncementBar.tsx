import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X } from 'lucide-react';
import { scrollToSection } from '../utils/scroll';

const ANNOUNCEMENTS = [
  'Complimentary shipping on all domestic orders above ₹1,999',
  'Autumn / Winter 2026: The Signature Collection is now live',
  'Crafted in limited artisanal batches with zero compromise',
];

export const AnnouncementBar: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="bg-[#242522] text-[#F8F6F1] text-xs py-2 px-4 relative z-50 border-b border-[#383934] transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left balance spacer */}
        <div className="w-6 hidden md:block" />

        {/* Center message carousel */}
        <div
          onClick={() => scrollToSection('new-arrivals', 80)}
          className="flex-1 flex items-center justify-center overflow-hidden h-5 cursor-pointer group"
          title="Click to view new arrivals"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-2 font-light tracking-wide text-center group-hover:text-[#D8C6AA] transition-colors"
            >
              <span>{ANNOUNCEMENTS[index]}</span>
              <ChevronRight className="w-3 h-3 text-[#D8C6AA] hidden sm:inline-block" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right close button */}
        <button
          onClick={() => setIsVisible(false)}
          aria-label="Close announcement bar"
          className="text-[#D8C6AA]/70 hover:text-[#F8F6F1] transition-colors p-1 -mr-1"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

