import type { CreditCard } from '@/features/cards/types';

export const MOCK_CARDS: CreditCard[] = [
  {
    id: 'c1',
    name: 'Millennia',
    bank: 'HDFC Bank',
    network: 'Visa Signature',
    last4: '4821',
    credit_limit: '350000',
    outstanding: '18450',
    statement_day: 26,
    due_day: 8,
    opened_on: '2022-03-11',
    minimum_due: '1850',
    utilization_pct: 5.3,
  },
  {
    id: 'c2',
    name: 'Amazon Pay',
    bank: 'ICICI Bank',
    network: 'Visa Platinum',
    last4: '9037',
    credit_limit: '200000',
    outstanding: '42600',
    statement_day: 18,
    due_day: 5,
    opened_on: '2023-08-02',
    minimum_due: '4260',
    utilization_pct: 21.3,
  },
  {
    id: 'c3',
    name: 'Magnus',
    bank: 'Axis Bank',
    network: 'Mastercard World',
    last4: '1164',
    credit_limit: '500000',
    outstanding: '96300',
    statement_day: 22,
    due_day: 12,
    opened_on: '2024-11-19',
    minimum_due: '9630',
    utilization_pct: 19.3,
  },
];

export function cardsSummaryFrom(cards: CreditCard[]) {
  const totalLimit = cards.reduce((s, c) => s + Number(c.credit_limit), 0);
  const totalOutstanding = cards.reduce((s, c) => s + Number(c.outstanding), 0);
  return {
    total_limit: String(totalLimit),
    total_outstanding: String(totalOutstanding),
    utilization_pct: totalLimit ? (totalOutstanding / totalLimit) * 100 : 0,
    cards,
  };
}
