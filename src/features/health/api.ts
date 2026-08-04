import { apiClient, type Envelope } from '@/api/client';

export type HealthStatus = {
  status: string;
  version: string;
  environment: string;
};

export async function getHealthLive(): Promise<HealthStatus> {
  const response = await apiClient.get<Envelope<HealthStatus>>('/health/live');
  return response.data.data as HealthStatus;
}
