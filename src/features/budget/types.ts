import type { Category } from '@/features/categories/types';

export type BudgetSettings = {
  monthly_amount: string;
  alert_pct: number;
  reminder_lead_days: number;
};

export type BudgetSettingsUpdatePayload = BudgetSettings;

export type BudgetSummary = {
  monthly_amount: string;
  spent: string;
  remaining: string;
  pct_remaining: number;
  per_day_left: string;
  days_remaining_in_month: number;
  alert_triggered: boolean;
  over_by: string;
};

export type FixedCommitmentKind = 'emi' | 'home_loan' | 'personal_loan' | 'subscription' | 'bill';

export type FixedCommitment = {
  id: string;
  name: string;
  category: Category;
  amount: string;
  due_day: number;
  kind: FixedCommitmentKind;
  paid_this_month: boolean;
  linked_transaction_id: string | null;
};

export type FixedCommitmentCreatePayload = {
  name: string;
  category_id: string;
  amount: string;
  due_day: number;
  kind: FixedCommitmentKind;
};

export type FixedCommitmentUpdatePayload = Partial<FixedCommitmentCreatePayload>;
