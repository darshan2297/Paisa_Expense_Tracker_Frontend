import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as api from './api';
import type { PolicyCreatePayload } from './types';

export function usePolicies() {
  return useQuery({ queryKey: ['policies'], queryFn: api.getPolicies });
}

export function usePoliciesSummary() {
  return useQuery({ queryKey: ['policies', 'summary'], queryFn: api.getPoliciesSummary });
}

export function useCreatePolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PolicyCreatePayload) => api.createPolicy(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeletePolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (policyId: string) => api.deletePolicy(policyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useTogglePolicyPremiumPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (policyId: string) => api.togglePremiumPaid(policyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
