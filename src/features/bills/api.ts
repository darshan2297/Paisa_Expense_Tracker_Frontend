import { USE_MOCK_DATA } from '@/config/dataSource';
import { mockStore } from '@/mock/store';
import { apiClient, type Envelope } from '@/api/client';

import type { Bill, BillCreatePayload, BillUpdatePayload } from './types';

export async function getBills(month?: string): Promise<Bill[]> {
  if (USE_MOCK_DATA) return mockStore.getBills(month);
  const response = await apiClient.get<Envelope<Bill[]>>('/bills', {
    params: month ? { month } : undefined,
  });
  return response.data.data as Bill[];
}

export async function createBill(payload: BillCreatePayload): Promise<Bill> {
  if (USE_MOCK_DATA) return mockStore.createBill(payload);
  const response = await apiClient.post<Envelope<Bill>>('/bills', payload);
  return response.data.data as Bill;
}

export async function updateBill(billId: string, payload: BillUpdatePayload): Promise<Bill> {
  if (USE_MOCK_DATA) return mockStore.updateBill(billId, payload);
  const response = await apiClient.patch<Envelope<Bill>>(`/bills/${billId}`, payload);
  return response.data.data as Bill;
}

export async function deleteBill(billId: string): Promise<void> {
  if (USE_MOCK_DATA) return mockStore.deleteBill(billId);
  await apiClient.delete(`/bills/${billId}`);
}

export async function payBill(billId: string): Promise<Bill> {
  if (USE_MOCK_DATA) return mockStore.payBill(billId);
  const response = await apiClient.post<Envelope<Bill>>(`/bills/${billId}/pay`);
  return response.data.data as Bill;
}

export async function unpayBill(billId: string): Promise<Bill> {
  if (USE_MOCK_DATA) return mockStore.unpayBill(billId);
  const response = await apiClient.post<Envelope<Bill>>(`/bills/${billId}/unpay`);
  return response.data.data as Bill;
}

export async function toggleBillAuto(billId: string): Promise<Bill> {
  if (USE_MOCK_DATA) return mockStore.toggleBillAuto(billId);
  const response = await apiClient.post<Envelope<Bill>>(`/bills/${billId}/toggle-auto`);
  return response.data.data as Bill;
}
