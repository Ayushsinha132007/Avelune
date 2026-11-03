import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Clock } from 'lucide-react';
import { MOCK_PRODUCTS } from '../data/products';
import { catalogApi } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { scrollToSection } from '../utils/scroll';
import { Product } from '../types';

interface NewArrivalsSectionProps {
  onViewAllNewArrivals?: () => void;
}

export const NewArrivalsSection: React.FC<NewArrivalsSectionProps> = ({
  onViewAllNewArrivals,
}) => {
  const [newArrivals, setNewArrivals] = useState<Product[]>(() =>
    MOCK_PRODUCTS.filter((p) => p.badge === 'New Arrival' || p.isNewArrival).slice(0, 4)
  );

  useEffect(() => {
    let isMounted = true;
    async function loadNewArrivals() {
      try {
        const items = await catalogApi.getCollection('new-arrivals');
        if (isMounted && items && items.length > 0) {
          setNewArrivals(items.slice(0, 4));
        }
      } catch (err) {
        console.warn('Using local fallback for new arrivals:', err);
      }
    }
    loadNewArrivals();
    return () => { isMounted = false; };
  }, []);

  return (
    <section
      id="new-arrivals"
      className="scroll-mt-24 py-20 sm:py-28 bg-[#EFE9DF]/50 px-4 sm:px-6 lg:px-8 border-t border-[#E4DED4]"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 sm:mb-16 border-b border-[#E4DED4] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#777B63] animate-pulse" />
              <span className="text-xs uppercase tracking-widest-luxury text-[#777B63] font-medium">
                Atelier Drop 01 // Autumn 2026
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#242522] font-normal tracking-tight">
              New Arrivals
            </h2>
          </div>

          <div className="mt-3 sm:mt-0 flex flex-col items-start sm:items-end">
            <p className="text-sm text-[#5A5C55] font-light max-w-sm leading-relaxed text-left sm:text-right">
              Fresh additions crafted in limited small-batch firings and single-needle tailoring for the upcoming season.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-[#777B63] font-medium mt-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Released this week • Quantities limited</span>
            </div>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {newArrivals.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        {/* Bottom Editorial Callout */}
        <div className="mt-14 p-6 sm:p-8 bg-white border border-[#E4DED4] rounded-xs flex flex-col md:flex-row items-center justify-between gap-6 shadow-subtle-luxury">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#EFE9DF] flex items-center justify-center text-[#777B63] shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-lg text-[#242522]">
                Autumn / Winter Atelier Capsule
              </h4>
              <p className="text-xs text-[#5A5C55] font-light mt-0.5">
                Every newly released silhouette is numbered by our master cutters and artisan ceramists.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (onViewAllNewArrivals) {
                onViewAllNewArrivals();
              } else {
                scrollToSection('featured-collection');
              }
            }}
            className="px-6 py-3 bg-[#242522] hover:bg-[#383934] text-[#F8F6F1] text-xs font-medium uppercase tracking-widest transition-colors flex items-center gap-2 group shrink-0"
          >
            <span>Explore All Pieces in Catalog</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D8C6AA] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

