import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as api from './api';
import type {
  GroupCreatePayload,
  GroupExpenseCreatePayload,
  GroupSettlementCreatePayload,
} from './types';

export function useGroups() {
  return useQuery({ queryKey: ['groups'], queryFn: api.getGroups });
}

export function useGroupBalances(groupId: string) {
  return useQuery({
    queryKey: ['groups', groupId, 'balances'],
    queryFn: () => api.getGroupBalances(groupId),
    enabled: !!groupId,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GroupCreatePayload) => api.createGroup(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  });
}

export function useDeleteGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (groupId: string) => api.deleteGroup(groupId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  });
}

export function useAddGroupExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, payload }: { groupId: string; payload: GroupExpenseCreatePayload }) =>
      api.addGroupExpense(groupId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  });
}

export function useAddGroupSettlement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      payload,
    }: {
      groupId: string;
      payload: GroupSettlementCreatePayload;
    }) => api.addGroupSettlement(groupId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  });
}

export function useDeleteGroupExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, expenseId }: { groupId: string; expenseId: string }) =>
      api.deleteGroupExpense(groupId, expenseId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  });
}

export function useDeleteGroupSettlement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, settlementId }: { groupId: string; settlementId: string }) =>
      api.deleteGroupSettlement(groupId, settlementId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  });
}
