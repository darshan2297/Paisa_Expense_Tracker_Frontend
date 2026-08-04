import { apiClient, type Envelope } from '@/api/client';

export type Investment = {
  id: string;
  name: string;
  kind: string;
  invested_amount: string;
  current_value: string;
  monthly_sip: string;
  gain: string;
  gain_pct: number;
};

export type InvestmentsSummary = {
  portfolio_total: string;
  total_invested: string;
  total_gain: string;
  gain_pct: number;
  monthly_sip_total: string;
  investments: Investment[];
};

type InvestmentsSummaryApi = {
  portfolio_total: string | number;
  total_invested: string | number;
  total_gain: string | number;
  gain_pct: number;
  monthly_sip_total?: string | number;
  investments: Investment[];
};

function mapSummary(raw: InvestmentsSummaryApi): InvestmentsSummary {
  return {
    portfolio_total: String(raw.portfolio_total),
    total_invested: String(raw.total_invested),
    total_gain: String(raw.total_gain),
    gain_pct: raw.gain_pct ?? 0,
    monthly_sip_total: String(raw.monthly_sip_total ?? 0),
    investments: raw.investments ?? [],
  };
}

export async function getInvestments(): Promise<Investment[]> {
  const response = await apiClient.get<Envelope<Investment[]>>('/investments');
  return response.data.data as Investment[];
}

export async function getInvestmentsSummary(): Promise<InvestmentsSummary> {
  const response = await apiClient.get<Envelope<InvestmentsSummaryApi>>('/investments/summary');
  return mapSummary(response.data.data as InvestmentsSummaryApi);
}

export async function createInvestment(payload: {
  name: string;
  kind: string;
  invested_amount: string;
  current_value: string;
  monthly_sip?: string;
}): Promise<Investment> {
  const response = await apiClient.post<Envelope<Investment>>('/investments', payload);
  return response.data.data as Investment;
}

export async function updateInvestment(
  investmentId: string,
  payload: Partial<{
    name: string;
    kind: string;
    invested_amount: string;
    current_value: string;
    monthly_sip: string;
  }>,
): Promise<Investment> {
  const response = await apiClient.patch<Envelope<Investment>>(
    `/investments/${investmentId}`,
    payload,
  );
  return response.data.data as Investment;
}

export async function deleteInvestment(investmentId: string): Promise<void> {
  await apiClient.delete(`/investments/${investmentId}`);
}
