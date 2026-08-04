import { apiClient, type Envelope } from '@/api/client';
import { currentYearMonth } from '@/utils/date';

import type { Loan, LoanCreatePayload, LoanUpdatePayload, LoansSummary } from './types';

export type { Loan, LoanCreatePayload, LoanUpdatePayload, LoansSummary };

export async function getLoans(): Promise<Loan[]> {
  const response = await apiClient.get<Envelope<Loan[]>>('/loans');
  return response.data.data as Loan[];
}

export async function getLoansSummary(month = currentYearMonth()): Promise<LoansSummary> {
  const response = await apiClient.get<Envelope<LoansSummary>>('/loans/summary', {
    params: { month },
  });
  return response.data.data as LoansSummary;
}

export async function createLoan(payload: LoanCreatePayload): Promise<Loan> {
  const response = await apiClient.post<Envelope<Loan>>('/loans', payload);
  return response.data.data as Loan;
}

export async function updateLoan(loanId: string, payload: LoanUpdatePayload): Promise<Loan> {
  const response = await apiClient.patch<Envelope<Loan>>(`/loans/${loanId}`, payload);
  return response.data.data as Loan;
}

export async function deleteLoan(loanId: string): Promise<void> {
  await apiClient.delete(`/loans/${loanId}`);
}
