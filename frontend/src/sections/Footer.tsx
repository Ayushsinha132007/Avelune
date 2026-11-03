import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, Instagram, Twitter, Compass, Globe } from 'lucide-react';
import { CategoryType } from '../types';
import { scrollToSection } from '../utils/scroll';
import { useAuth } from '../hooks/useAuth';

interface FooterProps {
  onSelectCategory?: (cat: CategoryType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory }) => {
  const { isAuthenticated } = useAuth();
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryClick = (cat: CategoryType) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    }
    scrollToSection('featured-collection', 80);
  };

  return (
    <footer className="bg-[#242522] text-[#F8F6F1] pt-20 pb-12 px-4 sm:px-6 lg:px-8 border-t border-[#383934]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-16 border-b border-[#383934]">
          
          {/* Brand Info & Mission */}
          <div className="lg:col-span-5 space-y-4">
            <span className="font-serif text-3xl sm:text-4xl tracking-[0.2em] font-normal text-[#F8F6F1] block">
              AVELUNE
            </span>
            <p className="text-xs tracking-[0.25em] uppercase text-[#D8C6AA] font-medium">
              Atelier & Considered Essentials
            </p>
            <p className="text-xs sm:text-sm text-[#F8F6F1]/70 font-light max-w-sm leading-relaxed pt-2">
              Designing enduring objects and wardrobe foundations that bring beauty, architectural quiet, and tactile warmth to everyday living.
            </p>

            <div className="pt-4 flex items-center gap-4 text-[#D8C6AA]">
              <a
                href="#instagram"
                onClick={(e) => e.preventDefault()}
                aria-label="AVELUNE Instagram"
                className="w-8 h-8 rounded-full border border-[#383934] flex items-center justify-center hover:bg-[#D8C6AA] hover:text-[#242522] transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#twitter"
                onClick={(e) => e.preventDefault()}
                aria-label="AVELUNE Twitter / X"
                className="w-8 h-8 rounded-full border border-[#383934] flex items-center justify-center hover:bg-[#D8C6AA] hover:text-[#242522] transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <button
                onClick={() => scrollToSection('editorial-lookbook', 80)}
                aria-label="AVELUNE Journal"
                className="w-8 h-8 rounded-full border border-[#383934] flex items-center justify-center hover:bg-[#D8C6AA] hover:text-[#242522] transition-colors"
              >
                <Compass className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Shop Realms */}
          <div className="lg:col-span-3">
            <h4 className="text-xs uppercase tracking-widest-luxury text-[#D8C6AA] font-medium mb-4">
              Collections & Departments
            </h4>
            <ul className="space-y-2.5 text-xs text-[#F8F6F1]/80 font-light">
              <li>
                <Link
                  to="/collections/men"
                  className="hover:text-[#D8C6AA] transition-colors text-left"
                >
                  Men's Collection
                </Link>
              </li>
              <li>
                <Link
                  to="/collections/women"
                  className="hover:text-[#D8C6AA] transition-colors text-left"
                >
                  Women's Atelier
                </Link>
              </li>
              <li>
                <Link
                  to="/collections/kids"
                  className="hover:text-[#D8C6AA] transition-colors text-left"
                >
                  Kids & Juniors
                </Link>
              </li>
              <li>
                <Link
                  to="/offers"
                  className="hover:text-[#D8C6AA] transition-colors text-left"
                >
                  Offers & Special Picks
                </Link>
              </li>
              <li>
                <Link
                  to="/collections?collection=under-999"
                  className="hover:text-[#D8C6AA] transition-colors text-left"
                >
                  Under ₹999 Edit
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="hover:text-[#D8C6AA] transition-colors text-left"
                >
                  Shopping Bag
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="lg:col-span-2">
            <h4 className="text-xs uppercase tracking-widest-luxury text-[#D8C6AA] font-medium mb-4">
              Client Care
            </h4>
            <ul className="space-y-2.5 text-xs text-[#F8F6F1]/80 font-light">
              <li>
                <Link
                  to={isAuthenticated ? "/account/home" : "/login"}
                  className="hover:text-[#D8C6AA] transition-colors"
                >
                  {isAuthenticated ? "Client Dashboard (Private Salon)" : "Client Account (Sign In)"}
                </Link>
              </li>
              <li>
                <a href="#care" onClick={(e) => e.preventDefault()} className="hover:text-[#D8C6AA] transition-colors">
                  Complimentary Shipping
                </a>
              </li>
              <li>
                <a href="#care" onClick={(e) => e.preventDefault()} className="hover:text-[#D8C6AA] transition-colors">
                  Returns & Exchanges
                </a>
              </li>
              <li>
                <a href="#care" onClick={(e) => e.preventDefault()} className="hover:text-[#D8C6AA] transition-colors">
                  Fibers & Garment Care
                </a>
              </li>
              <li>
                <a href="#care" onClick={(e) => e.preventDefault()} className="hover:text-[#D8C6AA] transition-colors">
                  Bespoke Inquiries
                </a>
              </li>
              <li>
                <a href="#care" onClick={(e) => e.preventDefault()} className="hover:text-[#D8C6AA] transition-colors">
                  Concierge Desk
                </a>
              </li>
            </ul>
          </div>

          {/* Region / Currency */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs uppercase tracking-widest-luxury text-[#D8C6AA] font-medium mb-4">
              Region & Market
            </h4>
            <div className="p-3 bg-[#2F312D] border border-[#383934] rounded-xs space-y-1 text-xs">
              <div className="flex items-center gap-2 text-[#D8C6AA]">
                <Globe className="w-3.5 h-3.5" />
                <span className="font-medium">India / INR (₹)</span>
              </div>
              <p className="text-[11px] text-[#F8F6F1]/60 font-light">
                Prices inclusive of GST and local artisanal taxes.
              </p>
            </div>

            <button
              onClick={scrollToTop}
              className="w-full py-2.5 px-3 border border-[#383934] hover:border-[#D8C6AA] text-xs uppercase tracking-wider text-[#F8F6F1] flex items-center justify-center gap-2 transition-colors mt-4"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5 text-[#D8C6AA]" />
            </button>
          </div>

        </div>

        {/* Bottom Legal / Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#F8F6F1]/60 font-light gap-4">
          <p>© 2026 AVELUNE Atelier & Co. All rights reserved. Designed for quiet living.</p>
          <div className="flex items-center gap-6">
            <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-[#D8C6AA] transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-[#D8C6AA] transition-colors">
              Terms of Service
            </a>
            <a href="#shipping" onClick={(e) => e.preventDefault()} className="hover:text-[#D8C6AA] transition-colors">
              Shipping & Duties
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

