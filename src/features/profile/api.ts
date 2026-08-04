import { apiClient, type Envelope } from '@/api/client';

import type { Profile, ProfileUpdatePayload } from './types';

export async function getProfile(): Promise<Profile> {
  const response = await apiClient.get<Envelope<Profile>>('/profile');
  return response.data.data as Profile;
}

export async function updateProfile(payload: ProfileUpdatePayload): Promise<Profile> {
  const response = await apiClient.patch<Envelope<Profile>>('/profile', payload);
  return response.data.data as Profile;
}
