import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Plus, Eye, Check, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { formatINR } from '../utils/currency';
import { useStore } from '../hooks/useStore';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  matchingReason?: string;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  matchingReason,
  className = '',
}) => {
  const { addToCart, toggleWishlist, isInWishlist, openQuickView } = useStore();
  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isFavorited = isInWishlist(product.id);
  const hasSecondaryImage = product.images.length > 1;

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div
      className={`group relative flex flex-col bg-white border border-[#E4DED4]/60 hover:border-[#D8C6AA] transition-all duration-500 rounded-sm overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => openQuickView(product)}
    >
      {/* Image Container with 4:5 Aspect Ratio */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#EFE9DF]/40 cursor-pointer">
        {/* Primary Image */}
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className={`h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 ${
            hasSecondaryImage && isHovered ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* Secondary Hover Image */}
        {hasSecondaryImage && (
          <img
            src={product.images[1]}
            alt={`${product.name} detail view`}
            loading="lazy"
            className={`absolute inset-0 h-full w-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-105 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex flex-col gap-1.5 z-10">
          {product.badge && (
            <span className="inline-block px-2 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[10px] uppercase tracking-widest font-medium bg-[#242522]/90 text-[#F8F6F1] backdrop-blur-sm rounded-none">
              {product.badge}
            </span>
          )}
          {discountPercent && (
            <span className="inline-block px-2 py-0.5 text-[9px] uppercase tracking-wider font-semibold bg-[#777B63] text-white">
              {discountPercent}% Off
            </span>
          )}
        </div>

        {/* Top-Right Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-3 right-3 p-2 rounded-full z-10 transition-all duration-300 ${
            isFavorited
              ? 'bg-[#242522] text-[#D8C6AA]'
              : 'bg-white/90 text-[#242522] hover:bg-white hover:text-[#777B63] shadow-sm'
          }`}
        >
          <motion.div whileTap={{ scale: 0.8 }} transition={{ duration: 0.15 }}>
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorited ? 'fill-[#D8C6AA] stroke-[#D8C6AA]' : 'stroke-current'
              }`}
            />
          </motion.div>
        </button>

        {/* Hover Action Overlay (Desktop) */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-[#242522]/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-between gap-2 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openQuickView(product);
            }}
            className="flex-1 py-2 px-3 text-xs font-medium tracking-wider uppercase bg-[#F8F6F1]/95 hover:bg-white text-[#242522] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Eye className="w-3.5 h-3.5 text-[#777B63]" />
            <span>Quick View</span>
          </button>

          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={justAdded}
            className="py-2 px-3 text-xs font-medium tracking-wider uppercase bg-[#242522] hover:bg-[#383934] text-[#F8F6F1] transition-colors flex items-center justify-center gap-1 shadow-sm"
            aria-label="Add to bag"
          >
            {justAdded ? (
              <Check className="w-3.5 h-3.5 text-[#D8C6AA]" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between bg-white">
        <div>
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[#777B63] font-medium mb-1">
            <span>{product.category}</span>
            {product.rating && (
              <span className="flex items-center gap-1 text-[#242522]/70">
                ★ {product.rating}
              </span>
            )}
          </div>

          <h3 className="font-serif text-base sm:text-lg font-normal text-[#242522] leading-snug group-hover:text-[#777B63] transition-colors line-clamp-1">
            {product.name}
          </h3>

          <p className="text-xs text-[#5A5C55] font-light mt-1 line-clamp-1">
            {product.subtitle}
          </p>

          {matchingReason && (
            <div className="mt-2 text-[10px] sm:text-[11px] text-[#777B63] font-medium flex items-center gap-1.5 bg-[#EFE9DF]/50 px-2 py-0.5 border border-[#E4DED4]/60">
              <Sparkles className="w-3 h-3 text-[#D8C6AA] shrink-0" />
              <span className="truncate">{matchingReason}</span>
            </div>
          )}
        </div>

        {/* Price & Mobile Quick Add */}
        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-[#E4DED4]/60 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-xs sm:text-base font-medium text-[#242522]">
              {formatINR(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="text-[10px] sm:text-xs text-[#5A5C55]/70 line-through">
                  {formatINR(product.originalPrice)}
                </span>
                {discountPercent && (
                  <span className="text-[10px] text-[#777B63] font-medium hidden sm:inline">
                    ({discountPercent}% off)
                  </span>
                )}
              </>
            )}
          </div>

          {/* Mobile direct add icon with comfortable tap target */}
          <button
            type="button"
            onClick={handleQuickAdd}
            className="sm:hidden min-w-[32px] min-h-[32px] flex items-center justify-center p-1.5 text-[#242522] hover:text-[#777B63] transition-colors"
            aria-label="Add to cart"
          >
            {justAdded ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

