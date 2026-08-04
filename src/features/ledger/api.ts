import { apiClient, type Envelope } from '@/api/client';

import type {
  LedgerEntry,
  LedgerEntryCreatePayload,
  LedgerEntryUpdatePayload,
  PersonBalance,
} from './types';

export async function getLedger(person?: string): Promise<LedgerEntry[]> {
  const response = await apiClient.get<Envelope<LedgerEntry[]>>('/ledger', {
    params: person ? { person } : undefined,
  });
  return response.data.data as LedgerEntry[];
}

export async function getLedgerPeople(): Promise<PersonBalance[]> {
  const response = await apiClient.get<Envelope<PersonBalance[]>>('/ledger/people');
  return response.data.data as PersonBalance[];
}

export async function createLedgerEntry(payload: LedgerEntryCreatePayload): Promise<LedgerEntry> {
  const response = await apiClient.post<Envelope<LedgerEntry>>('/ledger', payload);
  return response.data.data as LedgerEntry;
}

export async function updateLedgerEntry(
  entryId: string,
  payload: LedgerEntryUpdatePayload,
): Promise<LedgerEntry> {
  const response = await apiClient.patch<Envelope<LedgerEntry>>(`/ledger/${entryId}`, payload);
  return response.data.data as LedgerEntry;
}

export async function deleteLedgerEntry(entryId: string): Promise<void> {
  await apiClient.delete(`/ledger/${entryId}`);
}
