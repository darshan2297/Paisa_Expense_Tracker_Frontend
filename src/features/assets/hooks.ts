import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as api from './api';
import type { AssetCreatePayload } from './types';

export function useAssets() {
  return useQuery({ queryKey: ['assets'], queryFn: api.getAssets });
}

export function useAssetsSummary() {
  return useQuery({ queryKey: ['assets', 'summary'], queryFn: api.getAssetsSummary });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssetCreatePayload) => api.createAsset(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['netWorth'] });
    },
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assetId: string) => api.deleteAsset(assetId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assets'] }),
  });
}
