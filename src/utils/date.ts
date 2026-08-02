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
