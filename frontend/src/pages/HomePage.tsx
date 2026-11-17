import React from 'react';
import { FlagshipHero } from '../sections/FlagshipHero';
import { MaisonPortals } from '../sections/MaisonPortals';
import { ShopTheLookSection } from '../sections/ShopTheLookSection';
import { AiStylistSalon } from '../sections/AiStylistSalon';
import { CuratedArchiveShowcase } from '../sections/CuratedArchiveShowcase';
import { MaterialitySection } from '../sections/MaterialitySection';
import { BrandStorySection } from '../sections/BrandStorySection';
import { AtelierServicesSection } from '../sections/AtelierServicesSection';
import { NewsletterSection } from '../sections/NewsletterSection';
import { CategoryType } from '../types';

interface HomePageProps {
  selectedCategory: string | null;
  onSelectCategory: (cat: CategoryType) => void;
  onClearCategory: () => void;
}

export const HomePage: React.FC<HomePageProps> = () => {
  return (
    <div className="w-full bg-[#F8F6F1]">
      {/* 1. Cinematic Flagship Hero with Interactive Mood Switcher */}
      <FlagshipHero />

      {/* 2. The Maison Portals: Dedicated Department Universes (Homme, Femme, Vault, Enfant) */}
      <MaisonPortals />

      {/* 3. Interactive "Shop The Look" Editorial Canvas with Clickable Hotspot Pins */}
      <ShopTheLookSection />

      {/* 4. L'Atelier Styliste: Interactive AI Style Concierge Consultation Salon */}
      <AiStylistSalon />

      {/* 5. Curator's Exhibition: 4 Selected Masterpieces + Link to Complete Catalogue Dashboard */}
      <CuratedArchiveShowcase />

      {/* 6. Honest Materiality: Interactive Fabric Provenance Archives */}
      <MaterialitySection />

      {/* 7. Brand Story & Quiet Luxury Manifesto ("Less, but better.") */}
      <BrandStorySection />

      {/* 8. The Atelier Experience & Critical Press Praise (Vogue, GQ, AD) */}
      <AtelierServicesSection />

      {/* 9. VIP Private Salon Invitation */}
      <NewsletterSection />
    </div>
  );
};
