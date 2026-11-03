import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { scrollToSection } from '../utils/scroll';

interface HeroSectionProps {
  onExploreClick?: () => void;
  onStoryClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreClick,
  onStoryClick,
}) => {
  const scrollToFeatured = () => {
    if (onExploreClick) {
      onExploreClick();
    } else {
      scrollToSection('featured-collection');
    }
  };

  const scrollToStory = () => {
    if (onStoryClick) {
      onStoryClick();
    } else {
      scrollToSection('brand-story');
    }
  };

  const scrollToNextSection = () => {
    scrollToSection('shop-categories');
  };

  return (
    <section
      id="hero-section"
      className="relative min-h-[90vh] lg:min-h-[94vh] flex items-center overflow-hidden bg-[#F8F6F1] pt-6 pb-16 px-4 sm:px-6 lg:px-8 scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Asymmetrical Editorial Typography */}
        <div className="lg:col-span-5 flex flex-col justify-center z-10 order-2 lg:order-1 pt-4 lg:pt-0">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 text-xs tracking-widest-luxury uppercase text-[#777B63] font-medium"
          >
            <span className="w-8 h-[1px] bg-[#777B63]" />
            <span>The New Season / 2026</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#242522] font-normal leading-[1.08] tracking-tight mt-6"
          >
            Considered pieces.
            <br />
            <span className="italic font-light text-[#5A5C55]">Enduring presence.</span>
          </motion.h1>

          {/* Supporting Copy */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 text-sm sm:text-base text-[#5A5C55] font-light leading-relaxed max-w-md"
          >
            Discover thoughtfully selected essentials designed to bring beauty, purpose, and quiet confidence to everyday life.
          </motion.p>

          {/* Dual CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 sm:mt-10 flex flex-wrap items-center gap-4"
          >
            <button
              onClick={scrollToFeatured}
              className="px-8 py-4 bg-[#242522] hover:bg-[#383934] text-[#F8F6F1] text-xs uppercase tracking-widest font-medium transition-all duration-300 shadow-sm flex items-center gap-2 group"
            >
              <span>Explore the Collection</span>
              <ArrowUpRight className="w-4 h-4 text-[#D8C6AA] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>

            <button
              onClick={scrollToStory}
              className="px-6 py-4 bg-transparent hover:bg-[#EFE9DF]/60 text-[#242522] text-xs uppercase tracking-widest font-medium border border-[#E4DED4] transition-all duration-300"
            >
              Discover Our Story
            </button>
          </motion.div>

          {/* Micro Brand Highlights */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-12 pt-8 border-t border-[#E4DED4]/70 grid grid-cols-3 gap-4 text-left"
          >
            <div>
              <p className="font-serif text-lg font-medium text-[#242522]">100%</p>
              <p className="text-[10px] uppercase tracking-wider text-[#777B63] mt-0.5">
                Traceable Fibers
              </p>
            </div>
            <div>
              <p className="font-serif text-lg font-medium text-[#242522]">Artisanal</p>
              <p className="text-[10px] uppercase tracking-wider text-[#777B63] mt-0.5">
                Small-Batch Firings
              </p>
            </div>
            <div>
              <p className="font-serif text-lg font-medium text-[#242522]">Direct</p>
              <p className="text-[10px] uppercase tracking-wider text-[#777B63] mt-0.5">
                Atelier To Hand
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Hero Editorial Lifestyle Photography */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 relative order-1 lg:order-2"
        >
          {/* Main Hero Image Frame */}
          <div className="relative aspect-[4/5] sm:aspect-[16/11] lg:aspect-[5/6] w-full overflow-hidden bg-[#EFE9DF] rounded-xs shadow-subtle-luxury">
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=85&w=1600&auto=format&fit=crop"
              alt="AVELUNE Atelier Autumn / Winter Collection"
              fetchPriority="high"
              className="w-full h-full object-cover object-center filter saturate-[0.95] contrast-[1.02] transform hover:scale-[1.02] transition-transform duration-1000 ease-out"
            />

            {/* Subtle Gradient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#242522]/30 via-transparent to-transparent opacity-40 pointer-events-none" />

            {/* Overlaid Editorial Note Tag */}
            <div className="absolute bottom-6 right-6 hidden sm:block bg-white/95 backdrop-blur-md p-4 border border-[#E4DED4] max-w-[240px] text-left">
              <span className="text-[10px] uppercase tracking-widest text-[#777B63] font-medium block">
                Featured Silhouette
              </span>
              <p className="font-serif text-sm text-[#242522] mt-1">
                The Atelier Relaxed Trench & Combed Cotton Poplin
              </p>
              <span className="text-xs font-medium text-[#242522] block mt-1">
                Edition of 150
              </span>
            </div>
          </div>

          {/* Decorative Framing Accent */}
          <div className="hidden lg:block absolute -top-4 -right-4 w-32 h-32 border-t-2 border-r-2 border-[#D8C6AA]/70 pointer-events-none" />
        </motion.div>
      </div>

      {/* Subtle Scroll Indicator */}
      <motion.button
        onClick={scrollToNextSection}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1.5 text-[#777B63] hover:text-[#242522] transition-colors"
        aria-label="Scroll down to categories"
      >
        <span className="text-[10px] uppercase tracking-widest font-medium">Scroll</span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <ArrowDown className="w-3.5 h-3.5" />
        </motion.div>
      </motion.button>
    </section>
  );
};

