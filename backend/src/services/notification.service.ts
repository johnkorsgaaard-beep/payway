import { firebaseMessaging } from '../config/firebase.js';
import { prisma } from '../config/database.js';

export class NotificationService {
  async sendPaymentReceived(userId: string, senderName: string, amount: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true, name: true },
    });

    if (!user?.fcmToken) return;

    const amountStr = (amount / 100).toFixed(2);

    try {
      await firebaseMessaging.send({
        token: user.fcmToken,
        notification: {
          title: 'Betaling modtaget',
          body: `${senderName} har sendt dig ${amountStr} DKK`,
        },
        data: {
          type: 'payment_received',
          amount: amount.toString(),
          senderName,
        },
        android: {
          priority: 'high',
          notification: { sound: 'default', channelId: 'payments' },
        },
        apns: {
          payload: {
            aps: { sound: 'default', badge: 1 },
          },
        },
      });
    } catch (err) {
      console.error('FCM send error:', err);
    }
  }

  async sendPaymentRequest(userId: string, requesterName: string, amount: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true },
    });

    if (!user?.fcmToken) return;

    const amountStr = (amount / 100).toFixed(2);

    try {
      await firebaseMessaging.send({
        token: user.fcmToken,
        notification: {
          title: 'Betalingsanmodning',
          body: `${requesterName} anmoder om ${amountStr} DKK`,
        },
        data: {
          type: 'payment_request',
          amount: amount.toString(),
          requesterName,
        },
        android: {
          priority: 'high',
          notification: { sound: 'default', channelId: 'payments' },
        },
        apns: {
          payload: { aps: { sound: 'default', badge: 1 } },
        },
      });
    } catch (err) {
      console.error('FCM send error:', err);
    }
  }

  async sendGenericNotification(userId: string, title: string, body: string, data?: Record<string, string>) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true },
    });

    if (!user?.fcmToken) return;

    try {
      await firebaseMessaging.send({
        token: user.fcmToken,
        notification: { title, body },
        data,
        android: { priority: 'high' },
        apns: { payload: { aps: { sound: 'default' } } },
      });
    } catch (err) {
      console.error('FCM send error:', err);
    }
  }
}

export const notificationService = new NotificationService();
