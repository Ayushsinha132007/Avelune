import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, RotateCcw, PackageSearch, ChevronRight } from 'lucide-react';
import { MOCK_PRODUCTS } from '../data/products';
import { catalogApi } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { CategoryCarousel } from '../components/catalog/CategoryCarousel';
import { ProductFilterPanel } from '../components/catalog/ProductFilterPanel';
import {
  Gender,
  MerchandisingCollection,
  ProductFilterState,
  CarouselCategoryItem,
  SortOption,
  Product,
} from '../types';
import {
  filterAndSortProducts,
  INITIAL_FILTER_STATE,
} from '../utils/filterProducts';

export const CollectionsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { gender: routeGender } = useParams<{ gender?: string }>();

  // Normalize gender from URL params (/collections/men or ?gender=men)
  const initialGender = (routeGender as Gender) || (searchParams.get('gender') as Gender) || 'all';

  // Initialize filter state from URL search params
  const [filters, setFilters] = useState<ProductFilterState>(() => {
    const collectionParam = searchParams.get('collection') as MerchandisingCollection | null;
    const categoryParam = searchParams.get('category');
    const sortParam = searchParams.get('sort') as SortOption | null;
    const maxPriceParam = searchParams.get('maxPrice');

    return {
      ...INITIAL_FILTER_STATE,
      gender: initialGender,
      collection: collectionParam || 'all',
      category: categoryParam || 'All Categories',
      sortBy: sortParam || 'recommended',
      priceRange: [0, maxPriceParam ? Number(maxPriceParam) : 25000],
    };
  });

  // Keep URL parameters in sync when filters change
  const updateFiltersAndUrl = (newFilters: ProductFilterState) => {
    setFilters(newFilters);

    const params = new URLSearchParams();
    if (newFilters.gender !== 'all') params.set('gender', newFilters.gender);
    if (newFilters.collection !== 'all') params.set('collection', newFilters.collection);
    if (newFilters.category !== 'All Categories') params.set('category', newFilters.category);
    if (newFilters.sortBy !== 'recommended') params.set('sort', newFilters.sortBy);
    if (newFilters.priceRange[1] < 25000) params.set('maxPrice', String(newFilters.priceRange[1]));

    setSearchParams(params, { replace: true });
  };

  // Sync state if URL changes externally (e.g. browser back/forward or direct link)
  useEffect(() => {
    const effectiveGender = (routeGender as Gender) || (searchParams.get('gender') as Gender) || 'all';
    const collectionParam = searchParams.get('collection') as MerchandisingCollection | null;
    const categoryParam = searchParams.get('category');
    const sortParam = searchParams.get('sort') as SortOption | null;
    const maxPriceParam = searchParams.get('maxPrice');

    setFilters((prev) => ({
      ...prev,
      gender: effectiveGender,
      collection: collectionParam || 'all',
      category: categoryParam || 'All Categories',
      sortBy: sortParam || 'recommended',
      priceRange: [0, maxPriceParam ? Number(maxPriceParam) : 25000],
    }));
  }, [searchParams, routeGender]);

  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadProducts() {
      setIsLoading(true);
      try {
        const data = await catalogApi.getProducts(filters);
        if (isMounted) setProducts(data);
      } catch (err) {
        console.warn('Backend unavailable, using local mock dataset:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadProducts();
    return () => { isMounted = false; };
  }, [filters]);

  const handleResetFilters = () => {
    updateFiltersAndUrl(INITIAL_FILTER_STATE);
  };

  const handleCarouselSelect = (item: CarouselCategoryItem) => {
    const newFilters = { ...filters };
    if (item.gender) {
      newFilters.gender = item.gender;
      newFilters.category = 'All Categories';
    }
    if (item.collection) {
      newFilters.collection = item.collection;
    }
    updateFiltersAndUrl(newFilters);

    // Smooth scroll down to filter panel
    const filterEl = document.getElementById('catalog-filter-bar');
    if (filterEl) {
      filterEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Compute filtered & sorted products
  const filteredProducts = useMemo(() => {
    return filterAndSortProducts(products, filters);
  }, [products, filters]);

  const departmentTitle = useMemo(() => {
    if (filters.collection === 'under-999') return 'The Under ₹999 Edit';
    if (filters.collection === 'new-arrivals') return 'New Arrivals Atelier Drop';
    if (filters.collection === 'bestsellers') return 'Most Loved & Bestsellers';
    if (filters.collection === 'signature') return 'The Signature Collection';
    if (filters.gender === 'men') return "Men's Collection";
    if (filters.gender === 'women') return "Women's Collection";
    if (filters.gender === 'kids') return 'Kids & Juniors Collection';
    return 'Complete Wardrobe & Objects';
  }, [filters]);

  return (
    <div className="min-h-screen bg-[#F8F6F1]">
      {/* Editorial Page Header */}
      <section className="pt-10 pb-8 sm:pt-14 sm:pb-10 bg-[#EFE9DF]/40 border-b border-[#E4DED4]/60 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#777B63] mb-4">
            <Link to="/" className="hover:text-[#242522] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-[#A8A69E]" />
            <span className="text-[#242522] font-medium">Catalogue</span>
            {filters.gender !== 'all' && (
              <>
                <ChevronRight className="w-3 h-3 text-[#A8A69E]" />
                <span className="text-[#777B63] capitalize">{filters.gender}</span>
              </>
            )}
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest-luxury text-[#777B63] font-medium block mb-2">
                Atelier Catalogue & Archival Edit
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#242522] font-normal tracking-tight">
                {departmentTitle}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#5A5C55] font-light max-w-md leading-relaxed">
              Quiet forms, high-density natural textiles, and archetypal silhouettes constructed with uncompromised materiality.
            </p>
          </div>
        </div>
      </section>

      {/* Category Carousel ("Discover Your Style") */}
      <CategoryCarousel
        onSelectItem={handleCarouselSelect}
        selectedGender={filters.gender}
        selectedCollection={filters.collection}
      />

      {/* Interactive Filter Panel with Sticky anchor */}
      <div id="catalog-filter-bar" className="scroll-mt-16 sticky top-16 z-30">
        <ProductFilterPanel
          filters={filters}
          onFilterChange={updateFiltersAndUrl}
          onResetFilters={handleResetFilters}
          totalResults={filteredProducts.length}
        />
      </div>

      {/* Product Grid Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {filteredProducts.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${filters.gender}-${filters.category}-${filters.collection}-${filters.sortBy}-${filters.priceRange[1]}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
            >
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          </AnimatePresence>
        ) : (
          /* Luxury Empty State */
          <div className="text-center py-20 px-4 max-w-lg mx-auto bg-white border border-[#E4DED4] p-10 sm:p-14 shadow-subtle-luxury">
            <div className="w-14 h-14 rounded-full bg-[#EFE9DF] flex items-center justify-center text-[#777B63] mx-auto mb-5">
              <PackageSearch className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-2xl text-[#242522] mb-2 font-normal">
              No matching pieces found
            </h3>
            <p className="text-xs sm:text-sm text-[#5A5C55] font-light leading-relaxed mb-6">
              We couldn’t find any items matching your selected criteria. Try adjusting your price range or clearing some category filters.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#242522] text-[#F8F6F1] text-xs uppercase tracking-widest font-medium hover:bg-[#383934] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

