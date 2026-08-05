import { useEffect } from 'react';

import { useSessionStore } from '@/stores/sessionStore';

import { registerForPushNotifications } from './push';

/**
 * Registers the device Expo push token once the session is authenticated and
 * hydration has finished. Safe to mount at the app root — no-ops on web /
 * simulators / denied permission.
 */
export function useRegisterPushNotifications() {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  const isHydrating = useSessionStore((state) => state.isHydrating);

  useEffect(() => {
    if (isHydrating || !isAuthenticated) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        if (!cancelled) {
          await registerForPushNotifications();
        }
      } catch {
        // Push is best-effort — never block the app on token registration.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isHydrating]);
}
