/**
 * Mock dashboard data — values match the design HTML seed for August 2026.
 *
 * Replace with API hooks when backend is ready (see `USE_MOCK_DATA` in
 * `src/config/dataSource.ts`).
 */

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

/** Static mock — no async loading, no API dependency. */
export function getLifeDashboardMock(): LifeDashboardData {
  return {
    userName: 'Darshan',
    userInitials: 'D',
    month: '2026-08',
    netWorth: '₹72.9 L',
    netWorthDelta: '+₹45,489 this month',
    netWorthDeltaPositive: true,
    nwParts: [
      { label: 'Portfolio', value: '₹12.7 L', color: '#5B54D6' },
      { label: 'Assets', value: '₹74.2 L', color: '#3E6E9E' },
      { label: 'Cash & goals', value: '₹10.3 L', color: '#2F7D5D' },
      { label: 'Liabilities', value: '−₹24.3 L', color: '#C2543D' },
    ],
    budget: 55000,
    budgetLeft: -30749,
    budgetUsedPct: 156,
    budgetOver: true,
    budgetNote: '₹85,749 of ₹55,000 used',
    showBudgetAlert: true,
    alertTitle: 'Budget exceeded by ₹30,749',
    alertBody: 'You have spent ₹85,749 against a ₹55,000 limit this month.',
    forecast: {
      predicted: '₹1,06,329',
      spent: '₹85,749',
      budget: '₹55,000',
      spentWidthPct: 78,
      predictedWidthPct: 97,
      overBudget: true,
      safeDaily: '₹0',
      expectedSavings: '−₹17,979',
      note: 'At this pace you will finish ₹51,329 over budget.',
    },
    lifeTiles: [
      {
        label: 'Monthly income',
        value: '₹88,350',
        sub: 'credited this month',
        color: '#23694E',
      },
      {
        label: 'Monthly expenses',
        value: '₹85,749',
        sub: '156% of budget',
        color: '#B04A34',
      },
      {
        label: 'Saved this month',
        value: '₹2,601',
        sub: '3% savings rate',
        color: '#14120F',
      },
      {
        label: 'Portfolio value',
        value: '₹12.7 L',
        sub: '+₹1.2 L overall',
        color: '#2F7D6E',
      },
      {
        label: 'Bank & cash',
        value: '₹2.6 L',
        sub: 'liquid right now',
        color: '#3E6E9E',
      },
      {
        label: 'Assets',
        value: '₹76.9 L',
        sub: '8 tracked',
        color: '#5B54D6',
      },
      {
        label: 'Loan outstanding',
        value: '₹24.3 L',
        sub: '3 active loans',
        color: '#C2543D',
      },
      {
        label: 'Emergency fund',
        value: '2.2 mo',
        sub: '₹1.85 L set aside',
        color: '#96702C',
      },
    ],
    recent: [
      {
        id: 'r1',
        title: 'Entertainment',
        sub: 'Aug 25 · Streaming & movies',
        amount: '−₹1,600',
        amountColor: '#B04A34',
        initial: 'E',
        bg: '#FAEED8',
        fg: '#96702C',
      },
      {
        id: 'r2',
        title: 'Health',
        sub: 'Aug 22 · Pharmacy',
        amount: '−₹1,400',
        amountColor: '#B04A34',
        initial: 'H',
        bg: '#E2F0E9',
        fg: '#2F7D5D',
      },
      {
        id: 'r3',
        title: 'Salary',
        sub: 'Aug 1 · Monthly salary',
        amount: '+₹86,000',
        amountColor: '#23694E',
        initial: 'S',
        bg: '#EDE9FE',
        fg: '#5B54D6',
      },
      {
        id: 'r4',
        title: 'Groceries',
        sub: 'Aug 5 · Weekend run',
        amount: '−₹1,450',
        amountColor: '#B04A34',
        initial: 'G',
        bg: '#E5EEF8',
        fg: '#3E6E9E',
      },
    ],
    upcoming: [
      {
        id: 'u1',
        label: 'Emergency fund contribution',
        sub: 'in 3 days · monthly',
        amount: '₹12,000',
      },
      {
        id: 'u2',
        label: 'Japan trip 2027 contribution',
        sub: 'in 5 days · monthly',
        amount: '₹9,000',
      },
      {
        id: 'u3',
        label: 'Term plan premium',
        sub: 'in 8 days · yearly',
        amount: '₹14,200',
      },
    ],
    goals: [
      { id: 'g1', name: 'Emergency fund', pct: '62%', width: '62%', color: '#2F7D5D' },
      { id: 'g2', name: 'Japan trip 2027', pct: '25%', width: '25%', color: '#5B54D6' },
      { id: 'g3', name: 'New laptop', pct: '80%', width: '80%', color: '#3E6E9E' },
      { id: 'g4', name: 'Home down payment', pct: '28%', width: '28%', color: '#96702C' },
    ],
    reminderCount: 3,
  };
}
