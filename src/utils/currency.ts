/**
 * Currency formatting helpers — Indian Rupee, en-IN locale (lakh/crore
 * grouping) throughout, since Paisa targets Indian users first.
 *
 * Ported 1:1 from the design mockup's `fmt` / `signed` / `compact` helpers:
 * whole rupees only (rounded, never paise), U+2212 minus for negatives.
 */

const inrGrouping = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

/** Full formatted amount, e.g. formatINR(1234567.5) -> "₹12,34,568" */
export function formatINR(amount: number): string {
  const n = Number.isFinite(amount) ? Math.round(amount) : 0;
  const sign = n < 0 ? '−' : '';
  return `${sign}₹${inrGrouping.format(Math.abs(n))}`;
}

/**
 * Compact lakh/crore form for tight UI spaces (stat tiles, chips).
 *
 * Mockup thresholds:
 *  - < 1,00,000     -> full amount, e.g. "₹42,000"
 *  - >= 1,00,000    -> lakhs, 1 decimal unless whole, e.g. "₹3.5 L" / "₹3 L"
 *  - >= 1,00,00,000 -> crores, 2 decimals unless whole, e.g. "₹1.17 Cr" / "₹2 Cr"
 */
export function compactINR(amount: number): string {
  const n = Number.isFinite(amount) ? amount : 0;
  const abs = Math.abs(n);
  const sign = n < 0 ? '−' : '';

  const CRORE = 1_00_00_000;
  const LAKH = 1_00_000;

  if (abs >= CRORE) {
    return `${sign}₹${(abs / CRORE).toFixed(abs % CRORE === 0 ? 0 : 2)} Cr`;
  }
  if (abs >= LAKH) {
    return `${sign}₹${(abs / LAKH).toFixed(abs % LAKH === 0 ? 0 : 1)} L`;
  }

  return formatINR(n);
}

/**
 * Reformats rupee amounts embedded inside a server-built sentence
 * ("You have spent ₹84850.00 against a ₹55000 limit…") to the mockup's
 * grouped whole-rupee form, preserving a +/− sign whether the source put it
 * before the ₹ ("−₹1234.56") or after ("₹-1234.56", as some backend-built
 * strings do) - either position is normalized the same way, since
 * formatINR/compactINR already place the sign correctly themselves.
 */
export function reformatEmbeddedINR(text: string, compact = false): string {
  return text.replace(
    /([+−-]?)₹\s*([+−-]?)\s*(\d+(?:\.\d+)?)/g,
    (_, signBefore: string, signAfter: string, num: string) => {
      const sign = signBefore || signAfter;
      const magnitude = Number(num);
      if (!Number.isFinite(magnitude)) return `${sign}₹${num}`;
      const value = sign === '-' || sign === '−' ? -magnitude : magnitude;
      return compact ? compactINR(value) : formatINR(value);
    },
  );
}
