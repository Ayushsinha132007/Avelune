import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowLeft, ArrowRight, Eye } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { formatINR } from '../../utils/currency';

export const WishlistPage: React.FC = () => {
  const {
    wishlist,
    removeFromWishlist,
    addToCart,
    openQuickView,
    totalWishlistItems,
  } = useStore();

  return (
    <div className="w-full py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Breadcrumb / Back Link */}
        <div className="mb-6">
          <Link
            to="/account/home"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#777B63] hover:text-[#242522] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Account Dashboard</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-[#E4DED4] mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-[#777B63]" />
              <span className="text-[10px] uppercase tracking-widest font-medium text-[#777B63]">
                Client Wishlist
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#242522] font-normal tracking-tight">
              Saved Pieces
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-[#5A5C55] font-light">
            {totalWishlistItems} {totalWishlistItems === 1 ? 'considered piece' : 'considered pieces'} reserved in your curation
          </p>
        </div>

        {/* Wishlist Items Grid or Polished Empty State */}
        {wishlist.length === 0 ? (
          <div className="bg-white border border-[#E4DED4] p-12 sm:p-16 text-center max-w-xl mx-auto rounded-none shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#EFE9DF] text-[#777B63] flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="font-serif text-2xl text-[#242522]">
              Your curation is currently empty
            </h3>
            <p className="text-xs sm:text-sm text-[#5A5C55] font-light max-w-md mx-auto mt-2 leading-relaxed">
              As you explore the atelier's seasonal collections, select the heart icon on any silhouette to reserve it here for later contemplation.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/account/home"
                className="px-7 py-3.5 bg-[#242522] text-[#F8F6F1] text-xs uppercase tracking-widest font-medium hover:bg-[#383934] transition-colors"
              >
                Browse Curated Edit
              </Link>
              <Link
                to="/"
                className="px-6 py-3.5 bg-white border border-[#E4DED4] text-[#242522] text-xs uppercase tracking-widest font-medium hover:border-[#242522] transition-colors"
              >
                View Full Public Catalog
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {wishlist.map(({ product }) => (
              <div
                key={product.id}
                className="bg-white border border-[#E4DED4] hover:border-[#D8C6AA] transition-all duration-300 rounded-none overflow-hidden flex flex-col justify-between group shadow-xs"
              >
                {/* Product Image */}
                <div
                  className="relative aspect-[4/5] bg-[#EFE9DF] cursor-pointer overflow-hidden"
                  onClick={() => openQuickView(product)}
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />

                  {/* Top-Right Remove Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWishlist(product.id);
                    }}
                    className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-[#5A5C55] hover:text-[#A65B5B] rounded-full shadow-xs transition-colors"
                    aria-label={`Remove ${product.name} from wishlist`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {product.badge && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] uppercase tracking-widest font-medium bg-[#242522] text-[#F8F6F1]">
                      {product.badge}
                    </span>
                  )}
                </div>

                {/* Info & Purchase Actions */}
                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#777B63] block mb-1">
                      {product.category}
                    </span>
                    <h4
                      className="font-serif text-lg text-[#242522] group-hover:text-[#777B63] transition-colors line-clamp-1 cursor-pointer"
                      onClick={() => openQuickView(product)}
                    >
                      {product.name}
                    </h4>
                    <p className="text-sm font-medium text-[#242522] mt-1.5">
                      {formatINR(product.price)}
                    </p>
                  </div>

                  {/* Actions Row */}
                  <div className="mt-5 pt-4 border-t border-[#E4DED4]/70 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      className="flex-1 py-2.5 px-3 bg-[#242522] hover:bg-[#383934] text-[#F8F6F1] text-xs uppercase tracking-wider font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Move to Bag</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openQuickView(product)}
                      className="p-2.5 bg-[#F8F6F1] hover:bg-[#EFE9DF] text-[#242522] border border-[#E4DED4] transition-colors"
                      title="Quick inspection"
                      aria-label="Inspect details"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#777B63]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

