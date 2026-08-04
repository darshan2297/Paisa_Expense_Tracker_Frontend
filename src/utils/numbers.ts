/** Parse API / form values to a finite number; fallback when missing or invalid. */
export function safeNumber(value: string | number | null | undefined, fallback = 0): number {
  if (value == null || value === '') return fallback;
  const n = typeof value === 'number' ? value : Number(String(value).replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : fallback;
}
