import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  RotateCcw,
  ShoppingBag,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  PhoneCall,
} from 'lucide-react';

export const PaymentFailedPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') || '';
  const reason = searchParams.get('reason') || 'Transaction was cancelled or declined by issuing bank.';

  return (
    <div className="min-h-screen bg-[#F8F6F1] py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-[#E4DED4] p-6 sm:p-10 shadow-sm"
        >
          {/* Failure Header */}
          <div className="text-center pb-8 border-b border-[#E4DED4]">
            <div className="w-16 h-16 rounded-full bg-[#F8EFEF] border border-[#E4B4B4] flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-[#A33B3B]" />
            </div>
            <span className="text-[10px] uppercase tracking-widest font-medium text-[#A33B3B] block mb-1">
              Payment Incomplete
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#242522] font-normal tracking-tight">
              Transaction Not Completed
            </h1>
            <p className="text-xs text-[#5A5C55] mt-2 max-w-md mx-auto leading-relaxed">
              We were unable to verify authorization from your payment provider. If any amount was debited by your bank, it will be automatically refunded within 3 to 5 business days.
            </p>
          </div>

          {/* Details Box */}
          <div className="py-6 border-b border-[#E4DED4] space-y-3 text-xs">
            {orderId && (
              <div className="flex justify-between">
                <span className="text-[#777B63] uppercase tracking-wider text-[10px]">Reference</span>
                <span className="font-mono text-[#242522] font-medium">{orderId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#777B63] uppercase tracking-wider text-[10px]">Gateway Notice</span>
              <span className="text-[#242522] text-right max-w-xs">{reason}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#777B63] uppercase tracking-wider text-[10px]">Bag Status</span>
              <span className="text-[#777B63] font-medium">Your pieces remain reserved in your bag.</span>
            </div>
          </div>

          {/* Helpful Tips */}
          <div className="py-6 border-b border-[#E4DED4] text-xs text-[#5A5C55] space-y-2">
            <h4 className="font-medium text-[#242522] uppercase tracking-wider text-[11px] mb-2">
              Recommended Next Steps
            </h4>
            <ul className="list-disc pl-4 space-y-1 text-[#5A5C55] text-xs">
              <li>Verify that your card allows online e-commerce transactions and international/domestic limits.</li>
              <li>Retry using UPI (Google Pay, PhonePe, Paytm) or alternative Net Banking.</li>
              <li>Ensure your OTP / bank verification password is entered within the designated timer.</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              to="/cart"
              className="w-full sm:w-auto px-6 py-3.5 border border-[#E4DED4] text-[#5A5C55] hover:text-[#242522] hover:border-[#242522] text-xs uppercase tracking-wider font-medium transition-colors text-center"
            >
              Review Shopping Bag
            </Link>

            <Link
              to="/checkout"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#242522] hover:bg-[#383934] text-[#F8F6F1] text-xs uppercase tracking-wider font-medium transition-colors flex items-center justify-center gap-2 text-center shadow-xs"
            >
              <RotateCcw className="w-4 h-4 text-[#D8C6AA]" />
              <span>Retry Secure Payment</span>
            </Link>
          </div>

          {/* Concierge Assistance */}
          <div className="mt-8 pt-6 border-t border-[#E4DED4] flex items-center justify-center gap-2 text-xs text-[#777B63]">
            <HelpCircle className="w-4 h-4 text-[#777B63]" />
            <span>Need assistance? Contact our Atelier Concierge at concierge@avelune.com</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

