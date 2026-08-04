import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as api from './api';
import type { MilestoneCreatePayload, MilestoneUpdatePayload } from './types';

export function useMilestones() {
  return useQuery({ queryKey: ['milestones'], queryFn: api.getMilestones });
}

export function useCreateMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MilestoneCreatePayload) => api.createMilestone(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['milestones'] }),
  });
}

export function useUpdateMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      milestoneId,
      payload,
    }: {
      milestoneId: string;
      payload: MilestoneUpdatePayload;
    }) => api.updateMilestone(milestoneId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['milestones'] }),
  });
}

export function useDeleteMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (milestoneId: string) => api.deleteMilestone(milestoneId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['milestones'] }),
  });
}
