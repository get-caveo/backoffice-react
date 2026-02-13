import { create } from 'zustand';
import type { Notification } from '@/types/notification';
import * as notificationService from '@/services/notification.service';
import { connectWebSocket, disconnectWebSocket, subscribe } from '@/lib/websocket';
import { useAuthStore } from './auth.store';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;

  // Actions
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  marquerCommeLue: (id: number) => Promise<void>;
  marquerToutesCommeLues: () => Promise<void>;

  // WebSocket
  startWebSocket: () => void;
  stopWebSocket: () => void;
}

function getToken(): string {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error('Non authentifié');
  return token;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isConnected: false,

  fetchNotifications: async () => {
    try {
      const token = getToken();
      const notifications = await notificationService.getNotifications(token);
      set({ notifications });
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    }
  },

  fetchUnreadCount: async () => {
    try {
      const token = getToken();
      const { count } = await notificationService.getCountNonLues(token);
      set({ unreadCount: count });
    } catch (error) {
      console.error('Erreur chargement count notifications:', error);
    }
  },

  marquerCommeLue: async (id: number) => {
    try {
      const token = getToken();
      await notificationService.marquerCommeLue(token, id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, lu: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error('Erreur marquage notification:', error);
    }
  },

  marquerToutesCommeLues: async () => {
    try {
      const token = getToken();
      await notificationService.marquerToutesCommeLues(token);
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, lu: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Erreur marquage toutes lues:', error);
    }
  },

  startWebSocket: () => {
    const token = getToken();

    connectWebSocket(token, () => {
      set({ isConnected: true });

      // Charger les notifications existantes
      get().fetchNotifications();
      get().fetchUnreadCount();
    });

    // Écouter les nouvelles notifications
    subscribe('/topic/notifications', (body) => {
      const notification = body as Notification;
      set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      }));
    });
  },

  stopWebSocket: () => {
    disconnectWebSocket();
    set({ isConnected: false });
  },
}));
