import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { PickedReceipt } from '@/utils/receiptPicker';

import * as transactionsApi from './api';
import type {
  TransactionCreatePayload,
  TransactionFilters,
  TransactionUpdatePayload,
} from './types';

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

export function useTransactionsSummary(month: string, cardOnly = false) {
  return useQuery({
    queryKey: cardOnly
      ? ([...transactionsSummaryQueryKey(month), 'cardOnly'] as const)
      : transactionsSummaryQueryKey(month),
    queryFn: () => transactionsApi.getTransactionsSummary(month, cardOnly),
  });
}

/** Invalidates every cached transactions/summary/budget-summary/dashboard
 * query (rather than a single key) since a create/delete can shift totals
 * shown on the Life Dashboard, sidebar Budget Left widget, and Planned
 * screen too, not just the Transactions list.
 */
function invalidateMoneyQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['transactions'] });
  queryClient.invalidateQueries({ queryKey: ['budget'] });
  queryClient.invalidateQueries({ queryKey: ['fixedCommitments'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}

export type CreateTransactionResult = {
  transaction: Awaited<ReturnType<typeof transactionsApi.createTransaction>>;
  /** True when the txn was saved but the receipt upload failed. */
  receiptUploadFailed: boolean;
};

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      payload,
      receipt,
    }: {
      payload: TransactionCreatePayload;
      receipt?: PickedReceipt | null;
    }): Promise<CreateTransactionResult> => {
      const created = await transactionsApi.createTransaction(payload);
      if (!receipt) {
        return { transaction: created, receiptUploadFailed: false };
      }
      try {
        const withReceipt = await transactionsApi.uploadReceipt(created.id, receipt);
        return { transaction: withReceipt, receiptUploadFailed: false };
      } catch {
        return { transaction: created, receiptUploadFailed: true };
      }
    },
    onSuccess: () => invalidateMoneyQueries(queryClient),
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      transactionId,
      payload,
      receipt,
    }: {
      transactionId: string;
      payload: TransactionUpdatePayload;
      receipt?: PickedReceipt | null;
    }) => {
      const updated = await transactionsApi.updateTransaction(transactionId, payload);
      if (!receipt) {
        return { transaction: updated, receiptUploadFailed: false as const };
      }
      try {
        const withReceipt = await transactionsApi.uploadReceipt(transactionId, receipt);
        return { transaction: withReceipt, receiptUploadFailed: false as const };
      } catch {
        return { transaction: updated, receiptUploadFailed: true as const };
      }
    },
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
