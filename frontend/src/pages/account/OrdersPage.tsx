import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Truck,
  CheckCircle2,
  Calendar,
  MapPin,
  X,
  ExternalLink,
  ShieldAlert,
  ArrowLeft,
  Lock,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { paymentService } from '../../services/paymentService';
import { ordersApi } from '../../services/api';
import { ServerOrder } from '../../types/payment';
import { DemoOrder } from '../../types/auth';
import { formatINR } from '../../utils/currency';

interface DisplayOrder {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  totalAmount: number;
  carrier: string;
  trackingNumber?: string;
  paymentId?: string;
  isRealOrder?: boolean;
  items: {
    name: string;
    category?: string;
    image?: string;
    size?: string;
    color?: string;
    quantity: number;
    price: number;
  }[];
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
}

export const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<DisplayOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<DisplayOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'In Transit' | 'Delivered'>('All');

  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      try {
        const userEmail = user?.email || '';
        // 1. Fetch real orders from backend / local cache
        const realOrders = userEmail ? await paymentService.getUserOrders(userEmail) : [];

        // Map real orders safely supporting both Django and local cached shapes
        const mappedReal: DisplayOrder[] = realOrders.map((ro: any) => ({
          id: String(ro.id),
          orderNumber: ro.orderNumber || ro.order_number,
          date: ro.date || (ro.createdAt ? new Date(ro.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }) : 'Recently'),
          status: ro.status === 'PAID' ? 'Paid' : (ro.status || 'Confirmed'),
          totalAmount: ro.summary?.totalAmount ?? ro.totalAmount ?? 0,
          carrier: ro.carrier || 'Blue Dart Luxury Express',
          trackingNumber: ro.trackingNumber || `BD-IND-${String(ro.orderNumber || '').replace(/\D/g, '')}`,
          paymentId: ro.payment?.razorpayPaymentId || ro.paymentDetails?.razorpayPaymentId,
          isRealOrder: true,
          items: (ro.items || []).map((i: any) => ({
            name: i.name,
            category: i.category || 'Atelier Selection',
            image: i.image,
            size: i.selectedSize || i.size,
            color: i.selectedColor || i.color,
            quantity: i.quantity,
            price: i.unitPrice ?? i.price ?? 0,
          })),
          shippingAddress: {
            name: ro.shippingAddress?.name || ro.deliveryAddress?.fullName || user?.fullName || 'Valued Client',
            street: ro.shippingAddress?.street || ro.deliveryAddress?.addressLine1 || '',
            city: ro.shippingAddress?.city || ro.deliveryAddress?.city || '',
            state: ro.shippingAddress?.state || ro.deliveryAddress?.state || '',
            postalCode: ro.shippingAddress?.postalCode || ro.deliveryAddress?.postalCode || '',
          },
        }));

        if (isMounted) {
          // Display verified orders
          setOrders(mappedReal);
        }
      } catch (err) {
        console.error('Error loading orders:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'All') return true;
    if (statusFilter === 'Paid') return o.status === 'Paid';
    return o.status === statusFilter;
  });

  return (
    <div className="w-full py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Navigation Breadcrumb / Back Link */}
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
                Atelier Client Archive
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#242522] font-normal tracking-tight">
              My Orders & Transactions
            </h1>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2">
            {(['All', 'Paid', 'In Transit', 'Delivered'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 text-xs uppercase tracking-wider font-medium transition-colors border ${
                  statusFilter === tab
                    ? 'bg-[#242522] text-[#F8F6F1] border-[#242522]'
                    : 'bg-white text-[#242522] border-[#E4DED4] hover:border-[#242522]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="bg-white border border-[#E4DED4] p-12 text-center">
              <Package className="w-10 h-10 text-[#A8A69E] mx-auto mb-3" />
              <h3 className="font-serif text-lg text-[#242522]">No orders found</h3>
              <p className="text-xs text-[#5A5C55] mt-1">
                You have not placed any orders matching this filter.
              </p>
              <Link
                to="/collections"
                className="mt-4 inline-block px-5 py-2.5 bg-[#242522] text-[#F8F6F1] text-xs uppercase tracking-wider font-medium"
              >
                Explore Collections
              </Link>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-[#E4DED4] hover:border-[#D8C6AA] transition-colors rounded-none p-5 sm:p-7 shadow-xs"
              >
                {/* Top Order Metadata Bar */}
                <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#E4DED4] gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#5A5C55] block">
                        Order Reference
                      </span>
                      <strong className="font-mono text-sm text-[#242522]">{order.orderNumber}</strong>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#5A5C55] block">
                        Placed Date
                      </span>
                      <span className="text-sm font-medium text-[#242522]">{order.date}</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#5A5C55] block">
                        Total Amount
                      </span>
                      <span className="text-sm font-medium text-[#242522]">
                        {formatINR(order.totalAmount)}
                      </span>
                    </div>

                    {order.paymentId && (
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-[#5A5C55] block">
                          Razorpay Payment Ref
                        </span>
                        <span className="font-mono text-xs text-[#777B63]">{order.paymentId}</span>
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] uppercase tracking-wider font-medium ${
                        order.status === 'Paid'
                          ? 'bg-[#EFE9DF] text-[#777B63] border border-[#D8C6AA]'
                          : order.status === 'In Transit'
                          ? 'bg-[#F2ECE2] text-[#242522] border border-[#E4DED4]'
                          : 'bg-[#F8F6F1] text-[#242522] border border-[#E4DED4]'
                      }`}
                    >
                      {order.status === 'Paid' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#777B63]" />
                      ) : (
                        <Truck className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {order.status === 'Paid' ? 'Paid & Confirmed' : order.status}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Items List in Order */}
                <div className="py-5 space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-20 object-cover rounded-xs bg-[#EFE9DF] border border-[#E4DED4] shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          {item.category && (
                            <span className="text-[10px] uppercase tracking-wider text-[#777B63] block">
                              {item.category}
                            </span>
                          )}
                          <h4 className="font-serif text-base text-[#242522] truncate">{item.name}</h4>
                          <p className="text-xs text-[#5A5C55] font-light mt-0.5">
                            {item.size && `Size: ${item.size} • `}
                            {item.color && `Tone: ${item.color} • `}
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-medium text-[#242522]">
                          {formatINR(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Actions Row */}
                <div className="pt-4 border-t border-[#E4DED4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-[#777B63]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      Carrier:{' '}
                      <strong className="text-[#242522] font-medium">{order.carrier}</strong>
                      {order.trackingNumber && ` (${order.trackingNumber})`}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedOrder(order)}
                    className="px-4 py-2 bg-[#F8F6F1] hover:bg-[#EFE9DF] text-[#242522] border border-[#E4DED4] uppercase tracking-wider text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    View Details & Tracking
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Interactive Order Details Modal */}
        <AnimatePresence>
          {selectedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedOrder(null)}
                className="fixed inset-0 bg-[#242522]/60 backdrop-blur-sm"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 15 }}
                transition={{ duration: 0.3 }}
                className="relative max-w-xl w-full bg-[#F8F6F1] p-6 sm:p-8 border border-[#E4DED4] shadow-2xl z-10 max-h-[85vh] overflow-y-auto text-left"
              >
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="absolute top-6 right-6 p-1 text-[#5A5C55] hover:text-[#242522]"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="pb-4 border-b border-[#E4DED4] pr-8">
                  <span className="text-[10px] uppercase tracking-widest text-[#777B63] block mb-1">
                    Atelier Order Dossier
                  </span>
                  <h3 className="font-serif text-2xl text-[#242522]">
                    Order {selectedOrder.orderNumber}
                  </h3>
                  {selectedOrder.paymentId && (
                    <p className="text-xs text-[#777B63] mt-1">
                      Razorpay Payment ID: <code className="font-mono">{selectedOrder.paymentId}</code>
                    </p>
                  )}
                </div>

                <div className="py-5 space-y-4 text-xs text-[#5A5C55]">
                  <div>
                    <strong className="block text-[#242522] uppercase tracking-wider text-[10px] mb-1">
                      Delivery Address
                    </strong>
                    <p className="text-xs text-[#242522]">{selectedOrder.shippingAddress.name}</p>
                    <p>{selectedOrder.shippingAddress.street}</p>
                    <p>
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} -{' '}
                      {selectedOrder.shippingAddress.postalCode}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#E4DED4]">
                    <strong className="block text-[#242522] uppercase tracking-wider text-[10px] mb-2">
                      Pieces in this Dispatch
                    </strong>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-xs">
                          <span>
                            {item.name} × {item.quantity}
                          </span>
                          <span className="font-medium text-[#242522]">
                            {formatINR(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E4DED4] flex justify-between font-serif text-base text-[#242522]">
                    <span>Total Paid</span>
                    <span>{formatINR(selectedOrder.totalAmount)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E4DED4] flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="px-5 py-2.5 bg-[#242522] text-[#F8F6F1] text-xs uppercase tracking-wider font-medium"
                  >
                    Close Dossier
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
