import { apiClient, type Envelope } from '@/api/client';

import { emptyLifeDashboard, mapLifeDashboardResponse } from './mapLifeDashboard';
import type { LifeDashboardApiResponse, LifeDashboardData } from './types';

export type {
  ActivityItem,
  GoalProgress,
  LifeDashboardData,
  LifeMetric,
  NetWorthPart,
  UpcomingItem,
} from './types';

export async function getLifeDashboard(month: string): Promise<LifeDashboardData> {
  // Do not swallow 401/network errors — React Query must see the failure.
  // Returning emptyLifeDashboard here used to cache ₹0 as a successful
  // response after a pre-login fetch, so the dashboard stayed empty until
  // a hard refresh.
  const response = await apiClient.get<Envelope<LifeDashboardApiResponse>>('/dashboard/life', {
    params: { month },
  });
  const raw = response.data.data;
  if (!raw) return emptyLifeDashboard(month);
  return mapLifeDashboardResponse(raw);
}
