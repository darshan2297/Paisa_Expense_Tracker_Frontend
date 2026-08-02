import { apiClient, type Envelope } from '@/api/client';

import type {
  Transaction,
  TransactionCreatePayload,
  TransactionFilters,
  TransactionListResponse,
  TransactionsSummary,
} from './types';

export async function getTransactions(
  filters: TransactionFilters,
): Promise<TransactionListResponse> {
  const response = await apiClient.get<Envelope<TransactionListResponse>>('/transactions', {
    params: {
      month: filters.month,
      type: filters.type,
      q: filters.q,
      page: filters.page,
      size: filters.size,
    },
  });
  return response.data.data as TransactionListResponse;
}

export async function getTransactionsSummary(month: string): Promise<TransactionsSummary> {
  const response = await apiClient.get<Envelope<TransactionsSummary>>('/transactions/summary', {
    params: { month },
  });
  return response.data.data as TransactionsSummary;
}

export async function createTransaction(payload: TransactionCreatePayload): Promise<Transaction> {
  const response = await apiClient.post<Envelope<Transaction>>('/transactions', payload);
  return response.data.data as Transaction;
}

export async function deleteTransaction(transactionId: string): Promise<void> {
  await apiClient.delete(`/transactions/${transactionId}`);
}
