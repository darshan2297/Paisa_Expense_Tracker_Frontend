import { apiClient, type Envelope } from '@/api/client';

import type { Milestone, MilestoneCreatePayload, MilestoneUpdatePayload } from './types';

export async function getMilestones(): Promise<Milestone[]> {
  const response = await apiClient.get<Envelope<Milestone[]>>('/milestones');
  return response.data.data as Milestone[];
}

export async function createMilestone(payload: MilestoneCreatePayload): Promise<Milestone> {
  const response = await apiClient.post<Envelope<Milestone>>('/milestones', payload);
  return response.data.data as Milestone;
}

export async function updateMilestone(
  milestoneId: string,
  payload: MilestoneUpdatePayload,
): Promise<Milestone> {
  const response = await apiClient.patch<Envelope<Milestone>>(
    `/milestones/${milestoneId}`,
    payload,
  );
  return response.data.data as Milestone;
}

export async function deleteMilestone(milestoneId: string): Promise<void> {
  await apiClient.delete(`/milestones/${milestoneId}`);
}
