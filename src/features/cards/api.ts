import { apiClient, type Envelope } from '@/api/client';

import type { CardAmountPayload, CardsSummary, CreditCard, CreditCardCreatePayload } from './types';

export async function getCards(): Promise<CreditCard[]> {
  const response = await apiClient.get<Envelope<CreditCard[]>>('/cards');
  return response.data.data as CreditCard[];
}

export async function getCardsSummary(): Promise<CardsSummary> {
  const response = await apiClient.get<Envelope<CardsSummary>>('/cards/summary');
  return response.data.data as CardsSummary;
}

export async function createCard(payload: CreditCardCreatePayload): Promise<CreditCard> {
  const response = await apiClient.post<Envelope<CreditCard>>('/cards', payload);
  return response.data.data as CreditCard;
}

export async function deleteCard(cardId: string): Promise<void> {
  await apiClient.delete(`/cards/${cardId}`);
}

export async function payCard(cardId: string, payload: CardAmountPayload): Promise<CreditCard> {
  const response = await apiClient.post<Envelope<CreditCard>>(`/cards/${cardId}/pay`, payload);
  return response.data.data as CreditCard;
}

export async function spendOnCard(cardId: string, payload: CardAmountPayload): Promise<CreditCard> {
  const response = await apiClient.post<Envelope<CreditCard>>(`/cards/${cardId}/spend`, payload);
  return response.data.data as CreditCard;
}
