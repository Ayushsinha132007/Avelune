/**
 * Format a number into standard Indian Rupee notation (INR) with currency symbol
 * e.g., 4490 -> ₹4,490
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export const FREE_SHIPPING_THRESHOLD = 1999;

export function calculateShippingProgress(currentTotal: number): {
  progressPercentage: number;
  remainingAmount: number;
  qualifiesForFreeShipping: boolean;
} {
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - currentTotal);
  const percentage = Math.min(100, Math.round((currentTotal / FREE_SHIPPING_THRESHOLD) * 100));
  
  return {
    progressPercentage: percentage,
    remainingAmount: remaining,
    qualifiesForFreeShipping: currentTotal >= FREE_SHIPPING_THRESHOLD,
  };
}

