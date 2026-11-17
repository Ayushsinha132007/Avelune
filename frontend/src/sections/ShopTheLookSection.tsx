import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ShoppingBag, ArrowRight, Check } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { formatINR } from '../utils/currency';

interface Hotspot {
  id: string;
  productId: string;
  name: string;
  category: string;
  price: number;
  image: string;
  xPercent: number; // Position percentage X
  yPercent: number; // Position percentage Y
}

const LOOK_HOTSPOTS: Hotspot[] = [
  {
    id: 'spot-shirt',
    productId: 'men-015',
    name: 'Sateen Evening Party Shirt',
    category: 'Formal & Evening Shirts',
    price: 1690,
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600&auto=format&fit=crop',
    xPercent: 48,
    yPercent: 38,
  },
  {
    id: 'spot-trousers',
    productId: 'men-016',
    name: 'Slim Jacquard Evening Trousers',
    category: 'Tailored Evening Trousers',
    price: 1950,
    image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=600&auto=format&fit=crop',
    xPercent: 54,
    yPercent: 68,
  },
  {
    id: 'spot-coat',
    productId: 'men-005',
    name: 'Merino Wool Relaxed Coat',
    category: 'Outerwear & Coats',
    price: 8990,
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=600&auto=format&fit=crop',
    xPercent: 36,
    yPercent: 26,
  },
];

export const ShopTheLookSection: React.FC = () => {
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>('spot-shirt');
  const [addedItemIds, setAddedItemIds] = useState<Set<string>>(new Set());
  const { addToCart, showToast, openCart } = useStore();
  const { requireAuth } = useRequireAuth();

  const activeSpot = LOOK_HOTSPOTS.find((s) => s.id === activeHotspotId) || LOOK_HOTSPOTS[0];

  const handleQuickAdd = (spot: Hotspot) => {
    requireAuth(() => {
      addToCart({
        id: spot.productId,
        name: spot.name,
        subtitle: spot.category,
        price: spot.price,
        images: [spot.image],
        category: spot.category,
        gender: 'men',
        rating: 4.9,
        reviewCount: 38,
        inStock: true,
        stockQuantity: 25,
        description: 'Part of the AVELUNE Autumn Lookbook styling.',
        details: ['Dry clean only', 'Ethically tailored', 'Signature hardware'],
        materials: 'Natural Luxury Fiber',
        tags: ['evening', 'party', 'tailored'],
      } as any);

      setAddedItemIds((prev) => new Set(prev).add(spot.id));
      showToast({
        title: 'Added to Atelier Bag',
        description: `${spot.name} has been added to your shopping bag.`,
        type: 'info',
      });
    }, '/cart', 'Please sign in to add pieces to your shopping bag.');
  };

  const handleAddEntireLook = () => {
    requireAuth(() => {
      LOOK_HOTSPOTS.forEach((spot) => {
        addToCart({
          id: spot.productId,
          name: spot.name,
          subtitle: spot.category,
          price: spot.price,
          images: [spot.image],
          category: spot.category,
          gender: 'men',
          rating: 4.9,
          reviewCount: 38,
          inStock: true,
          stockQuantity: 25,
          description: 'Complete Look Ensemble styling.',
          details: ['Tailored set'],
          materials: 'Natural Luxury Fiber',
          tags: ['lookbook', 'ensemble'],
        } as any);
      });

      setAddedItemIds(new Set(LOOK_HOTSPOTS.map((s) => s.id)));
      showToast({
        title: 'Complete Ensemble Added',
        description: 'All 3 pieces from Look 01 have been placed in your bag.',
        type: 'info',
      });
      openCart();
    }, '/cart', 'Please sign in to acquire this complete look.');
  };

  const totalLookPrice = LOOK_HOTSPOTS.reduce((acc, s) => acc + s.price, 0);

  return (
    <section className="py-24 sm:py-32 bg-[#EFE9DF]/40 px-4 sm:px-6 lg:px-12 border-b border-[#E4DED4]">
      <div className="max-w-7xl mx-auto">
        
        {/* Editorial Journal Masthead */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#242522] pb-6 mb-12">
          <div>
            <span className="text-[11px] uppercase tracking-widest-luxury font-semibold text-[#777B63] block mb-2">
              Atelier Journal / Look 01
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#242522] font-normal tracking-tight">
              Shop The Look
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-serif italic text-[#5A5C55] max-w-sm mt-3 sm:mt-0 leading-relaxed">
            "A seamless harmony of structured sateen, jacquard evening weave, and brushed merino wool."
          </p>
        </div>

        {/* Interactive Editorial Canvas Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Main Visual Image with Interactive Hotspots */}
          <div className="lg:col-span-7 relative group aspect-[4/5] sm:aspect-[16/11] lg:aspect-[4/5] overflow-hidden bg-[#E4DED4] rounded-xs shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1400&auto=format&fit=crop"
              alt="Editorial Look 01 styling"
              className="w-full h-full object-cover object-top filter saturate-[0.85] brightness-[0.96]"
            />
            <div className="absolute inset-0 bg-black/15" />

            {/* Hotspot Pins */}
            {LOOK_HOTSPOTS.map((spot) => {
              const isSelected = activeHotspotId === spot.id;
              return (
                <div
                  key={spot.id}
                  style={{ left: `${spot.xPercent}%`, top: `${spot.yPercent}%` }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
                >
                  <button
                    onClick={() => setActiveHotspotId(isSelected ? null : spot.id)}
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isSelected
                        ? 'bg-[#242522] text-[#F8F6F1] scale-110 shadow-xl'
                        : 'bg-[#F8F6F1]/90 text-[#242522] hover:bg-[#242522] hover:text-[#F8F6F1] shadow-md'
                    }`}
                  >
                    <span className="absolute -inset-1.5 rounded-full bg-white/40 animate-ping opacity-75" />
                    {isSelected ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>
              );
            })}

            {/* Interactive Tooltip Card on Active Pin */}
            <AnimatePresence>
              {activeSpot && activeHotspotId && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    left: `${Math.min(75, Math.max(25, activeSpot.xPercent))}%`,
                    top: `${Math.min(78, activeSpot.yPercent + 12)}%`,
                  }}
                  className="absolute transform -translate-x-1/2 z-30 w-64 p-3 bg-[#F8F6F1] border border-[#D8C6AA] shadow-2xl rounded-xs text-[#242522]"
                >
                  <div className="flex gap-3 items-center">
                    <img
                      src={activeSpot.image}
                      alt={activeSpot.name}
                      className="w-12 h-14 object-cover rounded-xs border border-[#E4DED4]"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] uppercase tracking-wider text-[#777B63] block truncate">
                        {activeSpot.category}
                      </span>
                      <h4 className="font-serif text-xs font-medium truncate text-[#242522]">
                        {activeSpot.name}
                      </h4>
                      <p className="text-xs font-semibold text-[#242522] mt-0.5">
                        {formatINR(activeSpot.price)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleQuickAdd(activeSpot)}
                    className="w-full mt-2.5 py-1.5 bg-[#242522] text-[#F8F6F1] text-[10px] uppercase tracking-widest font-medium hover:bg-[#3A3C36] transition-colors flex items-center justify-center gap-1.5"
                  >
                    {addedItemIds.has(activeSpot.id) ? (
                      <>
                        <Check className="w-3 h-3 text-[#A3B18A]" />
                        <span>Added to Bag</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3 h-3" />
                        <span>Add To Bag</span>
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Complete Look Breakdown & Purchase Card */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="p-6 sm:p-8 bg-[#F8F6F1] border border-[#E4DED4] rounded-xs shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E4DED4] pb-4 mb-6">
                <div>
                  <span className="text-[10px] uppercase tracking-widest-luxury text-[#777B63] font-medium block">
                    Curated Ensemble
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl text-[#242522]">
                    The Autumn Evening Silhouette
                  </h3>
                </div>
                <span className="text-sm font-serif font-medium text-[#242522]">
                  {formatINR(totalLookPrice)}
                </span>
              </div>

              {/* Individual Look Items List */}
              <div className="space-y-4">
                {LOOK_HOTSPOTS.map((spot) => {
                  const isActive = activeHotspotId === spot.id;
                  const isAdded = addedItemIds.has(spot.id);
                  return (
                    <div
                      key={spot.id}
                      onClick={() => setActiveHotspotId(spot.id)}
                      className={`p-3 border rounded-xs cursor-pointer transition-all flex items-center justify-between ${
                        isActive
                          ? 'border-[#242522] bg-[#EFE9DF]/60 shadow-xs'
                          : 'border-[#E4DED4] bg-white hover:border-[#777B63]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={spot.image}
                          alt={spot.name}
                          className="w-10 h-12 object-cover rounded-xs border border-[#E4DED4]"
                        />
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-[#777B63] block">
                            {spot.category}
                          </span>
                          <span className="text-xs font-serif font-medium text-[#242522] block">
                            {spot.name}
                          </span>
                          <span className="text-xs font-semibold text-[#5A5C55]">
                            {formatINR(spot.price)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickAdd(spot);
                        }}
                        className={`p-2 rounded-xs border text-xs transition-colors ${
                          isAdded
                            ? 'bg-[#242522] text-[#F8F6F1] border-[#242522]'
                            : 'border-[#D8C6AA] text-[#242522] hover:bg-[#242522] hover:text-[#F8F6F1]'
                        }`}
                        title="Add this piece to bag"
                      >
                        {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Add Entire Ensemble Button */}
              <button
                onClick={handleAddEntireLook}
                className="w-full mt-6 py-3.5 bg-[#242522] text-[#F8F6F1] text-xs uppercase tracking-widest-luxury font-medium hover:bg-[#3A3C36] transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Acquire Complete Ensemble ({formatINR(totalLookPrice)})</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
