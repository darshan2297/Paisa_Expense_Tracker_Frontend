export type Loan = {
  id: string;
  name: string;
  kind: string;
  principal: string;
  rate_pct: string;
  tenure_months: number;
  start_date: string;
  outstanding: string;
  emi: string;
  paid_months?: number;
  remaining_months?: number;
};

export type LoansSummary = {
  total_outstanding: string;
  active_count: number;
  total_emi: string;
  loans: Loan[];
};

export type LoanCreatePayload = {
  name: string;
  kind: string;
  principal: string;
  rate_pct: string;
  tenure_months: number;
  start_date: string;
  outstanding?: string;
};

export type LoanUpdatePayload = Partial<LoanCreatePayload> & {
  outstanding?: string;
};
