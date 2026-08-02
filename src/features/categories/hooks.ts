import { useQuery } from '@tanstack/react-query';

import * as categoriesApi from './api';

export const categoriesQueryKey = ['categories'] as const;

/** Seeded, rarely-changing taxonomy - `staleTime: Infinity` avoids
 * refetching it on every screen focus like a normal server resource.
 */
export function useCategories() {
  return useQuery({
    queryKey: categoriesQueryKey,
    queryFn: categoriesApi.getCategories,
    staleTime: Infinity,
  });
}
