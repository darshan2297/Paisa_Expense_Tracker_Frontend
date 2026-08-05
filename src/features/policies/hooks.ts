import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSessionStore } from '@/stores/sessionStore';

import * as api from './api';
import type { PolicyCreatePayload } from './types';

export function usePolicies() {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  return useQuery({
    queryKey: ['policies'],
    queryFn: api.getPolicies,
    enabled: isAuthenticated,
  });
}

export function usePoliciesSummary() {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  return useQuery({
    queryKey: ['policies', 'summary'],
    queryFn: api.getPoliciesSummary,
    enabled: isAuthenticated,
  });
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
