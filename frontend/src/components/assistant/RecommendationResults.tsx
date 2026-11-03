import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  RotateCcw,
  SlidersHorizontal,
  ArrowRight,
  PackageSearch,
  ExternalLink,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { useAssistant } from '../../context/AssistantContext';
import { ProductCard } from '../ProductCard';
import { formatINR } from '../../utils/currency';

export const RecommendationResults: React.FC = () => {
  const {
    recommendations,
    preferences,
    editPreferences,
    resetConversation,
    relaxFilters,
    closeAssistant,
  } = useAssistant();

  if (!recommendations) return null;

  const {
    bestMatches,
    withinBudget,
    similarStyles,
    completeTheLook,
    totalFound,
    summaryCopy,
    isRelaxedFilter,
  } = recommendations;

  // Handle 0 results state
  if (totalFound === 0) {
    return (
      <div className="mt-4 p-5 bg-white border border-[#E4DED4] rounded-xs text-center space-y-4 shadow-subtle-luxury">
        <div className="w-12 h-12 rounded-full bg-[#EFE9DF] text-[#777B63] flex items-center justify-center mx-auto">
          <PackageSearch className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-serif text-lg text-[#242522]">
            No pieces match this exact combination
          </h4>
          <p className="text-xs text-[#5A5C55] font-light mt-1.5 leading-relaxed max-w-sm mx-auto">
            {summaryCopy || `No products are currently available matching your selected criteria.`}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={editPreferences}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#242522] hover:bg-[#383934] text-[#F8F6F1] text-xs font-medium uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#D8C6AA]" />
            <span>Adjust Budget or Preferences</span>
          </button>
        </div>
      </div>
    );
  }

  // Catalogue link target based on preference
  const catalogueUrl = `/collections?gender=${
    preferences.gender !== 'anyone' ? preferences.gender : 'all'
  }&maxPrice=${preferences.maxBudget}`;

  return (
    <div className="mt-4 space-y-6">
      {/* 1. Recommendation Header & Summary Badge */}
      <div className="p-4 bg-white border border-[#E4DED4] shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#777B63]" />
          <span className="text-[10px] uppercase tracking-widest-luxury text-[#777B63] font-medium">
            Your Personal Edit • {totalFound} Pieces Selected
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[#242522] font-light leading-relaxed">
          {summaryCopy}
        </p>

        {/* Selected Criteria Chips */}
        <div className="mt-3 pt-3 border-t border-[#E4DED4]/60 flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="px-2 py-0.5 bg-[#EFE9DF] text-[#242522] font-medium">
            Occasion: {preferences.occasion}
          </span>
          <span className="px-2 py-0.5 bg-[#EFE9DF] text-[#242522] font-medium capitalize">
            {preferences.gender === 'anyone' ? 'All Departments' : preferences.gender}
          </span>
          <span className="px-2 py-0.5 bg-[#EFE9DF] text-[#242522] font-medium">
            Budget: {formatINR(preferences.minBudget)} — {formatINR(preferences.maxBudget)}
          </span>
          {preferences.styles.map((s) => (
            <span key={s} className="px-2 py-0.5 bg-[#F8F6F1] border border-[#E4DED4] text-[#5A5C55]">
              {s}
            </span>
          ))}
          {isRelaxedFilter && (
            <span className="px-2 py-0.5 bg-[#D8C6AA] text-[#242522] font-medium">
              Relaxed Range
            </span>
          )}
        </div>
      </div>

      {/* 2. Best Matches Section */}
      {bestMatches.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#E4DED4] pb-1.5">
            <h4 className="font-serif text-base text-[#242522] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#777B63]" />
              <span>Best Matches</span>
            </h4>
            <span className="text-[11px] text-[#777B63]">
              {bestMatches.length} high-affinity pieces
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {bestMatches.map((item) => (
              <ProductCard
                key={item.product.id}
                product={item.product}
                matchingReason={item.primaryReason}
              />
            ))}
          </div>
        </section>
      )}

      {/* 3. Within Your Budget Section */}
      {withinBudget.length > 0 && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-[#E4DED4] pb-1.5">
            <h4 className="font-serif text-base text-[#242522] flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#777B63]" />
              <span>Within Your Budget</span>
            </h4>
            <span className="text-[11px] text-[#777B63]">Under {formatINR(preferences.maxBudget)}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {withinBudget.map((item) => (
              <ProductCard
                key={item.product.id}
                product={item.product}
                matchingReason={item.primaryReason}
              />
            ))}
          </div>
        </section>
      )}

      {/* 4. Complete the Look (Complementary pieces) */}
      {completeTheLook && completeTheLook.length > 0 && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-[#E4DED4] pb-1.5">
            <h4 className="font-serif text-base text-[#242522] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#777B63]" />
              <span>Complete the Look</span>
            </h4>
            <span className="text-[11px] text-[#777B63]">Pairing accessories & footwear</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {completeTheLook.map((item) => (
              <ProductCard
                key={item.product.id}
                product={item.product}
                matchingReason={item.primaryReason}
              />
            ))}
          </div>
        </section>
      )}

      {/* 5. Action Buttons & Next Steps */}
      <div className="pt-4 border-t border-[#E4DED4] flex flex-col sm:flex-row items-center gap-3">
        <Link
          to={catalogueUrl}
          onClick={closeAssistant}
          className="w-full sm:flex-1 py-3 px-4 bg-[#242522] hover:bg-[#383934] text-[#F8F6F1] text-xs uppercase tracking-widest font-medium transition-colors flex items-center justify-center gap-1.5 text-center group"
        >
          <span>Explore All Matching Products</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#D8C6AA] group-hover:translate-x-1 transition-transform" />
        </Link>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={editPreferences}
            className="flex-1 sm:flex-none py-3 px-3.5 bg-white border border-[#E4DED4] hover:border-[#242522] text-[#242522] text-xs uppercase tracking-wider font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#777B63]" />
            <span>Refine</span>
          </button>
          <button
            type="button"
            onClick={resetConversation}
            className="flex-1 sm:flex-none py-3 px-3.5 bg-white border border-[#E4DED4] hover:border-[#242522] text-[#5A5C55] hover:text-[#242522] text-xs uppercase tracking-wider font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Start Over</span>
          </button>
        </div>
      </div>
    </div>
  );
};

