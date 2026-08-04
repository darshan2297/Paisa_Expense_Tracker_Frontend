export type NetWorthPart = {
  label: string;
  value: string;
  color: string;
};

export type LifeMetric = {
  label: string;
  value: string;
  sub: string;
  color: string;
};

export type ActivityItem = {
  id: string;
  title: string;
  sub: string;
  amount: string;
  amountColor: string;
  initial: string;
  bg: string;
  fg: string;
};

export type UpcomingItem = {
  id: string;
  label: string;
  sub: string;
  amount: string;
};

export type GoalProgress = {
  id: string;
  name: string;
  pct: string;
  width: string;
  color: string;
};

export type LifeDashboardData = {
  userName: string;
  userInitials: string;
  month: string;
  netWorth: string;
  netWorthDelta: string;
  netWorthDeltaPositive: boolean;
  nwParts: NetWorthPart[];
  budget: number;
  budgetLeft: number;
  budgetUsedPct: number;
  budgetOver: boolean;
  budgetNote: string;
  showBudgetAlert: boolean;
  alertTitle: string;
  alertBody: string;
  forecast: {
    predicted: string;
    spent: string;
    budget: string;
    spentWidthPct: number;
    predictedWidthPct: number;
    overBudget: boolean;
    safeDaily: string;
    expectedSavings: string;
    note: string;
  };
  lifeTiles: LifeMetric[];
  recent: ActivityItem[];
  upcoming: UpcomingItem[];
  goals: GoalProgress[];
  reminderCount: number;
};

/** Raw API response shape from GET /dashboard/life */
export type LifeDashboardApiResponse = {
  user_name: string;
  month: string;
  net_worth: string | number;
  net_worth_delta: string | number | null;
  nw_parts: { label: string; value: string | number }[];
  budget: string | number;
  budget_left: string | number;
  budget_used_pct: number;
  budget_over: boolean;
  show_budget_alert: boolean;
  alert_title: string;
  alert_body: string;
  forecast: {
    predicted: string | number;
    spent: string | number;
    budget: string | number;
    over_budget: boolean;
    safe_daily: string | number;
    expected_savings: string | number;
    note: string;
  };
  life_tiles: { label: string; value: string; sub: string }[];
  recent: { id: string; title: string; sub: string; amount: string; initial: string }[];
  upcoming: { id: string; label: string; sub: string; amount: string }[];
  goals: { id: string; name: string; pct: number }[];
  reminder_count: number;
};
