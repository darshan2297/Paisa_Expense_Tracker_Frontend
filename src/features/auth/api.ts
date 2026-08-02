import { apiClient, type Envelope } from '@/api/client';

import type { ChangePasswordPayload, LoginPayload, RegisterPayload, TokenPair } from './types';

export async function login(payload: LoginPayload): Promise<TokenPair> {
  const response = await apiClient.post<Envelope<TokenPair>>('/auth/login', payload);
  return response.data.data as TokenPair;
}

export async function register(payload: RegisterPayload): Promise<TokenPair> {
  const response = await apiClient.post<Envelope<TokenPair>>('/auth/register', payload);
  return response.data.data as TokenPair;
}

/** Whether one-time bootstrap registration is still available (no account created yet). */
export async function isRegistrationOpen(): Promise<boolean> {
  const response = await apiClient.get<Envelope<{ open: boolean }>>('/auth/registration-open');
  return response.data.data?.open ?? false;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await apiClient.post('/auth/change-password', payload);
}
