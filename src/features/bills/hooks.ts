import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as billsApi from './api';
import type { BillCreatePayload, BillUpdatePayload } from './types';

export const billsQueryKey = (month?: string) => ['bills', month ?? 'all'] as const;

export function useBills(month?: string) {
  return useQuery({
    queryKey: billsQueryKey(month),
    queryFn: () => billsApi.getBills(month),
    // Bills change via pay/create elsewhere; always hit the network on mount
    // so a persisted empty cache cannot hide existing bills.
    staleTime: 0,
    refetchOnMount: 'always',
  });
}

export function useCreateBill(month?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BillCreatePayload) => billsApi.createBill(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      if (month) queryClient.invalidateQueries({ queryKey: billsQueryKey(month) });
    },
  });
}

export function useUpdateBill(month?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ billId, payload }: { billId: string; payload: BillUpdatePayload }) =>
      billsApi.updateBill(billId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bills'] }),
  });
}

export function useDeleteBill(month?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (billId: string) => billsApi.deleteBill(billId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bills'] }),
  });
}

export function usePayBill(month?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (billId: string) => billsApi.payBill(billId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budget', 'summary'] });
    },
  });
}

export function useUnpayBill(month?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (billId: string) => billsApi.unpayBill(billId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budget', 'summary'] });
    },
  });
}

export function useToggleBillAuto(month?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (billId: string) => billsApi.toggleBillAuto(billId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bills'] }),
  });
}
