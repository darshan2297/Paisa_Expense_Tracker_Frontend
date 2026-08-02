import { apiClient, type Envelope } from '@/api/client';

import type { ChangePasswordPayload, LoginPayload, TokenPair } from './types';

export async function login(payload: LoginPayload): Promise<TokenPair> {
  const response = await apiClient.post<Envelope<TokenPair>>('/auth/login', payload);
  return response.data.data as TokenPair;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await apiClient.post('/auth/change-password', payload);
}
