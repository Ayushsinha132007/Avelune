import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag,
  Sparkles,
  ChevronRight,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
  PackageSearch,
  ArrowRight,
  Percent,
} from 'lucide-react';
import { MOCK_PRODUCTS } from '../data/products';
import { catalogApi } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { formatINR } from '../utils/currency';
import { Product } from '../types';

type OfferFilterTab = 'all-offers' | 'under-999' | 'bestsellers-sale' | 'elevated-deals';
type OfferSort = 'discount-desc' | 'price-asc' | 'price-desc' | 'rating';

export const OffersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<OfferFilterTab>('all-offers');
  const [sortBy, setSortBy] = useState<OfferSort>('discount-desc');
  const [allProducts, setAllProducts] = useState<Product[]>(MOCK_PRODUCTS);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await catalogApi.getProducts();
        if (isMounted && data && data.length > 0) {
          setAllProducts(data);
        }
      } catch (err) {
        console.warn('Backend unavailable for offers:', err);
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  // Filter only items with legitimate discounts or under ₹999
  const offerProducts = useMemo(() => {
    // Collect all products that have an originalPrice higher than price, or are in the under-999 edit
    let items = allProducts.filter(
      (p) => (p.originalPrice && p.originalPrice > p.price) || p.price <= 999
    );

    // Filter by tab
    if (activeTab === 'under-999') {
      items = items.filter((p) => p.price <= 999);
    } else if (activeTab === 'bestsellers-sale') {
      items = items.filter((p) => p.isBestseller);
    } else if (activeTab === 'elevated-deals') {
      items = items.filter((p) => p.price >= 4000);
    }

    // Sort items
    items.sort((a, b) => {
      const discountA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
      const discountB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;

      switch (sortBy) {
        case 'discount-desc':
          return discountB - discountA;
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating':
        default:
          return b.rating - a.rating;
      }
    });

    return items;
  }, [activeTab, sortBy]);

  return (
    <div className="min-h-screen bg-[#F8F6F1] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#777B63] mb-6">
          <Link to="/" className="hover:text-[#242522] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-[#A8A69E]" />
          <Link to="/collections" className="hover:text-[#242522] transition-colors">
            Collections
          </Link>
          <ChevronRight className="w-3 h-3 text-[#A8A69E]" />
          <span className="text-[#242522] font-medium">Offers & Special Picks</span>
        </nav>

        {/* Restrained Luxury Hero Promotional Banner */}
        <div className="bg-[#242522] text-[#F8F6F1] p-8 sm:p-12 mb-10 border border-[#383934] relative overflow-hidden shadow-subtle-luxury">
          {/* Subtle champagne gradient background glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-[#D8C6AA]/10 blur-3xl pointer-events-none" />

          <div className="max-w-2xl relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D8C6AA]" />
              <span className="text-[11px] uppercase tracking-widest-luxury text-[#D8C6AA] font-medium">
                Atelier Seasonal Curation
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white font-normal tracking-tight">
              Offers & Special Picks
            </h1>

            <p className="text-xs sm:text-sm text-[#F8F6F1]/80 font-light leading-relaxed">
              Considered wardrobe staples and limited atelier editions selected under accessible pricing tiers and seasonal privilege discounts. No compromise on fiber or craftsmanship.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-[#D8C6AA]">
              <span>• Up to 35% seasonal value</span>
              <span>• Certified GOTS organic cotton & flax</span>
              <span>• Complimentary delivery over ₹1,999</span>
            </div>
          </div>
        </div>

        {/* Filters & Sorting Bar */}
        <div className="bg-white border border-[#E4DED4] p-4 sm:p-5 mb-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Offer Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setActiveTab('all-offers')}
              className={`px-3.5 py-2 text-xs font-medium uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === 'all-offers'
                  ? 'bg-[#242522] text-[#F8F6F1] shadow-xs'
                  : 'bg-[#F8F6F1] text-[#5A5C55] hover:text-[#242522]'
              }`}
            >
              All Special Prices ({allProducts.filter((p) => p.originalPrice && p.originalPrice > p.price).length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('under-999')}
              className={`px-3.5 py-2 text-xs font-medium uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === 'under-999'
                  ? 'bg-[#242522] text-[#F8F6F1] shadow-xs'
                  : 'bg-[#F8F6F1] text-[#5A5C55] hover:text-[#242522]'
              }`}
            >
              Under ₹999 Edit
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bestsellers-sale')}
              className={`px-3.5 py-2 text-xs font-medium uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === 'bestsellers-sale'
                  ? 'bg-[#242522] text-[#F8F6F1] shadow-xs'
                  : 'bg-[#F8F6F1] text-[#5A5C55] hover:text-[#242522]'
              }`}
            >
              Bestsellers on Offer
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('elevated-deals')}
              className={`px-3.5 py-2 text-xs font-medium uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === 'elevated-deals'
                  ? 'bg-[#242522] text-[#F8F6F1] shadow-xs'
                  : 'bg-[#F8F6F1] text-[#5A5C55] hover:text-[#242522]'
              }`}
            >
              Signature & Outerwear Deals
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
            <span className="text-xs text-[#777B63] font-medium uppercase tracking-wider">
              Sort:
            </span>
            <div className="relative inline-block">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as OfferSort)}
                className="appearance-none bg-[#F8F6F1] border border-[#E4DED4] text-xs font-medium text-[#242522] py-2 pl-3 pr-8 rounded-none focus:outline-none focus:border-[#242522] cursor-pointer"
              >
                <option value="discount-desc">Highest Discount %</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#5A5C55] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="mb-6 flex items-center justify-between text-xs text-[#777B63]">
          <span>
            Displaying <strong className="font-semibold text-[#242522]">{offerProducts.length}</strong> special value pieces
          </span>
          <span className="font-light">
            All discounts calculated transparently against catalog list prices.
          </span>
        </div>

        {/* Product Grid */}
        {offerProducts.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${sortBy}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
            >
              {offerProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          </AnimatePresence>
        ) : (
          /* Empty State */
          <div className="text-center py-20 px-4 bg-white border border-[#E4DED4] p-10 max-w-md mx-auto shadow-subtle-luxury">
            <div className="w-12 h-12 rounded-full bg-[#EFE9DF] flex items-center justify-center text-[#777B63] mx-auto mb-4">
              <PackageSearch className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl text-[#242522] mb-1.5 font-normal">
              No matching offer pieces
            </h3>
            <p className="text-xs text-[#5A5C55] font-light leading-relaxed mb-5">
              No products currently meet this specific filter. View our complete catalog of archival essentials.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('all-offers')}
              className="px-6 py-2.5 bg-[#242522] text-[#F8F6F1] text-xs uppercase tracking-widest font-medium"
            >
              View All Special Prices
            </button>
          </div>
        )}

        {/* Bottom Editorial Callout */}
        <div className="mt-16 p-8 bg-white border border-[#E4DED4] flex flex-col md:flex-row items-center justify-between gap-6 shadow-subtle-luxury">
          <div className="space-y-1">
            <h3 className="font-serif text-lg text-[#242522]">
              Looking for something tailored to an occasion?
            </h3>
            <p className="text-xs text-[#5A5C55] font-light">
              Use our Style Assistant to find curated pieces tailored to your exact budget and personal aesthetic.
            </p>
          </div>
          <Link
            to="/collections"
            className="px-6 py-3 bg-[#242522] hover:bg-[#383934] text-[#F8F6F1] text-xs uppercase tracking-widest font-medium transition-colors flex items-center gap-2 group shrink-0"
          >
            <span>Explore All Collections</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D8C6AA] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

