import { apiClient } from '@/lib/api-client';
import type { Notification } from '@/types/notification';

export async function getNotifications(token: string): Promise<Notification[]> {
  return apiClient.get('/api/notifications', { token });
}

export async function getNonLues(token: string): Promise<Notification[]> {
  return apiClient.get('/api/notifications/non-lues', { token });
}

export async function getCountNonLues(token: string): Promise<{ count: number }> {
  return apiClient.get('/api/notifications/count', { token });
}

export async function marquerCommeLue(token: string, id: number): Promise<Notification> {
  return apiClient.put(`/api/notifications/${id}/lire`, { token });
}

export async function marquerToutesCommeLues(token: string): Promise<void> {
  return apiClient.put('/api/notifications/lire-tout', { token });
}
