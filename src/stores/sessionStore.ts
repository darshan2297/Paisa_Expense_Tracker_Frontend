import { create } from 'zustand';

/**
 * Client-only auth session state. This is deliberately NOT server state
 * (no TanStack Query here) — see docs/CODING_STANDARDS.md's server-vs-client
 * state rule. `isAuthenticated` is set optimistically from whether a token
 * exists in SecureStore (see `hydrateSession` in features/auth), not from a
 * verified round-trip to the server; an actually-invalid token is caught
 * reactively by the first API call that gets a 401 (src/api/client.ts).
 *
 * `registrationOpen` is the one deliberate exception to "no server state
 * here": the auth guard (app/_layout.tsx) needs it synchronously, in the
 * same boot-time check as `isAuthenticated`, to decide whether an
 * unauthenticated visitor should land on Register or Login - before any
 * route has rendered. A `useQuery` would work too, but would mean the guard
 * has two different async-readiness signals to wait on instead of one.
 */
export type SessionState = {
  isAuthenticated: boolean;
  /** True until the initial SecureStore check on app start has completed. */
  isHydrating: boolean;
  /** Whether one-time bootstrap registration is still available (no account created yet). */
  registrationOpen: boolean;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setHydrating: (isHydrating: boolean) => void;
  setRegistrationOpen: (registrationOpen: boolean) => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  isAuthenticated: false,
  isHydrating: true,
  registrationOpen: false,
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setHydrating: (isHydrating) => set({ isHydrating }),
  setRegistrationOpen: (registrationOpen) => set({ registrationOpen }),
}));

export default useSessionStore;
