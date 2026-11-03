import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AuthBrand } from './AuthBrand';
import { ToastNotification } from '../ToastNotification';

export interface AuthLayoutProps {
  children: React.ReactNode;
  imageSrc?: string;
  editorialHeadline?: string;
  editorialSubtitle?: string;
  editorialPlate?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  imageSrc = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=85&w=1600&auto=format&fit=crop',
  editorialHeadline = 'A more considered way to shop.',
  editorialSubtitle = 'Your personal space for the pieces you love.',
  editorialPlate = 'Plate 04 • Natural Fibers & Architectural Living • Autumn / Winter 2026',
}) => {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8F6F1] text-[#242522] selection:bg-[#D8C6AA] selection:text-[#242522]">
      
      {/* ================= LEFT PANEL: Editorial Lifestyle Imagery (Desktop: 50% width) ================= */}
      <div className="hidden lg:relative lg:flex lg:w-1/2 min-h-screen overflow-hidden bg-[#EFE9DF]">
        {/* Background Editorial Image with subtle zoom / pan effect */}
        <motion.img
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          src={imageSrc}
          alt="AVELUNE Atelier Lifestyle Editorial"
          className="w-full h-full object-cover object-center filter saturate-[0.92] contrast-[1.02]"
        />

        {/* Subtle Dark Vignette Overlay for Typographic Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#242522]/85 via-[#242522]/35 to-[#242522]/20" />

        {/* Top-Left Brand Logo & Return Action */}
        <div className="absolute top-8 left-8 z-10 flex items-center justify-between w-[calc(100%-4rem)]">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#F8F6F1]/80 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 text-[#D8C6AA] group-hover:-translate-x-1 transition-transform" />
            <span>Return to Storefront</span>
          </Link>

          <span className="text-[10px] uppercase tracking-widest text-[#D8C6AA] font-medium border border-[#D8C6AA]/40 px-2.5 py-1">
            AVELUNE Atelier ID
          </span>
        </div>

        {/* Bottom Editorial Copy & Plate Caption */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-x-0 bottom-0 p-12 text-[#F8F6F1] z-10 max-w-xl"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-[1px] bg-[#D8C6AA]" />
            <span className="text-[11px] uppercase tracking-widest text-[#D8C6AA] font-medium">
              Client Portal
            </span>
          </div>

          <h2 className="font-serif text-3xl xl:text-4xl font-normal leading-tight text-[#F8F6F1]">
            {editorialHeadline}
          </h2>

          <p className="mt-3 text-sm text-[#F8F6F1]/80 font-light leading-relaxed">
            {editorialSubtitle}
          </p>

          <div className="mt-8 pt-5 border-t border-white/20 text-[10px] uppercase tracking-wider text-[#F8F6F1]/60 font-light flex items-center justify-between">
            <span>{editorialPlate}</span>
            <span>Ref. 2026 // Vol. IV</span>
          </div>
        </motion.div>
      </div>

      {/* ================= RIGHT PANEL: Authentication Form Experience ================= */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-y-auto">
        
        {/* Top Header Row on Right Panel */}
        <div className="w-full flex items-center justify-between pb-6">
          <Link
            to="/"
            className="lg:hidden flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#777B63] hover:text-[#242522] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </Link>

          {/* Desktop Subtle Nav Status */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-[#777B63] ml-auto">
            <span>AVELUNE Encrypted Access</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#777B63]" />
          </div>
        </div>

        {/* Mobile Cropped Editorial Banner */}
        <div className="lg:hidden w-full aspect-[21/9] sm:aspect-[16/7] mb-6 overflow-hidden rounded-xs relative bg-[#EFE9DF]">
          <img
            src={imageSrc}
            alt="AVELUNE Atelier"
            className="w-full h-full object-cover filter saturate-[0.9]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#242522]/80 via-transparent to-transparent flex items-end p-4">
            <p className="font-serif text-lg text-white font-light">
              "A more considered way to shop."
            </p>
          </div>
        </div>

        {/* Center Container: max-w-[420px] */}
        <div className="w-full max-w-[420px] mx-auto my-auto py-4">
          {/* Brand Wordmark at top */}
          <div className="text-center mb-8">
            <AuthBrand />
          </div>

          {/* Form Content */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </div>

        {/* Bottom Legal / Copyright */}
        <div className="w-full text-center pt-8 text-[11px] text-[#5A5C55]/70 font-light border-t border-[#E4DED4]/60 mt-8">
          <p>© 2026 AVELUNE Atelier & Co. All rights reserved. Encrypted 256-bit SSL authentication.</p>
        </div>
      </div>

      {/* Floating Notifications */}
      <ToastNotification />
    </div>
  );
};
