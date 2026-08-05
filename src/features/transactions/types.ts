import type { Category } from '@/features/categories/types';

export type TransactionType = 'expense' | 'income';

export type PaymentMethod = 'cash' | 'upi' | 'card' | 'netbanking' | 'cheque' | 'other';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  upi: 'UPI',
  card: 'Card',
  netbanking: 'Net banking',
  cheque: 'Cheque',
  other: 'Other',
};

export type Transaction = {
  id: string;
  account_id: string;
  type: TransactionType;
  /** Decimal, serialized by the backend as a string (e.g. "1450.50") to
   * preserve exact precision - never parse to a JS `number` for display,
   * only for arithmetic (and even then prefer server-computed totals).
   */
  amount: string;
  currency: string;
  date: string; // "YYYY-MM-DD"
  note: string | null;
  payment_method?: PaymentMethod | null;
  category: Category;
  created_at: string;
  has_receipt?: boolean;
  receipt_url?: string | null;
};

export type TransactionListResponse = {
  data: Transaction[];
  total: number;
  page: number;
  size: number;
  pages: number;
};

export type CategoryBreakdownItem = {
  category_id: string;
  name: string;
  color: string;
  amount: string;
  pct: number;
};

export type TransactionsSummary = {
  income_total: string;
  expense_total: string;
  net_balance: string;
  category_breakdown: CategoryBreakdownItem[];
  recent: Transaction[];
};

export type TransactionCreatePayload = {
  type: TransactionType;
  category_id: string;
  amount: string;
  date: string;
  note?: string | null;
  payment_method?: PaymentMethod | null;
};

export type TransactionFilters = {
  month: string;
  type?: TransactionType;
  q?: string;
  page?: number;
  size?: number;
};
