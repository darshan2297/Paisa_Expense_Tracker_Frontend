export type BillFrequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export type BillKind = 'electricity' | 'internet' | 'mobile' | 'credit_card' | 'gas' | 'other';

export type Bill = {
  id: string;
  name: string;
  kind: BillKind;
  amount: string;
  due_date: string;
  frequency: BillFrequency;
  auto_pay: boolean;
  lead_days: number;
  note: string | null;
  paid_on: string | null;
  days_until_due: number;
  status_label: string;
  linked_transaction_id: string | null;
};

export type BillCreatePayload = {
  name: string;
  kind: BillKind;
  amount: string;
  due_date: string;
  frequency?: BillFrequency;
  auto_pay?: boolean;
  lead_days?: number;
  note?: string | null;
};

export type BillUpdatePayload = Partial<BillCreatePayload>;
