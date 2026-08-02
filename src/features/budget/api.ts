import { apiClient, type Envelope } from '@/api/client';

import type {
  BudgetSettings,
  BudgetSettingsUpdatePayload,
  BudgetSummary,
  FixedCommitment,
  FixedCommitmentCreatePayload,
  FixedCommitmentUpdatePayload,
} from './types';

export async function getBudgetSettings(): Promise<BudgetSettings> {
  const response = await apiClient.get<Envelope<BudgetSettings>>('/budget');
  return response.data.data as BudgetSettings;
}

export async function updateBudgetSettings(
  payload: BudgetSettingsUpdatePayload,
): Promise<BudgetSettings> {
  const response = await apiClient.put<Envelope<BudgetSettings>>('/budget', payload);
  return response.data.data as BudgetSettings;
}

export async function getBudgetSummary(month: string): Promise<BudgetSummary> {
  const response = await apiClient.get<Envelope<BudgetSummary>>('/budget/summary', {
    params: { month },
  });
  return response.data.data as BudgetSummary;
}

export async function getFixedCommitments(month: string): Promise<FixedCommitment[]> {
  const response = await apiClient.get<Envelope<FixedCommitment[]>>('/fixed-commitments', {
    params: { month },
  });
  return response.data.data as FixedCommitment[];
}

export async function createFixedCommitment(
  payload: FixedCommitmentCreatePayload,
): Promise<FixedCommitment> {
  const response = await apiClient.post<Envelope<FixedCommitment>>('/fixed-commitments', payload);
  return response.data.data as FixedCommitment;
}

export async function deleteFixedCommitment(commitmentId: string): Promise<void> {
  await apiClient.delete(`/fixed-commitments/${commitmentId}`);
}

export async function toggleFixedCommitmentPaid(
  commitmentId: string,
  month: string,
): Promise<FixedCommitment> {
  const response = await apiClient.post<Envelope<FixedCommitment>>(
    `/fixed-commitments/${commitmentId}/toggle-paid`,
    null,
    { params: { month } },
  );
  return response.data.data as FixedCommitment;
}

export async function updateFixedCommitment(
  commitmentId: string,
  month: string,
  payload: FixedCommitmentUpdatePayload,
): Promise<FixedCommitment> {
  const response = await apiClient.patch<Envelope<FixedCommitment>>(
    `/fixed-commitments/${commitmentId}`,
    payload,
    { params: { month } },
  );
  return response.data.data as FixedCommitment;
}
