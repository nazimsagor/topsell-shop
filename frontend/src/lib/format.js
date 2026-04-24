// Currency & number formatting helpers for Bangladesh.
//
// The site stores product prices as plain numbers in the DB (whatever the
// admin entered). For a BD storefront we display them as Bangladeshi taka
// using the `৳` symbol and locale grouping.
//
// Use these helpers instead of hand-rolling `$${value.toFixed(2)}` in JSX.

export const CURRENCY_SYMBOL = '৳';

/**
 * Format a number as BDT. Always returns "৳X,XXX.XX".
 * Handles string inputs, null, NaN gracefully.
 */
export function formatBDT(value) {
  const n = typeof value === 'number' ? value : parseFloat(value);
  if (!Number.isFinite(n)) return `${CURRENCY_SYMBOL}0.00`;
  return `${CURRENCY_SYMBOL}${n.toLocaleString('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Format without decimal places — useful for thresholds like "৳5,000". */
export function formatBDTWhole(value) {
  const n = typeof value === 'number' ? value : parseFloat(value);
  if (!Number.isFinite(n)) return `${CURRENCY_SYMBOL}0`;
  return `${CURRENCY_SYMBOL}${Math.round(n).toLocaleString('en-BD')}`;
}
