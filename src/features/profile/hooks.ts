import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as profileApi from './api';
import type { ProfileUpdatePayload } from './types';

export const profileQueryKey = ['profile'] as const;

export function useProfile() {
  return useQuery({
    queryKey: profileQueryKey,
    queryFn: profileApi.getProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProfileUpdatePayload) => profileApi.updateProfile(payload),
    onSuccess: (profile) => {
      queryClient.setQueryData(profileQueryKey, profile);
    },
  });
}
