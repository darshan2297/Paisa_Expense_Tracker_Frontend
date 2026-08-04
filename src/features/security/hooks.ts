import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as securityApi from './api';
import type { LoginHistoryFilters, SecuritySettingsUpdatePayload } from './types';

export const securityOverviewQueryKey = ['security', 'overview'] as const;
export const securitySettingsQueryKey = ['security', 'settings'] as const;
export const profileConfigQueryKey = ['profile', 'config'] as const;
export const loginHistoryQueryKey = ['security', 'login-history'] as const;

export function useSecurityOverview() {
  return useQuery({ queryKey: securityOverviewQueryKey, queryFn: securityApi.getSecurityOverview });
}

export function useLoginHistory(filters: LoginHistoryFilters) {
  return useQuery({
    queryKey: [...loginHistoryQueryKey, filters] as const,
    queryFn: () => securityApi.getLoginHistory(filters),
    placeholderData: (previous) => previous,
  });
}

export function useProfileConfig() {
  return useQuery({ queryKey: profileConfigQueryKey, queryFn: securityApi.getProfileConfig });
}

export function useUpdateSecuritySettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SecuritySettingsUpdatePayload) =>
      securityApi.updateSecuritySettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityOverviewQueryKey });
      queryClient.invalidateQueries({ queryKey: securitySettingsQueryKey });
    },
  });
}

export function useLockVault() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => securityApi.lockVault(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityOverviewQueryKey });
      queryClient.invalidateQueries({ queryKey: loginHistoryQueryKey });
    },
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => securityApi.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityOverviewQueryKey });
    },
  });
}

export function useExportBackup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => securityApi.exportBackup(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityOverviewQueryKey });
      queryClient.invalidateQueries({ queryKey: loginHistoryQueryKey });
    },
  });
}

export function useImportBackup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => securityApi.importBackup(content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityOverviewQueryKey });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
