import { compactINR, formatINR } from '@/utils/currency';

describe('formatINR', () => {
  it('formats with Indian digit grouping', () => {
    expect(formatINR(1234567.5)).toBe('₹12,34,567.50');
  });

  it('formats a small amount', () => {
    expect(formatINR(500)).toBe('₹500.00');
  });
});

describe('compactINR', () => {
  it('returns the full amount below one lakh', () => {
    expect(compactINR(42000)).toBe('₹42,000.00');
  });

  it('switches to lakh form at the threshold', () => {
    expect(compactINR(100000)).toBe('₹1 L');
    expect(compactINR(350000)).toBe('₹3.5 L');
  });

  it('switches to crore form at the threshold', () => {
    expect(compactINR(10000000)).toBe('₹1 Cr');
    expect(compactINR(21000000)).toBe('₹2.1 Cr');
  });

  it('preserves the sign for negative amounts', () => {
    expect(compactINR(-350000)).toBe('-₹3.5 L');
  });

  it('drops a trailing .0', () => {
    expect(compactINR(200000)).toBe('₹2 L');
  });
});
