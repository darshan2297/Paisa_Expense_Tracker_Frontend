import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as goalsApi from './api';
import type { GoalContributePayload, GoalCreatePayload, GoalUpdatePayload } from './types';

export const goalsQueryKey = ['goals'] as const;
export const emergencyFundQueryKey = ['goals', 'emergency'] as const;
export const goalsSummaryQueryKey = ['goals', 'summary'] as const;

export function useGoals() {
  return useQuery({ queryKey: goalsQueryKey, queryFn: goalsApi.getGoals });
}

export function useEmergencyFund() {
  return useQuery({ queryKey: emergencyFundQueryKey, queryFn: goalsApi.getEmergencyFund });
}

export function useGoalsSummary() {
  return useQuery({ queryKey: goalsSummaryQueryKey, queryFn: goalsApi.getGoalsSummary });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GoalCreatePayload) => goalsApi.createGoal(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalsQueryKey });
      queryClient.invalidateQueries({ queryKey: emergencyFundQueryKey });
      queryClient.invalidateQueries({ queryKey: goalsSummaryQueryKey });
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, payload }: { goalId: string; payload: GoalUpdatePayload }) =>
      goalsApi.updateGoal(goalId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalsQueryKey });
      queryClient.invalidateQueries({ queryKey: emergencyFundQueryKey });
      queryClient.invalidateQueries({ queryKey: goalsSummaryQueryKey });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (goalId: string) => goalsApi.deleteGoal(goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalsQueryKey });
      queryClient.invalidateQueries({ queryKey: emergencyFundQueryKey });
      queryClient.invalidateQueries({ queryKey: goalsSummaryQueryKey });
    },
  });
}

export function useContributeToGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, payload }: { goalId: string; payload: GoalContributePayload }) =>
      goalsApi.contributeToGoal(goalId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalsQueryKey });
      queryClient.invalidateQueries({ queryKey: emergencyFundQueryKey });
      queryClient.invalidateQueries({ queryKey: goalsSummaryQueryKey });
    },
  });
}
