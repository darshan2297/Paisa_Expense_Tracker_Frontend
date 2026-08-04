import { apiClient, type Envelope } from '@/api/client';

import type { HealthData, ReviewData, TrendsData } from './types';

export async function getHealthScore(month: string): Promise<HealthData> {
  const response = await apiClient.get<Envelope<HealthData>>('/insights/health', {
    params: { month },
  });
  return response.data.data as HealthData;
}

export async function getTrends(months = 6): Promise<TrendsData> {
  const response = await apiClient.get<Envelope<TrendsData>>('/insights/trends', {
    params: { months },
  });
  return response.data.data as TrendsData;
}

export async function getReview(month: string): Promise<ReviewData> {
  const response = await apiClient.get<Envelope<ReviewData>>('/insights/review', {
    params: { month },
  });
  return response.data.data as ReviewData;
}
