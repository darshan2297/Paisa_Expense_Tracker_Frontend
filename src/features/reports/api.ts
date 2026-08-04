import { apiClient, type Envelope } from '@/api/client';

import type { ReportData, ReportType } from './types';

export async function getReport(type: ReportType, month: string): Promise<ReportData> {
  const response = await apiClient.get<Envelope<ReportData>>(`/reports/${type}`, {
    params: { month },
  });
  return response.data.data as ReportData;
}

export async function exportReport(
  type: ReportType,
  month: string,
  format: 'csv' | 'pdf',
): Promise<Blob> {
  const response = await apiClient.get<Blob>(`/reports/${type}/export`, {
    params: { month, format },
    responseType: 'blob',
  });
  return response.data;
}
