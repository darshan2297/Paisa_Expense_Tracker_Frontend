import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as api from './api';
import type { LoanCreatePayload } from './types';
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

export function useCreateLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LoanCreatePayload) => api.createLoan(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['netWorth'] });
    },
  });
}

export function useDeleteLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (loanId: string) => api.deleteLoan(loanId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['netWorth'] });
    },
  });
}
