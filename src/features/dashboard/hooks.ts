import { useQuery } from '@tanstack/react-query';

import { currentYearMonth } from '@/utils/date';

import * as dashboardApi from './api';

export function useLifeDashboard(month: string = currentYearMonth()) {
  return useQuery({
    queryKey: ['dashboard', 'life', month],
    queryFn: () => dashboardApi.getLifeDashboard(month),
  });
}
