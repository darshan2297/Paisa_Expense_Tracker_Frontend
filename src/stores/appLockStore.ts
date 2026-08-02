import { create } from 'zustand';

/**
 * Device-level app-lock state — distinct from `sessionStore`'s
 * authentication state. A user can be authenticated (has a valid backend
 * session) AND locked (needs to re-enter their PIN/biometric to reveal the
 * app) at the same time; that's the whole point of this feature. See
 * docs/DEVELOPER_PHILOSOPHY.md §8.6: app-lock gates access to an
 * already-authenticated session, it does not replace real backend auth.
 */
export type AppLockState = {
  /** Whether a PIN has been configured on this device at all. */
  hasPinConfigured: boolean;
  /** User preference: whether biometric unlock is enabled (device support is checked separately, at point of use). */
  biometricEnabled: boolean;
  /** Whether the lock screen should currently be shown. */
  isLocked: boolean;
  isHydrating: boolean;
  setHasPinConfigured: (value: boolean) => void;
  setBiometricEnabled: (value: boolean) => void;
  setLocked: (value: boolean) => void;
  setHydrating: (value: boolean) => void;
};

export const useAppLockStore = create<AppLockState>((set) => ({
  hasPinConfigured: false,
  biometricEnabled: false,
  isLocked: false,
  isHydrating: true,
  setHasPinConfigured: (value) => set({ hasPinConfigured: value }),
  setBiometricEnabled: (value) => set({ biometricEnabled: value }),
  setLocked: (value) => set({ isLocked: value }),
  setHydrating: (value) => set({ isHydrating: value }),
}));

export default useAppLockStore;
