import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export const LookbookSection: React.FC = () => {
  return (
    <section id="editorial-lookbook" className="scroll-mt-24 py-20 sm:py-32 bg-[#EFE9DF]/30 px-4 sm:px-6 lg:px-8 border-t border-[#E4DED4]">
      <div className="max-w-7xl mx-auto">
        {/* Magazine Header */}
        <div className="flex items-center justify-between border-b border-[#242522] pb-4 mb-10">
          <span className="text-[11px] uppercase tracking-widest-luxury font-semibold text-[#242522]">
            AVELUNE Journal — Volume IV
          </span>
          <span className="text-xs font-serif italic text-[#777B63]">
            Autumn in Kashmir & Kyoto
          </span>
          <span className="text-[11px] uppercase tracking-wider text-[#5A5C55] hidden sm:inline-block">
            October 2026
          </span>
        </div>

        {/* Magazine Editorial Collage Spread */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Large Editorial Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 relative group"
          >
            <div className="aspect-[4/5] sm:aspect-[16/11] lg:aspect-[4/5] overflow-hidden bg-[#EFE9DF] rounded-xs shadow-subtle-luxury relative">
              <img
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1400&auto=format&fit=crop"
                alt="Editorial lookbook Autumn styling"
                loading="lazy"
                className="w-full h-full object-cover object-center filter saturate-[0.9] group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#242522]/60 via-transparent to-transparent opacity-60" />

              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-[10px] uppercase tracking-widest text-[#D8C6AA] font-medium">
                  Plate 01 / Outerwear In Transition
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-light mt-1 text-[#F8F6F1]">
                  "Form follows the warmth of natural light."
                </h3>
              </div>
            </div>
          </motion.div>

          {/* Right Supporting Visuals & Journal Entry */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
            {/* Supporting Image Top */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="aspect-square bg-[#EFE9DF] overflow-hidden rounded-xs border border-[#E4DED4]/80">
                <img
                  src="https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=700&auto=format&fit=crop"
                  alt="Atmospheric warm brass lighting"
                  loading="lazy"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="aspect-square bg-[#EFE9DF] overflow-hidden rounded-xs border border-[#E4DED4]/80">
                <img
                  src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=700&auto=format&fit=crop"
                  alt="Full-grain leather tote detail"
                  loading="lazy"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </motion.div>

            {/* Editorial Article Excerpt */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="pt-4 border-t border-[#E4DED4]"
            >
              <span className="text-xs uppercase tracking-widest text-[#777B63] font-medium block mb-2">
                Essay • 04
              </span>
              <h4 className="font-serif text-2xl text-[#242522] leading-snug">
                On the Sensory Weight of Living Spaces
              </h4>
              <p className="text-xs sm:text-sm text-[#5A5C55] font-light leading-relaxed mt-3">
                In this issue, we spend three mornings with an architect in Shimla and a ceramicist in Kyoto to understand why the objects that surround us possess such immense psychological resonance.
              </p>

              <div className="mt-6">
                <a
                  href="#journal"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("AVELUNE Journal Volume IV is distributed print-only with orders above ₹5,000. Digital reader coming soon.");
                  }}
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-medium text-[#242522] hover:text-[#777B63] group pb-1 border-b border-[#242522] hover:border-[#777B63] transition-all"
                >
                  <span>Explore the Journal</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#D8C6AA] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

