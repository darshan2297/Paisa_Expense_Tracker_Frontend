import { create } from 'zustand';

export type ConfirmRequest = {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
};

type ConfirmState = {
  request: ConfirmRequest | null;
  open: (request: ConfirmRequest) => void;
  close: () => void;
};

/**
 * Imperative confirm dialog state — used by `confirmDestructive` so any
 * screen can open the shared in-app modal without prop-drilling.
 */
export const useConfirmStore = create<ConfirmState>((set) => ({
  request: null,
  open: (request) => set({ request }),
  close: () => set({ request: null }),
}));

export default useConfirmStore;
