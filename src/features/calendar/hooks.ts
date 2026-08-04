import { useQuery } from '@tanstack/react-query';

import * as api from './api';

export function useCalendar(month: string) {
  return useQuery({ queryKey: ['calendar', month], queryFn: () => api.getCalendar(month) });
}

export function useHeatmap(weeks = 26) {
  return useQuery({ queryKey: ['heatmap', weeks], queryFn: () => api.getHeatmap(weeks) });
}
