import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as api from './api';
import type { LoanCreatePayload, LoanUpdatePayload } from './types';
import { currentYearMonth } from '@/utils/date';

export function useLoans() {
  return useQuery({ queryKey: ['loans'], queryFn: api.getLoans });
}

export function useLoansSummary(month = currentYearMonth()) {
  return useQuery({
    queryKey: ['loans', 'summary', month],
    queryFn: () => api.getLoansSummary(month),
  });
}

function invalidateLoanQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['loans'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  queryClient.invalidateQueries({ queryKey: ['netWorth'] });
}

export function useCreateLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LoanCreatePayload) => api.createLoan(payload),
    onSuccess: () => invalidateLoanQueries(queryClient),
  });
}

export function useUpdateLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ loanId, payload }: { loanId: string; payload: LoanUpdatePayload }) =>
      api.updateLoan(loanId, payload),
    onSuccess: () => invalidateLoanQueries(queryClient),
  });
}

export function useDeleteLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (loanId: string) => api.deleteLoan(loanId),
    onSuccess: () => invalidateLoanQueries(queryClient),
  });
}
