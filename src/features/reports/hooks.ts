import { useQuery } from '@tanstack/react-query';

import * as api from './api';
import type { ReportType } from './types';

export function useReport(type: ReportType, month: string) {
  return useQuery({
    queryKey: ['reports', type, month],
    queryFn: () => api.getReport(type, month),
  });
}
