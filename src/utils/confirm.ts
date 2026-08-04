import { useConfirmStore } from '@/stores/confirmStore';

/**
 * Open the shared in-app delete/confirm modal.
 *
 * Mandatory before every destructive mutation (delete transaction, bill,
 * ledger entry, card, loan, etc.). Do not call delete APIs directly from
 * trash/remove handlers — always go through this helper first.
 */
export function confirmDestructive(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmLabel = 'Delete',
): void {
  useConfirmStore.getState().open({
    title,
    message,
    confirmLabel,
    onConfirm,
  });
}
