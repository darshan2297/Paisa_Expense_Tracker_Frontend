import { compactINR, formatINR, reformatEmbeddedINR } from '@/utils/currency';

describe('formatINR', () => {
  it('formats with Indian digit grouping, whole rupees', () => {
    expect(formatINR(1234567.5)).toBe('₹12,34,568');
  });

  it('formats a small amount without paise', () => {
    expect(formatINR(500)).toBe('₹500');
  });

  it('uses the U+2212 minus for negatives', () => {
    expect(formatINR(-16864)).toBe('−₹16,864');
  });
});

describe('compactINR', () => {
  it('returns the full amount below one lakh', () => {
    expect(compactINR(42000)).toBe('₹42,000');
  });

  it('switches to lakh form at the threshold', () => {
    expect(compactINR(100000)).toBe('₹1 L');
    expect(compactINR(350000)).toBe('₹3.5 L');
  });

  it('uses two decimals for non-whole crores (mockup style)', () => {
    expect(compactINR(10000000)).toBe('₹1 Cr');
    expect(compactINR(11700000)).toBe('₹1.17 Cr');
  });

  it('preserves the sign for negative amounts', () => {
    expect(compactINR(-350000)).toBe('−₹3.5 L');
  });

  it('keeps one decimal for non-whole lakhs', () => {
    expect(compactINR(200000)).toBe('₹2 L');
    expect(compactINR(7290000)).toBe('₹72.9 L');
  });
});

describe('reformatEmbeddedINR', () => {
  it('regroups raw amounts inside sentences', () => {
    expect(reformatEmbeddedINR('You have spent ₹84850.00 against a ₹55000 limit.')).toBe(
      'You have spent ₹84,850 against a ₹55,000 limit.',
    );
  });

  it('keeps the sign in front of the rupee symbol', () => {
    expect(reformatEmbeddedINR('+₹1000.00')).toBe('+₹1,000');
    expect(reformatEmbeddedINR('−₹1600.00')).toBe('−₹1,600');
  });

  it('compacts large amounts when asked', () => {
    expect(reformatEmbeddedINR('₹190000 set aside', true)).toBe('₹1.9 L set aside');
  });
});
