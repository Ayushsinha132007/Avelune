import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Heart } from 'lucide-react';
import { useStore } from '../hooks/useStore';

export const ToastNotification: React.FC = () => {
  const { toasts, removeToast } = useStore();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto bg-white border border-[#E4DED4] shadow-subtle-luxury p-3.5 flex items-center justify-between gap-3 rounded-sm"
          >
            <div className="flex items-center gap-3 min-w-0">
              {toast.image ? (
                <img
                  src={toast.image}
                  alt={toast.title}
                  className="w-10 h-12 object-cover rounded-xs bg-[#EFE9DF] shrink-0 border border-[#E4DED4]"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#EFE9DF] flex items-center justify-center shrink-0">
                  {toast.type === 'wishlist' ? (
                    <Heart className="w-4 h-4 text-[#777B63] fill-[#777B63]" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-[#777B63]" />
                  )}
                </div>
              )}

              <div className="min-w-0">
                <p className="font-serif text-sm font-medium text-[#242522] truncate">
                  {toast.title}
                </p>
                <p className="text-xs text-[#5A5C55] font-light truncate">
                  {toast.description}
                </p>
              </div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#5A5C55] hover:text-[#242522] p-1 -mr-1 shrink-0"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

