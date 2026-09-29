import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export type PushSubscriptionStatus = 'unsupported' | 'unconfigured' | 'denied' | 'subscribed' | 'unsubscribed';

export const isPushSupported = (): boolean =>
  'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0))) as BufferSource;
}

async function hashEndpoint(endpoint: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(endpoint));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function getPushSubscriptionStatus(): Promise<PushSubscriptionStatus> {
  if (!isPushSupported()) return 'unsupported';
  if (!VAPID_PUBLIC_KEY) return 'unconfigured';
  if (Notification.permission === 'denied') return 'denied';

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  return subscription ? 'subscribed' : 'unsubscribed';
}

export async function subscribeToPush(userId: string): Promise<void> {
  if (!isPushSupported()) throw new Error('Push notifications are not supported on this device/browser.');
  if (!VAPID_PUBLIC_KEY) throw new Error('Push notifications are not configured yet.');

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission was not granted.');
  }

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  const json = subscription.toJSON();
  const id = await hashEndpoint(subscription.endpoint);

  await setDoc(doc(db, 'users', userId, 'pushSubscriptions', id), {
    endpoint: subscription.endpoint,
    keys: json.keys,
    userAgent: navigator.userAgent,
    createdAt: new Date().toISOString(),
  });
}

export async function unsubscribeFromPush(userId: string): Promise<void> {
  if (!isPushSupported()) return;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;

  const id = await hashEndpoint(subscription.endpoint);
  await subscription.unsubscribe();
  await deleteDoc(doc(db, 'users', userId, 'pushSubscriptions', id));
}
