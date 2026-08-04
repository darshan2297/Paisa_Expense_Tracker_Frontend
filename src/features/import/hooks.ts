import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as api from './api';
import type { ImportRowUpdatePayload } from './types';

export function useImportPreview(jobId: string | null) {
  return useQuery({
    queryKey: ['import', jobId],
    queryFn: () => api.getImportPreview(jobId!),
    enabled: !!jobId,
  });
}

export function useUploadImport() {
  return useMutation({ mutationFn: (file: FormData) => api.uploadImport(file) });
}

export function useUpdateImportRow(jobId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ rowId, payload }: { rowId: string; payload: ImportRowUpdatePayload }) =>
      api.updateImportRow(jobId, rowId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['import', jobId] }),
  });
}

export function useConfirmImport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => api.confirmImport(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
