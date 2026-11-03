import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  ChevronRight,
  Check,
  X,
  Package,
} from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { useAuth } from '../hooks/useAuth';
import { formatINR, calculateShippingProgress } from '../utils/currency';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, clearCart, cartSubtotal, totalCartItems, showToast } =
    useStore();
  const { isAuthenticated, user } = useAuth();

  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [placedOrderNumber, setPlacedOrderNumber] = useState('');

  const { progressPercentage, remainingAmount, qualifiesForFreeShipping } =
    calculateShippingProgress(cartSubtotal);

  const shippingFee = qualifiesForFreeShipping || cart.length === 0 ? 0 : 250;
  const finalTotal = Math.max(0, cartSubtotal - appliedDiscount) + shippingFee;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');

    if (promoCode.trim().toUpperCase() === 'AVELUNE10') {
      const discount = Math.round(cartSubtotal * 0.1);
      setAppliedDiscount(discount);
      setPromoSuccess('10% seasonal atelier privilege applied.');
      showToast({
        title: 'Privilege Applied',
        description: '10% atelier discount applied to your order.',
        type: 'info',
      });
    } else if (promoCode.trim().length === 0) {
      setPromoError('Please enter a privilege code.');
    } else {
      setPromoError('Invalid privilege code. Try "AVELUNE10" for 10% off.');
    }
  };

  const handleRemoveItem = (item: (typeof cart)[0]) => {
    removeFromCart(item.product.id, item.selectedSize, item.selectedColor);
    showToast({
      title: 'Item Removed',
      description: `${item.product.name} removed from your bag.`,
      type: 'info',
    });
  };

  const handlePlaceDemoOrder = () => {
    const randomOrderNum = `AVL-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setPlacedOrderNumber(randomOrderNum);
    setIsOrderPlaced(true);
    clearCart();
    showToast({
      title: 'Demo Order Created',
      description: `Order ${randomOrderNum} placed in preview mode.`,
      type: 'cart',
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F6F1] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#777B63] mb-6">
          <Link to="/" className="hover:text-[#242522] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-[#A8A69E]" />
          <Link to="/collections" className="hover:text-[#242522] transition-colors">
            Collections
          </Link>
          <ChevronRight className="w-3 h-3 text-[#A8A69E]" />
          <span className="text-[#242522] font-medium">Shopping Bag</span>
        </nav>

        {/* Page Title & Count */}
        <div className="border-b border-[#E4DED4] pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest-luxury text-[#777B63] font-medium block mb-1">
              Your Wardrobe Selection
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#242522] font-normal tracking-tight">
              Your Shopping Bag
            </h1>
          </div>
          <span className="text-xs uppercase tracking-wider text-[#777B63]">
            {totalCartItems} {totalCartItems === 1 ? 'Piece' : 'Pieces'} Selected
          </span>
        </div>

        {/* Free Delivery Threshold Bar */}
        {cart.length > 0 && (
          <div className="bg-white border border-[#E4DED4] p-4 sm:p-5 mb-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#242522] mb-2 gap-1">
              {qualifiesForFreeShipping ? (
                <div className="flex items-center gap-2 font-medium text-[#777B63]">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>You qualify for complimentary domestic delivery</span>
                </div>
              ) : (
                <div>
                  Add{' '}
                  <strong className="font-semibold text-[#242522]">
                    {formatINR(remainingAmount)}
                  </strong>{' '}
                  more for complimentary standard delivery (orders above ₹1,999)
                </div>
              )}
              <span className="font-mono text-[11px] text-[#777B63] self-end sm:self-auto">
                {progressPercentage}%
              </span>
            </div>
            <div className="w-full bg-[#EFE9DF] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#777B63] h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        {cart.length === 0 && !isOrderPlaced ? (
          /* Empty Bag State */
          <div className="bg-white border border-[#E4DED4] p-12 sm:p-16 text-center max-w-xl mx-auto shadow-subtle-luxury my-8">
            <div className="w-16 h-16 rounded-full bg-[#EFE9DF] flex items-center justify-center text-[#777B63] mx-auto mb-5">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl text-[#242522] font-normal mb-2">
              Your Shopping Bag is Empty
            </h2>
            <p className="text-xs sm:text-sm text-[#5A5C55] font-light max-w-sm mx-auto leading-relaxed mb-8">
              Explore our permanent collection of considered garments, natural fabrics, and quiet lifestyle objects.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/collections"
                className="w-full sm:w-auto px-8 py-3.5 bg-[#242522] hover:bg-[#383934] text-[#F8F6F1] text-xs uppercase tracking-widest font-medium transition-colors"
              >
                Explore Collections
              </Link>
              <Link
                to="/offers"
                className="w-full sm:w-auto px-8 py-3.5 border border-[#242522] text-[#242522] hover:bg-[#242522] hover:text-[#F8F6F1] text-xs uppercase tracking-widest font-medium transition-colors"
              >
                View Special Offers
              </Link>
            </div>
          </div>
        ) : isOrderPlaced ? (
          /* Order Confirmation Demo Screen */
          <div className="bg-white border border-[#E4DED4] p-10 sm:p-14 text-center max-w-lg mx-auto shadow-subtle-luxury my-8">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
              <Check className="w-8 h-8" />
            </div>
            <span className="text-[10px] uppercase tracking-widest text-[#777B63] font-medium block mb-1">
              Order Confirmed
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#242522] mb-2 font-normal">
              Thank You for Your Order
            </h2>
            <p className="text-xs sm:text-sm text-[#5A5C55] font-light leading-relaxed mb-6">
              Your order <strong className="font-semibold text-[#242522]">{placedOrderNumber}</strong> has been received. An order receipt with tracking has been dispatched to your email.
            </p>

            <div className="p-4 bg-[#F8F6F1] border border-[#E4DED4] text-left text-xs space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-[#5A5C55]">Order Reference:</span>
                <span className="font-mono font-medium text-[#242522]">{placedOrderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5A5C55]">Estimated Dispatch:</span>
                <span className="text-[#242522]">Within 24–48 hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5A5C55]">Payment Mode:</span>
                <span className="text-[#242522]">Atelier Standard Payment</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {isAuthenticated ? (
                <Link
                  to="/account/orders"
                  className="w-full sm:w-auto px-6 py-3 bg-[#242522] hover:bg-[#383934] text-[#F8F6F1] text-xs uppercase tracking-widest font-medium transition-colors"
                >
                  View My Orders
                </Link>
              ) : (
                <Link
                  to="/collections"
                  className="w-full sm:w-auto px-6 py-3 bg-[#242522] hover:bg-[#383934] text-[#F8F6F1] text-xs uppercase tracking-widest font-medium transition-colors"
                >
                  Continue Shopping
                </Link>
              )}
            </div>
          </div>
        ) : (
          /* Active Cart Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-8 bg-white border border-[#E4DED4] divide-y divide-[#E4DED4]/70 shadow-xs">
              <div className="p-4 sm:p-6 bg-[#EFE9DF]/30 flex items-center justify-between text-xs text-[#777B63] uppercase tracking-wider font-medium">
                <span>Selected Items ({cart.length})</span>
                <button
                  type="button"
                  onClick={clearCart}
                  className="hover:text-red-700 transition-colors cursor-pointer"
                >
                  Clear Bag
                </button>
              </div>

              {cart.map((item, idx) => {
                const itemSubtotal = item.product.price * item.quantity;
                return (
                  <div
                    key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${idx}`}
                    className="p-4 sm:p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
                  >
                    {/* Thumbnail & Product Details */}
                    <div className="flex gap-4 items-center flex-1">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-20 h-24 sm:w-24 sm:h-28 object-cover object-center bg-[#EFE9DF] border border-[#E4DED4] shrink-0"
                      />

                      <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-widest text-[#777B63] font-medium block">
                          {item.product.category}
                        </span>
                        <h3 className="font-serif text-base sm:text-lg text-[#242522] font-normal leading-snug">
                          {item.product.name}
                        </h3>

                        <div className="text-xs text-[#5A5C55] font-light flex items-center gap-2">
                          {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                          {item.selectedSize && item.selectedColor && <span>•</span>}
                          {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                        </div>

                        <div className="text-xs font-medium text-[#242522] pt-1">
                          Unit Price: {formatINR(item.product.price)}
                        </div>
                      </div>
                    </div>

                    {/* Quantity Selector & Item Subtotal */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E4DED4]/60">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-[#E4DED4] bg-[#F8F6F1]">
                        <button
                          type="button"
                          onClick={() => {
                            if (item.quantity > 1) {
                              updateQuantity(
                                item.product.id,
                                item.quantity - 1,
                                item.selectedSize,
                                item.selectedColor
                              );
                            } else {
                              handleRemoveItem(item);
                            }
                          }}
                          aria-label="Decrease quantity"
                          className="p-1.5 px-3 text-[#242522] hover:bg-white transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 py-1 text-xs font-semibold text-[#242522] min-w-[28px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.quantity + 1,
                              item.selectedSize,
                              item.selectedColor
                            )
                          }
                          aria-label="Increase quantity"
                          className="p-1.5 px-3 text-[#242522] hover:bg-white transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right min-w-[90px]">
                        <span className="text-sm sm:text-base font-serif font-medium text-[#242522]">
                          {formatINR(itemSubtotal)}
                        </span>
                      </div>

                      {/* Delete Action */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item)}
                        aria-label={`Remove ${item.product.name}`}
                        className="text-[#A8A69E] hover:text-red-700 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Bottom Actions */}
              <div className="p-4 sm:p-6 bg-[#F8F6F1]/50 flex items-center justify-between">
                <Link
                  to="/collections"
                  className="text-xs uppercase tracking-wider text-[#242522] hover:text-[#777B63] font-medium transition-colors flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3.5 h-3.5 rotate-180 text-[#D8C6AA]" />
                  <span>Continue Shopping</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-4 bg-white border border-[#E4DED4] p-6 space-y-5 shadow-xs sticky top-24">
              <h2 className="font-serif text-xl text-[#242522] pb-3 border-b border-[#E4DED4]">
                Order Summary
              </h2>

              {/* Privilege Code Input */}
              <form onSubmit={handleApplyPromo} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Privilege code (AVELUNE10)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 bg-[#F8F6F1] border border-[#E4DED4] focus:outline-none focus:border-[#242522] uppercase tracking-wider"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-medium uppercase tracking-wider bg-[#242522] hover:bg-[#383934] text-[#F8F6F1] transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {promoSuccess && (
                  <p className="text-[11px] text-[#777B63] font-medium">{promoSuccess}</p>
                )}
                {promoError && (
                  <p className="text-[11px] text-red-600 font-medium">{promoError}</p>
                )}
              </form>

              {/* Calculations Breakdown */}
              <div className="space-y-2.5 text-xs text-[#5A5C55] pt-2 border-t border-[#E4DED4]/60">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="text-[#242522] font-medium">{formatINR(cartSubtotal)}</span>
                </div>

                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-[#777B63]">
                    <span>Atelier Privilege Discount</span>
                    <span>-{formatINR(appliedDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Standard Delivery</span>
                  <span>
                    {qualifiesForFreeShipping ? (
                      <span className="text-[#777B63] font-medium">Complimentary</span>
                    ) : (
                      formatINR(250)
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-base font-serif font-medium text-[#242522] pt-3 border-t border-[#E4DED4]">
                  <span>Total Amount (INR)</span>
                  <span>{formatINR(finalTotal)}</span>
                </div>
              </div>

              {/* Checkout Trigger */}
              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="w-full py-4 bg-[#242522] hover:bg-[#383934] text-[#F8F6F1] text-xs font-medium uppercase tracking-widest transition-colors flex items-center justify-center gap-2 group shadow-sm cursor-pointer"
              >
                <span>Proceed to Secure Checkout</span>
                <ArrowRight className="w-4 h-4 text-[#D8C6AA] group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-[#777B63]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#777B63]" />
                <span>Encrypted SSL transaction • 14-day archival return policy</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Honest Demo Checkout Modal */}
      <AnimatePresence>
        {isCheckoutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutModalOpen(false)}
              className="fixed inset-0 bg-[#242522]/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-lg bg-white border border-[#E4DED4] p-6 sm:p-8 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#E4DED4]">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#777B63]" />
                  <h3 className="font-serif text-xl text-[#242522]">Preview Checkout</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="p-1.5 text-[#5A5C55] hover:text-[#242522]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-5 space-y-4 text-xs text-[#5A5C55] leading-relaxed">
                <div className="p-3 bg-[#EFE9DF]/50 border border-[#E4DED4] text-[#242522]">
                  <p className="font-medium text-[11px] uppercase tracking-wider text-[#777B63] mb-1">
                    Frontend Demonstration Environment
                  </p>
                  <p className="text-xs">
                    This preview simulates order dispatch and inventory allocation. No actual payment card will be charged.
                  </p>
                </div>

                <div className="space-y-2 border-t border-[#E4DED4]/60 pt-3">
                  <div className="flex justify-between text-xs">
                    <span>Client Name:</span>
                    <strong className="text-[#242522]">
                      {isAuthenticated && user?.fullName ? user.fullName : 'Ayush (Guest Atelier Client)'}
                    </strong>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Pieces in Order:</span>
                    <strong className="text-[#242522]">{totalCartItems} Items</strong>
                  </div>
                  <div className="flex justify-between text-xs font-serif font-medium text-base text-[#242522] pt-2 border-t border-[#E4DED4]">
                    <span>Total Payable:</span>
                    <span>{formatINR(finalTotal)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E4DED4] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="px-4 py-2.5 border border-[#E4DED4] text-xs font-medium uppercase tracking-wider text-[#5A5C55] hover:text-[#242522]"
                >
                  Return to Bag
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCheckoutModalOpen(false);
                    handlePlaceDemoOrder();
                  }}
                  className="px-6 py-2.5 bg-[#242522] hover:bg-[#383934] text-[#F8F6F1] text-xs font-medium uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D8C6AA]" />
                  <span>Place Demo Order</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

