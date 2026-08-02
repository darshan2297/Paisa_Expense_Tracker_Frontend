/**
 * Currency formatting helpers — Indian Rupee, en-IN locale (lakh/crore
 * grouping) throughout, since Paisa targets Indian users first.
 */

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

/** Full formatted amount, e.g. formatINR(1234567.5) -> "₹12,34,567.50" */
export function formatINR(amount: number): string {
  return inrFormatter.format(amount);
}

/**
 * Compact lakh/crore form for tight UI spaces (stat tiles, chips).
 *
 * formatINR-style thresholds:
 *  - < 1,00,000            -> full amount, e.g. "₹42,000"
 *  - >= 1,00,000           -> lakhs, e.g. "₹3.5 L"
 *  - >= 1,00,00,000        -> crores, e.g. "₹2.1 Cr"
 */
export function compactINR(amount: number): string {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  const CRORE = 1_00_00_000;
  const LAKH = 1_00_000;

  if (absAmount >= CRORE) {
    return `${sign}₹${trimDecimals(absAmount / CRORE)} Cr`;
  }
  if (absAmount >= LAKH) {
    return `${sign}₹${trimDecimals(absAmount / LAKH)} L`;
  }

  return `${sign}${inrFormatter.format(absAmount).replace('-', '')}`;
}

/** Formats to at most 1 decimal place, dropping a trailing ".0". */
function trimDecimals(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}
