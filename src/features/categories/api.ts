import { apiClient, type Envelope } from '@/api/client';

import type { Category } from './types';

export async function getCategories(): Promise<Category[]> {
  const response = await apiClient.get<Envelope<Category[]>>('/categories');
  return response.data.data as Category[];
}
