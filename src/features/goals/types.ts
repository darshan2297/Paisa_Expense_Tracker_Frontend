export type Goal = {
  id: string;
  name: string;
  target_amount: string;
  saved_amount: string;
  monthly_contribution: string;
  is_emergency: boolean;
  due_day: number | null;
  remaining: string;
  pct_complete: number;
};

export type GoalCreatePayload = {
  name: string;
  target_amount: string;
  saved_amount?: string;
  monthly_contribution?: string;
  is_emergency?: boolean;
  due_day?: number | null;
};

export type GoalUpdatePayload = {
  name?: string;
  target_amount?: string;
  monthly_contribution?: string;
  due_day?: number | null;
};

export type GoalContributePayload = {
  amount: string;
  note?: string;
};

export type GoalSummary = {
  total_saved: string;
  active_count: number;
  emergency_saved: string;
  next_contributions: {
    goal_id: string;
    goal_name: string;
    amount: string;
    due_day: number | null;
  }[];
};

export type EmergencyFund = {
  goal_id: string | null;
  saved: string;
  target: string;
  monthly_expense_avg: string;
  months_of_expenses_covered: number;
  pct_complete: number;
};
