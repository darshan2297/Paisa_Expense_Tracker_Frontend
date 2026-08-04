export type HealthMetric = {
  label: string;
  value: string;
  trend: string;
  status: string;
  score: number;
};

export type HealthData = {
  composite_score: number;
  metrics: HealthMetric[];
};

export type TrendMonth = {
  label: string;
  income: string;
  expense: string;
};

export type InsightCard = {
  label: string;
  value: string;
  sub: string;
};

export type TrendsData = {
  months: TrendMonth[];
  insights: InsightCard[];
};

export type ReviewRow = {
  label: string;
  value: string;
  delta: string;
};

export type CategoryBar = {
  name: string;
  amount: string;
  pct: number;
};

export type ReviewData = {
  month: string;
  narrative: string;
  rows: ReviewRow[];
  highlights: InsightCard[];
  category_bars: CategoryBar[];
};
