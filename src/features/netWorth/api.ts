import { apiClient, type Envelope } from '@/api/client';

import type { NetWorthCurrent, NetWorthHistory } from './types';

export async function getNetWorthCurrent(): Promise<NetWorthCurrent> {
  const response = await apiClient.get<Envelope<NetWorthCurrent>>('/net-worth/current');
  return response.data.data as NetWorthCurrent;
}

export async function getNetWorthHistory(months = 12): Promise<NetWorthHistory> {
  const response = await apiClient.get<Envelope<NetWorthHistory>>('/net-worth/history', {
    params: { months },
  });
  return response.data.data as NetWorthHistory;
}

export async function recordNetWorthSnapshot(): Promise<NetWorthCurrent> {
  const response = await apiClient.post<Envelope<NetWorthCurrent>>('/net-worth/snapshot');
  return response.data.data as NetWorthCurrent;
}
