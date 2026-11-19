import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Package,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminUserDetail, AdminOrder } from '../../types/admin';

interface UserDossierModalProps {
  userId: number | null;
  onClose: () => void;
  onOpenOrderUpdate?: (order: AdminOrder) => void;
}

export const UserDossierModal: React.FC<UserDossierModalProps> = ({
  userId,
  onClose,
  onOpenOrderUpdate,
}) => {
  const [loading, setLoading] = useState(true);
  const [dossier, setDossier] = useState<AdminUserDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;
    setLoading(true);
    setError(null);

    adminService
      .getUserDetail(userId)
      .then((data) => {
        if (isMounted) {
          setDossier(data);
          if (data.orders && data.orders.length > 0) {
            setSelectedOrderNumber(data.orders[0].orderNumber);
          }
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Unable to load user dossier.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [userId]);

  if (!userId) return null;

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return 'Never recorded';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Paid (Successful)
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold uppercase tracking-wider">
            <Clock className="w-3 h-3 text-amber-600" />
            Payment Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-semibold uppercase tracking-wider">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            Failed / Cancelled
          </span>
        );
    }
  };

  const getDispatchBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#242522] text-[#D8C6AA] text-[10px] uppercase tracking-wider">
            Delivered to Client
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] uppercase tracking-wider">
            <Truck className="w-3 h-3 text-indigo-600" />
            In Transit / Shipped
          </span>
        );
      case 'processing':
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-medium uppercase tracking-wider">
            <Package className="w-3 h-3 text-amber-600" />
            Needs Dispatch ({status})
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-stone-100 text-stone-700 text-[10px] uppercase tracking-wider">
            {status}
          </span>
        );
    }
  };

  const activeOrder = dossier?.orders.find((o) => o.orderNumber === selectedOrderNumber);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="w-full max-w-4xl bg-[#FAF8F5] h-full shadow-2xl flex flex-col overflow-hidden border-l border-[#E4DED4]"
      >
        {/* Top Bar */}
        <div className="px-6 py-4 bg-[#242522] text-[#F8F6F1] flex items-center justify-between border-b border-[#3A3B37]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-[#D8C6AA] font-mono">
                Client Dossier & Order Audit
              </span>
              <span className="px-1.5 py-0.5 text-[9px] bg-[#3A3B37] text-[#D8C6AA] uppercase font-mono">
                ID #{userId}
              </span>
            </div>
            <h2 className="font-serif text-xl tracking-wide text-[#FAF8F5]">
              {loading ? 'Retrieving dossier...' : dossier?.user.fullName || 'Client Profile'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#D8C6AA] hover:text-[#FFFFFF] hover:bg-[#3A3B37] rounded-sm transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-2 border-[#242522] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-[#777B63] font-mono">Loading client purchase records & history...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs">{error}</div>
          ) : dossier ? (
            <>
              {/* Client Profile Card */}
              <div className="bg-white border border-[#E4DED4] p-5 shadow-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Info Column 1 */}
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-wider text-[#777B63] font-semibold">
                      Client Identity
                    </p>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[#777B63]" />
                      <span className="text-sm font-medium text-[#242522]">{dossier.user.fullName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#5A5C55]">
                      <Mail className="w-3.5 h-3.5 text-[#777B63]" />
                      <span className="font-mono">{dossier.user.email}</span>
                    </div>
                    {dossier.user.phone && (
                      <div className="flex items-center gap-2 text-xs text-[#5A5C55]">
                        <Phone className="w-3.5 h-3.5 text-[#777B63]" />
                        <span>{dossier.user.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Info Column 2: Account Tenancy (Kab se user hai) */}
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-wider text-[#777B63] font-semibold">
                      Account Tenancy (Member History)
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[#242522]">
                      <Calendar className="w-3.5 h-3.5 text-[#777B63]" />
                      <span>
                        <strong className="font-medium">Member Since:</strong>{' '}
                        {formatDate(dossier.user.dateJoined)}
                      </span>
                    </div>
                    <div className="text-xs text-[#5A5C55]">
                      <span className="text-[#777B63]">Last Activity:</span>{' '}
                      {formatDate(dossier.user.lastLogin)}
                    </div>
                    <div className="text-xs">
                      <span className="px-2 py-0.5 bg-[#FAF8F5] border border-[#E4DED4] text-[#242522] text-[10px] uppercase font-mono tracking-wider">
                        {dossier.user.membershipTier}
                      </span>
                    </div>
                  </div>

                  {/* Info Column 3: Spend & Dispatch Summary */}
                  <div className="bg-[#FAF8F5] p-3.5 border border-[#E4DED4] space-y-2">
                    <p className="text-[10px] uppercase tracking-wider text-[#777B63] font-semibold">
                      Lifetime Spend & Fulfillment
                    </p>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-[#5A5C55]">Total Paid Spend:</span>
                      <span className="font-serif text-base font-bold text-[#242522]">
                        ₹{dossier.orderMetrics.totalSpent.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-[#5A5C55]">Total Orders Placed:</span>
                      <span className="font-mono text-xs font-semibold text-[#242522]">
                        {dossier.orderMetrics.totalOrders}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline pt-1 border-t border-[#E4DED4]">
                      <span className="text-xs text-[#777B63]">Pending Dispatches:</span>
                      <span
                        className={`text-xs font-semibold font-mono ${
                          dossier.orderMetrics.pendingDispatch > 0
                            ? 'text-amber-700 font-bold'
                            : 'text-emerald-700'
                        }`}
                      >
                        {dossier.orderMetrics.pendingDispatch} Pending
                      </span>
                    </div>
                  </div>
                </div>

                {/* Registered Primary Address */}
                {dossier.user.primaryAddress.city && (
                  <div className="mt-4 pt-3 border-t border-[#E4DED4] flex items-start gap-2 text-xs text-[#5A5C55]">
                    <MapPin className="w-3.5 h-3.5 text-[#777B63] mt-0.5 shrink-0" />
                    <span>
                      <strong className="text-[#242522]">Client Residence:</strong>{' '}
                      {dossier.user.primaryAddress.street}
                      {dossier.user.primaryAddress.apartment && `, ${dossier.user.primaryAddress.apartment}`},{' '}
                      {dossier.user.primaryAddress.city}, {dossier.user.primaryAddress.state}{' '}
                      {dossier.user.primaryAddress.postalCode}, {dossier.user.primaryAddress.country}
                    </span>
                  </div>
                )}
              </div>

              {/* Order History Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-serif text-base uppercase tracking-wider text-[#242522]">
                    Order History ({dossier.orders.length})
                  </h3>
                  <span className="text-xs text-[#777B63]">
                    Click any order to inspect details, dispatch status & items
                  </span>
                </div>

                {dossier.orders.length === 0 ? (
                  <div className="bg-white border border-[#E4DED4] p-8 text-center text-xs text-[#777B63]">
                    This client has not placed any orders yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Left: Orders List Column */}
                    <div className="lg:col-span-5 space-y-2 max-h-[460px] overflow-y-auto pr-1">
                      {dossier.orders.map((o) => {
                        const isSelected = o.orderNumber === selectedOrderNumber;
                        return (
                          <div
                            key={o.orderNumber}
                            onClick={() => setSelectedOrderNumber(o.orderNumber)}
                            className={`p-3.5 border cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-[#242522] text-[#F8F6F1] border-[#242522] shadow-sm'
                                : 'bg-white hover:bg-[#F2ECE1] border-[#E4DED4] text-[#242522]'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-mono text-xs font-bold tracking-tight">
                                {o.orderNumber}
                              </span>
                              <span className="font-serif text-xs font-semibold">
                                ₹{o.finalAmount.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div
                              className={`text-[11px] mb-2 ${
                                isSelected ? 'text-[#D8C6AA]' : 'text-[#777B63]'
                              }`}
                            >
                              {formatDate(o.createdAt)}
                            </div>
                            <div className="flex items-center justify-between gap-1 flex-wrap">
                              <div>{getPaymentBadge(o.paymentStatus)}</div>
                              <div>{getDispatchBadge(o.orderStatus)}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Right: Selected Order Detail Card */}
                    <div className="lg:col-span-7 bg-white border border-[#E4DED4] p-5 shadow-xs flex flex-col justify-between">
                      {activeOrder ? (
                        <div className="space-y-4">
                          {/* Order Header */}
                          <div className="flex items-start justify-between border-b border-[#E4DED4] pb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-mono text-sm font-bold text-[#242522]">
                                  {activeOrder.orderNumber}
                                </h4>
                                {getPaymentBadge(activeOrder.paymentStatus)}
                              </div>
                              <p className="text-[11px] text-[#777B63] mt-0.5">
                                Placed on {formatDate(activeOrder.createdAt)}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] uppercase text-[#777B63] block">Total Amount</span>
                              <span className="font-serif text-lg font-bold text-[#242522]">
                                ₹{activeOrder.finalAmount.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>

                          {/* Dispatch & Logistics Status Banner */}
                          <div className="bg-[#FAF8F5] border border-[#E4DED4] p-3 rounded-xs space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#777B63] flex items-center gap-1.5">
                                <Truck className="w-3.5 h-3.5" />
                                Logistics & Dispatch Status
                              </span>
                              {getDispatchBadge(activeOrder.orderStatus)}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-[#777B63] block text-[10px] uppercase">Carrier:</span>
                                <span className="font-medium text-[#242522]">
                                  {activeOrder.logistics.carrier || 'Not yet assigned'}
                                </span>
                              </div>
                              <div>
                                <span className="text-[#777B63] block text-[10px] uppercase">
                                  Tracking Number:
                                </span>
                                <span className="font-mono font-medium text-[#242522]">
                                  {activeOrder.logistics.trackingNumber || 'Pending dispatch'}
                                </span>
                              </div>
                            </div>

                            {/* Quick Dispatch Update Trigger */}
                            {onOpenOrderUpdate && (
                              <button
                                onClick={() => onOpenOrderUpdate(activeOrder)}
                                className="w-full mt-2 py-1.5 px-3 bg-[#242522] text-[#F8F6F1] text-[11px] uppercase tracking-widest hover:bg-[#3A3B37] transition-colors flex items-center justify-center gap-2"
                              >
                                <Package className="w-3.5 h-3.5 text-[#D8C6AA]" />
                                Update Dispatch / Status
                              </button>
                            )}
                          </div>

                          {/* Shipping Destination for this specific order */}
                          <div className="bg-white border border-[#E4DED4] p-3 text-xs space-y-1">
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#777B63] flex items-center gap-1.5 mb-1">
                              <MapPin className="w-3.5 h-3.5 text-[#777B63]" />
                              Order Shipping Destination
                            </span>
                            <div className="font-medium text-[#242522]">
                              {activeOrder.shippingAddress.name || activeOrder.customerName}
                            </div>
                            <div className="text-[#5A5C55]">
                              {activeOrder.shippingAddress.street}
                              {activeOrder.shippingAddress.apartment && `, ${activeOrder.shippingAddress.apartment}`}
                            </div>
                            <div className="text-[#5A5C55]">
                              {activeOrder.shippingAddress.city}, {activeOrder.shippingAddress.state}{' '}
                              {activeOrder.shippingAddress.postalCode},{' '}
                              {activeOrder.shippingAddress.country}
                            </div>
                            {activeOrder.shippingAddress.phone && (
                              <div className="text-[#777B63] pt-1">
                                Contact: {activeOrder.shippingAddress.phone}
                              </div>
                            )}
                          </div>

                          {/* Payment Reference Snapshot */}
                          <div className="text-xs bg-[#FAF8F5] p-2.5 border border-[#E4DED4] space-y-1">
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#777B63] flex items-center gap-1.5">
                              <CreditCard className="w-3.5 h-3.5" />
                              Razorpay Payment Audit
                            </span>
                            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                              <div>
                                <span className="text-[#777B63] block text-[9px] uppercase">
                                  Razorpay Order ID:
                                </span>
                                <span>{activeOrder.paymentDetails.razorpayOrderId || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-[#777B63] block text-[9px] uppercase">
                                  Razorpay Payment ID:
                                </span>
                                <span className="text-emerald-700 font-semibold">
                                  {activeOrder.paymentDetails.razorpayPaymentId || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Items Ordered Snapshot */}
                          <div>
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#777B63] block mb-2">
                              Pieces Ordered ({activeOrder.items.length})
                            </span>
                            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                              {activeOrder.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center gap-3 p-2 bg-[#FAF8F5] border border-[#E4DED4]"
                                >
                                  <img
                                    src={item.image || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c'}
                                    alt={item.productName}
                                    className="w-11 h-13 object-cover border border-[#E4DED4] shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-serif text-xs font-medium text-[#242522] truncate">
                                      {item.productName}
                                    </h5>
                                    <div className="flex items-center gap-2 text-[11px] text-[#777B63] mt-0.5">
                                      {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                                      {item.selectedColor && (
                                        <span>• Color: {item.selectedColor}</span>
                                      )}
                                      <span>• Qty: {item.quantity}</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-[#5A5C55]">
                                      SKU: {item.productId}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <span className="font-serif text-xs font-bold text-[#242522]">
                                      ₹{item.lineTotal.toLocaleString('en-IN')}
                                    </span>
                                    <span className="block text-[10px] text-[#777B63]">
                                      ₹{item.unitPrice.toLocaleString('en-IN')} each
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-64 flex items-center justify-center text-xs text-[#777B63]">
                          Select an order to view comprehensive records.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
};

