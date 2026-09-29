import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import {
  getPushSubscriptionStatus,
  subscribeToPush,
  unsubscribeFromPush,
  PushSubscriptionStatus,
} from '../utils/pushNotifications';

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<PushSubscriptionStatus | 'loading'>('loading');
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setStatus(await getPushSubscriptionStatus());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const enable = useCallback(async () => {
    if (!user) return;
    setError(null);
    setStatus('loading');
    try {
      await subscribeToPush(user.uid);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enable notifications.');
    } finally {
      await refresh();
    }
  }, [user, refresh]);

  const disable = useCallback(async () => {
    if (!user) return;
    setError(null);
    setStatus('loading');
    try {
      await unsubscribeFromPush(user.uid);
    } finally {
      await refresh();
    }
  }, [user, refresh]);

  return { status, error, enable, disable };
};
