import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingBag,
  Heart,
  Package,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useStore } from '../../hooks/useStore';

export const AuthenticatedHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const {
    openCart,
    openWishlist,
    openSearch,
    totalCartItems,
    totalWishlistItems,
    showToast,
  } = useStore();

  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sticky scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    logout();
    showToast({
      title: 'Signed Out',
      description: 'Your atelier session has ended securely.',
      type: 'info',
    });
    navigate('/', { replace: true });
  };

  const navLinks = [
    { label: 'Private Edit', path: '/account/home' },
    { label: 'Catalogue', path: '/collections' },
    { label: 'Special Offers', path: '/offers' },
    { label: 'My Orders', path: '/account/orders' },
    { label: 'Wishlist', path: '/account/wishlist' },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#F8F6F1]/95 backdrop-blur-md shadow-sm border-b border-[#E4DED4]/80 py-3.5'
            : 'bg-[#F8F6F1] py-4 border-b border-[#E4DED4]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Left: Mobile Menu Trigger + Brand Wordmark with Private Client Badge */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-1.5 -ml-1 text-[#242522] hover:text-[#777B63] transition-colors focus:outline-none"
                aria-label="Open private navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <Link to="/account/home" className="group flex flex-col items-start">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-2xl sm:text-3xl tracking-[0.2em] font-normal text-[#242522] transition-colors group-hover:text-[#777B63]">
                    AVELUNE
                  </span>
                  <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider font-semibold bg-[#242522] text-[#D8C6AA] hidden sm:inline-block">
                    Private Salon
                  </span>
                </div>
                <span className="text-[9px] tracking-[0.3em] uppercase text-[#777B63] font-medium -mt-1 hidden sm:block">
                  Client Dashboard
                </span>
              </Link>
            </div>

            {/* Center: Private Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.label}
                    to={link.path}
                    className={`relative group text-xs tracking-widest uppercase py-1 transition-colors ${
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
                  </Link>
                );
              })}

              <Link
                to="/"
                className="text-xs tracking-wider uppercase text-[#777B63] hover:text-[#242522] transition-colors flex items-center gap-1 font-medium"
              >
                <span>Storefront</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </nav>

            {/* Right: Authenticated Utility Controls */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Search Button */}
              <button
                onClick={openSearch}
                aria-label="Search collection"
                className="p-2 text-[#242522] hover:text-[#777B63] transition-colors rounded-full hover:bg-[#EFE9DF]/50"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Wishlist Link */}
              <Link
                to="/account/wishlist"
                aria-label={`View saved pieces (${totalWishlistItems})`}
                className="relative p-2 text-[#242522] hover:text-[#777B63] transition-colors rounded-full hover:bg-[#EFE9DF]/50"
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                {totalWishlistItems > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-medium bg-[#777B63] text-white rounded-full">
                    {totalWishlistItems}
                  </span>
                )}
              </Link>

              {/* Shopping Bag Button */}
              <button
                onClick={openCart}
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

              {/* User Avatar & Account Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 p-1 pl-2 text-left rounded-full hover:bg-[#EFE9DF]/60 transition-colors focus:outline-none"
                  aria-expanded={dropdownOpen}
                  aria-label="Account options for Ayush"
                >
                  <div className="w-8 h-8 rounded-full bg-[#242522] text-[#D8C6AA] flex items-center justify-center text-xs font-semibold uppercase shadow-xs">
                    {user?.avatarInitials || 'A'}
                  </div>
                  <span className="hidden sm:inline-block text-xs font-medium text-[#242522] max-w-[80px] truncate">
                    {user?.firstName || 'Ayush'}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#5A5C55] transition-transform duration-200 hidden sm:block ${
                      dropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 mt-2 w-64 bg-white border border-[#E4DED4] shadow-modal-luxury rounded-none p-2 text-xs text-[#242522] z-50 overflow-hidden"
                    >
                      {/* User Header in Dropdown */}
                      <div className="p-3 bg-[#F8F6F1] border-b border-[#E4DED4] mb-1">
                        <div className="flex items-center justify-between">
                          <p className="font-serif text-base font-medium text-[#242522]">
                            {user?.fullName || user?.firstName || 'Client'}
                          </p>
                          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-[#D8C6AA] text-[#242522] font-semibold">
                            Private
                          </span>
                        </div>
                        <p className="text-[11px] text-[#5A5C55] font-light truncate mt-0.5">
                          {user?.email || ''}
                        </p>
                        <p className="text-[10px] text-[#777B63] font-medium uppercase tracking-wider mt-1.5 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#D8C6AA]" />
                          <span>Atelier Private Client</span>
                        </p>
                      </div>

                      {/* Dropdown Navigation Links */}
                      <div className="space-y-0.5 py-1">
                        <Link
                          to="/account/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-[#242522] hover:bg-[#F8F6F1] hover:text-[#777B63] transition-colors"
                        >
                          <User className="w-3.5 h-3.5 text-[#777B63]" />
                          <span>My Profile</span>
                        </Link>

                        <Link
                          to="/account/orders"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-[#242522] hover:bg-[#F8F6F1] hover:text-[#777B63] transition-colors"
                        >
                          <Package className="w-3.5 h-3.5 text-[#777B63]" />
                          <span>My Orders</span>
                        </Link>

                        <Link
                          to="/account/wishlist"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-[#242522] hover:bg-[#F8F6F1] hover:text-[#777B63] transition-colors"
                        >
                          <Heart className="w-3.5 h-3.5 text-[#777B63]" />
                          <span>My Wishlist ({totalWishlistItems})</span>
                        </Link>

                        <Link
                          to="/"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center justify-between px-3 py-2 text-[#5A5C55] hover:bg-[#F8F6F1] hover:text-[#242522] transition-colors border-t border-[#E4DED4]/60 mt-1 pt-2"
                        >
                          <span>Public Storefront</span>
                          <ExternalLink className="w-3 h-3 text-[#777B63]" />
                        </Link>
                      </div>

                      {/* Logout Action */}
                      <div className="pt-1 mt-1 border-t border-[#E4DED4]">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-[#A65B5B] hover:bg-[#FAF0F0] transition-colors text-left font-medium"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-[#242522]/40 backdrop-blur-sm z-50 lg:hidden"
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-[#F8F6F1] border-r border-[#E4DED4] z-50 flex flex-col justify-between p-6 shadow-drawer-luxury lg:hidden overflow-y-auto"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-[#E4DED4]">
                  <div>
                    <span className="font-serif text-2xl tracking-[0.2em] text-[#242522]">
                      AVELUNE
                    </span>
                    <span className="block text-[9px] uppercase tracking-wider text-[#777B63] font-medium">
                      Private Salon • {user?.firstName || 'Ayush'}
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-[#242522] hover:text-[#777B63] transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-8 space-y-3">
                  <Link
                    to="/account/home"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-left py-2.5 flex items-center justify-between text-base font-serif text-[#242522] hover:text-[#777B63] border-b border-[#E4DED4]/50 transition-colors"
                  >
                    <span>Private Edit</span>
                    <ArrowRight className="w-4 h-4 text-[#D8C6AA]" />
                  </Link>

                  <Link
                    to="/account/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-left py-2.5 flex items-center justify-between text-base font-serif text-[#242522] hover:text-[#777B63] border-b border-[#E4DED4]/50 transition-colors"
                  >
                    <span>My Orders</span>
                    <ArrowRight className="w-4 h-4 text-[#D8C6AA]" />
                  </Link>

                  <Link
                    to="/account/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-left py-2.5 flex items-center justify-between text-base font-serif text-[#242522] hover:text-[#777B63] border-b border-[#E4DED4]/50 transition-colors"
                  >
                    <span>My Wishlist ({totalWishlistItems})</span>
                    <ArrowRight className="w-4 h-4 text-[#D8C6AA]" />
                  </Link>

                  <Link
                    to="/account/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-left py-2.5 flex items-center justify-between text-base font-serif text-[#242522] hover:text-[#777B63] border-b border-[#E4DED4]/50 transition-colors"
                  >
                    <span>My Profile</span>
                    <ArrowRight className="w-4 h-4 text-[#D8C6AA]" />
                  </Link>

                  <Link
                    to="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-left py-2.5 flex items-center justify-between text-base font-serif text-[#5A5C55] hover:text-[#242522] border-b border-[#E4DED4]/50 transition-colors"
                  >
                    <span>Public Storefront</span>
                    <ExternalLink className="w-4 h-4 text-[#777B63]" />
                  </Link>
                </div>
              </div>

              <div className="pt-6 border-t border-[#E4DED4]">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-3 px-4 bg-white border border-[#A65B5B]/40 text-[#A65B5B] text-xs uppercase tracking-wider font-medium flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Atelier</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

