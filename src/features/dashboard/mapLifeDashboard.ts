import type { LifeDashboardApiResponse, LifeDashboardData } from './types';
import { compactINR, formatINR, reformatEmbeddedINR } from '@/utils/currency';
import { safeNumber } from '@/utils/numbers';

const TILE_COLORS = [
  '#23694E',
  '#B04A34',
  '#14120F',
  '#2F7D6E',
  '#3E6E9E',
  '#5B54D6',
  '#C2543D',
  '#96702C',
];

const NW_PART_COLORS = ['#5B54D6', '#3E6E9E', '#2F7D5D', '#C2543D'];

const GOAL_COLORS = ['#2F7D5D', '#5B54D6', '#3E6E9E', '#96702C'];

const ACTIVITY_PALETTE = [
  { bg: '#FAEED8', fg: '#96702C' },
  { bg: '#E2F0E9', fg: '#2F7D5D' },
  { bg: '#EDE9FE', fg: '#5B54D6' },
  { bg: '#E5EEF8', fg: '#3E6E9E' },
  { bg: '#F9E7E1', fg: '#C2543D' },
];

function num(value: string | number | null | undefined): number {
  return safeNumber(value, 0);
}

/** Tiles the mockup renders in compact lakh/crore form (`cmp`) vs. full rupees (`fmt`). */
const COMPACT_TILE_LABELS = new Set([
  'Portfolio value',
  'Bank & cash',
  'Assets',
  'Loan outstanding',
]);

function formatTileValue(label: string, raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '—';
  if (trimmed.includes(' mo') || trimmed.includes('%')) {
    return trimmed;
  }
  const parsed = safeNumber(trimmed.replace(/[₹,+\s]/g, '').replace('−', '-'), NaN);
  if (!Number.isFinite(parsed)) return trimmed;
  return COMPACT_TILE_LABELS.has(label) ? compactINR(parsed) : formatINR(parsed);
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase();
}

function activityColors(index: number, amount: string) {
  const palette = ACTIVITY_PALETTE[index % ACTIVITY_PALETTE.length]!;
  const isIncome = amount.startsWith('+');
  return {
    amountColor: isIncome ? '#23694E' : '#B04A34',
    bg: palette.bg,
    fg: palette.fg,
  };
}

export function mapLifeDashboardResponse(raw: LifeDashboardApiResponse): LifeDashboardData {
  const budget = num(raw.budget);
  const budgetLeft = num(raw.budget_left);
  const spent = num(raw.forecast.spent);
  const predicted = num(raw.forecast.predicted);
  const delta = num(raw.net_worth_delta);
  const predictedCap = Math.max(predicted, budget, spent, 1);

  return {
    userName: raw.user_name,
    userInitials: initials(raw.user_name),
    month: raw.month,
    netWorth: compactINR(num(raw.net_worth)),
    netWorthDelta:
      delta === 0
        ? 'No change this month'
        : `${delta > 0 ? '+' : ''}${formatINR(delta)} this month`,
    netWorthDeltaPositive: delta >= 0,
    nwParts: raw.nw_parts.map((part, i) => ({
      label: part.label,
      value: compactINR(num(part.value)),
      color: NW_PART_COLORS[i % NW_PART_COLORS.length]!,
    })),
    budget,
    budgetLeft,
    budgetUsedPct: raw.budget_used_pct,
    budgetOver: raw.budget_over,
    budgetNote: `${formatINR(spent)} of ${formatINR(budget)} used`,
    showBudgetAlert: raw.show_budget_alert,
    alertTitle: reformatEmbeddedINR(raw.alert_title),
    alertBody: reformatEmbeddedINR(raw.alert_body),
    forecast: {
      predicted: formatINR(predicted),
      spent: formatINR(spent),
      budget: formatINR(budget),
      spentWidthPct: Math.min(100, Math.round((spent / predictedCap) * 100)),
      predictedWidthPct: Math.min(100, Math.round((predicted / predictedCap) * 100)),
      overBudget: raw.forecast.over_budget,
      safeDaily: formatINR(num(raw.forecast.safe_daily)),
      expectedSavings: formatINR(num(raw.forecast.expected_savings)),
      note: reformatEmbeddedINR(raw.forecast.note),
    },
    lifeTiles: raw.life_tiles.map((tile, i) => ({
      label: tile.label,
      value: formatTileValue(tile.label, tile.value),
      sub: reformatEmbeddedINR(tile.sub, true),
      color: TILE_COLORS[i % TILE_COLORS.length]!,
    })),
    recent: raw.recent.map((item, i) => {
      const colors = activityColors(i, item.amount);
      return {
        id: item.id,
        title: item.title,
        sub: item.sub,
        amount: reformatEmbeddedINR(item.amount),
        amountColor: colors.amountColor,
        initial: item.initial,
        bg: colors.bg,
        fg: colors.fg,
      };
    }),
    upcoming: raw.upcoming.map((item) => ({
      ...item,
      amount: reformatEmbeddedINR(item.amount),
    })),
    goals: raw.goals.map((goal, i) => ({
      id: goal.id,
      name: goal.name,
      pct: `${goal.pct}%`,
      width: `${Math.min(100, goal.pct)}%`,
      color: GOAL_COLORS[i % GOAL_COLORS.length]!,
    })),
    reminderCount: raw.reminder_count,
  };
}

export function emptyLifeDashboard(month: string): LifeDashboardData {
  return {
    userName: 'User',
    userInitials: 'U',
    month,
    netWorth: formatINR(0),
    netWorthDelta: 'No change this month',
    netWorthDeltaPositive: true,
    nwParts: [],
    budget: 0,
    budgetLeft: 0,
    budgetUsedPct: 0,
    budgetOver: false,
    budgetNote: `${formatINR(0)} of ${formatINR(0)} used`,
    showBudgetAlert: false,
    alertTitle: '',
    alertBody: '',
    forecast: {
      predicted: formatINR(0),
      spent: formatINR(0),
      budget: formatINR(0),
      spentWidthPct: 0,
      predictedWidthPct: 0,
      overBudget: false,
      safeDaily: formatINR(0),
      expectedSavings: formatINR(0),
      note: 'Add transactions to see your forecast.',
    },
    lifeTiles: [],
    recent: [],
    upcoming: [],
    goals: [],
    reminderCount: 0,
  };
}
