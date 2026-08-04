import { apiClient, type Envelope } from '@/api/client';

import type {
  EmergencyFund,
  Goal,
  GoalContributePayload,
  GoalCreatePayload,
  GoalSummary,
  GoalUpdatePayload,
} from './types';

export async function getGoals(): Promise<Goal[]> {
  const response = await apiClient.get<Envelope<Goal[]>>('/goals');
  return response.data.data as Goal[];
}

export async function getEmergencyFund(): Promise<EmergencyFund> {
  const response = await apiClient.get<Envelope<EmergencyFund>>('/goals/emergency');
  return response.data.data as EmergencyFund;
}

export async function getGoalsSummary(): Promise<GoalSummary> {
  const response = await apiClient.get<Envelope<GoalSummary>>('/goals/summary');
  return response.data.data as GoalSummary;
}

export async function createGoal(payload: GoalCreatePayload): Promise<Goal> {
  const response = await apiClient.post<Envelope<Goal>>('/goals', payload);
  return response.data.data as Goal;
}

export async function updateGoal(goalId: string, payload: GoalUpdatePayload): Promise<Goal> {
  const response = await apiClient.patch<Envelope<Goal>>(`/goals/${goalId}`, payload);
  return response.data.data as Goal;
}

export async function deleteGoal(goalId: string): Promise<void> {
  await apiClient.delete(`/goals/${goalId}`);
}

export async function contributeToGoal(
  goalId: string,
  payload: GoalContributePayload,
): Promise<Goal> {
  const response = await apiClient.post<Envelope<Goal>>(`/goals/${goalId}/contribute`, payload);
  return response.data.data as Goal;
}
