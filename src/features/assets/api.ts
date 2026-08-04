import { apiClient, type Envelope } from '@/api/client';

import type { Asset, AssetCreatePayload, AssetsSummary } from './types';

export type { Asset, AssetCreatePayload, AssetsSummary };

export async function getAssets(): Promise<Asset[]> {
  const response = await apiClient.get<Envelope<Asset[]>>('/assets');
  return response.data.data as Asset[];
}

export async function getAssetsSummary(): Promise<AssetsSummary> {
  const response = await apiClient.get<Envelope<AssetsSummary>>('/assets/summary');
  return response.data.data as AssetsSummary;
}

export async function createAsset(payload: AssetCreatePayload): Promise<Asset> {
  const response = await apiClient.post<Envelope<Asset>>('/assets', payload);
  return response.data.data as Asset;
}

export async function deleteAsset(assetId: string): Promise<void> {
  await apiClient.delete(`/assets/${assetId}`);
}
