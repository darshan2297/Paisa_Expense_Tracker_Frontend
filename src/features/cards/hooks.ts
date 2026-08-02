import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as cardsApi from './api';
import type { CardAmountPayload, CreditCardCreatePayload } from './types';

export const cardsQueryKey = ['cards'] as const;
export const cardsSummaryQueryKey = ['cards', 'summary'] as const;

export function useCards() {
  return useQuery({ queryKey: cardsQueryKey, queryFn: cardsApi.getCards });
}

export function useCardsSummary() {
  return useQuery({ queryKey: cardsSummaryQueryKey, queryFn: cardsApi.getCardsSummary });
}

export function useCreateCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreditCardCreatePayload) => cardsApi.createCard(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cardsQueryKey });
      queryClient.invalidateQueries({ queryKey: cardsSummaryQueryKey });
    },
  });
}

export function usePayCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, payload }: { cardId: string; payload: CardAmountPayload }) =>
      cardsApi.payCard(cardId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cardsQueryKey });
      queryClient.invalidateQueries({ queryKey: cardsSummaryQueryKey });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useSpendOnCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, payload }: { cardId: string; payload: CardAmountPayload }) =>
      cardsApi.spendOnCard(cardId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cardsQueryKey });
      queryClient.invalidateQueries({ queryKey: cardsSummaryQueryKey });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useDeleteCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cardId: string) => cardsApi.deleteCard(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cardsQueryKey });
      queryClient.invalidateQueries({ queryKey: cardsSummaryQueryKey });
    },
  });
}
