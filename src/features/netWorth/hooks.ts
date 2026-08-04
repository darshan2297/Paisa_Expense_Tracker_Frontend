import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as api from './api';

export function useNetWorthCurrent() {
  return useQuery({ queryKey: ['netWorth', 'current'], queryFn: api.getNetWorthCurrent });
}

export function useNetWorthHistory(months = 12) {
  return useQuery({
    queryKey: ['netWorth', 'history', months],
    queryFn: () => api.getNetWorthHistory(months),
  });
}

export function useRecordNetWorthSnapshot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.recordNetWorthSnapshot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['netWorth'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
