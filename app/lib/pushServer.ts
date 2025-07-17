import webpush, { PushSubscription as WebPushSubscriptionType } from 'web-push';

export interface NotificationData {
  fromUser: string;
  timestamp: string;
  [key: string]: string;
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: NotificationData;
}

export class PushService {
  static async sendNotification(
    subscription: PushSubscription,
    payload: NotificationPayload
  ): Promise<void> {
    const webPushSubscription: WebPushSubscriptionType = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: Buffer.from(subscription.getKey('p256dh') as ArrayBuffer).toString('base64'),
        auth: Buffer.from(subscription.getKey('auth') as ArrayBuffer).toString('base64')
      }
    };

    await webpush.sendNotification(
      webPushSubscription,
      JSON.stringify(payload)
    );
  }
}