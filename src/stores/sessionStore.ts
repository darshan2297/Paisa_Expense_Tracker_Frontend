import { create } from 'zustand';

/**
 * Placeholder session store.
 *
 * TODO(auth-phase): not wired to real auth yet — nothing calls
 * `setAuthenticated` today. Once login/register are implemented this will
 * also hold the current user profile and drive route guarding between the
 * (auth) and (tabs) groups.
 */
export type SessionState = {
  isAuthenticated: boolean;
  setAuthenticated: (isAuthenticated: boolean) => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  isAuthenticated: false,
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
}));

export default useSessionStore;
