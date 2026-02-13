import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { API_BASE_URL } from './api-client';

type MessageHandler = (body: unknown) => void;

let stompClient: Client | null = null;
const subscriptions = new Map<string, MessageHandler[]>();

export function connectWebSocket(token: string, onConnected?: () => void) {
  if (stompClient?.connected) {
    onConnected?.();
    return;
  }

  stompClient = new Client({
    webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 5000,
    onConnect: () => {
      console.log('[WS] Connecté');

      // Re-subscribe to all topics after reconnect
      for (const [topic, handlers] of subscriptions.entries()) {
        stompClient?.subscribe(topic, (message) => {
          const body = JSON.parse(message.body);
          handlers.forEach((handler) => handler(body));
        });
      }

      onConnected?.();
    },
    onStompError: (frame) => {
      console.error('[WS] Erreur STOMP:', frame.headers['message']);
    },
    onDisconnect: () => {
      console.log('[WS] Déconnecté');
    },
  });

  stompClient.activate();
}

export function disconnectWebSocket() {
  stompClient?.deactivate();
  stompClient = null;
  subscriptions.clear();
}

export function subscribe(topic: string, handler: MessageHandler) {
  if (!subscriptions.has(topic)) {
    subscriptions.set(topic, []);
  }
  subscriptions.get(topic)!.push(handler);

  // Subscribe if already connected
  if (stompClient?.connected) {
    stompClient.subscribe(topic, (message) => {
      const body = JSON.parse(message.body);
      subscriptions.get(topic)?.forEach((h) => h(body));
    });
  }
}

export function unsubscribe(topic: string) {
  subscriptions.delete(topic);
}
