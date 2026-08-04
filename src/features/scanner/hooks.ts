import { useMutation, useQueryClient } from '@tanstack/react-query';

import * as api from './api';
import type { ScanConfirmPayload } from './types';

export function useScanReceipt() {
  return useMutation({ mutationFn: (file: FormData) => api.scanReceipt(file) });
}

export function useConfirmScan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ScanConfirmPayload) => api.confirmScan(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
