import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Calendar,
  MapPin,
  Mail,
} from 'lucide-react';
import { paymentService } from '../services/paymentService';
import { ServerOrder } from '../types/payment';
import { formatINR } from '../utils/currency';

export const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') || '';

  const [order, setOrder] = useState<ServerOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const data = await paymentService.getOrderById(orderId);
        if (isMounted) {
          setOrder(data);
        }
      } catch (err) {
        console.error('Error fetching confirmed order:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchOrder();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  return (
    <div className="min-h-screen bg-[#F8F6F1] py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white border border-[#E4DED4] p-6 sm:p-10 shadow-sm"
        >
          {/* Top Atelier Badge & Icon */}
          <div className="text-center pb-8 border-b border-[#E4DED4]">
            <div className="w-16 h-16 rounded-full bg-[#EFE9DF] border border-[#D8C6AA] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-[#777B63]" />
            </div>
            <span className="text-[10px] uppercase tracking-widest font-medium text-[#777B63] block mb-1">
              Payment Verified & Allocated
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#242522] font-normal tracking-tight">
              Thank You for Your Order
            </h1>
            <p className="text-xs text-[#5A5C55] mt-2 max-w-md mx-auto leading-relaxed">
              Your transaction has been securely captured by Razorpay. An atelier dispatch receipt has been
              sent to{' '}
              <strong className="text-[#242522]">{(order as any)?.customerEmail || (order as any)?.customer_email || 'your email'}</strong>.
            </p>
          </div>

          {/* Order Metadata Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-[#E4DED4] text-xs">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#777B63] block mb-0.5">
                Order Number
              </span>
              <strong className="font-mono text-[#242522]">
                {order?.orderNumber || (orderId ? `AVL-2026-${orderId.slice(-5)}` : 'AVL-2026-CONFIRMED')}
              </strong>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#777B63] block mb-0.5">
                Payment Ref
              </span>
              <strong className="font-mono text-[#242522] truncate block">
                {(order as any)?.payment?.razorpayPaymentId || (order as any)?.paymentDetails?.razorpayPaymentId || 'pay_verified'}
              </strong>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#777B63] block mb-0.5">
                Status
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#EFE9DF] text-[#777B63] font-medium text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#777B63]" />
                Payment Confirmed
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#777B63] block mb-0.5">
                Total Charged
              </span>
              <strong className="font-serif text-sm text-[#242522]">
                {order ? formatINR((order as any)?.summary?.totalAmount ?? (order as any)?.totalAmount ?? 0) : 'Paid in INR'}
              </strong>
            </div>
          </div>

          {/* Purchased Items List */}
          {order && (order.items || []).length > 0 && (
            <div className="py-6 border-b border-[#E4DED4]">
              <h3 className="font-serif text-lg text-[#242522] mb-4">Acquired Pieces</h3>
              <div className="divide-y divide-[#E4DED4]/60">
                {order.items.map((item: any, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-16 object-cover bg-[#EFE9DF] border border-[#E4DED4]"
                        />
                      )}
                      <div>
                        <h4 className="text-xs font-medium text-[#242522]">{item.name}</h4>
                        <p className="text-[11px] text-[#777B63]">
                          {(item.selectedSize || item.size) && `Size: ${item.selectedSize || item.size} • `}
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-[#242522]">
                      {formatINR(item.totalPrice ?? (item.price * item.quantity))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivery Destination */}
          {((order as any)?.deliveryAddress || (order as any)?.shippingAddress) && (
            <div className="py-6 border-b border-[#E4DED4] text-xs leading-relaxed text-[#5A5C55]">
              <div className="flex items-center gap-2 mb-2 text-[#242522]">
                <MapPin className="w-4 h-4 text-[#777B63]" />
                <h3 className="font-serif text-base">Atelier Delivery Address</h3>
              </div>
              <p className="font-medium text-[#242522]">
                {(order as any).deliveryAddress?.fullName || (order as any).shippingAddress?.name}
              </p>
              <p>{(order as any).deliveryAddress?.addressLine1 || (order as any).shippingAddress?.street}</p>
              {((order as any).deliveryAddress?.apartment || (order as any).shippingAddress?.apartment) && (
                <p>{(order as any).deliveryAddress?.apartment || (order as any).shippingAddress?.apartment}</p>
              )}
              <p>
                {(order as any).deliveryAddress?.city || (order as any).shippingAddress?.city},{' '}
                {(order as any).deliveryAddress?.state || (order as any).shippingAddress?.state} -{' '}
                {(order as any).deliveryAddress?.postalCode || (order as any).shippingAddress?.postalCode}
              </p>
              <p>
                {(order as any).deliveryAddress?.country || (order as any).shippingAddress?.country || 'India'}
                {(order as any).deliveryAddress?.phone && ` • Phone: +91 ${(order as any).deliveryAddress.phone}`}
              </p>
            </div>
          )}

          {/* Next Steps Guide */}
          <div className="py-6 border-b border-[#E4DED4] bg-[#F8F6F1] p-4 text-xs text-[#5A5C55] flex items-start gap-3">
            <Truck className="w-5 h-5 text-[#777B63] shrink-0 mt-0.5" />
            <div>
              <strong className="block text-[#242522] mb-0.5">Complimentary Blue Dart Express Transit</strong>
              Your curated order is entering quality inspection and will be dispatched within 24 to 48 hours. A live logistics tracking link will be transmitted via SMS and email.
            </div>
          </div>

          {/* Actions */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              to="/account/orders"
              className="w-full sm:w-auto px-6 py-3.5 border border-[#242522] text-[#242522] hover:bg-[#242522] hover:text-[#F8F6F1] text-xs uppercase tracking-wider font-medium transition-colors text-center"
            >
              View in My Orders
            </Link>

            <Link
              to="/collections"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#242522] hover:bg-[#383934] text-[#F8F6F1] text-xs uppercase tracking-wider font-medium transition-colors flex items-center justify-center gap-2 text-center shadow-xs"
            >
              <span>Continue Exploring Collections</span>
              <ArrowRight className="w-4 h-4 text-[#D8C6AA]" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

