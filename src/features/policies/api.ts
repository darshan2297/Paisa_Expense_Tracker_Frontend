import { apiClient, type Envelope } from '@/api/client';

import type { PoliciesSummary, Policy, PolicyCreatePayload } from './types';

export async function getPolicies(): Promise<Policy[]> {
  const response = await apiClient.get<Envelope<Policy[]>>('/policies');
  return response.data.data as Policy[];
}

export async function getPoliciesSummary(): Promise<PoliciesSummary> {
  const response = await apiClient.get<Envelope<PoliciesSummary>>('/policies/summary');
  return response.data.data as PoliciesSummary;
}

export async function createPolicy(payload: PolicyCreatePayload): Promise<Policy> {
  const response = await apiClient.post<Envelope<Policy>>('/policies', payload);
  return response.data.data as Policy;
}

export async function deletePolicy(policyId: string): Promise<void> {
  await apiClient.delete(`/policies/${policyId}`);
}

export async function togglePremiumPaid(policyId: string): Promise<Policy> {
  const response = await apiClient.post<Envelope<Policy>>(`/policies/${policyId}/toggle-paid`);
  return response.data.data as Policy;
}
