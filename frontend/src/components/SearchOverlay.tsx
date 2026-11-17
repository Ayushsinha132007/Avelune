import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, Eye, Plus } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { MOCK_PRODUCTS } from '../data/products';
import { catalogApi } from '../services/api';
import { formatINR } from '../utils/currency';
import { Product } from '../types';

const POPULAR_SEARCHES = [
  'Linen Shirt',
  'Mulberry Silk',
  'Under ₹999',
  'Cashmere Coat',
  'Kids Cotton',
  'Selvedge Denim',
  'Derby Shoes',
  'Handloom Kurta',
];

export const SearchOverlay: React.FC = () => {
  const { isSearchOpen, closeSearch, searchQuery, setSearchQuery, openQuickView, addToCart } = useStore();
  const { requireAuth } = useRequireAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [productsPool, setProductsPool] = useState<Product[]>(MOCK_PRODUCTS);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await catalogApi.getProducts();
        if (isMounted && data && data.length > 0) {
          setProductsPool(data);
        }
      } catch (err) {
        console.warn('Backend unavailable for search:', err);
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setSearchQuery('');
    }
  }, [isSearchOpen, setSearchQuery]);

  // Filter matching products
  const trimmed = searchQuery.trim().toLowerCase();
  const results = trimmed
    ? productsPool.filter(
        (p) =>
          p.name.toLowerCase().includes(trimmed) ||
          p.category.toLowerCase().includes(trimmed) ||
          p.description.toLowerCase().includes(trimmed) ||
          p.tags.some((t) => t.toLowerCase().includes(trimmed))
      )
    : [];

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSearch}
            className="fixed inset-0 bg-[#242522]/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative min-h-screen sm:min-h-0 sm:max-w-3xl sm:mx-auto sm:my-16 bg-[#F8F6F1] shadow-modal-luxury border border-[#E4DED4] sm:rounded-sm overflow-hidden z-10"
          >
            {/* Search Header & Input */}
            <div className="p-6 bg-white border-b border-[#E4DED4]">
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-[#777B63] shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search by piece, material, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-base sm:text-lg text-[#242522] placeholder-[#5A5C55]/60 focus:outline-none font-serif"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-[#5A5C55] hover:text-[#242522]"
                    aria-label="Clear search input"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={closeSearch}
                  className="p-1.5 text-[#242522] hover:text-[#777B63] ml-2"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Popular quick searches */}
              {!searchQuery && (
                <div className="mt-5 pt-4 border-t border-[#E4DED4]/60">
                  <p className="text-[11px] uppercase tracking-wider text-[#777B63] font-medium mb-2.5">
                    Suggested Inquiries
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCHES.map((term) => (
                      <button
                        key={term}
                        onClick={() => setSearchQuery(term)}
                        className="text-xs px-3 py-1.5 bg-[#F8F6F1] hover:bg-[#EFE9DF] text-[#242522] border border-[#E4DED4] transition-colors rounded-none"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search Results Area */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {searchQuery && results.length === 0 && (
                <div className="text-center py-12">
                  <p className="font-serif text-lg text-[#242522]">
                    No pieces found matching "{searchQuery}"
                  </p>
                  <p className="text-xs text-[#5A5C55] mt-1 font-light">
                    Try searching for cashmere, gabardine, stoneware, lamp, or tote.
                  </p>
                </div>
              )}

              {searchQuery && results.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs uppercase tracking-wider text-[#777B63] font-medium">
                      Found {results.length} matching {results.length === 1 ? 'piece' : 'pieces'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {results.map((product) => (
                      <div
                        key={product.id}
                        className="flex gap-3 p-3 bg-white border border-[#E4DED4]/80 hover:border-[#D8C6AA] transition-colors rounded-sm group cursor-pointer"
                        onClick={() => {
                          requireAuth(
                            () => {
                              closeSearch();
                              openQuickView(product);
                            },
                            undefined,
                            'Please sign in to inspect atelier piece details.'
                          );
                          if (!requireAuth(undefined)) {
                            closeSearch();
                          }
                        }}
                      >
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-16 h-20 object-cover rounded-sm bg-[#EFE9DF] shrink-0"
                        />
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-[#777B63]">
                              {product.category}
                            </span>
                            <h4 className="font-serif text-sm text-[#242522] group-hover:text-[#777B63] transition-colors line-clamp-1">
                              {product.name}
                            </h4>
                            <p className="text-xs font-medium text-[#242522] mt-0.5">
                              {formatINR(product.price)}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 pt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                requireAuth(
                                  () => {
                                    closeSearch();
                                    openQuickView(product);
                                  },
                                  undefined,
                                  'Please sign in to inspect atelier piece details.'
                                );
                                if (!requireAuth(undefined)) {
                                  closeSearch();
                                }
                              }}
                              className="text-[11px] text-[#777B63] hover:text-[#242522] flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Details</span>
                            </button>
                            <span className="text-[#E4DED4]">•</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                requireAuth(
                                  () => {
                                    addToCart(product);
                                  },
                                  '/cart',
                                  'Please sign in to add pieces to your shopping bag.'
                                );
                                if (!requireAuth(undefined, '/cart')) {
                                  closeSearch();
                                }
                              }}
                              className="text-[11px] text-[#242522] hover:text-[#777B63] font-medium flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

