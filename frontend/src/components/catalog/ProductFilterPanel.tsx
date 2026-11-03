import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SlidersHorizontal,
  ChevronDown,
  X,
  RotateCcw,
  Sparkles,
  Check,
  Tag,
  CircleDollarSign,
  Layers,
} from 'lucide-react';
import { Gender, MerchandisingCollection, SortOption, ProductFilterState } from '../../types';
import { formatINR } from '../../utils/currency';

interface ProductFilterPanelProps {
  filters: ProductFilterState;
  onFilterChange: (newFilters: ProductFilterState) => void;
  onResetFilters: () => void;
  totalResults: number;
}

const GENDER_TABS: { label: string; value: Gender }[] = [
  { label: 'All Collections', value: 'all' },
  { label: 'Men', value: 'men' },
  { label: 'Women', value: 'women' },
  { label: 'Kids & Juniors', value: 'kids' },
];

const COLLECTION_OPTIONS: { label: string; value: MerchandisingCollection }[] = [
  { label: 'All Departments', value: 'all' },
  { label: 'Under ₹999 Edit', value: 'under-999' },
  { label: 'New Arrivals', value: 'new-arrivals' },
  { label: 'Bestsellers', value: 'bestsellers' },
  { label: 'Everyday Essentials', value: 'everyday-essentials' },
  { label: 'Signature Collection', value: 'signature' },
  { label: 'Premium Picks', value: 'premium-picks' },
];

const QUICK_PRICE_BANDS: { label: string; range: [number, number] }[] = [
  { label: 'All Prices', range: [0, 25000] },
  { label: 'Under ₹999', range: [0, 999] },
  { label: '₹1,000 – ₹2,499', range: [1000, 2499] },
  { label: '₹2,500 – ₹4,999', range: [2500, 4999] },
  { label: '₹5,000 – ₹20,000+', range: [5000, 25000] },
];

const CATEGORY_MAP: Record<Gender, string[]> = {
  all: [
    'All Categories',
    'T-shirts and Tops',
    'Shirts',
    'Trousers and Jeans',
    'Dresses and Ethnic Wear',
    'Jackets and Outerwear',
    'Footwear',
    'Bags and Accessories',
    'Jewellery and Accessories',
    'Contemporary Living',
  ],
  men: [
    'All Categories',
    'T-shirts and Tops',
    'Shirts',
    'Trousers and Jeans',
    'Jackets and Outerwear',
    'Footwear',
    'Bags and Accessories',
    'Watches and Jewellery',
  ],
  women: [
    'All Categories',
    'T-shirts and Tops',
    'Dresses and Ethnic Wear',
    'Trousers and Jeans',
    'Jackets and Outerwear',
    'Footwear',
    'Handbags and Accessories',
    'Jewellery and Accessories',
  ],
  kids: [
    'All Categories',
    "Kids' Clothing",
    "Kids' Accessories",
  ],
  unisex: [
    'All Categories',
    'Contemporary Living',
    'Bags and Accessories',
  ],
};

export const ProductFilterPanel: React.FC<ProductFilterPanelProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalResults,
}) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showExtendedFilters, setShowExtendedFilters] = useState(false);

  const activeCategories = CATEGORY_MAP[filters.gender] || CATEGORY_MAP.all;

  const handleGenderChange = (gender: Gender) => {
    onFilterChange({
      ...filters,
      gender,
      category: 'All Categories', // Reset category when switching gender to prevent incompatible filters
    });
  };

  const handleCategoryChange = (category: string) => {
    onFilterChange({
      ...filters,
      category,
    });
  };

  const handleCollectionChange = (collection: MerchandisingCollection) => {
    onFilterChange({
      ...filters,
      collection,
    });
  };

  const handlePriceRangeChange = (range: [number, number]) => {
    onFilterChange({
      ...filters,
      priceRange: range,
    });
  };

  const handleMaxPriceSlider = (val: number) => {
    onFilterChange({
      ...filters,
      priceRange: [filters.priceRange[0], val],
    });
  };

  const handleSortChange = (sortBy: SortOption) => {
    onFilterChange({
      ...filters,
      sortBy,
    });
  };

  const hasActiveFilters =
    filters.gender !== 'all' ||
    filters.category !== 'All Categories' ||
    filters.collection !== 'all' ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 25000 ||
    filters.onlyNewArrivals ||
    filters.onlyBestsellers ||
    filters.onlyInStock;

  return (
    <div className="w-full bg-white border-b border-[#E4DED4]/80 py-5 sm:py-6 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tier 1: Primary Gender Tabs + Search/Results Counter + Mobile Trigger */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E4DED4]/60">
          {/* Gender Segmented Control */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F8F6F1] border border-[#E4DED4] overflow-x-auto scrollbar-none rounded-none">
            {GENDER_TABS.map((tab) => {
              const isActive = filters.gender === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => handleGenderChange(tab.value)}
                  className={`px-4 py-2 text-xs font-medium uppercase tracking-wider transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'bg-[#242522] text-[#F8F6F1] shadow-xs'
                      : 'text-[#5A5C55] hover:text-[#242522] hover:bg-white/60'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Right: Results Count + Filter Drawer Toggle (Mobile) + Sort Dropdown */}
          <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
            <span className="text-xs text-[#777B63] font-medium tracking-wide">
              Showing <span className="font-semibold text-[#242522]">{totalResults}</span> pieces
            </span>

            {/* Mobile Filter Drawer Button */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden flex items-center gap-1.5 px-3 py-2 border border-[#242522] text-xs uppercase tracking-wider font-medium text-[#242522] hover:bg-[#242522] hover:text-[#F8F6F1] transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[#D8C6AA] ml-0.5" />
              )}
            </button>

            {/* Desktop Sort Dropdown */}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs text-[#777B63] font-medium uppercase tracking-wider">
                Sort:
              </span>
              <div className="relative inline-block">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleSortChange(e.target.value as SortOption)}
                  className="appearance-none bg-[#F8F6F1] border border-[#E4DED4] text-xs font-medium text-[#242522] py-2 pl-3 pr-8 rounded-none focus:outline-none focus:border-[#242522] cursor-pointer hover:border-[#242522] transition-colors"
                >
                  <option value="recommended">Curated / Recommended</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="newest">Newest Arrivals</option>
                  <option value="bestselling">Most Popular / Bestsellers</option>
                  <option value="rating">Customer Rating</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#5A5C55] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Desktop More Filters Button */}
            <button
              type="button"
              onClick={() => setShowExtendedFilters(!showExtendedFilters)}
              className={`hidden md:flex items-center gap-1.5 px-3.5 py-2 border text-xs font-medium uppercase tracking-wider transition-all duration-200 ${
                showExtendedFilters || hasActiveFilters
                  ? 'border-[#242522] bg-[#242522] text-[#F8F6F1]'
                  : 'border-[#E4DED4] bg-white text-[#242522] hover:border-[#242522]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showExtendedFilters ? 'Hide Filters' : 'Refine & Price'}</span>
            </button>
          </div>
        </div>

        {/* Tier 2: Category Chips (Desktop Horizontal Scroll) */}
        <div className="pt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] uppercase tracking-wider text-[#777B63] font-medium shrink-0 mr-1 hidden sm:inline-block">
            Category:
          </span>
          {activeCategories.map((cat) => {
            const isSelected = filters.category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`px-3 py-1.5 text-xs tracking-wider whitespace-nowrap transition-all duration-200 border rounded-none ${
                  isSelected
                    ? 'bg-[#242522] text-[#F8F6F1] border-[#242522] font-medium shadow-xs'
                    : 'bg-[#F8F6F1]/80 text-[#242522]/80 border-[#E4DED4] hover:border-[#242522] hover:bg-white'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Tier 3: Extended Refinements Panel (Price, Merchandising Collection, In-Stock, Badges) */}
        <AnimatePresence>
          {showExtendedFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-5 pt-5 border-t border-[#E4DED4] grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#F8F6F1]/60 p-5 border border-[#E4DED4]">
                {/* 1. Merchandising Collection Filter (Cols 1-4) */}
                <div className="md:col-span-4 flex flex-col gap-2.5">
                  <span className="text-xs uppercase tracking-wider font-medium text-[#242522] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#777B63]" />
                    <span>Curated Collections</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {COLLECTION_OPTIONS.map((col) => {
                      const isSelected = filters.collection === col.value;
                      return (
                        <button
                          key={col.value}
                          type="button"
                          onClick={() => handleCollectionChange(col.value)}
                          className={`px-2.5 py-1 text-xs border transition-colors ${
                            isSelected
                              ? 'bg-[#242522] text-[#F8F6F1] border-[#242522] font-medium'
                              : 'bg-white text-[#5A5C55] border-[#E4DED4] hover:border-[#242522]'
                          }`}
                        >
                          {col.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Interactive Price Range Filter (Cols 5-8) */}
                <div className="md:col-span-5 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider font-medium text-[#242522] flex items-center gap-1.5">
                      <CircleDollarSign className="w-3.5 h-3.5 text-[#777B63]" />
                      <span>Price Range</span>
                    </span>
                    <span className="text-xs font-serif font-medium text-[#242522]">
                      {formatINR(filters.priceRange[0])} — {formatINR(filters.priceRange[1])}
                    </span>
                  </div>

                  {/* Interactive Dual / Upper-Bound Slider */}
                  <div className="flex flex-col gap-1.5 pt-1">
                    <input
                      type="range"
                      min={0}
                      max={25000}
                      step={250}
                      value={filters.priceRange[1]}
                      onChange={(e) => handleMaxPriceSlider(Number(e.target.value))}
                      className="w-full accent-[#242522] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-[#777B63] font-mono">
                      <span>₹0</span>
                      <span>₹5,000</span>
                      <span>₹10,000</span>
                      <span>₹25,000+</span>
                    </div>
                  </div>

                  {/* Quick Price Shortcuts */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {QUICK_PRICE_BANDS.map((band) => {
                      const isSelected =
                        filters.priceRange[0] === band.range[0] &&
                        filters.priceRange[1] === band.range[1];
                      return (
                        <button
                          key={band.label}
                          type="button"
                          onClick={() => handlePriceRangeChange(band.range)}
                          className={`px-2 py-0.5 text-[11px] border transition-colors ${
                            isSelected
                              ? 'bg-[#777B63] text-white border-[#777B63] font-medium'
                              : 'bg-white text-[#5A5C55] border-[#E4DED4] hover:border-[#242522]'
                          }`}
                        >
                          {band.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Availability & Badges Toggles (Cols 9-12) */}
                <div className="md:col-span-3 flex flex-col gap-2.5">
                  <span className="text-xs uppercase tracking-wider font-medium text-[#242522] flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#777B63]" />
                    <span>Special Filters</span>
                  </span>

                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-xs text-[#242522] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={filters.onlyInStock}
                        onChange={(e) =>
                          onFilterChange({ ...filters, onlyInStock: e.target.checked })
                        }
                        className="rounded-none border-[#E4DED4] text-[#242522] focus:ring-0 w-3.5 h-3.5 accent-[#242522]"
                      />
                      <span>In Stock Pieces Only</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-[#242522] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={filters.onlyNewArrivals}
                        onChange={(e) =>
                          onFilterChange({ ...filters, onlyNewArrivals: e.target.checked })
                        }
                        className="rounded-none border-[#E4DED4] text-[#242522] focus:ring-0 w-3.5 h-3.5 accent-[#242522]"
                      />
                      <span>New Arrivals Drop Only</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-[#242522] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={filters.onlyBestsellers}
                        onChange={(e) =>
                          onFilterChange({ ...filters, onlyBestsellers: e.target.checked })
                        }
                        className="rounded-none border-[#E4DED4] text-[#242522] focus:ring-0 w-3.5 h-3.5 accent-[#242522]"
                      />
                      <span>Acclaimed Bestsellers Only</span>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tier 4: Active Filter Badges & Reset Button */}
        {hasActiveFilters && (
          <div className="mt-3 pt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] uppercase tracking-wider text-[#777B63] font-medium mr-1">
              Active:
            </span>

            {filters.gender !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#EFE9DF] text-[#242522] text-xs font-medium">
                Gender: {filters.gender.toUpperCase()}
                <button
                  type="button"
                  onClick={() => handleGenderChange('all')}
                  className="hover:text-red-700 ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.category !== 'All Categories' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#EFE9DF] text-[#242522] text-xs font-medium">
                Category: {filters.category}
                <button
                  type="button"
                  onClick={() => handleCategoryChange('All Categories')}
                  className="hover:text-red-700 ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.collection !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#EFE9DF] text-[#242522] text-xs font-medium">
                Collection:{' '}
                {COLLECTION_OPTIONS.find((c) => c.value === filters.collection)?.label ||
                  filters.collection}
                <button
                  type="button"
                  onClick={() => handleCollectionChange('all')}
                  className="hover:text-red-700 ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {(filters.priceRange[0] > 0 || filters.priceRange[1] < 25000) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#EFE9DF] text-[#242522] text-xs font-medium">
                Price: {formatINR(filters.priceRange[0])} - {formatINR(filters.priceRange[1])}
                <button
                  type="button"
                  onClick={() => handlePriceRangeChange([0, 25000])}
                  className="hover:text-red-700 ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.onlyInStock && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#EFE9DF] text-[#242522] text-xs font-medium">
                In Stock Only
                <button
                  type="button"
                  onClick={() => onFilterChange({ ...filters, onlyInStock: false })}
                  className="hover:text-red-700 ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.onlyNewArrivals && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#EFE9DF] text-[#242522] text-xs font-medium">
                New Arrivals
                <button
                  type="button"
                  onClick={() => onFilterChange({ ...filters, onlyNewArrivals: false })}
                  className="hover:text-red-700 ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.onlyBestsellers && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#EFE9DF] text-[#242522] text-xs font-medium">
                Bestsellers
                <button
                  type="button"
                  onClick={() => onFilterChange({ ...filters, onlyBestsellers: false })}
                  className="hover:text-red-700 ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-[#777B63] hover:text-[#242522] underline font-medium ml-2 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All</span>
            </button>
          </div>
        )}
      </div>

      {/* Mobile Drawer (Slide-Over) */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="fixed inset-0 bg-[#242522]/50 backdrop-blur-xs"
            />

            {/* Content Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="relative ml-auto w-full max-w-sm bg-[#F8F6F1] h-full shadow-2xl flex flex-col z-10"
            >
              {/* Header */}
              <div className="p-4 border-b border-[#E4DED4] flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#777B63]" />
                  <h3 className="font-serif text-lg text-[#242522]">Refine & Sort</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 text-[#242522] hover:bg-[#EFE9DF] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Gender */}
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-medium text-[#777B63] mb-2.5">
                    Department
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {GENDER_TABS.map((tab) => (
                      <button
                        key={tab.value}
                        type="button"
                        onClick={() => handleGenderChange(tab.value)}
                        className={`p-2.5 text-xs uppercase tracking-wider text-center border ${
                          filters.gender === tab.value
                            ? 'bg-[#242522] text-[#F8F6F1] border-[#242522] font-medium'
                            : 'bg-white text-[#242522] border-[#E4DED4]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Option */}
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-medium text-[#777B63] mb-2.5">
                    Sort Order
                  </h4>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleSortChange(e.target.value as SortOption)}
                    className="w-full bg-white border border-[#E4DED4] text-xs font-medium text-[#242522] p-2.5 rounded-none"
                  >
                    <option value="recommended">Curated / Recommended</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="newest">Newest Arrivals</option>
                    <option value="bestselling">Most Popular / Bestsellers</option>
                    <option value="rating">Customer Rating</option>
                  </select>
                </div>

                {/* Categories */}
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-medium text-[#777B63] mb-2.5">
                    Category
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleCategoryChange(cat)}
                        className={`px-3 py-1.5 text-xs border ${
                          filters.category === cat
                            ? 'bg-[#242522] text-[#F8F6F1] border-[#242522] font-medium'
                            : 'bg-white text-[#242522] border-[#E4DED4]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Merchandising Collections */}
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-medium text-[#777B63] mb-2.5">
                    Curated Collections
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {COLLECTION_OPTIONS.map((col) => (
                      <button
                        key={col.value}
                        type="button"
                        onClick={() => handleCollectionChange(col.value)}
                        className={`px-3 py-1.5 text-xs border ${
                          filters.collection === col.value
                            ? 'bg-[#242522] text-[#F8F6F1] border-[#242522] font-medium'
                            : 'bg-white text-[#242522] border-[#E4DED4]'
                        }`}
                      >
                        {col.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs uppercase tracking-wider font-medium text-[#777B63]">
                      Max Price: {formatINR(filters.priceRange[1])}
                    </h4>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={25000}
                    step={250}
                    value={filters.priceRange[1]}
                    onChange={(e) => handleMaxPriceSlider(Number(e.target.value))}
                    className="w-full accent-[#242522]"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {QUICK_PRICE_BANDS.map((band) => (
                      <button
                        key={band.label}
                        type="button"
                        onClick={() => handlePriceRangeChange(band.range)}
                        className={`px-2 py-1 text-[11px] border ${
                          filters.priceRange[0] === band.range[0] &&
                          filters.priceRange[1] === band.range[1]
                            ? 'bg-[#777B63] text-white border-[#777B63]'
                            : 'bg-white text-[#242522] border-[#E4DED4]'
                        }`}
                      >
                        {band.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-3 pt-2">
                  <label className="flex items-center justify-between text-xs text-[#242522] p-2.5 bg-white border border-[#E4DED4]">
                    <span>In Stock Only</span>
                    <input
                      type="checkbox"
                      checked={filters.onlyInStock}
                      onChange={(e) =>
                        onFilterChange({ ...filters, onlyInStock: e.target.checked })
                      }
                      className="accent-[#242522] w-4 h-4"
                    />
                  </label>
                  <label className="flex items-center justify-between text-xs text-[#242522] p-2.5 bg-white border border-[#E4DED4]">
                    <span>New Arrivals Only</span>
                    <input
                      type="checkbox"
                      checked={filters.onlyNewArrivals}
                      onChange={(e) =>
                        onFilterChange({ ...filters, onlyNewArrivals: e.target.checked })
                      }
                      className="accent-[#242522] w-4 h-4"
                    />
                  </label>
                  <label className="flex items-center justify-between text-xs text-[#242522] p-2.5 bg-white border border-[#E4DED4]">
                    <span>Bestsellers Only</span>
                    <input
                      type="checkbox"
                      checked={filters.onlyBestsellers}
                      onChange={(e) =>
                        onFilterChange({ ...filters, onlyBestsellers: e.target.checked })
                      }
                      className="accent-[#242522] w-4 h-4"
                    />
                  </label>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-[#E4DED4] bg-white flex items-center gap-3">
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="flex-1 py-3 text-xs uppercase tracking-wider font-medium border border-[#E4DED4] text-[#5A5C55] hover:text-[#242522]"
                >
                  Reset All
                </button>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex-1 py-3 text-xs uppercase tracking-wider font-medium bg-[#242522] text-[#F8F6F1]"
                >
                  Apply Filters ({totalResults})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

