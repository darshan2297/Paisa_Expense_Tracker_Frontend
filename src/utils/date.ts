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

/** e.g. "Today, 9:02 AM" or "Yesterday, 9:14 PM" or "14 Jul 2026" */
export function formatRelativeDateTime(date: Date | string | number): string {
  const d = new Date(date);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayDiff = Math.round((startOfToday.getTime() - startOfTarget.getTime()) / 86_400_000);

  const timePart = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });

  if (dayDiff === 0) return `Today, ${timePart}`;
  if (dayDiff === 1) return `Yesterday, ${timePart}`;
  return formatShortDate(d);
}

/** e.g. "4.2 MB" */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
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
