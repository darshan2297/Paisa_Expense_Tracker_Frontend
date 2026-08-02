import { USE_MOCK_DATA } from '@/config/dataSource';
import { mockStore } from '@/mock/store';
import { apiClient, type Envelope } from '@/api/client';

import type { Category } from './types';

export async function getCategories(): Promise<Category[]> {
  if (USE_MOCK_DATA) return mockStore.getCategories();
  const response = await apiClient.get<Envelope<Category[]>>('/categories');
  return response.data.data as Category[];
}
