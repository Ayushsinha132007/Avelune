import React from 'react';
import { Link } from 'react-router-dom';

export interface AuthFooterProps {
  promptText: string;
  linkText: string;
  linkTo: string;
}

export const AuthFooter: React.FC<AuthFooterProps> = ({
  promptText,
  linkText,
  linkTo,
}) => {
  return (
    <div className="mt-8 text-center text-xs text-[#5A5C55] font-light">
      <span>{promptText} </span>
      <Link
        to={linkTo}
        className="text-[#242522] font-semibold underline underline-offset-4 decoration-[#D8C6AA] hover:text-[#777B63] hover:decoration-[#777B63] transition-colors"
      >
        {linkText}
      </Link>
    </div>
  );
};

