import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Menu, X, ArrowRight } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { useAuth } from '../hooks/useAuth';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { scrollToSection } from '../utils/scroll';

interface NavbarProps {
  onNavigateSection?: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigateSection }) => {
  const {
    openCart,
    openWishlist,
    openSearch,
    totalCartItems,
    totalWishlistItems,
  } = useStore();
  const { isAuthenticated, user } = useAuth();
  const { requireAuth } = useRequireAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountNotice, setAccountNotice] = useState(false);

  interface NavItem {
    label: string;
    id?: string;
    path?: string;
  }

  const navLinks: NavItem[] = [
    { label: 'Collections', path: '/collections' },
    { label: 'Men', path: '/collections/men' },
    { label: 'Women', path: '/collections/women' },
    { label: 'Kids', path: '/collections/kids' },
    { label: 'Offers', path: '/offers' },
    { label: 'Our Story', id: 'brand-story' },
  ];

  const extendedMobileLinks: NavItem[] = [
    { label: 'All Collections', path: '/collections' },
    { label: "Men's Collection", path: '/collections/men' },
    { label: "Women's Collection", path: '/collections/women' },
    { label: 'Kids & Juniors', path: '/collections/kids' },
    { label: 'Offers & Special Picks', path: '/offers' },
    { label: 'Under ₹999 Edit', path: '/collections?collection=under-999' },
    { label: 'Your Shopping Bag', path: '/cart' },
    { label: 'Our Story', id: 'brand-story' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);

      const sectionIds = [
        'shop-categories',
        'new-arrivals',
        'featured-collection',
        'bestsellers-section',
        'brand-story',
      ];
      const scrollPos = window.scrollY + 130;

      let found = '';
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            found = id;
            break;
          }
        }
      }
      setActiveSection(found);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (link: NavItem) => {
    setMobileMenuOpen(false);
    if (link.path) {
      requireAuth(
        () => navigate(link.path!),
        link.path,
        `Please sign in to view the ${link.label} collection.`
      );
      return;
    }
    if (link.id) {
      if (location.pathname !== '/') {
        navigate(`/#${link.id}`);
        setTimeout(() => {
          scrollToSection(link.id!, 80);
        }, 120);
      } else {
        if (onNavigateSection) {
          onNavigateSection(link.id);
        } else {
          scrollToSection(link.id, 80);
        }
      }
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isLinkActive = (link: NavItem) => {
    if (link.path) {
      if (link.path === '/collections') {
        return location.pathname === '/collections' && !location.search;
      }
      if (link.path.startsWith('/collections/')) {
        return location.pathname === link.path;
      }
      if (link.path === '/offers') {
        return location.pathname === '/offers';
      }
      if (link.path === '/cart') {
        return location.pathname === '/cart';
      }
      return (
        location.pathname.startsWith('/collections') &&
        link.path.includes('?') &&
        location.search.includes(link.path.split('?')[1])
      );
    }
    return location.pathname === '/' && activeSection === link.id;
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#F8F6F1]/95 backdrop-blur-md shadow-sm border-b border-[#E4DED4]/80 py-3.5'
            : 'bg-transparent py-5 border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Left: Mobile Menu Trigger + Brand Wordmark */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-1.5 -ml-1 text-[#242522] hover:text-[#777B63] transition-colors focus:outline-none"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <a
                href="/"
                onClick={handleLogoClick}
                className="group flex flex-col items-start"
              >
                <span className="font-serif text-2xl sm:text-3xl tracking-[0.2em] font-normal text-[#242522] transition-colors group-hover:text-[#777B63]">
                  AVELUNE
                </span>
                <span className="text-[9px] tracking-[0.3em] uppercase text-[#777B63] font-medium -mt-1 hidden sm:block">
                  Atelier & Lifestyle
                </span>
              </a>
            </div>

            {/* Center: Desktop Navigation Links (Each links to its distinct section or department) */}
            <nav className="hidden lg:flex items-center space-x-7">
              {navLinks.map((link) => {
                const isActive = isLinkActive(link);
                return (
                  <button
                    key={link.label}
                    onClick={() => handleNavClick(link)}
                    className={`relative group text-xs tracking-wider uppercase py-1 transition-colors ${
                      isActive
                        ? 'text-[#242522] font-semibold'
                        : 'text-[#242522]/75 hover:text-[#242522] font-medium'
                    }`}
                  >
                    <span>{link.label}</span>
                    <span
                      className={`absolute bottom-0 left-0 h-[1.5px] bg-[#242522] transition-all duration-300 ease-out ${
                        isActive ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                    />
                  </button>
                );
              })}
            </nav>

            {/* Right: Utility Icons */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Search Button */}
              <button
                onClick={() =>
                  requireAuth(openSearch, '/', 'Please sign in to search the atelier collection.')
                }
                aria-label="Search collection"
                className="p-2 text-[#242522] hover:text-[#777B63] transition-colors rounded-full hover:bg-[#EFE9DF]/50"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Account / Dashboard Link */}
              <Link
                to={isAuthenticated ? "/account/home" : "/login"}
                aria-label={isAuthenticated ? `Client Dashboard (${user?.firstName})` : "Client account sign in"}
                className="p-1.5 text-[#242522] hover:text-[#777B63] transition-colors rounded-full hover:bg-[#EFE9DF]/50 flex items-center gap-1.5"
                title={isAuthenticated ? `Welcome back, ${user?.firstName} (Open Dashboard)` : "Sign in to your AVELUNE account"}
              >
                {isAuthenticated ? (
                  <div className="w-7 h-7 rounded-full bg-[#242522] text-[#D8C6AA] flex items-center justify-center text-xs font-semibold shadow-xs">
                    {user?.avatarInitials || 'A'}
                  </div>
                ) : (
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </Link>

              {/* Wishlist Button */}
              <button
                onClick={() =>
                  requireAuth(
                    openWishlist,
                    '/account/wishlist',
                    'Please sign in to view your saved pieces.'
                  )
                }
                aria-label="View saved pieces"
                className="relative p-2 text-[#242522] hover:text-[#777B63] transition-colors rounded-full hover:bg-[#EFE9DF]/50"
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                {totalWishlistItems > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-medium bg-[#777B63] text-white rounded-full">
                    {totalWishlistItems}
                  </span>
                )}
              </button>

              {/* Cart Bag Button */}
              <button
                onClick={() =>
                  requireAuth(openCart, '/cart', 'Please sign in to view your shopping bag.')
                }
                aria-label={`Shopping bag containing ${totalCartItems} items`}
                className="relative p-2 text-[#242522] hover:text-[#777B63] transition-colors rounded-full hover:bg-[#EFE9DF]/50 flex items-center gap-1.5"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                {totalCartItems > 0 && (
                  <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold bg-[#242522] text-[#F8F6F1] rounded-full">
                    {totalCartItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-[#242522]/40 backdrop-blur-sm z-50 lg:hidden"
            />

            {/* Slide-in Menu */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-[#F8F6F1] border-r border-[#E4DED4] z-50 flex flex-col justify-between p-6 shadow-drawer-luxury lg:hidden overflow-y-auto"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-[#E4DED4]">
                  <span className="font-serif text-2xl tracking-[0.2em] text-[#242522]">
                    AVELUNE
                  </span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-[#242522] hover:text-[#777B63] transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-8 space-y-3">
                  {extendedMobileLinks.map((link) => (
                    <button
                      key={link.label}
                      onClick={() => handleNavClick(link)}
                      className="w-full text-left py-2.5 flex items-center justify-between text-base font-serif text-[#242522] hover:text-[#777B63] border-b border-[#E4DED4]/50 transition-colors"
                    >
                      <span>{link.label}</span>
                      <ArrowRight className="w-4 h-4 text-[#D8C6AA]" />
                    </button>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-[#E4DED4] space-y-3">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      requireAuth(
                        openSearch,
                        '/',
                        'Please sign in to search the atelier collection.'
                      );
                    }}
                    className="flex items-center gap-3 text-sm text-[#242522]/80 hover:text-[#242522]"
                  >
                    <Search className="w-4 h-4 text-[#777B63]" />
                    <span>Search Collection</span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      requireAuth(
                        openWishlist,
                        '/account/wishlist',
                        'Please sign in to view your saved pieces.'
                      );
                    }}
                    className="flex items-center gap-3 text-sm text-[#242522]/80 hover:text-[#242522]"
                  >
                    <Heart className="w-4 h-4 text-[#777B63]" />
                    <span>Saved Pieces ({totalWishlistItems})</span>
                  </button>

                  <Link
                    to={isAuthenticated ? "/account/home" : "/login"}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-sm text-[#242522]/80 hover:text-[#242522] pt-1"
                  >
                    {isAuthenticated ? (
                      <div className="w-5 h-5 rounded-full bg-[#242522] text-[#D8C6AA] flex items-center justify-center text-[10px] font-semibold">
                        {user?.avatarInitials || 'A'}
                      </div>
                    ) : (
                      <User className="w-4 h-4 text-[#777B63]" />
                    )}
                    <span>{isAuthenticated ? `Client Dashboard (${user?.firstName})` : 'Client Account (Sign In)'}</span>
                  </Link>
                </div>
              </div>

              <div className="pt-8 border-t border-[#E4DED4]">
                <p className="font-serif italic text-sm text-[#777B63]">
                  "Considered pieces. Enduring presence."
                </p>
                <p className="text-[11px] text-[#5A5C55] mt-2">
                  Complimentary standard shipping on all domestic orders above ₹1,999.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
