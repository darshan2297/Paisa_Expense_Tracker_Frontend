export type CreditCard = {
  id: string;
  name: string;
  bank: string;
  network: string;
  last4: string;
  credit_limit: string;
  outstanding: string;
  statement_day: number;
  due_day: number;
  opened_on: string | null;
  minimum_due: string;
  utilization_pct: number;
};

export type CardsSummary = {
  total_limit: string;
  total_outstanding: string;
  utilization_pct: number;
  cards: CreditCard[];
};

export type CreditCardCreatePayload = {
  name: string;
  bank: string;
  network?: string;
  last4: string;
  credit_limit: string;
  outstanding?: string;
  statement_day: number;
  due_day: number;
  opened_on?: string | null;
};

export type CardAmountPayload = {
  amount: string;
  note?: string | null;
  category_id?: string | null;
};

export type CardPaymentHistoryItem = {
  id: string;
  card_id: string;
  label: string;
  sub: string;
  amount: string;
  date: string;
};
