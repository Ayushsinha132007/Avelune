import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Truck, Check, Loader2 } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminOrder } from '../../types/admin';

interface OrderStatusModalProps {
  order: AdminOrder | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const OrderStatusModal: React.FC<OrderStatusModalProps> = ({
  order,
  onClose,
  onSuccess,
}) => {
  if (!order) return null;

  const [orderStatus, setOrderStatus] = useState(order.orderStatus);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [carrier, setCarrier] = useState(order.logistics.carrier || 'BlueDart Express');
  const [trackingNumber, setTrackingNumber] = useState(order.logistics.trackingNumber || '');
  const [estimatedDelivery, setEstimatedDelivery] = useState(
    order.logistics.estimatedDelivery || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await adminService.updateOrderStatus(order.orderNumber, {
        order_status: orderStatus,
        payment_status: paymentStatus,
        carrier,
        tracking_number: trackingNumber.trim(),
        estimated_delivery: estimatedDelivery.trim(),
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.message || 'Failed to update order status.');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to update order logistics.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-lg bg-[#FAF8F5] border border-[#E4DED4] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#242522] text-[#F8F6F1] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#D8C6AA]">
              Logistics & Fulfillment
            </span>
            <h3 className="font-serif text-lg text-white">
              Manage Dispatch: {order.orderNumber}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#D8C6AA] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Customer snapshot */}
          <div className="bg-white p-3 border border-[#E4DED4] text-xs">
            <span className="text-[10px] uppercase tracking-wider text-[#777B63] block">
              Recipient & Destination
            </span>
            <p className="font-medium text-[#242522] mt-0.5">
              {order.customerName} ({order.shippingAddress.city}, {order.shippingAddress.state})
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Order Status */}
            <div>
              <label className="block text-[11px] uppercase font-semibold text-[#5A5C55] mb-1.5">
                Fulfillment Status
              </label>
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-[#D8C6AA] text-[#242522] focus:outline-hidden focus:border-[#242522]"
              >
                <option value="Confirmed">Confirmed (Needs Packing)</option>
                <option value="Processing">Processing (Atelier Packing)</option>
                <option value="Shipped">Shipped (In Transit)</option>
                <option value="Delivered">Delivered (Completed)</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-[11px] uppercase font-semibold text-[#5A5C55] mb-1.5">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-[#D8C6AA] text-[#242522] focus:outline-hidden focus:border-[#242522]"
              >
                <option value="Paid">Paid (Verified)</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Carrier */}
            <div>
              <label className="block text-[11px] uppercase font-semibold text-[#5A5C55] mb-1.5">
                Logistics Carrier
              </label>
              <input
                type="text"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                placeholder="e.g. BlueDart Express, Delhivery"
                className="w-full text-xs p-2.5 bg-white border border-[#D8C6AA] text-[#242522] focus:outline-hidden focus:border-[#242522]"
              />
            </div>

            {/* Tracking Number */}
            <div>
              <label className="block text-[11px] uppercase font-semibold text-[#5A5C55] mb-1.5">
                Tracking AWB / Number
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. BLUEDART-984719"
                className="w-full text-xs p-2.5 bg-white border border-[#D8C6AA] text-[#242522] focus:outline-hidden focus:border-[#242522] font-mono"
              />
            </div>
          </div>

          {/* Estimated Delivery */}
          <div>
            <label className="block text-[11px] uppercase font-semibold text-[#5A5C55] mb-1.5">
              Estimated Delivery Window
            </label>
            <input
              type="text"
              value={estimatedDelivery}
              onChange={(e) => setEstimatedDelivery(e.target.value)}
              placeholder="e.g. 2-3 Business Days or Nov 22, 2026"
              className="w-full text-xs p-2.5 bg-white border border-[#D8C6AA] text-[#242522] focus:outline-hidden focus:border-[#242522]"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-[#E4DED4] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs uppercase tracking-wider text-[#5A5C55] hover:text-[#242522]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#242522] text-[#F8F6F1] text-xs uppercase tracking-widest hover:bg-[#3A3B37] transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Truck className="w-3.5 h-3.5 text-[#D8C6AA]" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
