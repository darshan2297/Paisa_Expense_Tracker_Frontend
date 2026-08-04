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
  try {
    const response = await apiClient.get<Envelope<LifeDashboardApiResponse>>('/dashboard/life', {
      params: { month },
    });
    const raw = response.data.data;
    if (!raw) return emptyLifeDashboard(month);
    return mapLifeDashboardResponse(raw);
  } catch {
    return emptyLifeDashboard(month);
  }
}
