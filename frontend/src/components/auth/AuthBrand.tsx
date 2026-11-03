import React from 'react';
import { Link } from 'react-router-dom';

export interface AuthBrandProps {
  className?: string;
  showTagline?: boolean;
}

export const AuthBrand: React.FC<AuthBrandProps> = ({
  className = '',
  showTagline = true,
}) => {
  return (
    <Link
      to="/"
      className={`inline-flex flex-col items-center group ${className}`}
      aria-label="AVELUNE Home"
    >
      <span className="font-serif text-3xl sm:text-4xl tracking-[0.22em] font-normal text-[#242522] transition-colors group-hover:text-[#777B63]">
        AVELUNE
      </span>
      {showTagline && (
        <span className="text-[9px] tracking-[0.3em] uppercase text-[#777B63] font-medium -mt-1">
          Atelier & Considered Essentials
        </span>
      )}
    </Link>
  );
};

