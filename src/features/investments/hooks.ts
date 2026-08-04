import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as api from './api';

export const investmentsQueryKey = ['investments'] as const;

export function useInvestments() {
  return useQuery({ queryKey: investmentsQueryKey, queryFn: api.getInvestments });
}

export function useInvestmentsSummary() {
  return useQuery({
    queryKey: [...investmentsQueryKey, 'summary'],
    queryFn: api.getInvestmentsSummary,
  });
}

export function useCreateInvestment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createInvestment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: investmentsQueryKey });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['netWorth'] });
    },
  });
}

export function useDeleteInvestment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteInvestment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: investmentsQueryKey });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['netWorth'] });
    },
  });
}
