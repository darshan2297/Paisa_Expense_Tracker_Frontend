import { apiClient, type Envelope } from '@/api/client';

import type {
  ChangePasswordPayload,
  LoginPayload,
  PinChangePayload,
  PinSetPayload,
  PinStatus,
  PinVerifyPayload,
  RegisterPayload,
  TokenPair,
} from './types';

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

/** Returns false when the stored access token is missing, expired, or the user no longer exists. */
export async function sessionIsValid(): Promise<boolean> {
  try {
    await apiClient.get<Envelope<unknown>>('/profile');
    return true;
  } catch {
    return false;
  }
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await apiClient.post('/auth/change-password', payload);
}

export async function getPinStatus(): Promise<PinStatus> {
  const response = await apiClient.get<Envelope<PinStatus>>('/auth/pin');
  return response.data.data as PinStatus;
}

/** Create or replace the account PIN (first setup / forgot-PIN reset). */
export async function setAccountPin(payload: PinSetPayload): Promise<PinStatus> {
  const response = await apiClient.post<Envelope<PinStatus>>('/auth/pin', payload);
  return response.data.data as PinStatus;
}

/** Change PIN — requires proving the current PIN to the server. */
export async function changeAccountPin(payload: PinChangePayload): Promise<PinStatus> {
  const response = await apiClient.put<Envelope<PinStatus>>('/auth/pin', payload);
  return response.data.data as PinStatus;
}

export async function verifyAccountPin(payload: PinVerifyPayload): Promise<boolean> {
  const response = await apiClient.post<Envelope<{ valid: boolean }>>('/auth/pin/verify', payload);
  return Boolean(response.data.data?.valid);
}

export async function clearAccountPin(payload: PinSetPayload): Promise<PinStatus> {
  const response = await apiClient.post<Envelope<PinStatus>>('/auth/pin/clear', payload);
  return response.data.data as PinStatus;
}
