import { apiClient, type Envelope } from '@/api/client';

import type { Bill, BillCreatePayload, BillUpdatePayload } from './types';

export async function getBills(month?: string): Promise<Bill[]> {
  const response = await apiClient.get<Envelope<Bill[]>>('/bills', {
    params: month ? { month } : undefined,
  });
  return response.data.data as Bill[];
}

export async function createBill(payload: BillCreatePayload): Promise<Bill> {
  const response = await apiClient.post<Envelope<Bill>>('/bills', payload);
  return response.data.data as Bill;
}

export async function updateBill(billId: string, payload: BillUpdatePayload): Promise<Bill> {
  const response = await apiClient.patch<Envelope<Bill>>(`/bills/${billId}`, payload);
  return response.data.data as Bill;
}

export async function deleteBill(billId: string): Promise<void> {
  await apiClient.delete(`/bills/${billId}`);
}

export async function payBill(billId: string): Promise<Bill> {
  const response = await apiClient.post<Envelope<Bill>>(`/bills/${billId}/pay`);
  return response.data.data as Bill;
}

export async function unpayBill(billId: string): Promise<Bill> {
  const response = await apiClient.post<Envelope<Bill>>(`/bills/${billId}/unpay`);
  return response.data.data as Bill;
}

export async function toggleBillAuto(billId: string): Promise<Bill> {
  const response = await apiClient.post<Envelope<Bill>>(`/bills/${billId}/toggle-auto`);
  return response.data.data as Bill;
}
