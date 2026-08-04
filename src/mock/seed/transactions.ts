import type { Transaction } from '@/features/transactions/types';

import { categoryById } from './categories';

const ACCOUNT_ID = 'mock-account-1';

function tx(
  id: string,
  type: 'income' | 'expense',
  categoryId: string,
  amount: string,
  date: string,
  note: string,
): Transaction {
  return {
    id,
    account_id: ACCOUNT_ID,
    type,
    amount,
    currency: 'INR',
    date,
    note,
    category: categoryById(categoryId),
    created_at: `${date}T10:00:00Z`,
  };
}

/** August 2026 transactions — totals match Life Dashboard mock (₹88,350 in / ₹85,749 out). */
export const MOCK_TRANSACTIONS: Transaction[] = [
  tx('t1', 'income', 'cat-salary', '86000', '2026-08-01', 'Monthly salary'),
  tx('t3', 'income', 'cat-interest', '2350', '2026-08-07', 'FD interest'),
  tx('t4', 'expense', 'cat-rent', '24000', '2026-08-03', 'Flat rent'),
  tx('t5', 'expense', 'cat-rent', '18400', '2026-08-05', 'Home loan EMI'),
  tx('t6', 'expense', 'cat-groceries', '6540', '2026-08-06', 'Monthly stock-up'),
  tx('t7', 'expense', 'cat-groceries', '1450', '2026-08-05', 'Weekend run'),
  tx('t8', 'expense', 'cat-utilities', '2490', '2026-08-08', 'Electricity + water'),
  tx('t9', 'expense', 'cat-transport', '3220', '2026-08-11', 'Fuel & cabs'),
  tx('t10', 'expense', 'cat-transport', '9250', '2026-08-10', 'Car loan EMI'),
  tx('t11', 'expense', 'cat-transport', '320', '2026-08-04', 'Auto fare'),
  tx('t12', 'expense', 'cat-food', '5060', '2026-08-15', 'Eating out'),
  tx('t13', 'expense', 'cat-food', '780', '2026-08-02', 'Team lunch'),
  tx('t14', 'expense', 'cat-shopping', '3680', '2026-08-19', 'Clothes'),
  tx('t15', 'expense', 'cat-health', '1400', '2026-08-22', 'Pharmacy'),
  tx('t16', 'expense', 'cat-entertainment', '1280', '2026-08-25', 'Streaming & movies'),
  tx('t17', 'expense', 'cat-entertainment', '1600', '2026-08-26', 'Movies'),
  tx('t18', 'expense', 'cat-other', '6800', '2026-08-12', 'Personal loan EMI'),
  tx('t19', 'expense', 'cat-other', '899', '2026-08-22', 'Streaming & cloud'),
];
