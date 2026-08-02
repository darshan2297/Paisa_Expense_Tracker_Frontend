import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

/**
 * Shared TanStack Query client.
 *
 * Defaults are tuned for a mobile app talking to a server that doesn't
 * change every second: data is considered fresh for a minute (avoids a
 * refetch storm on every screen focus) and kept in the cache for 24h so the
 * persister below has something to restore on cold start / offline.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 24 * 60 * 60 * 1000, // 24 hours
      retry: 2,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

/**
 * Persists the query cache to AsyncStorage so it survives app restarts /
 * offline. Note: `app.json`'s `web.output` is intentionally set to
 * `"single"` (client-only rendering, no SSR/prerendering) — AsyncStorage's
 * web implementation touches `window`, which doesn't exist in Expo's
 * Node-based static-rendering step, and this module runs at import time.
 */
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'paisa-query-cache',
});

persistQueryClient({
  queryClient,
  persister: asyncStoragePersister,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours — matches gcTime above
});

export default queryClient;
