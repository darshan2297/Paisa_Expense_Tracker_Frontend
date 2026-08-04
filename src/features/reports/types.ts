export type ReportKpi = {
  label: string;
  value: string;
};

export type ReportRow = {
  cells: string[];
};

export type ReportChartBar = {
  label: string;
  height: number;
  color: string;
};

export type ReportData = {
  report_type: string;
  month: string;
  summary: ReportKpi[];
  rows: ReportRow[];
  chart: ReportChartBar[];
};

export type ReportType =
  | 'monthly'
  | 'yearly'
  | 'income'
  | 'expense'
  | 'budget'
  | 'investment'
  | 'loan'
  | 'networth'
  | 'goal'
  | 'tax';
