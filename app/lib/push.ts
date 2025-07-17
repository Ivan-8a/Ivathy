// lib/push.ts
import webpush from 'web-push';

// Configuración de web-push
// Genera las claves VAPID en: https://web-push-codelab.glitch.me/
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa40HI6DLBAbjgJg6A_JnlgVzVwKPaRKIjmKdIJBQnMJNkqZrPPgNyYvOmTVys',
  privateKey: process.env.VAPID_PRIVATE_KEY || 'nGzcGJMpYpZQF3yPEOJJHU5SzLLDdBm8DwZZvBkMJ4k'
};

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Solo interfaces y tipos
export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
}

export class PushService {
  static async sendNotification(
    subscription: PushSubscription,
    payload: NotificationPayload
  ): Promise<void> {
    try {
      await webpush.sendNotification(
        subscription,
        JSON.stringify(payload)
      );
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }

  static getVapidPublicKey(): string {
    return vapidKeys.publicKey;
  }
}

// Utilidades para el cliente
export const subscribeUser = async (): Promise<PushSubscription | null> => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push messaging is not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKeys.publicKey)
    });
    
    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push:', error);
    return null;
  }
};

// Función auxiliar para convertir VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}