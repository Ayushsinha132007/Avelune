import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { CAROUSEL_CATEGORIES } from '../../data/products';
import { CarouselCategoryItem, Gender, MerchandisingCollection } from '../../types';

interface CategoryCarouselProps {
  onSelectItem?: (item: CarouselCategoryItem) => void;
  selectedGender?: Gender;
  selectedCollection?: MerchandisingCollection;
  className?: string;
}

export const CategoryCarousel: React.FC<CategoryCarouselProps> = ({
  onSelectItem,
  selectedGender,
  selectedCollection,
  className = '',
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      checkScroll();
      el.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.75;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section id="shop-categories" className={`scroll-mt-24 py-12 sm:py-16 bg-[#F8F6F1] border-b border-[#E4DED4]/60 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#777B63]" />
              <span className="text-[11px] uppercase tracking-widest-luxury text-[#777B63] font-medium">
                Curated Departments
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#242522] font-normal tracking-tight">
              Discover Your Style
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-[#5A5C55] font-light">
              Find the pieces that feel like you. Explore across men, women, juniors, and archival drops.
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              aria-label="Previous categories"
              className={`p-2.5 rounded-full border transition-all duration-300 ${
                canScrollLeft
                  ? 'border-[#242522] text-[#242522] hover:bg-[#242522] hover:text-[#F8F6F1] cursor-pointer'
                  : 'border-[#E4DED4] text-[#A8A69E] cursor-not-allowed opacity-50'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              aria-label="Next categories"
              className={`p-2.5 rounded-full border transition-all duration-300 ${
                canScrollRight
                  ? 'border-[#242522] text-[#242522] hover:bg-[#242522] hover:text-[#F8F6F1] cursor-pointer'
                  : 'border-[#E4DED4] text-[#A8A69E] cursor-not-allowed opacity-50'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {CAROUSEL_CATEGORIES.map((item) => {
            const isSelected =
              (item.gender && item.gender === selectedGender) ||
              (item.collection && item.collection === selectedCollection);

            return (
              <motion.div
                key={item.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
                onClick={() => onSelectItem && onSelectItem(item)}
                className={`snap-start shrink-0 w-[240px] sm:w-[280px] lg:w-[300px] group cursor-pointer relative bg-white border transition-all duration-300 overflow-hidden ${
                  isSelected
                    ? 'border-[#242522] shadow-md ring-1 ring-[#242522]'
                    : 'border-[#E4DED4] hover:border-[#D8C6AA] hover:shadow-subtle-luxury'
                }`}
              >
                {/* Image Container with 4:5 Aspect Ratio */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#EFE9DF]/50">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {/* Subtle Top-Down Darkening for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#242522]/80 via-[#242522]/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                  {/* Top Badge */}
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 text-[10px] uppercase tracking-widest font-medium bg-[#242522]/90 text-[#F8F6F1] backdrop-blur-sm">
                      {item.tag}
                    </span>
                    {isSelected && (
                      <span className="px-2 py-1 text-[9px] uppercase tracking-wider font-semibold bg-[#D8C6AA] text-[#242522]">
                        Active
                      </span>
                    )}
                  </div>

                  {/* Bottom Text Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 z-10 text-white flex flex-col justify-end">
                    <span className="text-[10px] uppercase tracking-widest text-[#D8C6AA] font-medium block mb-1">
                      {item.itemCount} Curated Pieces
                    </span>
                    <h3 className="font-serif text-lg sm:text-xl font-normal tracking-tight text-white group-hover:text-[#F8F6F1] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-white/80 font-light mt-1 line-clamp-2 leading-relaxed">
                      {item.subtitle}
                    </p>

                    <div className="mt-3 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#D8C6AA] font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-1 group-hover:translate-y-0">
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#D8C6AA] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

