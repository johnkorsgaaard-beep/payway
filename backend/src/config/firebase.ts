import admin from 'firebase-admin';
import { env } from './env.js';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL || undefined,
      privateKey: env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || undefined,
    }),
  });
}

export const firebaseAuth = admin.auth();
export const firebaseMessaging = admin.messaging();
