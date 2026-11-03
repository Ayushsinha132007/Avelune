import React from 'react';

export interface AuthDividerProps {
  label?: string;
}

export const AuthDivider: React.FC<AuthDividerProps> = ({
  label = 'OR CONTINUE WITH',
}) => {
  return (
    <div className="relative flex items-center justify-center my-6 w-full">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-[#E4DED4]" />
      </div>
      <div className="relative bg-[#F8F6F1] px-3">
        <span className="text-[10px] tracking-widest uppercase font-medium text-[#777B63]">
          {label}
        </span>
      </div>
    </div>
  );
};

