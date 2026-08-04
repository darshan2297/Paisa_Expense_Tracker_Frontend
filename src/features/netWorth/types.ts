export type NetWorthPart = {
  label: string;
  value: string;
};

export type NetWorthCurrent = {
  net_worth: string;
  total_assets: string;
  total_liabilities: string;
  delta_month: string | null;
  parts: NetWorthPart[];
};

export type NetWorthHistoryPoint = {
  date: string;
  net_worth: string;
  total_assets: string;
  total_liabilities: string;
};

export type NetWorthHistory = {
  points: NetWorthHistoryPoint[];
};
