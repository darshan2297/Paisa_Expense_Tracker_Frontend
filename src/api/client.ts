import { create as createAxiosClient, isAxiosError, type InternalAxiosRequestConfig } from 'axios';

import { clearAppUnlockSession } from '@/features/appLock/unlockSession';
import { useSessionStore } from '@/stores/sessionStore';
import { secureStorage } from '@/utils/secureStorage';

/**
 * Shape of every JSON response from the backend, success or error - see the
 * backend's docs/API_STANDARDS.md. Feature `api.ts` files should type their
 * axios calls as `Envelope<T>` and return `response.data.data`.
 */
export type Envelope<T> = {
  success: boolean;
  status_code: number;
  data: T | null;
  message: string | null;
  errors: unknown[] | null;
};

/** Keys under which the auth token pair is persisted in SecureStore. */
export const AUTH_TOKEN_KEY = 'paisa.auth.accessToken';
export const REFRESH_TOKEN_KEY = 'paisa.auth.refreshToken';

export async function getAccessToken(): Promise<string | null> {
  return secureStorage.getItem(AUTH_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return secureStorage.getItem(REFRESH_TOKEN_KEY);
}

export async function storeTokens(accessToken: string, refreshToken: string): Promise<void> {
  await secureStorage.setItem(AUTH_TOKEN_KEY, accessToken);
  await secureStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export async function clearTokens(): Promise<void> {
  await secureStorage.deleteItem(AUTH_TOKEN_KEY);
  await secureStorage.deleteItem(REFRESH_TOKEN_KEY);
}

/**
 * Shared Axios instance for all API calls.
 *
 * `EXPO_PUBLIC_API_URL` is inlined at build time by Expo (any env var
 * prefixed `EXPO_PUBLIC_` is exposed to client code) — see `.env.example`.
 */
const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL;
const isNgrokApi = typeof apiBaseUrl === 'string' && apiBaseUrl.includes('ngrok');

export const apiClient = createAxiosClient({
  baseURL: apiBaseUrl,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    // Free ngrok serves an interstitial HTML page unless this header is set.
    ...(isNgrokApi ? { 'ngrok-skip-browser-warning': '1' } : {}),
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

// A single in-flight refresh is shared across every request that hits a 401
// at the same time (e.g. several screens fetching on focus at once) - without
// this, each would independently call /auth/refresh, and refresh tokens are
// rotated on use, so only the first would actually succeed.
let refreshPromise: Promise<string | null> | null = null;

async function forceLocalSignOut(): Promise<void> {
  await clearTokens();
  clearAppUnlockSession();
  // Remote "Sign out" / expired refresh must leave the app, not a ghost
  // authenticated shell with empty SecureStore.
  useSessionStore.getState().setAuthenticated(false);
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    await forceLocalSignOut();
    return null;
  }
  try {
    // A bare axios instance, not `apiClient` - it must not carry the
    // (about-to-be-invalid) access token or re-enter these interceptors.
    const response = await createAxiosClient({
      baseURL: apiBaseUrl,
      headers: isNgrokApi ? { 'ngrok-skip-browser-warning': '1' } : undefined,
    }).post('/auth/refresh', { refresh_token: refreshToken });
    const pair = response.data.data as { access_token: string; refresh_token: string };
    await storeTokens(pair.access_token, pair.refresh_token);
    return pair.access_token;
  } catch {
    await forceLocalSignOut();
    return null;
  }
}

// --- Response interceptor -----------------------------------------------
// On a 401, attempt exactly one refresh-and-retry. If the refresh itself
// fails (refresh token also expired/revoked — including remote device sign
// out), clear tokens + session store so the auth guard sends the user to
// login on that device.
apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const config = error.config as RetriableConfig | undefined;
    if (!config || config._retried) {
      return Promise.reject(error);
    }

    refreshPromise ??= refreshAccessToken();
    const newAccessToken = await refreshPromise;
    refreshPromise = null;

    if (!newAccessToken) {
      return Promise.reject(error);
    }

    config._retried = true;
    config.headers.set('Authorization', `Bearer ${newAccessToken}`);
    return apiClient.request(config);
  },
);

export default apiClient;
