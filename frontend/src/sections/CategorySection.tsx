import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { CATEGORIES_DATA } from '../data/products';
import { CategoryType } from '../types';

interface CategorySectionProps {
  onSelectCategory: (category: CategoryType) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({ onSelectCategory }) => {
  return (
    <section id="shop-categories" className="scroll-mt-24 py-20 sm:py-28 bg-[#F8F6F1] px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 border-b border-[#E4DED4] pb-6">
          <div>
            <span className="text-xs uppercase tracking-widest-luxury text-[#777B63] font-medium block mb-2">
              Curated Realms
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#242522] font-normal tracking-tight">
              Find Your Everyday
            </h2>
          </div>
          <p className="text-sm text-[#5A5C55] font-light max-w-sm mt-3 md:mt-0 leading-relaxed">
            Thoughtful essentials for the way you live. Designed with quiet architectural intent and enduring materiality.
          </p>
        </div>

        {/* Asymmetrical Editorial Category Grid */}
        <div className="grid grid-cols-12 gap-6 sm:gap-8">
          {CATEGORIES_DATA.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => onSelectCategory(cat.title)}
              className={`group cursor-pointer relative overflow-hidden bg-[#EFE9DF] rounded-xs ${
                cat.gridSpanDesktop || 'col-span-12 md:col-span-6'
              }`}
            >
              <div className="relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/10] overflow-hidden">
                {/* Background Editorial Image */}
                <img
                  src={cat.image}
                  alt={cat.title}
                  loading="lazy"
                  className="w-full h-full object-cover object-center filter saturate-[0.9] group-hover:scale-105 group-hover:saturate-100 transition-all duration-700 ease-out"
                />

                {/* Subtle Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#242522]/85 via-[#242522]/35 to-transparent transition-opacity duration-300" />

                {/* Top Badge */}
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                  <span className="px-3 py-1 bg-[#F8F6F1]/90 backdrop-blur-sm text-[10px] uppercase tracking-widest font-medium text-[#242522]">
                    {cat.tag}
                  </span>
                </div>

                {/* Bottom Content Layer */}
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 flex items-end justify-between">
                  <div className="max-w-md">
                    <span className="text-[11px] uppercase tracking-wider text-[#D8C6AA] font-medium block mb-1">
                      {cat.itemCount} Archival Designs
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#F8F6F1] font-normal group-hover:text-[#D8C6AA] transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#F8F6F1]/80 font-light mt-1.5 hidden sm:block line-clamp-2">
                      {cat.subtitle}
                    </p>
                  </div>

                  {/* Circular Arrow Button */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white group-hover:bg-[#242522] group-hover:text-[#D8C6AA] group-hover:border-[#242522] transition-all duration-300 shrink-0 ml-4">
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

