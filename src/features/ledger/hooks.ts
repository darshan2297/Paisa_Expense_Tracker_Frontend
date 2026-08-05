import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as api from './api';
import type { LedgerEntryCreatePayload, LedgerEntryUpdatePayload } from './types';

export function useLedger(person?: string) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ['ledger', person ?? 'all'],
    queryFn: async () => {
      const rows = await api.getLedger(person);
      // Listing may backfill cash transactions for older settle-ups.
      void queryClient.invalidateQueries({ queryKey: ['transactions'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['budget'] });
      return rows;
    },
  });
}

export function useLedgerPeople() {
  return useQuery({ queryKey: ['ledger', 'people'], queryFn: api.getLedgerPeople });
}

function invalidateLedgerMoney(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['ledger'] });
  // Settle / lend / repay also writes a cash transaction.
  queryClient.invalidateQueries({ queryKey: ['transactions'] });
  queryClient.invalidateQueries({ queryKey: ['budget'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  queryClient.invalidateQueries({ queryKey: ['netWorth'] });
}

export function useCreateLedgerEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LedgerEntryCreatePayload) => api.createLedgerEntry(payload),
    onSuccess: () => invalidateLedgerMoney(queryClient),
  });
}

export function useUpdateLedgerEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ entryId, payload }: { entryId: string; payload: LedgerEntryUpdatePayload }) =>
      api.updateLedgerEntry(entryId, payload),
    onSuccess: () => invalidateLedgerMoney(queryClient),
  });
}

export function useDeleteLedgerEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entryId: string) => api.deleteLedgerEntry(entryId),
    onSuccess: () => invalidateLedgerMoney(queryClient),
  });
}
