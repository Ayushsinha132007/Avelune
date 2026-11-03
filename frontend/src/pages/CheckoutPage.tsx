import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  ArrowLeft,
  ChevronRight,
  Package,
  AlertCircle,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  HelpCircle,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { useAuth } from '../hooks/useAuth';
import { formatINR } from '../utils/currency';
import { paymentService } from '../services/paymentService';
import { CheckoutAddress } from '../types/payment';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, cartSubtotal, clearCart, showToast } = useStore();
  const { user, isAuthenticated } = useAuth();

  // If cart is empty, redirect back to cart
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [cart, navigate]);

  // Delivery form state
  const [formData, setFormData] = useState<CheckoutAddress>({
    fullName: user?.fullName || (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : ''),
    email: user?.email || '',
    phone: user?.phone?.replace(/\D/g, '').slice(-10) || '',
    addressLine1: '',
    apartment: '',
    city: user?.preferredCity?.split(',')[0]?.trim() || '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  // Separate billing address state
  const [useSameBilling, setUseSameBilling] = useState(true);
  const [billingData, setBillingData] = useState<CheckoutAddress>({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  // Coupon state
  const [couponCode, setCouponCode] = useState('AVELUNE10');
  const [appliedCoupon, setAppliedCoupon] = useState('AVELUNE10');
  const [couponDiscount, setCouponDiscount] = useState<number>(() => Math.round(cartSubtotal * 0.1));
  const [couponMessage, setCouponMessage] = useState('10% seasonal atelier privilege applied.');

  // Payment UI state
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isPaymentInterrupted, setIsPaymentInterrupted] = useState(false);
  const [pendingInternalOrderId, setPendingInternalOrderId] = useState<string | null>(null);

  // Financial calculations
  const deliveryFee = cartSubtotal >= 1999 ? 0 : 250;
  const finalPayable = Math.max(0, cartSubtotal - couponDiscount) + deliveryFee;
  const taxPortion = Math.round((finalPayable * 0.18) / 1.18);

  const handleInputChange = (field: keyof CheckoutAddress, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    setErrorMessage('');
  };

  const handleBillingChange = (field: keyof CheckoutAddress, value: string) => {
    setBillingData((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'AVELUNE10') {
      const discount = Math.round(cartSubtotal * 0.1);
      setAppliedCoupon(code);
      setCouponDiscount(discount);
      setCouponMessage('10% seasonal atelier privilege applied.');
    } else if (code === 'ATELIER15') {
      if (cartSubtotal >= 5000) {
        const discount = Math.round(cartSubtotal * 0.15);
        setAppliedCoupon(code);
        setCouponDiscount(discount);
        setCouponMessage('15% privilege on orders above ₹5,000 applied.');
      } else {
        setErrorMessage('ATELIER15 requires a minimum order subtotal of ₹5,000.');
      }
    } else if (code === '') {
      setAppliedCoupon('');
      setCouponDiscount(0);
      setCouponMessage('');
    } else {
      setErrorMessage('Invalid privilege code. Use "AVELUNE10" for 10% off.');
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) errors.fullName = 'Please enter your full name';
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      errors.phone = 'Please enter a valid 10-digit mobile number';
    }
    if (!formData.addressLine1.trim() || formData.addressLine1.trim().length < 5) {
      errors.addressLine1 = 'Please enter your complete street address';
    }
    if (!formData.city.trim()) errors.city = 'Please enter your city';
    if (!formData.state.trim()) errors.state = 'Please enter your state';
    const cleanPin = formData.postalCode.replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      errors.postalCode = 'Please enter a valid 6-digit Indian PIN code';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInitiatePayment = async () => {
    if (!validateForm()) {
      setErrorMessage('Please complete all required delivery fields.');
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');
    setIsPaymentInterrupted(false);

    try {
      // 1. Ensure Razorpay SDK is loaded
      await paymentService.loadRazorpayScript();

      // 2. Request backend order creation (Authoritative Server Pricing)
      const orderPayload = {
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
        })),
        deliveryAddress: formData,
        billingAddress: useSameBilling ? formData : billingData,
        couponCode: appliedCoupon || undefined,
        userId: user?.id,
      };

      const orderRes = await paymentService.createOrder(orderPayload);
      setPendingInternalOrderId(orderRes.internalOrderId);

      // Check if window.Razorpay is available
      if (typeof window !== 'undefined' && window.Razorpay) {
        const options = {
          key: orderRes.keyId,
          amount: orderRes.amount,
          currency: orderRes.currency,
          name: 'AVELUNE Atelier',
          description: `Order ${orderRes.orderNumber}`,
          image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=200&auto=format&fit=crop',
          order_id: orderRes.razorpayOrderId,
          handler: async (response: any) => {
            try {
              setIsProcessing(true);
              // Cryptographically Verify Signature on Backend
              const verifyRes = await paymentService.verifyPayment({
                internalOrderId: orderRes.internalOrderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyRes.success && verifyRes.order) {
                // Clear cart only after verified payment
                clearCart();
                showToast({
                  title: 'Order Confirmed',
                  description: `Order ${verifyRes.order.orderNumber} successfully placed.`,
                  type: 'cart',
                });
                navigate(`/payment/success?orderId=${encodeURIComponent(verifyRes.order.id)}`);
              } else {
                navigate(`/payment/failed?orderId=${encodeURIComponent(orderRes.internalOrderId)}&reason=VerificationFailed`);
              }
            } catch (err: any) {
              console.error('Payment verification error:', err);
              navigate(`/payment/failed?orderId=${encodeURIComponent(orderRes.internalOrderId)}&reason=SignatureMismatch`);
            } finally {
              setIsProcessing(false);
            }
          },
          prefill: {
            name: orderRes.customer.name,
            email: orderRes.customer.email,
            contact: orderRes.customer.contact,
          },
          notes: {
            internalOrderId: orderRes.internalOrderId,
            orderNumber: orderRes.orderNumber,
          },
          theme: {
            color: '#242522', // Deep Charcoal
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
              setIsPaymentInterrupted(true);
            },
          },
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.on('payment.failed', (failedRes: any) => {
          setIsProcessing(false);
          const reason = failedRes.error?.description || 'Payment was declined by issuing bank.';
          navigate(`/payment/failed?orderId=${encodeURIComponent(orderRes.internalOrderId)}&reason=${encodeURIComponent(reason)}`);
        });

        razorpayInstance.open();
      } else {
        // Razorpay SDK could not load (e.g., offline or network blocker)
        setIsProcessing(false);
        setErrorMessage(
          'The secure Razorpay payment gateway could not be loaded. Please ensure you are connected to the internet and disable any ad blockers.'
        );
      }
    } catch (err: any) {
      console.error('Payment initiation error:', err);
      setErrorMessage(err.message || 'Unable to connect to atelier payment gateway. Please check your network.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F1] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#777B63] mb-6">
          <Link to="/" className="hover:text-[#242522] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-[#A8A69E]" />
          <Link to="/cart" className="hover:text-[#242522] transition-colors">
            Shopping Bag
          </Link>
          <ChevronRight className="w-3 h-3 text-[#A8A69E]" />
          <span className="text-[#242522] font-medium">Secure Checkout</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-[#E4DED4] mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-[#777B63]" />
              <span className="text-[10px] uppercase tracking-widest font-medium text-[#777B63]">
                Encrypted Transaction
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#242522] font-normal tracking-tight">
              Checkout & Atelier Dispatch
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#5A5C55]">
            <Lock className="w-4 h-4 text-[#777B63]" />
            <span>256-Bit SSL Razorpay Encryption</span>
          </div>
        </div>

        {/* Interrupted Payment Alert */}
        <AnimatePresence>
          {isPaymentInterrupted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-[#EFE9DF] border border-[#D8C6AA] mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#242522]"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#777B63] shrink-0" />
                <span>
                  The checkout window was closed before completion. Your pending reservation{' '}
                  {pendingInternalOrderId ? `(${pendingInternalOrderId})` : ''} is held safely.
                </span>
              </div>
              <button
                type="button"
                onClick={handleInitiatePayment}
                className="px-4 py-2 bg-[#242522] text-[#F8F6F1] font-medium uppercase tracking-wider text-[11px] shrink-0 hover:bg-[#383934] transition-colors"
              >
                Resume Payment
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="p-4 bg-[#F8EFEF] border border-[#E4B4B4] mb-6 flex items-start gap-3 text-xs text-[#A33B3B]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{errorMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* ========================================================= */}
          {/* LEFT COLUMN: Delivery Details & Billing                    */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-8">
            {/* Delivery Address Form */}
            <div className="bg-white border border-[#E4DED4] p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#E4DED4] mb-6">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#242522] text-[#F8F6F1] flex items-center justify-center text-xs font-serif">
                    1
                  </span>
                  <h2 className="font-serif text-xl text-[#242522]">Delivery Details</h2>
                </div>
                {isAuthenticated && (
                  <span className="text-[11px] uppercase tracking-wider text-[#777B63] bg-[#F8F6F1] px-2.5 py-1 border border-[#E4DED4]">
                    Atelier Client Verified
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#5A5C55] mb-1.5">
                    Full Name <span className="text-[#A33B3B]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="e.g. Ayush Kumar"
                    className={`w-full px-4 py-3 bg-[#F8F6F1] border text-xs text-[#242522] focus:outline-none focus:bg-white transition-colors ${
                      validationErrors.fullName ? 'border-[#A33B3B]' : 'border-[#E4DED4] focus:border-[#242522]'
                    }`}
                  />
                  {validationErrors.fullName && (
                    <p className="text-[11px] text-[#A33B3B] mt-1">{validationErrors.fullName}</p>
                  )}
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#5A5C55] mb-1.5">
                      Email Address <span className="text-[#A33B3B]">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="client@avelune.com"
                      className={`w-full px-4 py-3 bg-[#F8F6F1] border text-xs text-[#242522] focus:outline-none focus:bg-white transition-colors ${
                        validationErrors.email ? 'border-[#A33B3B]' : 'border-[#E4DED4] focus:border-[#242522]'
                      }`}
                    />
                    {validationErrors.email && (
                      <p className="text-[11px] text-[#A33B3B] mt-1">{validationErrors.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#5A5C55] mb-1.5">
                      Phone Number <span className="text-[#A33B3B]">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#777B63] font-medium">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, ''))}
                        placeholder="98765 43210"
                        className={`w-full pl-12 pr-4 py-3 bg-[#F8F6F1] border text-xs text-[#242522] focus:outline-none focus:bg-white transition-colors ${
                          validationErrors.phone ? 'border-[#A33B3B]' : 'border-[#E4DED4] focus:border-[#242522]'
                        }`}
                      />
                    </div>
                    {validationErrors.phone && (
                      <p className="text-[11px] text-[#A33B3B] mt-1">{validationErrors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Street Address */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#5A5C55] mb-1.5">
                    Street Address & Building <span className="text-[#A33B3B]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.addressLine1}
                    onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                    placeholder="House / Flat No., Road, Area"
                    className={`w-full px-4 py-3 bg-[#F8F6F1] border text-xs text-[#242522] focus:outline-none focus:bg-white transition-colors ${
                      validationErrors.addressLine1 ? 'border-[#A33B3B]' : 'border-[#E4DED4] focus:border-[#242522]'
                    }`}
                  />
                  {validationErrors.addressLine1 && (
                    <p className="text-[11px] text-[#A33B3B] mt-1">{validationErrors.addressLine1}</p>
                  )}
                </div>

                {/* Apartment / Landmark */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#5A5C55] mb-1.5">
                    Apartment, Floor, Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.apartment}
                    onChange={(e) => handleInputChange('apartment', e.target.value)}
                    placeholder="e.g. Tower B, Flat 1402, Near Oberoi Mall"
                    className="w-full px-4 py-3 bg-[#F8F6F1] border border-[#E4DED4] focus:border-[#242522] text-xs text-[#242522] focus:outline-none focus:bg-white transition-colors"
                  />
                </div>

                {/* City, State & PIN */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#5A5C55] mb-1.5">
                      City <span className="text-[#A33B3B]">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Mumbai"
                      className={`w-full px-4 py-3 bg-[#F8F6F1] border text-xs text-[#242522] focus:outline-none focus:bg-white transition-colors ${
                        validationErrors.city ? 'border-[#A33B3B]' : 'border-[#E4DED4] focus:border-[#242522]'
                      }`}
                    />
                    {validationErrors.city && (
                      <p className="text-[11px] text-[#A33B3B] mt-1">{validationErrors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#5A5C55] mb-1.5">
                      State <span className="text-[#A33B3B]">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="Maharashtra"
                      className={`w-full px-4 py-3 bg-[#F8F6F1] border text-xs text-[#242522] focus:outline-none focus:bg-white transition-colors ${
                        validationErrors.state ? 'border-[#A33B3B]' : 'border-[#E4DED4] focus:border-[#242522]'
                      }`}
                    />
                    {validationErrors.state && (
                      <p className="text-[11px] text-[#A33B3B] mt-1">{validationErrors.state}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#5A5C55] mb-1.5">
                      PIN Code <span className="text-[#A33B3B]">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value.replace(/\D/g, ''))}
                      placeholder="400026"
                      className={`w-full px-4 py-3 bg-[#F8F6F1] border text-xs text-[#242522] focus:outline-none focus:bg-white transition-colors ${
                        validationErrors.postalCode ? 'border-[#A33B3B]' : 'border-[#E4DED4] focus:border-[#242522]'
                      }`}
                    />
                    {validationErrors.postalCode && (
                      <p className="text-[11px] text-[#A33B3B] mt-1">{validationErrors.postalCode}</p>
                    )}
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#5A5C55] mb-1.5">Country</label>
                  <input
                    type="text"
                    disabled
                    value="India (Complimentary Blue Dart Express)"
                    className="w-full px-4 py-3 bg-[#EFE9DF]/50 border border-[#E4DED4] text-xs text-[#5A5C55] cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Billing Address Toggle */}
            <div className="bg-white border border-[#E4DED4] p-6 shadow-xs">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={useSameBilling}
                  onChange={(e) => setUseSameBilling(e.target.checked)}
                  className="w-4 h-4 accent-[#242522] rounded-none"
                />
                <span className="text-xs uppercase tracking-wider text-[#242522] font-medium">
                  Billing address matches shipping address
                </span>
              </label>

              {!useSameBilling && (
                <div className="mt-6 pt-6 border-t border-[#E4DED4] space-y-4">
                  <h3 className="font-serif text-base text-[#242522] mb-2">Separate Billing Address</h3>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#5A5C55] mb-1.5">
                      Billing Contact Name
                    </label>
                    <input
                      type="text"
                      value={billingData.fullName}
                      onChange={(e) => handleBillingChange('fullName', e.target.value)}
                      placeholder="Name on card / invoice"
                      className="w-full px-4 py-3 bg-[#F8F6F1] border border-[#E4DED4] text-xs text-[#242522]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#5A5C55] mb-1.5">
                      Billing Address Line
                    </label>
                    <input
                      type="text"
                      value={billingData.addressLine1}
                      onChange={(e) => handleBillingChange('addressLine1', e.target.value)}
                      placeholder="Billing street address"
                      className="w-full px-4 py-3 bg-[#F8F6F1] border border-[#E4DED4] text-xs text-[#242522]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#5A5C55] mb-1.5">City</label>
                      <input
                        type="text"
                        value={billingData.city}
                        onChange={(e) => handleBillingChange('city', e.target.value)}
                        placeholder="City"
                        className="w-full px-4 py-3 bg-[#F8F6F1] border border-[#E4DED4] text-xs text-[#242522]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#5A5C55] mb-1.5">PIN Code</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={billingData.postalCode}
                        onChange={(e) => handleBillingChange('postalCode', e.target.value.replace(/\D/g, ''))}
                        placeholder="PIN Code"
                        className="w-full px-4 py-3 bg-[#F8F6F1] border border-[#E4DED4] text-xs text-[#242522]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Trust Reassurance Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-white border border-[#E4DED4] flex items-center gap-3">
                <Truck className="w-4 h-4 text-[#777B63] shrink-0" />
                <div className="text-[11px] text-[#5A5C55]">
                  <strong className="block text-[#242522] uppercase tracking-wider text-[10px]">Express Courier</strong>
                  Blue Dart Insured Transit
                </div>
              </div>
              <div className="p-4 bg-white border border-[#E4DED4] flex items-center gap-3">
                <RotateCcw className="w-4 h-4 text-[#777B63] shrink-0" />
                <div className="text-[11px] text-[#5A5C55]">
                  <strong className="block text-[#242522] uppercase tracking-wider text-[10px]">15-Day Return</strong>
                  Complimentary Pickup
                </div>
              </div>
              <div className="p-4 bg-white border border-[#E4DED4] flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-[#777B63] shrink-0" />
                <div className="text-[11px] text-[#5A5C55]">
                  <strong className="block text-[#242522] uppercase tracking-wider text-[10px]">RBI Compliant</strong>
                  Razorpay Tokenized
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Order Summary & Payment Button              */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-[#E4DED4] p-6 sm:p-7 shadow-sm sticky top-24">
              <div className="flex items-center justify-between pb-4 border-b border-[#E4DED4] mb-5">
                <h2 className="font-serif text-xl text-[#242522]">Order Summary</h2>
                <Link
                  to="/cart"
                  className="text-xs uppercase tracking-wider text-[#777B63] hover:text-[#242522] transition-colors underline underline-offset-4"
                >
                  Edit Bag ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                </Link>
              </div>

              {/* Items List Snapshot */}
              <div className="divide-y divide-[#E4DED4]/60 max-h-72 overflow-y-auto pr-1 mb-6">
                {cart.map((item, idx) => (
                  <div key={`${item.product.id}-${idx}`} className="py-3.5 flex gap-3.5 first:pt-0 last:pb-0">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-14 h-18 object-cover bg-[#EFE9DF] shrink-0 border border-[#E4DED4]"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs text-[#242522] font-medium truncate">{item.product.name}</h4>
                      <p className="text-[11px] text-[#777B63] mt-0.5">
                        {item.selectedSize && `Size: ${item.selectedSize}`}
                        {item.selectedColor && ` • ${item.selectedColor}`}
                      </p>
                      <div className="flex items-center justify-between mt-1 text-xs">
                        <span className="text-[#5A5C55]">Qty: {item.quantity}</span>
                        <span className="font-medium text-[#242522]">
                          {formatINR(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Privilege Code Voucher Input */}
              <form onSubmit={handleApplyCoupon} className="mb-6 pt-4 border-t border-[#E4DED4]">
                <label className="block text-[11px] uppercase tracking-wider text-[#5A5C55] mb-1.5">
                  Privilege Voucher
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter privilege code"
                    className="flex-1 px-3 py-2 bg-[#F8F6F1] border border-[#E4DED4] text-xs text-[#242522] uppercase tracking-wider focus:outline-none focus:bg-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#242522] hover:bg-[#383934] text-[#F8F6F1] text-xs uppercase tracking-wider font-medium transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponMessage && (
                  <p className="text-[11px] text-[#777B63] mt-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#D8C6AA]" />
                    <span>{couponMessage}</span>
                  </p>
                )}
              </form>

              {/* Financial Breakdown */}
              <div className="space-y-2.5 text-xs text-[#5A5C55] pt-4 border-t border-[#E4DED4]">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="text-[#242522]">{formatINR(cartSubtotal)}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-[#777B63]">
                    <span>Privilege Savings ({appliedCoupon})</span>
                    <span>-{formatINR(couponDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Insured Express Shipping</span>
                  <span>{deliveryFee === 0 ? <strong className="text-[#777B63]">Complimentary</strong> : formatINR(deliveryFee)}</span>
                </div>

                <div className="flex justify-between text-[11px] text-[#777B63] pt-1">
                  <span>Estimated GST (18% inclusive)</span>
                  <span>{formatINR(taxPortion)}</span>
                </div>

                <div className="flex justify-between text-base font-serif font-medium text-[#242522] pt-3.5 border-t border-[#E4DED4]">
                  <span>Total Payable</span>
                  <span>{formatINR(finalPayable)}</span>
                </div>
              </div>

              {/* Pay Securely Button */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleInitiatePayment}
                className="w-full mt-6 py-4 bg-[#242522] hover:bg-[#383934] disabled:bg-[#A8A69E] text-[#F8F6F1] text-xs uppercase tracking-widest font-medium transition-colors flex items-center justify-center gap-2 group shadow-sm cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#D8C6AA] border-t-transparent rounded-full animate-spin" />
                    <span>Contacting Razorpay Gateway...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-[#D8C6AA]" />
                    <span>Pay {formatINR(finalPayable)} with Razorpay</span>
                  </>
                )}
              </button>

              <div className="mt-4 pt-4 border-t border-[#E4DED4]/60 text-center text-[10px] uppercase tracking-wider text-[#777B63]">
                Hosted on Razorpay Standard Checkout • UPI, Net Banking, Cards & EMI
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

