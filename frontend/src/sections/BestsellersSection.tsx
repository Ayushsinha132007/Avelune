import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MOCK_PRODUCTS } from '../data/products';
import { catalogApi } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';

export const BestsellersSection: React.FC = () => {
  const [bestsellers, setBestsellers] = useState<Product[]>(() =>
    MOCK_PRODUCTS.filter((p) => p.isBestseller).slice(0, 4)
  );

  useEffect(() => {
    let isMounted = true;
    async function loadBestsellers() {
      try {
        const items = await catalogApi.getCollection('bestsellers');
        if (isMounted && items && items.length > 0) {
          setBestsellers(items.slice(0, 4));
        }
      } catch (err) {
        console.warn('Using fallback for bestsellers:', err);
      }
    }
    loadBestsellers();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="bestsellers-section" className="scroll-mt-24 py-20 sm:py-28 bg-[#F8F6F1] px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 sm:mb-16 border-b border-[#E4DED4] pb-6">
          <div>
            <span className="text-xs uppercase tracking-widest-luxury text-[#777B63] font-medium block mb-2">
              Customer Acclaim
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#242522] font-normal tracking-tight">
              Most Loved
            </h2>
          </div>
          <p className="text-sm text-[#5A5C55] font-light max-w-sm mt-3 sm:mt-0 leading-relaxed">
            Consistently reordered essentials acclaimed for their sublime comfort, flawless craftsmanship, and tactile longevity.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {bestsellers.map((product, idx) => (
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
      </div>
    </section>
  );
};

