import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Compass, Feather, Sparkles, X } from 'lucide-react';

export const BrandStorySection: React.FC = () => {
  const [philosophyModal, setPhilosophyModal] = useState(false);

  return (
    <>
      <section id="brand-story" className="scroll-mt-24 py-20 sm:py-32 bg-[#EFE9DF]/40 px-4 sm:px-6 lg:px-8 border-y border-[#E4DED4]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Editorial Lifestyle Imagery */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 relative"
            >
              <div className="relative aspect-[4/5] sm:aspect-[1/1] lg:aspect-[4/5] rounded-xs overflow-hidden bg-[#EFE9DF] shadow-subtle-luxury">
                <img
                  src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200&auto=format&fit=crop"
                  alt="AVELUNE Atelier Craftsmanship"
                  loading="lazy"
                  className="w-full h-full object-cover object-center filter saturate-[0.85] contrast-[1.05]"
                />

                {/* Overlaid Detail Badge */}
                <div className="absolute top-6 left-6 bg-[#242522]/90 backdrop-blur-md px-3.5 py-2 text-[#F8F6F1]">
                  <p className="text-[9px] uppercase tracking-widest text-[#D8C6AA]">
                    Atelier Standard
                  </p>
                  <p className="font-serif text-xs mt-0.5">Quiet Rigor & Restraint</p>
                </div>
              </div>

              {/* Inset Secondary Image for Depth */}
              <div className="hidden sm:block absolute -bottom-8 -right-8 w-48 h-56 bg-white p-2 shadow-drawer-luxury border border-[#E4DED4]">
                <img
                  src="https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=600&auto=format&fit=crop"
                  alt="Tactile stoneware interior"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            {/* Right Story Prose & Principles */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 flex flex-col justify-center lg:pl-6"
            >
              <span className="text-xs uppercase tracking-widest-luxury text-[#777B63] font-medium block mb-3">
                Our Foundation
              </span>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#242522] font-normal tracking-tight leading-[1.15]">
                Less, but better.
              </h2>

              <p className="mt-6 text-base sm:text-lg text-[#5A5C55] font-light leading-relaxed">
                We believe the things we choose should earn their place. Thoughtful design, considered details, and timeless essentials made for everyday living.
              </p>

              <p className="mt-4 text-xs sm:text-sm text-[#5A5C55]/90 font-light leading-relaxed">
                Rather than chasing seasonal novelty or synthetic embellishments, AVELUNE crafts enduring garments and tactile living objects engineered from pure natural fibers, vegetable-tanned leathers, and unhurried ceramic firings.
              </p>

              {/* Three Pillars */}
              <div className="mt-8 pt-6 border-t border-[#E4DED4] space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#EFE9DF] flex items-center justify-center shrink-0 mt-0.5">
                    <Feather className="w-4 h-4 text-[#777B63]" />
                  </div>
                  <div>
                    <h4 className="font-serif text-base text-[#242522]">Honest Materiality</h4>
                    <p className="text-xs text-[#5A5C55] font-light mt-0.5">
                      GOTS organic cotton, Grade-A Mongolian cashmere, and untreated Belgian flax.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#EFE9DF] flex items-center justify-center shrink-0 mt-0.5">
                    <Compass className="w-4 h-4 text-[#777B63]" />
                  </div>
                  <div>
                    <h4 className="font-serif text-base text-[#242522]">Architectural Proportion</h4>
                    <p className="text-xs text-[#5A5C55] font-light mt-0.5">
                      Calm silhouettes designed to be worn across years, not fashion cycles.
                    </p>
                  </div>
                </div>
              </div>

              {/* Philosophy CTA */}
              <div className="mt-10">
                <button
                  onClick={() => setPhilosophyModal(true)}
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-medium text-[#242522] hover:text-[#777B63] group pb-1 border-b border-[#242522] hover:border-[#777B63] transition-all"
                >
                  <span>Our Philosophy</span>
                  <ArrowRight className="w-4 h-4 text-[#D8C6AA] group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Philosophy Modal */}
      <AnimatePresence>
        {philosophyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPhilosophyModal(false)}
              className="fixed inset-0 bg-[#242522]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative max-w-xl w-full bg-[#F8F6F1] p-8 border border-[#E4DED4] shadow-modal-luxury z-10"
            >
              <button
                onClick={() => setPhilosophyModal(false)}
                className="absolute top-4 right-4 p-2 text-[#5A5C55] hover:text-[#242522]"
                aria-label="Close philosophy dialog"
              >
                <X className="w-5 h-5" />
              </button>

              <span className="text-xs uppercase tracking-widest text-[#777B63] font-medium block">
                The AVELUNE Manifesto
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-[#242522] mt-2">
                "Quiet confidence in what remains."
              </h3>
              <div className="space-y-4 text-xs sm:text-sm text-[#5A5C55] font-light leading-relaxed mt-4 pt-4 border-t border-[#E4DED4]">
                <p>
                  In a culture addicted to planned obsolescence and loud branding, we advocate for the sanctuary of permanence. Everything we produce is tested for longevity, graceful ageing, and quiet harmony with your existing life.
                </p>
                <p>
                  Every seam, every button choice, and every stoneware firing is conducted with ethical responsibility and transparent pricing in Indian Rupees.
                </p>
              </div>
              <button
                onClick={() => setPhilosophyModal(false)}
                className="mt-6 px-6 py-2.5 bg-[#242522] text-[#F8F6F1] text-xs uppercase tracking-widest hover:bg-[#383934] transition-colors"
              >
                Close Manifesto
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

