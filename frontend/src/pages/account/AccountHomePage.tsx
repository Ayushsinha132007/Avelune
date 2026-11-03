import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Package,
  Heart,
  ShoppingBag,
  Eye,
  ArrowRight,
  Sparkles,
  Compass,
  Clock,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useStore } from '../../hooks/useStore';
import { MOCK_PRODUCTS } from '../../data/products';
import { catalogApi } from '../../services/api';
import { ProductCard } from '../../components/ProductCard';
import { formatINR } from '../../utils/currency';
import { paymentService } from '../../services/paymentService';
import { Product } from '../../types';

export const AccountHomePage: React.FC = () => {
  const { user } = useAuth();
  const {
    openCart,
    totalCartItems,
    cartSubtotal,
    totalWishlistItems,
    recentlyViewed,
  } = useStore();

  const [realOrders, setRealOrders] = useState<any[]>([]);
  const [curatedProducts, setCuratedProducts] = useState<Product[]>(() =>
    MOCK_PRODUCTS.filter((p) => p.isFeatured || p.isBestseller).slice(0, 6)
  );

  useEffect(() => {
    let isMounted = true;
    async function loadCatalog() {
      try {
        const items = await catalogApi.getProducts();
        if (isMounted && items && items.length > 0) {
          const featured = items.filter((p) => p.isFeatured || p.isBestseller);
          setCuratedProducts((featured.length > 0 ? featured : items).slice(0, 6));
        }
      } catch (err) {
        console.warn('Using local fallback for curated products:', err);
      }
    }
    loadCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeOrdersCount = realOrders.filter((o) => o.status === 'In Transit' || o.orderStatus === 'In Transit').length;

  const scrollToCurated = () => {
    const el = document.getElementById('curated-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToRecent = () => {
    const el = document.getElementById('recently-viewed-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full pb-20">
      
      {/* ================= 1. PERSONALIZED WELCOME HERO ================= */}
      <section className="bg-gradient-to-b from-[#EFE9DF]/60 to-[#F8F6F1] py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-[#E4DED4]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Typography & Actions */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 space-y-5"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#777B63]" />
                <span className="text-[11px] uppercase tracking-widest text-[#777B63] font-medium">
                  {user?.membershipTier || 'Atelier Private Client'} • Edition 2026
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#242522] font-normal tracking-tight leading-tight">
                Welcome back, {user?.firstName || 'Valued Client'}.
              </h1>

              <p className="text-sm sm:text-base text-[#5A5C55] font-light max-w-xl leading-relaxed">
                Your personal edit of considered essentials is ready. We have prepared seasonal recommendations matched to your taste for tactile natural fibers and architectural silhouettes.
              </p>

              {/* Dual CTAs */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={scrollToCurated}
                  className="px-7 py-3.5 bg-[#242522] hover:bg-[#383934] text-[#F8F6F1] text-xs uppercase tracking-widest font-medium transition-colors flex items-center gap-2 group shadow-xs"
                >
                  <span>Explore Your Collection</span>
                  <ArrowRight className="w-4 h-4 text-[#D8C6AA] group-hover:translate-x-1 transition-transform" />
                </button>

                <Link
                  to="/account/orders"
                  className="px-6 py-3.5 bg-white border border-[#E4DED4] hover:border-[#242522] text-[#242522] text-xs uppercase tracking-widest font-medium transition-colors flex items-center gap-2"
                >
                  <span>View Your Orders ({realOrders.length})</span>
                </Link>
              </div>
            </motion.div>

            {/* Right Inset Lifestyle Graphic */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 relative"
            >
              <div className="aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] rounded-xs overflow-hidden bg-[#EFE9DF] border border-[#E4DED4] shadow-subtle-luxury relative group">
                <img
                  src="https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1000&auto=format&fit=crop"
                  alt="Private Client Autumn Curation"
                  className="w-full h-full object-cover object-center filter saturate-[0.9] group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#242522]/70 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                  <span className="text-[10px] uppercase tracking-widest text-[#D8C6AA] font-medium">
                    Autumn Private Preview
                  </span>
                  <p className="font-serif text-base font-light text-[#F8F6F1]">
                    The Double-Faced Cashmere Wrap Coat
                  </p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ================= 2. FOUR ACCOUNT OVERVIEW CARDS ================= */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: My Orders */}
            <Link
              to="/account/orders"
              className="p-5 bg-white border border-[#E4DED4] hover:border-[#D8C6AA] transition-all duration-300 rounded-none shadow-xs group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-[#EFE9DF] text-[#777B63] flex items-center justify-center group-hover:bg-[#242522] group-hover:text-[#D8C6AA] transition-colors">
                  <Package className="w-4 h-4" />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-[#777B63] font-medium bg-[#F8F6F1] px-2 py-0.5 border border-[#E4DED4]">
                  {activeOrdersCount} In Transit
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-serif text-[#242522] font-normal">
                  {realOrders.length} {realOrders.length === 1 ? 'Order' : 'Orders'}
                </p>
                <div className="flex items-center justify-between text-xs text-[#5A5C55] mt-1">
                  <span>Track recent parcels</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D8C6AA] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Card 2: Saved Items (Wishlist) */}
            <Link
              to="/account/wishlist"
              className="p-5 bg-white border border-[#E4DED4] hover:border-[#D8C6AA] transition-all duration-300 rounded-none shadow-xs group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-[#EFE9DF] text-[#777B63] flex items-center justify-center group-hover:bg-[#242522] group-hover:text-[#D8C6AA] transition-colors">
                  <Heart className="w-4 h-4" />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-[#777B63] font-medium bg-[#F8F6F1] px-2 py-0.5 border border-[#E4DED4]">
                  Personal Edit
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-serif text-[#242522] font-normal">
                  {totalWishlistItems} {totalWishlistItems === 1 ? 'Piece' : 'Pieces'}
                </p>
                <div className="flex items-center justify-between text-xs text-[#5A5C55] mt-1">
                  <span>View saved wishlist</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D8C6AA] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Card 3: Shopping Bag */}
            <button
              type="button"
              onClick={openCart}
              className="p-5 bg-white border border-[#E4DED4] hover:border-[#D8C6AA] transition-all duration-300 rounded-none shadow-xs group flex flex-col justify-between text-left"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-[#EFE9DF] text-[#777B63] flex items-center justify-center group-hover:bg-[#242522] group-hover:text-[#D8C6AA] transition-colors">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-[#777B63] font-medium bg-[#F8F6F1] px-2 py-0.5 border border-[#E4DED4]">
                  Cart Drawer
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-serif text-[#242522] font-normal">
                  {totalCartItems} {totalCartItems === 1 ? 'Item' : 'Items'}
                </p>
                <div className="flex items-center justify-between text-xs text-[#5A5C55] mt-1">
                  <span>{cartSubtotal > 0 ? formatINR(cartSubtotal) : 'Bag is empty'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D8C6AA] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>

            {/* Card 4: Recently Viewed */}
            <button
              type="button"
              onClick={scrollToRecent}
              className="p-5 bg-white border border-[#E4DED4] hover:border-[#D8C6AA] transition-all duration-300 rounded-none shadow-xs group flex flex-col justify-between text-left"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-[#EFE9DF] text-[#777B63] flex items-center justify-center group-hover:bg-[#242522] group-hover:text-[#D8C6AA] transition-colors">
                  <Eye className="w-4 h-4" />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-[#777B63] font-medium bg-[#F8F6F1] px-2 py-0.5 border border-[#E4DED4]">
                  History
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-serif text-[#242522] font-normal">
                  {recentlyViewed.length} Viewed
                </p>
                <div className="flex items-center justify-between text-xs text-[#5A5C55] mt-1">
                  <span>Jump to recent pieces</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D8C6AA] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>

          </div>
        </div>
      </section>

      {/* ================= 3. CURATED FOR YOU COLLECTION ================= */}
      <section id="curated-section" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-[#E4DED4]/60">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-6 border-b border-[#E4DED4]">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#D8C6AA]" />
                <span className="text-xs uppercase tracking-widest text-[#777B63] font-medium">
                  Private Salon Edit
                </span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#242522] font-normal tracking-tight">
                Curated for You
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#5A5C55] font-light max-w-sm mt-3 sm:mt-0 leading-relaxed text-left sm:text-right">
              Considered pieces selected for your next discovery. Structured silhouettes and tactile staples.
            </p>
          </div>

          {/* Curated Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {curatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ================= 4. RECENTLY VIEWED SECTION ================= */}
      <section id="recently-viewed-section" className="py-16 bg-[#EFE9DF]/40 px-4 sm:px-6 lg:px-8 border-t border-[#E4DED4]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E4DED4]">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#777B63] font-medium block mb-1">
                Browsing Continuity
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-[#242522]">
                Recently Viewed
              </h3>
            </div>
            <span className="text-xs text-[#5A5C55]">
              {recentlyViewed.length} items logged in session
            </span>
          </div>

          {recentlyViewed.length === 0 ? (
            /* Polished Empty State */
            <div className="p-10 bg-white border border-[#E4DED4] text-center max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-[#EFE9DF] text-[#777B63] flex items-center justify-center mx-auto mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-lg text-[#242522]">No recent browsing history</h4>
              <p className="text-xs text-[#5A5C55] font-light mt-1">
                As you explore pieces across the atelier and inspect quick view specs, they will assemble here for easy reference.
              </p>
              <button
                type="button"
                onClick={scrollToCurated}
                className="mt-5 px-5 py-2.5 bg-[#242522] text-[#F8F6F1] text-xs uppercase tracking-widest font-medium hover:bg-[#383934] transition-colors"
              >
                Browse Curated Edit
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentlyViewed.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= 5. PRIVATE CLIENT CONCIERGE BANNER ================= */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto bg-[#242522] text-[#F8F6F1] p-8 sm:p-10 rounded-xs flex flex-col md:flex-row items-center justify-between gap-6 shadow-subtle-luxury">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#D8C6AA] text-xs uppercase tracking-wider font-medium">
              <Shield className="w-4 h-4" />
              <span>Complimentary Private Styling</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-normal text-white">
              Bespoke Fittings & Priority Sourcing
            </h3>
            <p className="text-xs sm:text-sm text-[#F8F6F1]/70 font-light max-w-lg leading-relaxed">
              As an Atelier Private Client, you have direct telephone and messaging access to our master cutters and design studio in Mumbai and Kashmir.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              to="/account/profile"
              className="px-6 py-3 bg-[#D8C6AA] hover:bg-[#E6DAC5] text-[#242522] text-xs uppercase tracking-widest font-medium transition-colors"
            >
              Manage Profile
            </Link>
            <Link
              to="/"
              className="px-6 py-3 bg-transparent border border-white/20 hover:border-white text-white text-xs uppercase tracking-widest font-medium transition-colors"
            >
              View Public Catalog
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

