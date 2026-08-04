import { Platform } from 'react-native';

import { apiClient, type Envelope } from '@/api/client';
import type { PickedReceipt } from '@/utils/receiptPicker';

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

export async function getTransactionsSummary(
  month: string,
  cardOnly = false,
): Promise<TransactionsSummary> {
  const response = await apiClient.get<Envelope<TransactionsSummary>>('/transactions/summary', {
    params: { month, ...(cardOnly ? { card_only: true } : {}) },
  });
  return response.data.data as TransactionsSummary;
}

export async function createTransaction(payload: TransactionCreatePayload): Promise<Transaction> {
  const response = await apiClient.post<Envelope<Transaction>>('/transactions', payload);
  return response.data.data as Transaction;
}

export async function updateTransaction(
  transactionId: string,
  payload: Partial<TransactionCreatePayload>,
): Promise<Transaction> {
  const response = await apiClient.patch<Envelope<Transaction>>(
    `/transactions/${transactionId}`,
    payload,
  );
  return response.data.data as Transaction;
}

export async function deleteTransaction(transactionId: string): Promise<void> {
  await apiClient.delete(`/transactions/${transactionId}`);
}

export async function uploadReceipt(
  transactionId: string,
  receipt: PickedReceipt,
): Promise<Transaction> {
  const form = new FormData();
  if (Platform.OS === 'web') {
    const blob = await (await fetch(receipt.uri)).blob();
    form.append('file', blob, receipt.name);
  } else {
    form.append('file', {
      uri: receipt.uri,
      name: receipt.name,
      type: receipt.mimeType,
    } as unknown as Blob);
  }
  const response = await apiClient.post<Envelope<Transaction>>(
    `/transactions/${transactionId}/receipt`,
    form,
    {
      timeout: 60_000,
      transformRequest: [
        (data, headers) => {
          // Let RN/browser set multipart boundary.
          if (headers && typeof headers === 'object') {
            delete (headers as Record<string, unknown>)['Content-Type'];
          }
          return data;
        },
      ],
    },
  );
  return response.data.data as Transaction;
}
