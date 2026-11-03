import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, RotateCcw, PackageSearch, Sparkles } from 'lucide-react';
import { MOCK_PRODUCTS } from '../data/products';
import { catalogApi } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { ProductFilterPanel } from '../components/catalog/ProductFilterPanel';
import { CategoryType, ProductFilterState, Product } from '../types';
import { filterAndSortProducts, INITIAL_FILTER_STATE } from '../utils/filterProducts';

interface FeaturedCollectionProps {
  selectedCategory: string | null;
  onClearCategory: () => void;
  onSelectCategory: (cat: CategoryType) => void;
}

export const FeaturedCollection: React.FC<FeaturedCollectionProps> = ({
  selectedCategory,
  onClearCategory,
  onSelectCategory,
}) => {
  const [filters, setFilters] = useState<ProductFilterState>(() => ({
    ...INITIAL_FILTER_STATE,
    category: selectedCategory || 'All Categories',
  }));
  const [visibleCount, setVisibleCount] = useState<number>(8);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [isLoading, setIsLoading] = useState(false);

  // Synchronize when parent passes a new selectedCategory
  useEffect(() => {
    if (selectedCategory) {
      if (selectedCategory === "Men's Collection" || selectedCategory === 'Men') {
        setFilters((prev) => ({ ...prev, gender: 'men', category: 'All Categories' }));
      } else if (selectedCategory === "Women's Collection" || selectedCategory === 'Women') {
        setFilters((prev) => ({ ...prev, gender: 'women', category: 'All Categories' }));
      } else if (selectedCategory === 'Kids & Juniors' || selectedCategory === 'Kids') {
        setFilters((prev) => ({ ...prev, gender: 'kids', category: 'All Categories' }));
      } else if (selectedCategory === 'Under ₹999 Edit' || selectedCategory === 'Under ₹999') {
        setFilters((prev) => ({ ...prev, collection: 'under-999', category: 'All Categories' }));
      } else if (selectedCategory === 'The Signature Collection') {
        setFilters((prev) => ({ ...prev, collection: 'signature', category: 'All Categories' }));
      } else {
        setFilters((prev) => ({ ...prev, category: selectedCategory }));
      }
    }
  }, [selectedCategory]);

  // Query backend catalog API with fallback
  useEffect(() => {
    let isMounted = true;
    async function fetchProducts() {
      setIsLoading(true);
      try {
        const data = await catalogApi.getProducts(filters);
        if (isMounted) setProducts(data);
      } catch (err) {
        console.warn('API error, using local products fallback:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchProducts();
    return () => { isMounted = false; };
  }, [filters]);

  const handleFilterChange = (newFilters: ProductFilterState) => {
    setFilters(newFilters);
    setVisibleCount(8); // Reset visible count on filter change
    if (newFilters.category !== 'All Categories') {
      onSelectCategory(newFilters.category);
    } else if (newFilters.gender === 'all' && newFilters.collection === 'all') {
      onClearCategory();
    }
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTER_STATE);
    setVisibleCount(8);
    onClearCategory();
  };

  // Filter & sort products using our centralized logic
  const filteredProducts = useMemo(() => {
    return filterAndSortProducts(products, filters);
  }, [products, filters]);

  const displayedProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  return (
    <section
      id="featured-collection"
      className="scroll-mt-24 py-20 sm:py-28 bg-[#F8F6F1] border-t border-[#E4DED4]/60"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#777B63]" />
            <span className="text-xs uppercase tracking-widest-luxury text-[#777B63] font-medium">
              The Permanent Edit
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#242522] font-normal tracking-tight">
            Pieces Worth Keeping
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#5A5C55] font-light leading-relaxed">
            Designed with intention. Chosen to last. Filter by department, collection, price, or category to find your next enduring staple.
          </p>
        </div>

        {/* Embedded Interactive Filter Panel */}
        <div className="mb-10 bg-white border border-[#E4DED4] shadow-xs">
          <ProductFilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            totalResults={filteredProducts.length}
          />
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${filters.gender}-${filters.category}-${filters.collection}-${filters.sortBy}-${filters.priceRange[1]}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
            >
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          </AnimatePresence>
        ) : (
          /* Empty State */
          <div className="text-center py-16 px-4 bg-white border border-[#E4DED4] p-10 shadow-subtle-luxury max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-[#EFE9DF] flex items-center justify-center text-[#777B63] mx-auto mb-4">
              <PackageSearch className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl text-[#242522] mb-2 font-normal">
              No matching pieces
            </h3>
            <p className="text-xs text-[#5A5C55] font-light leading-relaxed mb-5">
              No items match this combination of filters. Try widening your price range or clearing selected categories.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#242522] text-[#F8F6F1] text-xs uppercase tracking-widest font-medium hover:bg-[#383934] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}

        {/* Action Buttons: Load More & Dedicated Collections Page */}
        <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4">
          {hasMore && (
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 4)}
              className="px-8 py-3.5 bg-white border border-[#242522] hover:bg-[#242522] text-[#242522] hover:text-[#F8F6F1] text-xs uppercase tracking-widest font-medium transition-all duration-300 w-full sm:w-auto"
            >
              View More Pieces ({filteredProducts.length - visibleCount} remaining)
            </button>
          )}

          <Link
            to={
              filters.gender !== 'all'
                ? `/collections?gender=${filters.gender}`
                : filters.collection !== 'all'
                ? `/collections?collection=${filters.collection}`
                : '/collections'
            }
            className="px-8 py-3.5 bg-[#242522] hover:bg-[#383934] text-[#F8F6F1] text-xs uppercase tracking-widest font-medium transition-all duration-300 flex items-center justify-center gap-2 group w-full sm:w-auto"
          >
            <span>Open Full Wardrobe Catalogue</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D8C6AA] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};
