export type CalendarPlannedItem = {
  label: string;
  kind: string;
  amount: string;
};

export type CalendarActualItem = {
  id: string;
  title: string;
  amount: string;
  type: string;
};

export type CalendarDay = {
  date: string;
  inflow: string;
  outflow: string;
  planned: CalendarPlannedItem[];
  actual: CalendarActualItem[];
};

export type CalendarData = {
  month: string;
  days: CalendarDay[];
  net_flow: string;
  highest_day_outflow: string;
  planned_total: string;
  actual_total: string;
};

export type HeatmapCell = {
  date: string;
  intensity: number;
  amount: string;
};

export type HeatmapData = {
  weeks: number;
  cells: HeatmapCell[];
  weekday_totals: Record<string, string>;
};
