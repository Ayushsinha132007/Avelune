import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Bot, Compass, ShieldCheck, Shirt } from 'lucide-react';
import { useAssistant } from '../hooks/useAssistant';
import { useRequireAuth } from '../hooks/useRequireAuth';

interface StylistPreset {
  id: string;
  badge: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
}

const STYLIST_PRESETS: StylistPreset[] = [
  {
    id: 'preset-party-men',
    badge: 'Trending Consultation',
    title: "Men's Evening Celebration",
    description: 'Crisp party shirts & slim tailored jacquard trousers strictly within ₹2,000.',
    prompt: "I need a men's partywear outfit under ₹2,000",
    category: 'Men • Partywear',
  },
  {
    id: 'preset-silk-women',
    badge: 'Executive Capsule',
    title: 'Minimalist Silk Boardroom',
    description: 'Subtle mulberry silk blouses and tailored wide-leg trousers for quiet authority.',
    prompt: "Show me women's office formal silk and tailored clothing",
    category: 'Women • Professional',
  },
  {
    id: 'preset-summer-linen',
    badge: 'Travel Edit',
    title: 'Tuscan Linen Getaway',
    description: 'Breathable Italian linen shirts, relaxed drawstring trousers, and natural accessories.',
    prompt: 'Curate a relaxed linen vacation capsule for warm climates',
    category: 'Unisex • Travel',
  },
  {
    id: 'preset-festive-chanderi',
    badge: 'Heritage Craft',
    title: 'Festive Handloom & Chanderi',
    description: 'Pure chanderi silk sets, handloom weaves, and gold zari embroidery.',
    prompt: 'Recommend authentic festive and wedding wear with artisan weaves',
    category: 'All • Festive',
  },
];

export const AiStylistSalon: React.FC = () => {
  const { openAssistant, handleUserTextMessage } = useAssistant();
  const { requireAuth } = useRequireAuth();
  const [customInput, setCustomInput] = useState('');

  const handlePresetClick = (preset: StylistPreset) => {
    requireAuth(
      () => {
        openAssistant(preset.prompt);
        handleUserTextMessage(preset.prompt);
      },
      undefined,
      'Please sign in to consult your personal AI stylist.'
    );
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requireAuth(
      () => {
        if (!customInput.trim()) {
          openAssistant();
          return;
        }
        openAssistant(customInput.trim());
        handleUserTextMessage(customInput.trim());
        setCustomInput('');
      },
      undefined,
      'Please sign in to consult your personal AI stylist.'
    );
  };

  return (
    <section className="py-24 sm:py-32 bg-[#1C1D1A] text-[#F8F6F1] px-4 sm:px-6 lg:px-12 relative overflow-hidden border-b border-[#2C2E29]">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D8C6AA]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest-luxury text-[#D8C6AA] font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#D8C6AA]" />
            <span>AI Style Concierge</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-[#F8F6F1]">
            L'Atelier Styliste
          </h2>
          <p className="text-sm sm:text-base text-[#A8A59B] font-light mt-4 leading-relaxed">
            Our personal shopping consultant powered by Google Gemini and real database inventory.
            We treat your budget, category, and occasion as hard constraints — never hallucinating or guessing.
          </p>
        </div>

        {/* 4 Interactive Consultation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STYLIST_PRESETS.map((preset, index) => (
            <motion.div
              key={preset.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => handlePresetClick(preset)}
              className="group cursor-pointer p-6 bg-[#242522] border border-[#383A32] rounded-xs hover:border-[#D8C6AA] hover:bg-[#2A2B27] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[9px] uppercase tracking-widest text-[#D8C6AA] font-medium px-2 py-0.5 bg-[#181916] rounded-xs">
                    {preset.badge}
                  </span>
                  <Shirt className="w-3.5 h-3.5 text-[#8C8A82] group-hover:text-[#D8C6AA] transition-colors" />
                </div>
                <h3 className="font-serif text-lg text-[#F8F6F1] font-normal group-hover:text-[#D8C6AA] transition-colors">
                  {preset.title}
                </h3>
                <p className="text-xs text-[#A8A59B] font-light mt-2 leading-relaxed">
                  {preset.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#33352E] flex items-center justify-between text-[11px] uppercase tracking-wider text-[#D8C6AA]">
                <span>Launch Consultation</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Custom Query Input Bar */}
        <div className="mt-12 p-6 sm:p-8 bg-[#242522] border border-[#383A32] rounded-xs">
          <form onSubmit={handleCustomSubmit} className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Ask the atelier stylist (e.g. 'I need formal trousers and silk shirt for an art gallery opening under ₹3,500')..."
                className="w-full bg-[#181916] border border-[#44463E] px-5 py-3.5 text-sm text-[#F8F6F1] placeholder-[#777B63] focus:outline-none focus:border-[#D8C6AA] transition-colors"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3.5 bg-[#F8F6F1] text-[#181916] text-xs uppercase tracking-widest-luxury font-medium hover:bg-[#D8C6AA] transition-all whitespace-nowrap flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Consult Atelier Stylist</span>
            </button>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-[#8C8A82]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#A3B18A]" />
              Strict Budget Guard
            </span>
            <span>•</span>
            <span>100% Real Database SKU Verification</span>
            <span>•</span>
            <span>Zero Hallucinated Products</span>
          </div>
        </div>

      </div>
    </section>
  );
};

