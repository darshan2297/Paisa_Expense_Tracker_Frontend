import { useQuery } from '@tanstack/react-query';

import * as api from './api';

export function useHealthScore(month: string) {
  return useQuery({
    queryKey: ['insights', 'health', month],
    queryFn: () => api.getHealthScore(month),
  });
}

export function useTrends(months = 6) {
  return useQuery({
    queryKey: ['insights', 'trends', months],
    queryFn: () => api.getTrends(months),
  });
}

export function useReview(month: string) {
  return useQuery({ queryKey: ['insights', 'review', month], queryFn: () => api.getReview(month) });
}
