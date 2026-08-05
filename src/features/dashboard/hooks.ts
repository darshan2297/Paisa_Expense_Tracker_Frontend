import { useQuery } from '@tanstack/react-query';

import { useSessionStore } from '@/stores/sessionStore';
import { currentYearMonth } from '@/utils/date';

import * as dashboardApi from './api';

export function useLifeDashboard(month: string = currentYearMonth()) {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  return useQuery({
    queryKey: ['dashboard', 'life', month],
    queryFn: () => dashboardApi.getLifeDashboard(month),
    enabled: isAuthenticated,
  });
}
