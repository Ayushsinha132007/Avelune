import React from 'react';

export interface PasswordStrengthIndicatorProps {
  password?: string;
}

export function calculatePasswordStrength(password: string): {
  score: number; // 0 to 4
  label: string;
  feedback: string;
} {
  if (!password) {
    return { score: 0, label: '', feedback: '' };
  }

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  switch (score) {
    case 1:
      return {
        score: 1,
        label: 'Weak',
        feedback: 'Use 8+ characters with a mix of letters & numbers.',
      };
    case 2:
      return {
        score: 2,
        label: 'Fair',
        feedback: 'Add numbers or special symbols to strengthen.',
      };
    case 3:
      return {
        score: 3,
        label: 'Good',
        feedback: 'Solid password. Almost optimal.',
      };
    case 4:
      return {
        score: 4,
        label: 'Strong',
        feedback: 'Exceptional security for your atelier account.',
      };
    default:
      return {
        score: 0,
        label: 'Too short',
        feedback: 'Minimum 8 characters required.',
      };
  }
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password = '',
}) => {
  if (!password) return null;

  const { score, label, feedback } = calculatePasswordStrength(password);

  const getBarColor = (index: number) => {
    if (index >= score) return 'bg-[#E4DED4]';
    if (score === 1) return 'bg-[#A65B5B]';
    if (score === 2) return 'bg-[#D8C6AA]';
    return 'bg-[#777B63]';
  };

  return (
    <div className="w-full mt-2 text-left space-y-1.5">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-medium">
        <span className="text-[#5A5C55]">Security Strength</span>
        <span
          className={`font-semibold ${
            score <= 1
              ? 'text-[#A65B5B]'
              : score === 2
              ? 'text-[#D8C6AA]'
              : 'text-[#777B63]'
          }`}
        >
          {label}
        </span>
      </div>

      {/* 4 segments */}
      <div className="grid grid-cols-4 gap-1.5 h-1 w-full">
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            className={`h-full rounded-full transition-colors duration-300 ${getBarColor(idx)}`}
          />
        ))}
      </div>

      <p className="text-[10px] text-[#5A5C55]/80 font-light">{feedback}</p>
    </div>
  );
};

