import { apiClient, type Envelope } from '@/api/client';

import type { CalendarData, HeatmapData } from './types';

export async function getCalendar(month: string): Promise<CalendarData> {
  const response = await apiClient.get<Envelope<CalendarData>>('/calendar', { params: { month } });
  return response.data.data as CalendarData;
}

export async function getHeatmap(weeks = 26): Promise<HeatmapData> {
  const response = await apiClient.get<Envelope<HeatmapData>>('/heatmap', { params: { weeks } });
  return response.data.data as HeatmapData;
}
