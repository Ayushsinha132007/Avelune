import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { formatINR, calculateShippingProgress } from '../utils/currency';
import { scrollToSection } from '../utils/scroll';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    cartSubtotal,
    totalCartItems,
  } = useStore();

  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [checkoutNotice, setCheckoutNotice] = useState(false);

  const { progressPercentage, remainingAmount, qualifiesForFreeShipping } =
    calculateShippingProgress(cartSubtotal);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');

    if (promoCode.trim().toUpperCase() === 'AVELUNE10') {
      const discount = Math.round(cartSubtotal * 0.1);
      setAppliedDiscount(discount);
      setPromoSuccess('10% seasonal atelier privilege applied.');
    } else if (promoCode.trim().length === 0) {
      setPromoError('Please enter a valid code');
    } else {
      setPromoError('Invalid code. Try "AVELUNE10"');
    }
  };

  const finalTotal = Math.max(0, cartSubtotal - appliedDiscount);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
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
                    Shopping Bag
                  </h2>
                  <p className="text-xs uppercase tracking-wider text-[#777B63] mt-0.5">
                    {totalCartItems} {totalCartItems === 1 ? 'item' : 'items'} selected
                  </p>
                </div>
                <button
                  onClick={closeCart}
                  className="p-2 text-[#242522] hover:text-[#777B63] transition-colors rounded-full"
                  aria-label="Close cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free Shipping Progress Indicator */}
              <div className="bg-[#EFE9DF]/80 px-6 py-3 border-b border-[#E4DED4]">
                <div className="flex items-center justify-between text-xs text-[#242522] mb-1.5">
                  {qualifiesForFreeShipping ? (
                    <span className="font-medium text-[#777B63]">
                      ✓ You qualify for complimentary domestic delivery
                    </span>
                  ) : (
                    <span>
                      Add{' '}
                      <strong className="font-semibold text-[#242522]">
                        {formatINR(remainingAmount)}
                      </strong>{' '}
                      more for free shipping
                    </span>
                  )}
                  <span className="font-medium">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-[#E4DED4] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#777B63] h-full transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Items List or Empty State */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-[#EFE9DF] flex items-center justify-center mb-4">
                      <Tag className="w-6 h-6 text-[#777B63]" />
                    </div>
                    <h3 className="font-serif text-xl text-[#242522]">Your bag is empty</h3>
                    <p className="text-xs text-[#5A5C55] max-w-xs mt-2 font-light">
                      Discover our considered collection of enduring pieces crafted for modern living.
                    </p>
                    <button
                      onClick={() => {
                        closeCart();
                        scrollToSection('featured-collection', 80);
                      }}
                      className="mt-6 px-6 py-3 bg-[#242522] text-[#F8F6F1] text-xs font-medium uppercase tracking-widest hover:bg-[#383934] transition-colors"
                    >
                      Explore Collection
                    </button>
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div
                      key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${idx}`}
                      className="flex gap-4 pb-5 border-b border-[#E4DED4]/70 last:border-b-0"
                    >
                      {/* Thumbnail */}
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-20 h-24 object-cover object-center bg-[#EFE9DF] rounded-sm shrink-0 border border-[#E4DED4]/60"
                      />

                      {/* Info & Quantity */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between">
                            <h4 className="font-serif text-base text-[#242522] line-clamp-1">
                              {item.product.name}
                            </h4>
                            <button
                              onClick={() =>
                                removeFromCart(
                                  item.product.id,
                                  item.selectedSize,
                                  item.selectedColor
                                )
                              }
                              className="text-[#5A5C55] hover:text-[#242522] p-1 -mr-1 transition-colors"
                              aria-label={`Remove ${item.product.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <p className="text-xs text-[#777B63] mt-0.5">
                            {item.selectedSize && `Size: ${item.selectedSize}`}
                            {item.selectedSize && item.selectedColor && ' • '}
                            {item.selectedColor && `Color: ${item.selectedColor}`}
                          </p>

                          <p className="text-xs font-medium text-[#242522] mt-1">
                            {formatINR(item.product.price)}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center border border-[#E4DED4] bg-white rounded-none">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity - 1,
                                  item.selectedSize,
                                  item.selectedColor
                                )
                              }
                              className="p-1 px-2 text-[#242522] hover:bg-[#EFE9DF] transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-medium text-[#242522] min-w-[24px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity + 1,
                                  item.selectedSize,
                                  item.selectedColor
                                )
                              }
                              className="p-1 px-2 text-[#242522] hover:bg-[#EFE9DF] transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="text-xs font-semibold text-[#242522]">
                            {formatINR(item.product.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer with Calculation & Actions */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-[#E4DED4] bg-white space-y-4">
                  {/* Promo Input */}
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Privilege code (AVELUNE10)"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 text-xs px-3 py-2 bg-[#F8F6F1] border border-[#E4DED4] focus:outline-none focus:border-[#242522] uppercase tracking-wider"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-medium uppercase tracking-wider bg-[#EFE9DF] hover:bg-[#D8C6AA] text-[#242522] transition-colors"
                    >
                      Apply
                    </button>
                  </form>

                  {promoSuccess && (
                    <p className="text-[11px] text-[#777B63] font-medium">{promoSuccess}</p>
                  )}
                  {promoError && (
                    <p className="text-[11px] text-[#A65B5B] font-medium">{promoError}</p>
                  )}

                  {/* Calculations */}
                  <div className="space-y-1.5 text-xs text-[#5A5C55] pt-1">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-[#242522] font-medium">{formatINR(cartSubtotal)}</span>
                    </div>

                    {appliedDiscount > 0 && (
                      <div className="flex justify-between text-[#777B63]">
                        <span>Atelier Privilege (10%)</span>
                        <span>-{formatINR(appliedDiscount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Estimated Shipping</span>
                      <span>
                        {qualifiesForFreeShipping ? (
                          <span className="text-[#777B63] font-medium">Complimentary</span>
                        ) : (
                          formatINR(250)
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm font-serif font-medium text-[#242522] pt-2 border-t border-[#E4DED4]">
                      <span>Total (INR)</span>
                      <span>
                        {formatINR(
                          finalTotal + (qualifiesForFreeShipping ? 0 : 250)
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Actions: View Bag Page & Proceed to Checkout */}
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        closeCart();
                        navigate('/checkout');
                      }}
                      className="w-full py-3.5 bg-[#242522] hover:bg-[#383934] text-[#F8F6F1] text-xs font-medium uppercase tracking-widest transition-colors flex items-center justify-center gap-2 group cursor-pointer"
                    >
                      <span>Proceed to Secure Checkout</span>
                      <ArrowRight className="w-4 h-4 text-[#D8C6AA] group-hover:translate-x-1 transition-transform" />
                    </button>

                    <Link
                      to="/cart"
                      onClick={closeCart}
                      className="w-full py-2.5 border border-[#E4DED4] hover:border-[#242522] text-[#242522] text-xs font-medium uppercase tracking-wider text-center block transition-colors"
                    >
                      View Detailed Shopping Bag
                    </Link>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-[11px] text-[#5A5C55]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#777B63]" />
                    <span>Secure encrypted SSL transactions & verified provenance</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

