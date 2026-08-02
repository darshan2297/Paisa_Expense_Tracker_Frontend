import { USE_MOCK_DATA } from '@/config/dataSource';
import { getLifeDashboardMock, type LifeDashboardData } from '@/mock/dashboard';

/**
 * Life Dashboard data hook.
 *
 * Returns mock data synchronously today. When `USE_MOCK_DATA` is false,
 * swap the body for a TanStack Query call to the real API.
 */
export function useLifeDashboard(): {
  data: LifeDashboardData;
  isLoading: false;
  isError: false;
} {
  if (USE_MOCK_DATA) {
    return {
      data: getLifeDashboardMock(),
      isLoading: false,
      isError: false,
    };
  }

  // TODO: wire to GET /api/v1/dashboard/life once backend is ready
  return {
    data: getLifeDashboardMock(),
    isLoading: false,
    isError: false,
  };
}
