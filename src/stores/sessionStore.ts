import { create } from 'zustand';

/**
 * Client-only auth session state. This is deliberately NOT server state
 * (no TanStack Query here) — see docs/CODING_STANDARDS.md's server-vs-client
 * state rule. `isAuthenticated` is set optimistically from whether a token
 * exists in SecureStore (see `hydrateSession` in features/auth), not from a
 * verified round-trip to the server; an actually-invalid token is caught
 * reactively by the first API call that gets a 401 (src/api/client.ts).
 */
export type SessionState = {
  isAuthenticated: boolean;
  /** True until the initial SecureStore check on app start has completed. */
  isHydrating: boolean;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setHydrating: (isHydrating: boolean) => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  isAuthenticated: false,
  isHydrating: true,
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setHydrating: (isHydrating) => set({ isHydrating }),
}));

export default useSessionStore;
