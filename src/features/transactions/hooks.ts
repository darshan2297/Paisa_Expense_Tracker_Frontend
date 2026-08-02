import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as transactionsApi from './api';
import type { TransactionCreatePayload, TransactionFilters } from './types';

export const transactionsQueryKey = (filters: TransactionFilters) =>
  ['transactions', filters] as const;
export const transactionsSummaryQueryKey = (month: string) =>
  ['transactions', 'summary', month] as const;

export function useTransactions(filters: TransactionFilters) {
  return useQuery({
    queryKey: transactionsQueryKey(filters),
    queryFn: () => transactionsApi.getTransactions(filters),
  });
}

export function useTransactionsSummary(month: string) {
  return useQuery({
    queryKey: transactionsSummaryQueryKey(month),
    queryFn: () => transactionsApi.getTransactionsSummary(month),
  });
}

/** Invalidates every cached transactions/summary/budget-summary query
 * (rather than a single key) since a create/delete can shift totals shown
 * on the Overview and Planned screens too, not just the Transactions list.
 */
function invalidateMoneyQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['transactions'] });
  queryClient.invalidateQueries({ queryKey: ['budget'] });
  queryClient.invalidateQueries({ queryKey: ['fixedCommitments'] });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TransactionCreatePayload) => transactionsApi.createTransaction(payload),
    onSuccess: () => invalidateMoneyQueries(queryClient),
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (transactionId: string) => transactionsApi.deleteTransaction(transactionId),
    onSuccess: () => invalidateMoneyQueries(queryClient),
  });
}
