import React from 'react';
import { AuthenticatedHeader } from '../components/account/AuthenticatedHeader';
import { CartDrawer } from '../components/CartDrawer';
import { WishlistDrawer } from '../components/WishlistDrawer';
import { SearchOverlay } from '../components/SearchOverlay';
import { QuickViewModal } from '../components/QuickViewModal';
import { ToastNotification } from '../components/ToastNotification';
import { ShoppingAssistantButton } from '../components/assistant/ShoppingAssistantButton';
import { ShoppingAssistantDrawer } from '../components/assistant/ShoppingAssistantDrawer';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface AccountLayoutProps {
  children: React.ReactNode;
}

export const AccountLayout: React.FC<AccountLayoutProps> = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F1] text-[#242522]">
      {/* Top Private Client Ribbon */}
      <div className="bg-[#242522] text-[#F8F6F1] text-[11px] py-1.5 px-4 text-center border-b border-[#383934] flex items-center justify-center gap-2">
        <Sparkles className="w-3 h-3 text-[#D8C6AA]" />
        <span>
          Private Client Salon • Welcome, <strong className="font-semibold text-white">{user?.firstName || 'Ayush'}</strong> (Demo Session)
        </span>
      </div>

      {/* Dedicated Authenticated Navigation */}
      <AuthenticatedHeader />

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>

      {/* Restrained Account Footer */}
      <footer className="bg-white border-t border-[#E4DED4] py-10 px-4 sm:px-6 lg:px-8 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-[#5A5C55] gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#777B63]" />
            <span>AVELUNE Concierge Desk • Dedicated Client Care & Priority Dispatch</span>
          </div>

          <div className="flex items-center gap-6">
            <span>Client ID: {user?.id}</span>
            <span className="text-[#D8C6AA]">•</span>
            <span>Demonstration Environment</span>
          </div>
        </div>
      </footer>

      {/* Overlays, Drawers & Modals */}
      <CartDrawer />
      <WishlistDrawer />
      <SearchOverlay />
      <QuickViewModal />
      <ToastNotification />
      <ShoppingAssistantButton />
      <ShoppingAssistantDrawer />
    </div>
  );
};

