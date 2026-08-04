import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as api from './api';
import type { LedgerEntryCreatePayload, LedgerEntryUpdatePayload } from './types';

export function useLedger(person?: string) {
  return useQuery({
    queryKey: ['ledger', person ?? 'all'],
    queryFn: () => api.getLedger(person),
  });
}

export function useLedgerPeople() {
  return useQuery({ queryKey: ['ledger', 'people'], queryFn: api.getLedgerPeople });
}

export function useCreateLedgerEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LedgerEntryCreatePayload) => api.createLedgerEntry(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledger'] });
    },
  });
}

export function useUpdateLedgerEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ entryId, payload }: { entryId: string; payload: LedgerEntryUpdatePayload }) =>
      api.updateLedgerEntry(entryId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledger'] });
    },
  });
}

export function useDeleteLedgerEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entryId: string) => api.deleteLedgerEntry(entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledger'] });
    },
  });
}
