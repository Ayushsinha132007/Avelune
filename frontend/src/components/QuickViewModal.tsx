import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Plus, Minus, ShoppingBag, Check, Shield } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { formatINR } from '../utils/currency';

export const QuickViewModal: React.FC = () => {
  const {
    quickViewProduct: product,
    closeQuickView,
    addToCart,
    toggleWishlist,
    isInWishlist,
  } = useStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      setQuantity(1);
      setSelectedSize(product.sizes ? product.sizes[0] : undefined);
      setSelectedColor(product.colors ? product.colors[0].name : undefined);
    }
  }, [product]);

  if (!product) return null;

  const isFavorited = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      closeQuickView();
    }, 900);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeQuickView}
          className="fixed inset-0 bg-[#242522]/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <div className="min-h-screen px-4 text-center flex items-center justify-center py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="inline-block w-full max-w-4xl text-left align-middle bg-[#F8F6F1] shadow-modal-luxury border border-[#E4DED4] sm:rounded-sm overflow-hidden z-10 relative"
          >
            {/* Close Button */}
            <button
              onClick={closeQuickView}
              className="absolute top-4 right-4 z-20 p-2 text-[#242522] hover:text-[#777B63] bg-white/80 rounded-full backdrop-blur-sm transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Product Gallery */}
              <div className="p-6 sm:p-8 bg-white border-b md:border-b-0 md:border-r border-[#E4DED4] flex flex-col justify-between">
                {/* Main Large Image */}
                <div className="relative aspect-[4/5] bg-[#EFE9DF] rounded-sm overflow-hidden">
                  <img
                    src={product.images[activeImageIndex] || product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover object-center"
                  />
                  {product.badge && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] uppercase tracking-widest font-medium bg-[#242522] text-[#F8F6F1]">
                      {product.badge}
                    </span>
                  )}
                </div>

                {/* Thumbnails */}
                {product.images.length > 1 && (
                  <div className="flex gap-3 mt-4">
                    {product.images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImageIndex(i)}
                        className={`w-16 h-20 rounded-sm overflow-hidden border-2 transition-all ${
                          activeImageIndex === i
                            ? 'border-[#242522]'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${product.name} view ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Specifications & Purchase Actions */}
              <div className="p-6 sm:p-8 flex flex-col justify-between bg-[#F8F6F1]">
                <div>
                  <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[#777B63] font-medium mb-1">
                    <span>{product.category}</span>
                    <span className="flex items-center gap-1">
                      ★ {product.rating} ({product.reviewCount} reviews)
                    </span>
                  </div>

                  <h2 className="font-serif text-2xl sm:text-3xl text-[#242522] font-normal leading-tight">
                    {product.name}
                  </h2>
                  <p className="text-xs text-[#5A5C55] font-light mt-1">
                    {product.subtitle}
                  </p>

                  {/* Price */}
                  <div className="flex items-baseline gap-3 mt-3">
                    <span className="text-xl sm:text-2xl font-serif text-[#242522]">
                      {formatINR(product.price)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-[#5A5C55] line-through">
                        {formatINR(product.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#5A5C55] leading-relaxed mt-4 pt-3 border-t border-[#E4DED4]">
                    {product.description}
                  </p>

                  {/* Color Selection */}
                  {product.colors && product.colors.length > 0 && (
                    <div className="mt-5">
                      <span className="text-[11px] uppercase tracking-wider text-[#242522] font-medium">
                        Tone: <span className="text-[#777B63]">{selectedColor}</span>
                      </span>
                      <div className="flex gap-2.5 mt-2">
                        {product.colors.map((c) => (
                          <button
                            key={c.name}
                            onClick={() => setSelectedColor(c.name)}
                            className={`w-7 h-7 rounded-full border-2 transition-transform ${
                              selectedColor === c.name
                                ? 'border-[#242522] scale-110'
                                : 'border-white hover:scale-105'
                            }`}
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                            aria-label={`Select color ${c.name}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Size Selection */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="mt-5">
                      <div className="flex items-center justify-between text-[11px] uppercase tracking-wider font-medium">
                        <span className="text-[#242522]">Select Size</span>
                        <span className="text-[#777B63] underline cursor-pointer">
                          Fit Guide
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {product.sizes.map((s) => (
                          <button
                            key={s}
                            onClick={() => setSelectedSize(s)}
                            className={`min-w-[42px] px-3 py-2 text-xs transition-all ${
                              selectedSize === s
                                ? 'bg-[#242522] text-[#F8F6F1] font-medium'
                                : 'bg-white text-[#242522] border border-[#E4DED4] hover:border-[#242522]'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Materials & Provenance */}
                  <div className="mt-5 pt-4 border-t border-[#E4DED4] space-y-1 text-xs text-[#5A5C55]">
                    <p>
                      <strong className="text-[#242522] font-medium">Materials:</strong>{' '}
                      {product.materials}
                    </p>
                    {product.dimensions && (
                      <p>
                        <strong className="text-[#242522] font-medium">Dimensions:</strong>{' '}
                        {product.dimensions}
                      </p>
                    )}
                  </div>
                </div>

                {/* Purchase Controls */}
                <div className="mt-6 pt-5 border-t border-[#E4DED4]">
                  <div className="flex items-center gap-3">
                    {/* Quantity counter */}
                    <div className="flex items-center border border-[#E4DED4] bg-white">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="p-2.5 text-[#242522] hover:bg-[#EFE9DF] transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-medium text-[#242522] min-w-[28px] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => q + 1)}
                        className="p-2.5 text-[#242522] hover:bg-[#EFE9DF] transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Add to bag */}
                    <button
                      onClick={handleAddToCart}
                      disabled={isAdded}
                      className="flex-1 py-3 px-6 bg-[#242522] hover:bg-[#383934] text-[#F8F6F1] text-xs font-medium uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-4 h-4 text-[#D8C6AA]" />
                          <span>Added to Bag</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>Add to Bag • {formatINR(product.price * quantity)}</span>
                        </>
                      )}
                    </button>

                    {/* Wishlist toggle */}
                    <button
                      onClick={() => toggleWishlist(product)}
                      className={`p-3 border border-[#E4DED4] rounded-none transition-colors ${
                        isFavorited
                          ? 'bg-[#242522] text-[#D8C6AA]'
                          : 'bg-white text-[#242522] hover:bg-[#EFE9DF]'
                      }`}
                      aria-label="Toggle wishlist"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isFavorited ? 'fill-[#D8C6AA]' : 'stroke-current'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-[#777B63]">
                    <Shield className="w-3 h-3" />
                    <span>Complimentary signature gift box with every order</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

