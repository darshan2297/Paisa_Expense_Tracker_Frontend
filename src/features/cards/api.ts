import { USE_MOCK_DATA } from '@/config/dataSource';
import { mockStore } from '@/mock/store';
import { apiClient, type Envelope } from '@/api/client';

import type { CardAmountPayload, CardsSummary, CreditCard, CreditCardCreatePayload } from './types';

export async function getCards(): Promise<CreditCard[]> {
  if (USE_MOCK_DATA) return mockStore.getCards();
  const response = await apiClient.get<Envelope<CreditCard[]>>('/cards');
  return response.data.data as CreditCard[];
}

export async function getCardsSummary(): Promise<CardsSummary> {
  if (USE_MOCK_DATA) return mockStore.getCardsSummary();
  const response = await apiClient.get<Envelope<CardsSummary>>('/cards/summary');
  return response.data.data as CardsSummary;
}

export async function createCard(payload: CreditCardCreatePayload): Promise<CreditCard> {
  if (USE_MOCK_DATA) return mockStore.createCard(payload);
  const response = await apiClient.post<Envelope<CreditCard>>('/cards', payload);
  return response.data.data as CreditCard;
}

export async function deleteCard(cardId: string): Promise<void> {
  if (USE_MOCK_DATA) return mockStore.deleteCard(cardId);
  await apiClient.delete(`/cards/${cardId}`);
}

export async function payCard(cardId: string, payload: CardAmountPayload): Promise<CreditCard> {
  if (USE_MOCK_DATA) return mockStore.payCard(cardId, payload);
  const response = await apiClient.post<Envelope<CreditCard>>(`/cards/${cardId}/pay`, payload);
  return response.data.data as CreditCard;
}

export async function spendOnCard(cardId: string, payload: CardAmountPayload): Promise<CreditCard> {
  if (USE_MOCK_DATA) return mockStore.spendOnCard(cardId, payload);
  const response = await apiClient.post<Envelope<CreditCard>>(`/cards/${cardId}/spend`, payload);
  return response.data.data as CreditCard;
}
