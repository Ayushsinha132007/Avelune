import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Compass, ShieldCheck, MoveRight } from 'lucide-react';
import { useAssistant } from '../hooks/useAssistant';

interface HeroSlide {
  id: string;
  season: string;
  title: string;
  titleItalic: string;
  subtitle: string;
  image: string;
  accent: string;
  primaryLink: string;
  primaryLabel: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-monolith',
    season: 'Autumn / Winter Atelier 2026',
    title: 'Considered pieces.',
    titleItalic: 'Enduring presence.',
    subtitle: 'Tailored sateen shirts, structured evening trousers, and sculptural outerwear crafted for tactile longevity.',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1400&auto=format&fit=crop',
    accent: '#D8C6AA',
    primaryLink: '/collections',
    primaryLabel: 'Explore 2026 Collection',
  },
  {
    id: 'slide-homme',
    season: 'Homme Evening Drop 01',
    title: 'Architectural lines.',
    titleItalic: 'Quiet confidence.',
    subtitle: 'Sharp formal sateen weaves, slim jacquard tailoring, and pure wool coats tailored in limited seasonal editions.',
    image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1400&auto=format&fit=crop',
    accent: '#A3B18A',
    primaryLink: '/collections/men',
    primaryLabel: 'Explore Atelier Homme',
  },
  {
    id: 'slide-femme',
    season: 'Femme Haute Silhouettes',
    title: 'Mulberry silks.',
    titleItalic: 'Sensory ease.',
    subtitle: 'Flowing handloom chanderi, asymmetrical evening slips, and tactile cashmere knits designed to move with you.',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1400&auto=format&fit=crop',
    accent: '#E6CCB2',
    primaryLink: '/collections/women',
    primaryLabel: 'Explore Atelier Femme',
  },
];

export const FlagshipHero: React.FC = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const { openAssistant } = useAssistant();
  const slide = HERO_SLIDES[currentSlideIndex];

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-[#181916] text-[#F8F6F1] pt-6 pb-16 px-4 sm:px-6 lg:px-12 border-b border-[#2C2E29]">
      {/* Subtle Atmospheric Gradient Backdrop */}
      <div className="absolute inset-0 bg-radial-gradient from-[#2A2C27]/40 via-[#181916] to-[#121311] pointer-events-none" />

      {/* Decorative Atelier Grid Lines */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10">
        
        {/* Left Column: Bold Editorial Typography */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          
          {/* Season Mood Switcher Tabs */}
          <div className="flex items-center gap-2 sm:gap-3 mb-6 overflow-x-auto no-scrollbar pb-1">
            {HERO_SLIDES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`text-[10px] sm:text-[11px] uppercase tracking-widest-luxury px-3.5 py-1.5 rounded-full transition-all duration-300 whitespace-nowrap ${
                  idx === currentSlideIndex
                    ? 'bg-[#F8F6F1] text-[#181916] font-semibold shadow-sm'
                    : 'bg-[#242522]/80 text-[#8C8A82] hover:text-[#F8F6F1] border border-[#33352E]'
                }`}
              >
                {s.season.split(' ')[0]} {s.season.split(' ')[1] || ''}
              </button>
            ))}
          </div>

          {/* Eyebrow */}
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id + '-eyebrow'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-3 text-xs tracking-widest-luxury uppercase text-[#A39E93] font-medium"
            >
              <span className="w-8 h-[1px] bg-[#A39E93]" />
              <span>{slide.season}</span>
            </motion.div>
          </AnimatePresence>

          {/* Headline */}
          <AnimatePresence mode="wait">
            <motion.h1
              key={slide.id + '-heading'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal leading-[1.05] tracking-tight mt-5 text-[#F8F6F1]"
            >
              {slide.title}
              <br />
              <span className="italic font-light text-[#D8C6AA]">{slide.titleItalic}</span>
            </motion.h1>
          </AnimatePresence>

          {/* Subtitle */}
          <AnimatePresence mode="wait">
            <motion.p
              key={slide.id + '-sub'}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-[#B3B0A6] text-sm sm:text-base font-light max-w-xl leading-relaxed mt-6"
            >
              {slide.subtitle}
            </motion.p>
          </AnimatePresence>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 mt-8 pt-2">
            <Link
              to={slide.primaryLink}
              className="inline-flex items-center gap-3 px-7 py-3.5 bg-[#F8F6F1] text-[#181916] text-xs uppercase tracking-widest-luxury font-medium hover:bg-[#EFE9DF] transition-all duration-300 shadow-md group"
            >
              <span>{slide.primaryLabel}</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>

            <button
              onClick={() => openAssistant()}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-transparent border border-[#484A42] text-[#F8F6F1] text-xs uppercase tracking-widest-luxury font-medium hover:border-[#D8C6AA] hover:text-[#D8C6AA] transition-all duration-300"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D8C6AA]" />
              <span>Consult AI Stylist</span>
            </button>
          </div>

          {/* Live Luxury Provenance Markers */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6 mt-12 pt-8 border-t border-[#2C2E29]">
            <div>
              <span className="font-serif text-xl sm:text-2xl text-[#F8F6F1] block">46</span>
              <span className="text-[10px] uppercase tracking-wider text-[#8C8A82]">Tailored Silhouettes</span>
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl text-[#F8F6F1] block">100%</span>
              <span className="text-[10px] uppercase tracking-wider text-[#8C8A82]">Natural Fibers</span>
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl text-[#F8F6F1] block">Zero</span>
              <span className="text-[10px] uppercase tracking-wider text-[#8C8A82]">Mass Production</span>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Visual Artwork */}
        <div className="lg:col-span-5 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id + '-image'}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-[4/5] sm:aspect-[3/4] overflow-hidden rounded-xs border border-[#33352E] shadow-2xl bg-[#242522]"
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-center filter saturate-[0.88] brightness-[0.95]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181916]/90 via-transparent to-black/20" />

              {/* Floating Curated Label */}
              <div className="absolute bottom-5 left-5 right-5 p-4 bg-[#181916]/85 backdrop-blur-md border border-[#33352E] flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-widest-luxury text-[#D8C6AA] block font-medium">
                    Atelier Spotlight
                  </span>
                  <span className="font-serif text-sm text-[#F8F6F1] font-light">
                    {slide.season}
                  </span>
                </div>
                <Link
                  to="/collections"
                  className="w-8 h-8 rounded-full border border-[#484A42] flex items-center justify-center text-[#F8F6F1] hover:border-[#D8C6AA] hover:text-[#D8C6AA] transition-colors"
                >
                  <MoveRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Editorial Background Accent */}
          <div className="absolute -bottom-6 -right-6 w-32 h-32 border border-[#484A42]/30 -z-10 pointer-events-none hidden sm:block" />
        </div>

      </div>
    </section>
  );
};
