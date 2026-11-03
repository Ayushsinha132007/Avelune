import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { formatINR } from '../utils/currency';
import { scrollToSection } from '../utils/scroll';

export const WishlistDrawer: React.FC = () => {
  const {
    wishlist,
    isWishlistOpen,
    closeWishlist,
    removeFromWishlist,
    addToCart,
    totalWishlistItems,
  } = useStore();

  const handleMoveToBag = (product: any) => {
    addToCart(product);
  };

  return (
    <AnimatePresence>
      {isWishlistOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeWishlist}
            className="absolute inset-0 bg-[#242522]/50 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-screen max-w-md bg-[#F8F6F1] shadow-drawer-luxury flex flex-col border-l border-[#E4DED4]"
            >
              {/* Drawer Header */}
              <div className="p-5 sm:p-6 border-b border-[#E4DED4] bg-white flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl text-[#242522]">
                    Saved Pieces
                  </h2>
                  <p className="text-xs uppercase tracking-wider text-[#777B63] mt-0.5">
                    {totalWishlistItems} {totalWishlistItems === 1 ? 'item' : 'items'} in wishlist
                  </p>
                </div>
                <button
                  onClick={closeWishlist}
                  className="p-2 text-[#242522] hover:text-[#777B63] transition-colors rounded-full"
                  aria-label="Close wishlist"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {wishlist.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-[#EFE9DF] flex items-center justify-center mb-4">
                      <Heart className="w-6 h-6 text-[#777B63]" />
                    </div>
                    <h3 className="font-serif text-xl text-[#242522]">No saved pieces yet</h3>
                    <p className="text-xs text-[#5A5C55] max-w-xs mt-2 font-light">
                      Click the heart icon on any piece to save it to your personal curation for later.
                    </p>
                    <button
                      onClick={() => {
                        closeWishlist();
                        scrollToSection('featured-collection', 80);
                      }}
                      className="mt-6 px-6 py-3 bg-[#242522] text-[#F8F6F1] text-xs font-medium uppercase tracking-widest hover:bg-[#383934] transition-colors"
                    >
                      Browse Collection
                    </button>
                  </div>
                ) : (
                  wishlist.map(({ product }) => (
                    <div
                      key={product.id}
                      className="flex gap-4 pb-5 border-b border-[#E4DED4]/70 last:border-b-0"
                    >
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-20 h-24 object-cover object-center bg-[#EFE9DF] rounded-sm shrink-0 border border-[#E4DED4]/60"
                      />

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between">
                            <h4 className="font-serif text-base text-[#242522] line-clamp-1">
                              {product.name}
                            </h4>
                            <button
                              onClick={() => removeFromWishlist(product.id)}
                              className="text-[#5A5C55] hover:text-[#242522] p-1 -mr-1 transition-colors"
                              aria-label={`Remove ${product.name} from wishlist`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <p className="text-xs text-[#777B63] mt-0.5">
                            {product.category}
                          </p>

                          <p className="text-xs font-medium text-[#242522] mt-1">
                            {formatINR(product.price)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="pt-2">
                          <button
                            onClick={() => handleMoveToBag(product)}
                            className="w-full py-2 px-3 text-xs font-medium uppercase tracking-wider bg-[#242522] hover:bg-[#383934] text-[#F8F6F1] transition-colors flex items-center justify-center gap-1.5"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Move to Bag</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

