import { apiClient, type Envelope } from '@/api/client';

import type { Notification } from './types';

export async function getNotifications(): Promise<Notification[]> {
  const response = await apiClient.get<Envelope<Notification[]>>('/notifications');
  return response.data.data ?? [];
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await apiClient.patch(`/notifications/${notificationId}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.post('/notifications/read-all');
}

export async function registerPushToken(expo_push_token: string, device_label?: string) {
  await apiClient.post('/push-tokens', { expo_push_token, device_label });
}
