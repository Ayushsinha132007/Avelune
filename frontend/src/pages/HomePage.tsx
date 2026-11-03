import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroSection } from '../sections/HeroSection';
import { CategoryCarousel } from '../components/catalog/CategoryCarousel';
import { NewArrivalsSection } from '../sections/NewArrivalsSection';
import { FeaturedCollection } from '../sections/FeaturedCollection';
import { BrandStorySection } from '../sections/BrandStorySection';
import { LookbookSection } from '../sections/LookbookSection';
import { BrandValuesSection } from '../sections/BrandValuesSection';
import { NewsletterSection } from '../sections/NewsletterSection';
import { StyleQuizBanner } from '../sections/StyleQuizBanner';
import { CategoryType, CarouselCategoryItem } from '../types';
import { scrollToSection } from '../utils/scroll';

interface HomePageProps {
  selectedCategory: string | null;
  onSelectCategory: (cat: CategoryType) => void;
  onClearCategory: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  selectedCategory,
  onSelectCategory,
  onClearCategory,
}) => {
  const navigate = useNavigate();

  const handleViewAllNewArrivals = () => {
    onClearCategory();
    scrollToSection('featured-collection');
  };

  const handleCarouselSelect = (item: CarouselCategoryItem) => {
    if (item.gender) {
      navigate(`/collections/${item.gender}`);
    } else if (item.collection) {
      navigate(`/collections?collection=${item.collection}`);
    } else {
      scrollToSection('featured-collection');
    }
  };

  return (
    <div className="w-full">
      {/* 1. Cinematic Hero */}
      <HeroSection />

      {/* 2. Category Carousel ("Discover Your Style") */}
      <CategoryCarousel onSelectItem={handleCarouselSelect} />

      {/* 3. Dedicated New Arrivals Spotlight ("Atelier Drop 01") */}
      <NewArrivalsSection onViewAllNewArrivals={handleViewAllNewArrivals} />

      {/* 4. Complete Shop / Featured Collection ("Pieces Worth Keeping") */}
      <FeaturedCollection
        selectedCategory={selectedCategory}
        onClearCategory={onClearCategory}
        onSelectCategory={onSelectCategory}
      />

      {/* 5. Discover Your Style Interactive Stylist Banner ("Your Style, Thoughtfully Curated") */}
      <StyleQuizBanner />

      {/* 6. Brand Story Editorial Banner ("Less, but better.") */}
      <BrandStorySection />

      {/* 7. Magazine Editorial Lookbook */}
      <LookbookSection />

      {/* 8. Brand Values */}
      <BrandValuesSection />

      {/* 9. Newsletter Signup */}
      <NewsletterSection />
    </div>
  );
};

