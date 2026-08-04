import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as cardsApi from './api';
import type { CardAmountPayload, CreditCardCreatePayload, CreditCardUpdatePayload } from './types';

export const cardsQueryKey = ['cards'] as const;
export const cardsSummaryQueryKey = ['cards', 'summary'] as const;
export const cardsPaymentsQueryKey = ['cards', 'payments'] as const;

export function useCards() {
  return useQuery({ queryKey: cardsQueryKey, queryFn: cardsApi.getCards });
}

export function useCardsSummary() {
  return useQuery({ queryKey: cardsSummaryQueryKey, queryFn: cardsApi.getCardsSummary });
}

export function useCardPayments() {
  return useQuery({ queryKey: cardsPaymentsQueryKey, queryFn: cardsApi.getCardPayments });
}

// Card outstanding is a net-worth liability and card spend/creation affects
// the Life Dashboard + sidebar Budget Left/Net worth widgets - every
// mutation here must invalidate both, the same class of fix already applied
// to `features/transactions/hooks.ts` (which was missing this too).

export function useCreateCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreditCardCreatePayload) => cardsApi.createCard(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cardsQueryKey });
      queryClient.invalidateQueries({ queryKey: cardsSummaryQueryKey });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['netWorth'] });
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
      queryClient.invalidateQueries({ queryKey: cardsPaymentsQueryKey });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['netWorth'] });
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
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['netWorth'] });
    },
  });
}

export function useUpdateCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, payload }: { cardId: string; payload: CreditCardUpdatePayload }) =>
      cardsApi.updateCard(cardId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cardsQueryKey });
      queryClient.invalidateQueries({ queryKey: cardsSummaryQueryKey });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['netWorth'] });
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
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['netWorth'] });
    },
  });
}
