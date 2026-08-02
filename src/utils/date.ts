/**
 * Date formatting helpers — en-IN locale throughout so dates read naturally
 * for Indian users (DD/MM/YYYY-style ordering, "date month year" prose).
 */

/** e.g. "2 Aug 2026" */
export function formatShortDate(date: Date | string | number): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** e.g. "2 August 2026" */
export function formatLongDate(date: Date | string | number): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** e.g. "2 Aug, 4:30 pm" */
export function formatDateTime(date: Date | string | number): string {
  const d = new Date(date);
  const datePart = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const timePart = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
  return `${datePart}, ${timePart}`;
}

/** e.g. "Aug 2026" — used for month-grouped ledgers/statements. */
export function formatMonthYear(date: Date | string | number): string {
  return new Date(date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

/**
 * "YYYY-MM" month-scoping helpers, shared by the Overview/Transactions/
 * Planned screens - each keeps its own selected-month `useState`, but all
 * three navigate it the same way (prev/next month, "this month" default).
 */

/** e.g. "2026-08" for the current wall-clock month. */
export function currentYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/** `shiftYearMonth("2026-08", -1)` -> `"2026-07"`. */
export function shiftYearMonth(yearMonth: string, delta: number): string {
  const [year, month] = yearMonth.split('-').map(Number);
  const shifted = new Date(year, month - 1 + delta, 1);
  return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, '0')}`;
}

/** `formatYearMonthLabel("2026-08")` -> `"August 2026"`. */
export function formatYearMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });
}
