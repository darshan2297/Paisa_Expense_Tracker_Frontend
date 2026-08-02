import { compactINR, formatINR } from '@/utils/currency';

export function fmt(n: number): string {
  return formatINR(Math.abs(n));
}

export function signed(n: number): string {
  return (n < 0 ? '−' : '') + formatINR(Math.abs(n));
}

export function compact(n: number): string {
  return compactINR(n);
}

export function pctWidth(value: number, max: number): string {
  return `${Math.max(4, (value / Math.max(1, max)) * 100)}%`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
