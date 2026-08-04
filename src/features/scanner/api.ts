import { apiClient, type Envelope } from '@/api/client';

import type { ScanConfirmPayload, ScanConfirmResult, ScanResult } from './types';

export async function scanReceipt(file: FormData): Promise<ScanResult> {
  const response = await apiClient.post<Envelope<ScanResult>>('/scanner/scan', file, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data as ScanResult;
}

export async function confirmScan(payload: ScanConfirmPayload): Promise<ScanConfirmResult> {
  const response = await apiClient.post<Envelope<ScanConfirmResult>>('/scanner/confirm', payload);
  return response.data.data as ScanConfirmResult;
}
