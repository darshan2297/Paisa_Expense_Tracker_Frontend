import { create as createAxiosClient, isAxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';

/**
 * Key under which the auth access token is persisted in SecureStore.
 * Centralised here so the Auth phase can reuse it without guessing.
 */
export const AUTH_TOKEN_KEY = 'paisa.auth.accessToken';

/**
 * Shared Axios instance for all API calls.
 *
 * `EXPO_PUBLIC_API_URL` is inlined at build time by Expo (any env var
 * prefixed `EXPO_PUBLIC_` is exposed to client code) — see `.env.example`.
 */
export const apiClient = createAxiosClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
});

// --- Request interceptor -----------------------------------------------
// TODO(auth-phase): this currently only *reads* whatever token happens to
// be in SecureStore. Real login/logout/token-refresh wiring lands with the
// Auth feature; for now there is nothing that ever writes AUTH_TOKEN_KEY.
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// --- Response interceptor -----------------------------------------------
// TODO(auth-phase): on 401 this should attempt a refresh-token flow and
// retry the original request once; if the refresh also fails it should
// clear the session (sessionStore) and route to /(auth)/login. For now we
// just pass the error through untouched.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (isAxiosError(error) && error.response?.status === 401) {
      // TODO(auth-phase): refresh-token flow goes here.
    }
    return Promise.reject(error);
  },
);

export default apiClient;
