import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Shield, Droplets, Feather, Sparkles } from 'lucide-react';

interface MaterialItem {
  id: string;
  name: string;
  fiberType: string;
  provenance: string;
  specs: string;
  description: string;
  image: string;
}

const MATERIALS: MaterialItem[] = [
  {
    id: 'mat-cashmere',
    name: '14.5µ Mongolian Cashmere',
    fiberType: 'Grade-A Natural Underdown',
    provenance: 'Steppes of Inner Mongolia',
    specs: 'Fiber fineness: 14.5 microns • 2-ply yarn',
    description: 'Sustainably combed by hand from indigenous nomadic goats. Lighter than air yet insulating against severe cold with butter-soft warmth that never pills.',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'mat-silk',
    name: 'Mulberry Silk & Chanderi',
    fiberType: 'Heritage Handloom Weave',
    provenance: 'Historic Weavers of Chanderi, MP',
    specs: '100% mulberry silk warp • Real gold zari accents',
    description: 'Woven on traditional wooden pit looms using centuries-old heritage techniques. Exhibits a subtle, non-glossy luminescent sheen that drapes with whisper-quiet weight.',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'mat-leather',
    name: 'Tuscan Full-Grain Leather',
    fiberType: 'Vegetable-Tanned Cowhide',
    provenance: 'Santa Croce sull’Arno, Tuscany',
    specs: 'Chromium-free • Natural chestnut bark tannins',
    description: 'Tanned using ancient bark and plant extract baths over 60 days. Untreated surface preserves the organic grain, maturing with a rich, unique patina over decades.',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'mat-cotton',
    name: 'Giza 87 Extra-Long Staple Cotton',
    fiberType: '100% Organic Long-Fiber',
    provenance: 'Nile River Delta, Egypt',
    specs: 'Fiber length: 38mm • 120/2 two-ply sateen',
    description: 'Hand-picked to ensure zero fiber damage. Spun into ultra-dense, durable yarns with a silky handfeel and natural thermoregulating airflow for humid climates.',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
  },
];

export const MaterialitySection: React.FC = () => {
  const [activeMaterialId, setActiveMaterialId] = useState<string>('mat-cashmere');
  const activeMaterial = MATERIALS.find((m) => m.id === activeMaterialId) || MATERIALS[0];

  return (
    <section className="py-24 sm:py-32 bg-[#F8F6F1] px-4 sm:px-6 lg:px-12 border-b border-[#E4DED4]">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#242522] pb-6 mb-16">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest-luxury text-[#777B63] font-medium mb-3">
              <Layers className="w-3.5 h-3.5 text-[#777B63]" />
              <span>Honest Materiality</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl text-[#242522] font-normal tracking-tight">
              The Fabric Archives
            </h2>
          </div>
          <p className="text-sm text-[#5A5C55] font-light max-w-md mt-4 md:mt-0 leading-relaxed">
            Quiet luxury begins with fiber purity. We refuse polyester, acrylic blends, and disposable fast-fashion synthetics.
          </p>
        </div>

        {/* Interactive Material Tabs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Material Selector List */}
          <div className="lg:col-span-5 space-y-3">
            {MATERIALS.map((mat) => {
              const isSelected = activeMaterialId === mat.id;
              return (
                <div
                  key={mat.id}
                  onClick={() => setActiveMaterialId(mat.id)}
                  className={`p-5 rounded-xs border cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? 'bg-white border-[#242522] shadow-sm'
                      : 'bg-[#EFE9DF]/40 border-[#E4DED4] hover:bg-white hover:border-[#777B63]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase tracking-widest-luxury text-[#777B63] font-mono">
                      {mat.fiberType}
                    </span>
                    <span className="text-[10px] text-[#8C8A82] font-mono">
                      {mat.provenance.split(',')[0]}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg text-[#242522] font-medium">
                    {mat.name}
                  </h3>
                  {isSelected && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-xs text-[#5A5C55] mt-2 font-light leading-relaxed"
                    >
                      {mat.description}
                    </motion.p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: Visual Showcase Card */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMaterial.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white border border-[#E4DED4] p-6 sm:p-8 rounded-xs shadow-md"
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-xs bg-[#EFE9DF] mb-6">
                  <img
                    src={activeMaterial.image}
                    alt={activeMaterial.name}
                    className="w-full h-full object-cover object-center filter saturate-[0.88]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <span className="text-[10px] uppercase tracking-widest text-[#D8C6AA] font-mono">
                      Provenance Verified
                    </span>
                    <h4 className="font-serif text-xl font-normal text-[#F8F6F1]">
                      {activeMaterial.provenance}
                    </h4>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-3 bg-[#F8F6F1] rounded-xs border border-[#E4DED4]">
                    <span className="text-[9px] uppercase tracking-wider text-[#777B63] block font-mono">
                      Technical Specification
                    </span>
                    <span className="text-xs text-[#242522] font-medium mt-0.5 block">
                      {activeMaterial.specs}
                    </span>
                  </div>
                  <div className="p-3 bg-[#F8F6F1] rounded-xs border border-[#E4DED4]">
                    <span className="text-[9px] uppercase tracking-wider text-[#777B63] block font-mono">
                      Environmental Standard
                    </span>
                    <span className="text-xs text-[#242522] font-medium mt-0.5 block">
                      100% Biodegradable • Zero Synthetic Blends
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
};

