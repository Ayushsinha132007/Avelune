import React, { useState } from 'react';
import { AnnouncementBar } from '../components/AnnouncementBar';
import { Navbar } from '../components/Navbar';
import { Footer } from '../sections/Footer';
import { CartDrawer } from '../components/CartDrawer';
import { WishlistDrawer } from '../components/WishlistDrawer';
import { SearchOverlay } from '../components/SearchOverlay';
import { QuickViewModal } from '../components/QuickViewModal';
import { ToastNotification } from '../components/ToastNotification';
import { ShoppingAssistantButton } from '../components/assistant/ShoppingAssistantButton';
import { ShoppingAssistantDrawer } from '../components/assistant/ShoppingAssistantDrawer';
import { CategoryType } from '../types';

interface RootLayoutProps {
  children: React.ReactNode;
  onSelectCategory?: (cat: CategoryType) => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const RootLayout: React.FC<RootLayoutProps> = ({
  children,
  onSelectCategory,
  onNavigateSection,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F1] text-[#242522]">
      {/* Announcement Bar */}
      <AnnouncementBar />

      {/* Main Sticky Navigation */}
      <Navbar onNavigateSection={onNavigateSection} />

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <Footer onSelectCategory={onSelectCategory} />

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

