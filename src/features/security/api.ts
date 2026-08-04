import { apiClient, type Envelope } from '@/api/client';

import type {
  LoginHistoryFilters,
  LoginHistoryListResponse,
  ProfileConfig,
  SecurityOverview,
  SecuritySettings,
  SecuritySettingsUpdatePayload,
} from './types';

export async function getSecurityOverview(): Promise<SecurityOverview> {
  const response = await apiClient.get<Envelope<SecurityOverview>>('/security');
  return response.data.data as SecurityOverview;
}

export async function getLoginHistory(
  filters: LoginHistoryFilters,
): Promise<LoginHistoryListResponse> {
  const response = await apiClient.get<Envelope<LoginHistoryListResponse>>(
    '/security/login-history',
    {
      params: {
        page: filters.page,
        size: filters.size,
        from_date: filters.from_date,
        to_date: filters.to_date,
      },
    },
  );
  return response.data.data as LoginHistoryListResponse;
}

export async function getSecuritySettings(): Promise<SecuritySettings> {
  const response = await apiClient.get<Envelope<SecuritySettings>>('/security/settings');
  return response.data.data as SecuritySettings;
}

export async function updateSecuritySettings(
  payload: SecuritySettingsUpdatePayload,
): Promise<SecuritySettings> {
  const response = await apiClient.patch<Envelope<SecuritySettings>>('/security/settings', payload);
  return response.data.data as SecuritySettings;
}

export async function lockVault(): Promise<SecuritySettings> {
  const response = await apiClient.post<Envelope<SecuritySettings>>('/security/vault/lock');
  return response.data.data as SecuritySettings;
}

export async function revokeSession(sessionId: string): Promise<void> {
  await apiClient.delete(`/security/sessions/${sessionId}`);
}

export async function exportBackup(): Promise<{
  filename: string;
  size_bytes: number;
  created_at: string;
  content: string;
}> {
  const response =
    await apiClient.post<
      Envelope<{ filename: string; size_bytes: number; created_at: string; content: string }>
    >('/security/backup/export');
  return response.data.data!;
}

export async function importBackup(content: string): Promise<{ message: string }> {
  const response = await apiClient.post<Envelope<{ message: string }>>('/security/backup/import', {
    content,
  });
  return response.data.data ?? { message: 'Backup restored' };
}

export async function getProfileConfig(): Promise<ProfileConfig> {
  const response = await apiClient.get<Envelope<ProfileConfig>>('/profile/config');
  return response.data.data as ProfileConfig;
}
