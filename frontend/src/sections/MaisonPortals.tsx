import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight } from 'lucide-react';

interface PortalItem {
  id: string;
  department: string;
  frenchTitle: string;
  tagline: string;
  description: string;
  image: string;
  path: string;
  piecesCount: string;
  colSpan: string;
  accentBadge: string;
}

const MAISON_PORTALS: PortalItem[] = [
  {
    id: 'portal-homme',
    department: "Men's Collection",
    frenchTitle: 'Atelier Homme',
    tagline: 'Precision Tailoring & Evening Sateen',
    description: 'Crisp band-collar sateen shirts, structured evening jacquard trousers, and minimalist overshirts engineered for silent presence.',
    image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1200&auto=format&fit=crop',
    path: '/collections/men',
    piecesCount: '16 Pieces',
    colSpan: 'lg:col-span-6',
    accentBadge: 'Tailored Formal & Evening',
  },
  {
    id: 'portal-femme',
    department: "Women's Collection",
    frenchTitle: 'Atelier Femme',
    tagline: 'Mulberry Silks & Sculptural Drapes',
    description: 'Flowing handloom chanderi, asymmetrical silk wrap dresses, and tactile cashmere knits designed with poetic fluid restraint.',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
    path: '/collections/women',
    piecesCount: '18 Pieces',
    colSpan: 'lg:col-span-6',
    accentBadge: 'Haute Silks & Cashmere',
  },
  {
    id: 'portal-vault',
    department: 'Leather Goods & Horology',
    frenchTitle: 'The Heritage Vault',
    tagline: 'Tuscan Full-Grain & Chronometers',
    description: 'Minimalist weekend duffels, vegetable-tanned cardholders, and surgical-grade titanium watches designed to acquire patina over decades.',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1200&auto=format&fit=crop',
    path: '/collections?collection=signature',
    piecesCount: '8 Pieces',
    colSpan: 'lg:col-span-7',
    accentBadge: 'Artisan Vegetable Tanned',
  },
  {
    id: 'portal-enfant',
    department: 'Kids & Juniors',
    frenchTitle: 'Atelier Enfant',
    tagline: 'Gentle Organic Cotton & Festive Weaves',
    description: 'Pure, chemical-free organic cotton kurtas, soft lounge sets, and festive silhouettes crafted for playful comfort.',
    image: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?q=80&w=1200&auto=format&fit=crop',
    path: '/collections/kids',
    piecesCount: '10 Pieces',
    colSpan: 'lg:col-span-5',
    accentBadge: 'Certified Organic Cotton',
  },
];

export const MaisonPortals: React.FC = () => {
  return (
    <section className="py-24 sm:py-32 bg-[#F8F6F1] px-4 sm:px-6 lg:px-12 border-b border-[#E4DED4]">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-[#242522] pb-8">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest-luxury text-[#777B63] font-medium mb-3">
              <span className="w-6 h-[1px] bg-[#777B63]" />
              <span>Department Archives</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl text-[#242522] font-normal tracking-tight">
              The Maison Universes
            </h2>
          </div>
          <div className="mt-4 md:mt-0 text-left md:text-right">
            <p className="text-sm text-[#5A5C55] font-light max-w-md leading-relaxed">
              Step into curated realms designed with distinct material integrity and singular aesthetic restraint.
            </p>
          </div>
        </div>

        {/* Portals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {MAISON_PORTALS.map((portal, index) => (
            <motion.div
              key={portal.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className={`group relative overflow-hidden bg-[#EFE9DF] rounded-xs border border-[#E4DED4] ${portal.colSpan}`}
            >
              <Link to={portal.path} className="block relative h-full">
                {/* Image Canvas with Subtle Luxury Zoom */}
                <div className="relative aspect-[16/11] sm:aspect-[16/9] lg:aspect-[16/11] overflow-hidden">
                  <img
                    src={portal.image}
                    alt={portal.frenchTitle}
                    loading="lazy"
                    className="w-full h-full object-cover object-center filter saturate-[0.88] brightness-[0.94] group-hover:scale-105 group-hover:saturate-100 transition-all duration-1000 ease-out"
                  />
                  {/* Atmospheric Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C1D1A]/95 via-[#1C1D1A]/40 to-transparent transition-opacity duration-500" />

                  {/* Top Badge Pill */}
                  <div className="absolute top-5 left-5">
                    <span className="px-3.5 py-1.5 bg-[#F8F6F1]/90 backdrop-blur-md text-[10px] uppercase tracking-widest-luxury font-medium text-[#242522]">
                      {portal.accentBadge}
                    </span>
                  </div>

                  {/* Pieces Counter Top Right */}
                  <div className="absolute top-5 right-5">
                    <span className="px-3 py-1 bg-black/40 backdrop-blur-sm border border-white/20 text-[10px] uppercase tracking-widest text-white/90">
                      {portal.piecesCount}
                    </span>
                  </div>

                  {/* Bottom Text Content */}
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <span className="text-xs uppercase tracking-widest text-[#D8C6AA] font-mono block mb-1">
                      {portal.department}
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl text-[#F8F6F1] font-normal leading-snug">
                      {portal.frenchTitle}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#D5D2CA] font-light max-w-lg mt-2 line-clamp-2 leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity">
                      {portal.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs font-medium tracking-widest-luxury uppercase text-[#F8F6F1] group-hover:text-[#D8C6AA] transition-colors">
                      <span>Enter Collection</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Global Dashboard Link Banner */}
        <div className="mt-14 p-6 sm:p-8 bg-[#EFE9DF]/60 border border-[#DCD5C9] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-[10px] uppercase tracking-widest-luxury text-[#777B63] font-semibold block mb-1">
              Catalogue Dashboard View
            </span>
            <p className="text-sm font-serif text-[#242522]">
              Looking to filter all 46 pieces by price, fabric, occasion, and size simultaneously?
            </p>
          </div>
          <Link
            to="/collections"
            className="px-6 py-3 bg-[#242522] text-[#F8F6F1] text-xs uppercase tracking-widest-luxury font-medium hover:bg-[#3A3C36] transition-colors whitespace-nowrap inline-flex items-center gap-2.5"
          >
            <span>Open Complete Filter Catalogue</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
};
