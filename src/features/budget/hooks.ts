import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSessionStore } from '@/stores/sessionStore';
import { todayKey } from '@/utils/date';

import * as budgetApi from './api';
import type { BudgetSettingsUpdatePayload, FixedCommitmentCreatePayload } from './types';

export const budgetSettingsQueryKey = ['budget', 'settings'] as const;
export const budgetSummaryQueryKey = (month: string, day = todayKey()) =>
  ['budget', 'summary', month, day] as const;
export const fixedCommitmentsQueryKey = (month: string) => ['fixedCommitments', month] as const;

export function useBudgetSettings() {
  return useQuery({ queryKey: budgetSettingsQueryKey, queryFn: budgetApi.getBudgetSettings });
}

export function useBudgetSummary(month: string) {
  const day = todayKey();
  return useQuery({
    queryKey: budgetSummaryQueryKey(month, day),
    queryFn: () => budgetApi.getBudgetSummary(month),
  });
}

export function useUpdateBudgetSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BudgetSettingsUpdatePayload) => budgetApi.updateBudgetSettings(payload),
    onSuccess: (settings) => {
      queryClient.setQueryData(budgetSettingsQueryKey, settings);
      queryClient.invalidateQueries({ queryKey: ['budget', 'summary'] });
    },
  });
}

export function useFixedCommitments(month: string) {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  return useQuery({
    queryKey: fixedCommitmentsQueryKey(month),
    queryFn: () => budgetApi.getFixedCommitments(month),
    enabled: isAuthenticated,
  });
}

export function useCreateFixedCommitment(month: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FixedCommitmentCreatePayload) => budgetApi.createFixedCommitment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fixedCommitmentsQueryKey(month) });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteFixedCommitment(month: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commitmentId: string) => budgetApi.deleteFixedCommitment(commitmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fixedCommitmentsQueryKey(month) });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useToggleFixedCommitmentPaid(month: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commitmentId: string) => budgetApi.toggleFixedCommitmentPaid(commitmentId, month),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fixedCommitmentsQueryKey(month) });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budget', 'summary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateFixedCommitment(month: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      commitmentId,
      payload,
    }: {
      commitmentId: string;
      payload: import('./types').FixedCommitmentUpdatePayload;
    }) => budgetApi.updateFixedCommitment(commitmentId, month, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fixedCommitmentsQueryKey(month) });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
