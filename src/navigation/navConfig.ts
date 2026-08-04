import type { Feather } from '@expo/vector-icons';

export type NavItemId =
  | 'life'
  | 'overview'
  | 'transactions'
  | 'bills'
  | 'calendar'
  | 'people'
  | 'shared'
  | 'cards'
  | 'planned'
  | 'wealth'
  | 'emergency'
  | 'policy'
  | 'networth'
  | 'assets'
  | 'loans'
  | 'health'
  | 'insights'
  | 'heatmap'
  | 'review'
  | 'timeline'
  | 'reports'
  | 'scanner'
  | 'import'
  | 'security'
  | 'profile';

export type NavItem = {
  id: NavItemId;
  label: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  href: `/(tabs)/${string}` | '/(tabs)';
  badge?: number;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

const R = (id: string): `/(tabs)/${string}` | '/(tabs)' =>
  id === 'life' || id === 'index' ? '/(tabs)' : (`/(tabs)/${id}` as `/(tabs)/${string}`);

/** Sidebar + mobile pill navigation — full design HTML `navDef`. */
export const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Daily',
    items: [
      { id: 'life', label: 'Life Dashboard', icon: 'grid', href: R('life') },
      { id: 'overview', label: 'This Month', icon: 'home', href: R('overview') },
      { id: 'transactions', label: 'Transactions', icon: 'list', href: R('transactions') },
      { id: 'bills', label: 'Bills & Reminders', icon: 'bookmark', href: R('bills') },
      { id: 'calendar', label: 'Cash Flow', icon: 'calendar', href: R('calendar') },
      { id: 'people', label: 'People', icon: 'users', href: R('people') },
      { id: 'shared', label: 'Shared Expenses', icon: 'users', href: R('shared') },
      { id: 'cards', label: 'Credit Cards', icon: 'credit-card', href: R('cards') },
    ],
  },
  {
    title: 'Plan',
    items: [
      { id: 'planned', label: 'Budget & Fixed', icon: 'target', href: R('planned') },
      { id: 'wealth', label: 'Savings & Invest', icon: 'bar-chart-2', href: R('wealth') },
      { id: 'emergency', label: 'Emergency Fund', icon: 'shield', href: R('emergency') },
      { id: 'policy', label: 'Policies', icon: 'shield', href: R('policy') },
    ],
  },
  {
    title: 'Wealth',
    items: [
      { id: 'networth', label: 'Net Worth', icon: 'trending-up', href: R('networth') },
      { id: 'assets', label: 'Assets', icon: 'home', href: R('assets') },
      { id: 'loans', label: 'Loans', icon: 'credit-card', href: R('loans') },
    ],
  },
  {
    title: 'Review',
    items: [
      { id: 'health', label: 'Financial Health', icon: 'activity', href: R('health') },
      { id: 'insights', label: 'Insights', icon: 'bar-chart', href: R('insights') },
      { id: 'heatmap', label: 'Spending Heatmap', icon: 'grid', href: R('heatmap') },
      { id: 'review', label: 'Monthly Review', icon: 'file-text', href: R('review') },
      { id: 'timeline', label: 'Timeline', icon: 'git-branch', href: R('timeline') },
      { id: 'reports', label: 'Reports', icon: 'file', href: R('reports') },
    ],
  },
  {
    title: 'Tools',
    items: [
      { id: 'scanner', label: 'Receipt Scanner', icon: 'camera', href: R('scanner') },
      { id: 'import', label: 'Import Statement', icon: 'upload', href: R('import') },
      { id: 'security', label: 'Security & Privacy', icon: 'shield', href: R('security') },
    ],
  },
];

export const FLAT_NAV = NAV_GROUPS.flatMap((g) => g.items);

export const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  life: { title: 'Life Dashboard', subtitle: 'Everything about your money, Darshan.' },
  index: { title: 'Life Dashboard', subtitle: 'Everything about your money, Darshan.' },
  overview: { title: 'This Month', subtitle: 'Income, spending and categories this month.' },
  transactions: { title: 'Transactions', subtitle: 'Every rupee in and out this month.' },
  bills: { title: 'Bills & Reminders', subtitle: 'Every recurring payment, and what is due next.' },
  calendar: { title: 'Cash Flow Calendar', subtitle: 'Money moving in and out, day by day.' },
  people: { title: 'People & Loans', subtitle: 'Who owes you, and who you owe.' },
  shared: { title: 'Shared Expenses', subtitle: 'Groups, splits and who still owes what.' },
  cards: { title: 'Credit Cards', subtitle: 'Limits, dues and how much credit you are using.' },
  planned: { title: 'Budget & Fixed', subtitle: 'Set a limit, and keep EMIs on track.' },
  wealth: { title: 'Savings & Investments', subtitle: 'Goals you are funding and money at work.' },
  emergency: { title: 'Emergency Fund', subtitle: 'How long you could last without income.' },
  policy: { title: 'Policies', subtitle: 'Cover, premiums and renewal dates.' },
  networth: {
    title: 'Net Worth Timeline',
    subtitle: 'Everything you own, minus everything you owe.',
  },
  assets: { title: 'Assets', subtitle: 'What you own and what it is worth today.' },
  loans: { title: 'Loans', subtitle: 'Balances, interest paid and payoff plans.' },
  health: { title: 'Financial Health', subtitle: 'Eight measures of how your money is doing.' },
  insights: { title: 'Insights', subtitle: 'Patterns across the last six months.' },
  heatmap: { title: 'Spending Heatmap', subtitle: 'Six months of spending, one square a day.' },
  review: { title: 'Monthly Review', subtitle: 'An automatic report for the month.' },
  timeline: { title: 'Financial Timeline', subtitle: 'The milestones that got you here.' },
  reports: { title: 'Reports', subtitle: 'Generate, read and export any statement.' },
  scanner: { title: 'Receipt Scanner', subtitle: 'Photograph a bill, check the details, save it.' },
  import: { title: 'Import Statement', subtitle: 'Bring in transactions from your bank file.' },
  security: { title: 'Security & Privacy', subtitle: 'Locks, backups and everything private.' },
  profile: { title: 'Profile & Settings', subtitle: 'Your details, preferences and account.' },
};

export function pageMetaForSegment(segment: string | undefined) {
  const key = segment === 'index' || !segment ? 'life' : segment;
  return PAGE_TITLES[key] ?? PAGE_TITLES.life;
}

export function activeNavIdFromSegment(segment: string | undefined): NavItemId {
  if (!segment || segment === 'index') return 'life';
  const known = FLAT_NAV.find((item) => item.id === segment);
  return known?.id ?? 'life';
}

/** Tab bar visible routes on mobile (design keeps bottom nav for primary flows). */
export const TAB_BAR_ROUTES = new Set(['index', 'transactions', 'planned', 'wealth', 'profile']);
