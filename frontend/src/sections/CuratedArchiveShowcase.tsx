import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Sparkles } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { MOCK_PRODUCTS } from '../data/products';
import { Product } from '../types';
import { useRequireAuth } from '../hooks/useRequireAuth';

export const CuratedArchiveShowcase: React.FC = () => {
  const { requireAuth } = useRequireAuth();
  const navigate = useNavigate();

  // Curate 4 iconic masterpieces from different categories
  const featuredIds = ['men-015', 'wom-001', 'men-016', 'sig-001'];
  const iconicProducts: Product[] = featuredIds
    .map((id) => MOCK_PRODUCTS.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));

  return (
    <section className="py-24 sm:py-32 bg-[#F8F6F1] px-4 sm:px-6 lg:px-12 border-b border-[#E4DED4]">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#242522] pb-6 mb-14">
          <div>
            <span className="text-xs uppercase tracking-widest-luxury text-[#777B63] font-medium block mb-2">
              Curator's Exhibition
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#242522] font-normal tracking-tight">
              Iconic Atelier Pieces
            </h2>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center gap-4">
            <button
              onClick={() => requireAuth(() => navigate('/collections'), '/collections')}
              className="text-xs uppercase tracking-widest-luxury font-medium text-[#242522] hover:text-[#777B63] inline-flex items-center gap-1.5 transition-colors"
            >
              <span>View All 46 Pieces in Catalogue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4 Exhibition Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {iconicProducts.map((product, idx) => (
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

        {/* Distinctive Callout Banner: Directing to Main Dashboard / Catalogue */}
        <div className="mt-16 p-8 bg-[#242522] text-[#F8F6F1] flex flex-col md:flex-row items-center justify-between gap-6 rounded-xs">
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest-luxury text-[#D8C6AA] font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full Storefront Inventory</span>
            </div>
            <h3 className="font-serif text-2xl text-[#F8F6F1] font-normal">
              Enter The Main Catalogue Dashboard
            </h3>
            <p className="text-xs text-[#A8A59B] max-w-xl mt-1.5 leading-relaxed font-light">
              Filter by specific occasion (Party, Office, Casual), set maximum budget thresholds, browse fabric families, and sort across all 46 real database items.
            </p>
          </div>

          <button
            onClick={() => requireAuth(() => navigate('/collections'), '/collections')}
            className="px-8 py-3.5 bg-[#F8F6F1] text-[#181916] text-xs uppercase tracking-widest-luxury font-medium hover:bg-[#D8C6AA] transition-colors whitespace-nowrap inline-flex items-center gap-2"
          >
            <span>Launch Catalogue Dashboard</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};

